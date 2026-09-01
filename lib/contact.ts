// Перевірка контакту клієнта. Спільна для форм (клієнт) і всіх роутів, що
// створюють замовлення (сервер) — без "server-only" і без node:*, файл їде
// і в браузерний бандл, як lib/envFields.ts.
//
// Раніше перевірялось лише `contact.trim()`, тому в замовлення проходили
// «@@@», «abc» замість пошти і «123» замість телефону: менеджер отримував
// заявку, з якою нічого не зробити.

export type ContactMethod = "telegram" | "email" | "phone";

export const CONTACT_METHODS: ContactMethod[] = ["telegram", "email", "phone"];

export function isContactMethod(v: unknown): v is ContactMethod {
  return v === "telegram" || v === "email" || v === "phone";
}

// Telegram: 5–32 символи, літери/цифри/підкреслення. Приймаємо і посилання
// (t.me/user, https://t.me/user), і @user, і голий user.
const TG_RE = /^[A-Za-z0-9_]{5,32}$/;

// Пошта: свідомо без «повного» RFC-регекса — він нічого не ловить на практиці.
// Вимагаємо крапку в домені: саме її бракує в «abc» і «user@localhost».
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

export const MAX_CONTACT_LEN = 120;

// Зводить введене до канонічного вигляду: @user, пошта в нижньому регістрі,
// телефон у форматі +380XXXXXXXXX.
export function normalizeContact(method: ContactMethod, raw: string): string {
  const value = raw.trim();

  if (method === "telegram") {
    // t.me/user, https://t.me/user, @user -> user
    const handle = value
      .replace(/^https?:\/\//i, "")
      .replace(/^(www\.)?t\.me\//i, "")
      .replace(/^@/, "")
      .split(/[/?#]/)[0];
    return handle ? `@${handle}` : "";
  }

  if (method === "email") return value.toLowerCase();

  // Телефон: лишаємо тільки цифри й провідний плюс.
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  // Локальні українські записи: 0XXXXXXXXX і 80XXXXXXXXX -> +380XXXXXXXXX.
  if (digits.length === 10 && digits.startsWith("0")) return `+38${digits}`;
  if (digits.length === 11 && digits.startsWith("80")) return `+3${digits}`;
  return `+${digits}`;
}

export type ContactCheck = { ok: true; value: string } | { ok: false; reason: "empty" | "format" };

export function validateContact(
  method: ContactMethod,
  raw: string,
): ContactCheck {
  if (!raw.trim()) return { ok: false, reason: "empty" };
  if (raw.length > MAX_CONTACT_LEN) return { ok: false, reason: "format" };

  const value = normalizeContact(method, raw);
  if (!value) return { ok: false, reason: "empty" };

  const ok =
    method === "telegram"
      ? TG_RE.test(value.slice(1))
      : method === "email"
        ? EMAIL_RE.test(value)
        : // Телефон: 9–15 цифр — межі E.164, покривають і місцеві, і міжнародні.
          /^\+\d{9,15}$/.test(value);

  return ok ? { ok: true, value } : { ok: false, reason: "format" };
}

// Ключ повідомлення в messages/*.json — щоб текст помилки був двомовний
// і редагувався в адмінці разом з рештою текстів.
export function contactErrorKey(
  method: ContactMethod,
  reason: "empty" | "format",
): string {
  if (reason === "empty") return "contactEmpty";
  return method === "telegram"
    ? "contactBadTelegram"
    : method === "email"
      ? "contactBadEmail"
      : "contactBadPhone";
}

// Розбір і перевірка контактної частини тіла запиту. Спільна для всіх
// чотирьох роутів, що створюють замовлення (order, pay/now, pay/jar,
// pay/wfp) — правило має бути одне, інакше платний шлях і безкоштовний
// розійдуться.
export type ParsedContact =
  | { ok: true; name: string; contactMethod: ContactMethod; contact: string }
  | { ok: false; error: string };

const SERVER_ERROR: Record<string, string> = {
  contactEmpty: "Вкажіть ім'я та контакт",
  contactBadTelegram: "Telegram-нік має вигляд @username (5–32 символи)",
  contactBadEmail: "Схоже, у пошті помилка — приклад: name@example.com",
  contactBadPhone: "Схоже, у номері помилка — приклад: +380 67 123 45 67",
};

export function parseContact(body: {
  name?: string;
  contactMethod?: unknown;
  contact?: string;
}): ParsedContact {
  const name = (body.name ?? "").trim();
  if (!name || name.length > MAX_CONTACT_LEN) {
    return { ok: false, error: SERVER_ERROR.contactEmpty };
  }
  if (!isContactMethod(body.contactMethod)) {
    return { ok: false, error: "Невірний спосіб зв'язку" };
  }

  const check = validateContact(body.contactMethod, body.contact ?? "");
  if (!check.ok) {
    return {
      ok: false,
      error: SERVER_ERROR[contactErrorKey(body.contactMethod, check.reason)],
    };
  }

  // Далі скрізь іде вже нормалізований контакт: @user, пошта в нижньому
  // регістрі, телефон у +380… — щоб «Артем» і «артем» не були двома клієнтами.
  return { ok: true, name, contactMethod: body.contactMethod, contact: check.value };
}
