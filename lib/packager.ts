import "server-only";
import { unzipSync, zipSync } from "fflate";
import type { Product } from "./products";
import type { StoredOrder } from "./store";
import { getObject, putObject } from "./blob";
import { decryptJson } from "./crypto";
import { renderEnvFile, quoteIfNeeded, type EnvValues } from "./envFields";

// Збирає персональний архів: бере ZIP товару, підставляє значення клієнта
// в .env усередині нього і заливає копію у сховище.
//
// Значення підставляються В ІСНУЮЧИЙ .env / .env.example, а не генеруються з
// нуля: так клієнт отримує рідний файл шаблону з усіма коментарями
// («# Токен бота от @BotFather»), а не голий список ключів.

export type PackageResult =
  | {
      ok: true;
      url: string;
      name: string;
      files: number;
      bytes: Uint8Array;
      envValues: Record<string, string>;
    }
  | { ok: false; error: string };

// Розпакований архів не має роз'їдати пам'ять serverless-функції.
const MAX_UNPACKED_BYTES = 150 * 1024 * 1024;

// Те, чого не має бути в архіві клієнта: залежності, кеші збірки, історія
// репозиторію. Застосовується при збірці, а не лише при завантаженні, — на
// випадок якщо адмін залив «брудний» архів.
//
// .env.example свідомо НЕ виключений: для товару-сорскоду це документація,
// і саме його ми патчимо. Виключаємо лише .env.local — чужі локальні секрети.
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

const EXCLUDED_FILES = [".env.local", ".DS_Store", "Thumbs.db"];

function isExcluded(path: string): boolean {
  const parts = path.split("/").filter(Boolean);
  if (parts.some((p) => EXCLUDED_DIRS.includes(p))) return true;
  const name = parts[parts.length - 1] ?? "";
  return EXCLUDED_FILES.includes(name) || name.endsWith(".pyc");
}

// Якщо весь архів загорнутий в одну теку (типово для GitHub-зіпів) — новий
// .env має лягти всередину неї, поруч із package.json, а не назовні.
function commonRoot(paths: string[]): string {
  if (!paths.length) return "";
  const first = paths[0].split("/")[0];
  if (!first) return "";
  const allShare = paths.every((p) => p === first || p.startsWith(`${first}/`));
  const isDir = paths.some((p) => p.startsWith(`${first}/`));
  return allShare && isDir ? `${first}/` : "";
}

// Замінює значення ключа, зберігаючи решту файлу — коментарі, порядок,
// групування. Рядок може бути закоментований (`# BOT_TOKEN=...`) або мати
// пробіли навколо `=`. Немає такого ключа взагалі — дописуємо в кінець.
// Строго перевіряємо, щоб після необов'язкового '# ' йшла точна назва ключа,
// уникаючи випадкового співпадіння з довільними коментарями.
function setEnvLine(content: string, key: string, value: string): string {
  const quoted = quoteIfNeeded(value);
  // Нормалізуємо переноси рядків перед розбиттям
  const isCrlf = content.includes("\r\n");
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n");
  const keyPattern = new RegExp(`^(?:#\\s*)?${key}\\s*=`);

  let replaced = false;
  for (let i = 0; i < lines.length; i++) {
    if (keyPattern.test(lines[i].trim())) {
      lines[i] = `${key}=${quoted}`;
      replaced = true;
      break;
    }
  }

  if (!replaced) {
    if (lines.length > 0 && lines[lines.length - 1] === "") {
      lines[lines.length - 1] = `${key}=${quoted}`;
      lines.push("");
    } else {
      lines.push(`${key}=${quoted}`);
      lines.push("");
    }
  }

  const newline = isCrlf ? "\r\n" : "\n";
  return lines.join(newline);
}

export async function packageOrder(
  order: StoredOrder,
  product: Product,
): Promise<PackageResult> {
  if (!product.fileUrl) {
    return { ok: false, error: "У товару не завантажений архів" };
  }

  const values = decryptJson<EnvValues>(order.envData);
  if (!values || !Object.keys(values).length) {
    return {
      ok: false,
      error:
        "Немає даних клієнта для .env (не збережені, застаріли або змінився ENV_DATA_SECRET)",
    };
  }

  const archive = await getObject(product.fileUrl);
  if (!archive) {
    return { ok: false, error: "Не вдалося завантажити архів товару зі сховища" };
  }

  let entries: Record<string, Uint8Array>;
  try {
    entries = unzipSync(archive);
  } catch {
    return { ok: false, error: "Файл товару не читається як ZIP" };
  }

  const out: Record<string, Uint8Array> = {};
  let total = 0;
  for (const [path, bytes] of Object.entries(entries)) {
    if (path.endsWith("/") || isExcluded(path)) continue;
    total += bytes.byteLength;
    if (total > MAX_UNPACKED_BYTES) {
      return {
        ok: false,
        error: `Архів завеликий (> ${Math.round(MAX_UNPACKED_BYTES / 1024 / 1024)} МБ у розпакованому вигляді)`,
      };
    }
    out[path] = bytes;
  }

  if (!Object.keys(out).length) {
    return { ok: false, error: "Після фільтрації в архіві не лишилось файлів" };
  }

  const dec = new TextDecoder();
  const enc = new TextEncoder();
  let patched = false;

  // Шукаємо існуючі .env файли в архіві
  for (const path of Object.keys(out)) {
    const base = path.split("/").pop() ?? "";
    if (base !== ".env") continue;

    let content = dec.decode(out[path]);
    for (const [key, value] of Object.entries(values)) {
      content = setEnvLine(content, key, value);
    }
    out[path] = enc.encode(content);
    patched = true;
  }

  // Якщо файлу .env не було, але є .env.example — беремо його як основу для нового .env,
  // при цьому сам .env.example залишаємо абсолютно чистим і недоторканим!
  if (!patched) {
    for (const path of Object.keys(out)) {
      const base = path.split("/").pop() ?? "";
      if (base !== ".env.example") continue;

      const envPath = path.slice(0, path.length - base.length) + ".env";
      let content = dec.decode(out[path]);
      for (const [key, value] of Object.entries(values)) {
        content = setEnvLine(content, key, value);
      }
      out[envPath] = enc.encode(content);
      patched = true;
      break;
    }
  }

  // У шаблоні взагалі немає ані .env, ані .env.example — генеруємо .env з нуля в корені.
  if (!patched) {
    const root = commonRoot(Object.keys(out));
    out[`${root}.env`] = enc.encode(
      renderEnvFile(product.envFields ?? [], values, {
        productTitle: product.title,
        orderId: order.id,
      }),
    );
  }

  let zipped: Uint8Array;
  try {
    zipped = zipSync(out, { level: 6 });
  } catch (e) {
    console.error("[packager] zip failed:", e);
    return { ok: false, error: "Не вдалося зібрати архів" };
  }

  const safeSlug = product.slug.replace(/[^a-z0-9-]/gi, "") || "product";
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
      name: `${safeSlug}-${order.id}.zip`,
      files: Object.keys(out).length,
      bytes: zipped,
      envValues: values,
    };
  } catch (e) {
    console.error("[packager] upload failed:", e);
    return { ok: false, error: "Не вдалося зберегти зібраний архів" };
  }
}
