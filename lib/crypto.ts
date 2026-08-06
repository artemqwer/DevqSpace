import "server-only";
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from "node:crypto";

// Шифрування .env-значень, які клієнт вводить при замовленні. Там лежить його
// бойовий BOT_TOKEN — у сховищі це не має бути відкритим текстом. Розшифровка
// відбувається лише в момент збірки архіву (lib/packager).

const ALGO = "aes-256-gcm";
const PREFIX = "v1";
// Фіксована сіль: ключ має бути відтворюваним між інстансами, а секретність
// тут забезпечує ENV_DATA_SECRET, не сіль.
const SALT = "devqspace.envdata.v1";

let cachedKey: Buffer | null = null;

function key(): Buffer {
  if (cachedKey) return cachedKey;
  const secret =
    process.env.ENV_DATA_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error(
      "Немає ENV_DATA_SECRET (ані ADMIN_SESSION_SECRET) — нема чим шифрувати дані клієнта",
    );
  }
  cachedKey = scryptSync(secret, SALT, 32);
  return cachedKey;
}

export function encryptJson(value: unknown): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key(), iv);
  const data = Buffer.concat([
    cipher.update(JSON.stringify(value), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [
    PREFIX,
    iv.toString("base64"),
    tag.toString("base64"),
    data.toString("base64"),
  ].join(":");
}

export function decryptJson<T>(payload: string | undefined): T | null {
  if (!payload) return null;
  const parts = payload.split(":");
  if (parts.length !== 4 || parts[0] !== PREFIX) return null;
  try {
    const decipher = createDecipheriv(
      ALGO,
      key(),
      Buffer.from(parts[1], "base64"),
    );
    decipher.setAuthTag(Buffer.from(parts[2], "base64"));
    const out = Buffer.concat([
      decipher.update(Buffer.from(parts[3], "base64")),
      decipher.final(),
    ]);
    return JSON.parse(out.toString("utf8")) as T;
  } catch {
    // Змінили секрет або пошкоджені дані — не валимо видачу, віддаємо null.
    return null;
  }
}

// Показ значення в адмінці без розкриття секрету цілком.
export function maskSecret(value: string): string {
  if (value.length <= 8) return "•".repeat(value.length);
  return `${value.slice(0, 6)}${"•".repeat(Math.min(12, value.length - 6))}`;
}
