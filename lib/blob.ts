import "server-only";
import { put } from "@vercel/blob";
import { DEV_STUBS, devBaseUrl } from "./devStubs";
import { DEV_BLOB_ROUTE, devReadFile, devWriteFile } from "./devStorage";

// Єдина точка доступу до файлового сховища.
// Прод — Vercel Blob. Dev без BLOB_READ_WRITE_TOKEN — локальна тека
// .devq-storage/blob, яка віддається через /api/dev/blob. Код, що зберігає і
// читає архіви (upload, packager, delivery), однаковий в обох середовищах.

export type PutResult = { url: string; pathname: string };

export function blobEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN) || DEV_STUBS;
}

// Локальне сховище замість Blob — лише поза продом і лише поки немає токена.
function devBlobActive(): boolean {
  return DEV_STUBS && !process.env.BLOB_READ_WRITE_TOKEN;
}

export async function putObject(
  pathname: string,
  data: Uint8Array | File | Blob,
  contentType?: string,
): Promise<PutResult> {
  if (devBlobActive()) {
    const bytes =
      data instanceof Uint8Array
        ? data
        : new Uint8Array(await (data as Blob).arrayBuffer());
    if (!devWriteFile("blob", pathname, bytes)) {
      throw new Error("Некоректний шлях об'єкта");
    }
    return { url: `${devBaseUrl()}${DEV_BLOB_ROUTE}${pathname}`, pathname };
  }

  // @vercel/blob не приймає голий Uint8Array — загортаємо в Buffer.
  const body = data instanceof Uint8Array ? Buffer.from(data) : data;
  const blob = await put(pathname, body, {
    access: "public",
    contentType: contentType || "application/octet-stream",
  });
  return { url: blob.url, pathname: blob.pathname };
}

// Приймає і повний URL, і шлях всередині сховища.
export async function getObject(ref: string): Promise<Uint8Array | null> {
  const devPath = devPathFromRef(ref);
  if (devPath !== null) {
    return devReadFile("blob", devPath);
  }

  try {
    const res = await fetch(ref, { cache: "no-store" });
    if (!res.ok) return null;
    return new Uint8Array(await res.arrayBuffer());
  } catch {
    return null;
  }
}

// Витягує шлях у локальному сховищі з посилання виду
// http://localhost:3000/api/dev/blob/templates/....zip
function devPathFromRef(ref: string): string | null {
  if (!devBlobActive()) return null;
  const idx = ref.indexOf(DEV_BLOB_ROUTE);
  if (idx !== -1) return decodeURIComponent(ref.slice(idx + DEV_BLOB_ROUTE.length));
  // Голий ключ без схеми — теж наш.
  if (!/^https?:\/\//i.test(ref)) return ref.replace(/^\/+/, "");
  return null;
}
