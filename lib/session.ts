import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";

export const ADMIN_COOKIE = "nexus_admin";

function getSecretValue(): string {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "ADMIN_SESSION_SECRET or ADMIN_PASSWORD must be configured in production",
      );
    }
    return "dev-insecure-secret-change-me";
  }
  return secret;
}

const key = new TextEncoder().encode(getSecretValue());

const MAX_AGE = 7 * 24 * 60 * 60; // 7 днів у секундах

export async function createSession(): Promise<void> {
  const token = await new SignJWT({ admin: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}

export async function getSession(): Promise<boolean> {
  // 1. Пряма автентифікація через API-ключ або пароль у заголовках (для скриптів та автоматизації)
  try {
    const headerList = await headers();
    const rawAuth =
      headerList.get("x-admin-key") ||
      headerList.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (rawAuth) {
      const auth = rawAuth.trim();
      const expectedPassword = process.env.ADMIN_PASSWORD;
      const expectedSecret = process.env.ADMIN_SESSION_SECRET;
      if (
        (expectedPassword && auth === expectedPassword) ||
        (expectedSecret && auth === expectedSecret)
      ) {
        return true;
      }
    }
  } catch {
    // headers() може бути недоступний у деяких статичних контекстах
  }

  // 2. Автентифікація через сесійну cookie адмінки
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, key);
    return payload.admin === true;
  } catch {
    return false;
  }
}

export function verifyPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  // довжина різна → одразу false; інакше посимвольне порівняння
  if (input.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < input.length; i++) {
    diff |= input.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}
