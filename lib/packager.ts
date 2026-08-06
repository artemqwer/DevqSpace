import "server-only";
import { unzipSync, zipSync } from "fflate";
import type { Product } from "./products";
import type { StoredOrder } from "./store";
import { getObject, putObject } from "./blob";
import { decryptJson } from "./crypto";
import { renderEnvFile, type EnvValues } from "./envFields";

// Збирає персональний архів: бере чистий шаблон товару, викидає сміття і
// кладе в корінь .env, заповнений значеннями клієнта.

export type PackageResult =
  | { ok: true; url: string; name: string; files: number }
  | { ok: false; error: string };

// Розпакований шаблон не має роздувати пам'ять serverless-функції.
const MAX_UNPACKED_BYTES = 150 * 1024 * 1024;

// Те, чого не має бути в архіві клієнта: залежності, кеші збірки, історія
// репозиторію і чужі .env. Фільтр застосовується при збірці, а не лише при
// підготовці шаблону, — на випадок якщо адмін залив «брудний» архів.
const EXCLUDED_DIRS = [
  "node_modules",
  ".git",
  ".venv",
  "venv",
  "__pycache__",
  ".next",
  "dist",
  "build",
  ".turbo",
  ".pytest_cache",
  ".mypy_cache",
];

const EXCLUDED_FILES = [
  ".env",
  ".env.local",
  ".env.example",
  ".DS_Store",
  "Thumbs.db",
];

function isExcluded(path: string): boolean {
  const parts = path.split("/").filter(Boolean);
  if (parts.some((p) => EXCLUDED_DIRS.includes(p))) return true;
  const name = parts[parts.length - 1] ?? "";
  if (EXCLUDED_FILES.includes(name)) return true;
  if (name.endsWith(".pyc")) return true;
  return false;
}

// Якщо весь архів загорнутий в одну теку (typical для GitHub-зіпів) — .env
// має лягти всередину неї, поруч із package.json, а не назовні.
function commonRoot(paths: string[]): string {
  if (!paths.length) return "";
  const first = paths[0].split("/")[0];
  if (!first) return "";
  const allShare = paths.every(
    (p) => p === first || p.startsWith(`${first}/`),
  );
  // Якщо в корені лежить сам файл із такою назвою — теки немає.
  const isDir = paths.some((p) => p.startsWith(`${first}/`));
  return allShare && isDir ? `${first}/` : "";
}

export async function packageOrder(
  order: StoredOrder,
  product: Product,
): Promise<PackageResult> {
  if (!product.sourceTemplatePath) {
    return { ok: false, error: "У товару не завантажений шаблон проєкту" };
  }

  const values = decryptJson<EnvValues>(order.envData);
  if (!values) {
    return {
      ok: false,
      error:
        "Немає даних клієнта для .env (не збережені, застаріли або змінився ENV_DATA_SECRET)",
    };
  }

  const archive = await getObject(product.sourceTemplatePath);
  if (!archive) {
    return { ok: false, error: "Не вдалося завантажити шаблон зі сховища" };
  }

  let entries: Record<string, Uint8Array>;
  try {
    entries = unzipSync(archive);
  } catch {
    return { ok: false, error: "Шаблон не читається як ZIP" };
  }

  const out: Record<string, Uint8Array> = {};
  let total = 0;
  for (const [path, bytes] of Object.entries(entries)) {
    if (isExcluded(path)) continue;
    if (path.endsWith("/")) continue; // теки zipSync створить сам
    total += bytes.byteLength;
    if (total > MAX_UNPACKED_BYTES) {
      return {
        ok: false,
        error: `Шаблон завеликий (> ${Math.round(MAX_UNPACKED_BYTES / 1024 / 1024)} МБ у розпакованому вигляді)`,
      };
    }
    out[path] = bytes;
  }

  if (!Object.keys(out).length) {
    return { ok: false, error: "Після фільтрації в шаблоні не лишилось файлів" };
  }

  const root = commonRoot(Object.keys(out));
  const envText = renderEnvFile(product.envFields ?? [], values, {
    productTitle: product.title,
    orderId: order.id,
  });
  out[`${root}.env`] = new TextEncoder().encode(envText);

  let zipped: Uint8Array;
  try {
    zipped = zipSync(out, { level: 6 });
  } catch (e) {
    console.error("[packager] zip failed:", e);
    return { ok: false, error: "Не вдалося зібрати архів" };
  }

  const safeSlug = product.slug.replace(/[^a-z0-9-]/gi, "") || "product";
  const name = `${safeSlug}-${order.id}.zip`;
  const rnd = Math.random().toString(36).slice(2, 10);

  try {
    const blob = await putObject(
      `packages/${order.id}-${rnd}.zip`,
      zipped,
      "application/zip",
    );
    return {
      ok: true,
      url: blob.url,
      name,
      files: Object.keys(out).length,
    };
  } catch (e) {
    console.error("[packager] upload failed:", e);
    return { ok: false, error: "Не вдалося зберегти зібраний архів" };
  }
}
