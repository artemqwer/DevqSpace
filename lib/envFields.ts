import type { EnvField } from "./products";

// Спільна логіка для форми замовлення (клієнт) і роутів оплати (сервер).
// Без "server-only" і без node:* — файл їде і в браузерний бандл.

export const TG_TOKEN_RE = /^\d{6,12}:[A-Za-z0-9_-]{30,}$/;

export const MAX_ENV_VALUE_LEN = 2000;

export type EnvValues = Record<string, string>;

export type ValidationResult =
  | { ok: true; values: EnvValues }
  | { ok: false; error: string };

// Перевіряє значення проти опису полів товару. Сервер зобов'язаний викликати
// це повторно: клієнтська перевірка нічого не гарантує.
export function validateEnvValues(
  fields: EnvField[],
  input: unknown,
  // ignoreRequired — для шляху «залишити заявку»: незаповнене обов'язкове поле
  // там не помилка, клієнту допоможе саппорт.
  opts?: { ignoreRequired?: boolean },
): ValidationResult {
  if (!fields.length) return { ok: true, values: {} };

  const raw =
    input && typeof input === "object" && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : {};

  const values: EnvValues = {};

  for (const field of fields) {
    // \r і \n у значенні поламали б згенерований .env — вирізаємо одразу.
    const value = String(raw[field.key] ?? field.defaultValue ?? "")
      .replace(/[\r\n]+/g, " ")
      .trim();

    if (!value) {
      if (field.required && !opts?.ignoreRequired) {
        return { ok: false, error: `Заповніть поле «${field.label}»` };
      }
      continue;
    }

    if (value.length > MAX_ENV_VALUE_LEN) {
      return { ok: false, error: `«${field.label}» — занадто довге значення` };
    }

    if (field.type === "telegram_token" && !TG_TOKEN_RE.test(value)) {
      return {
        ok: false,
        error: `«${field.label}» не схоже на токен бота (формат 1234567890:AA...)`,
      };
    }

    if (field.type === "number" && !/^-?\d+$/.test(value)) {
      return { ok: false, error: `«${field.label}» має бути числом` };
    }

    if (field.type === "url" && !/^https?:\/\/\S+$/i.test(value)) {
      // URL-поля часто містять не-HTTP схеми (postgresql://, file:./dev.db),
      // тож вимагаємо лише відсутність пробілів.
      if (/\s/.test(value)) {
        return { ok: false, error: `«${field.label}» не схоже на адресу` };
      }
    }

    values[field.key] = value;
  }

  return { ok: true, values };
}

// Чи заповнено все обов'язкове — для розблокування кнопки оплати.
export function requiredFilled(fields: EnvField[], values: EnvValues): boolean {
  return fields
    .filter((f) => f.required)
    .every((f) => (values[f.key] ?? "").trim().length > 0);
}

// Значення, які треба брати в лапки: пробіли, #, лапки, службові символи.
function quoteIfNeeded(value: string): string {
  if (!/[\s#"'$`\\]/.test(value)) return value;
  return `"${value.replace(/(["\\$`])/g, "\\$1")}"`;
}

// Збирає текст .env, який лягає в корінь персонального архіву.
export function renderEnvFile(
  fields: EnvField[],
  values: EnvValues,
  meta?: { productTitle?: string; orderId?: string },
): string {
  const lines: string[] = [
    "# Згенеровано автоматично DevqSpace",
    ...(meta?.productTitle ? [`# Товар: ${meta.productTitle}`] : []),
    ...(meta?.orderId ? [`# Замовлення: ${meta.orderId}`] : []),
    `# ${new Date().toISOString()}`,
    "",
  ];

  for (const field of fields) {
    const value = values[field.key];
    if (field.hint) lines.push(`# ${field.hint}`);
    if (value === undefined || value === "") {
      // Необов'язкове й незаповнене — лишаємо закоментованим, щоб клієнт
      // бачив, що таке налаштування взагалі існує.
      lines.push(`# ${field.key}=`);
    } else {
      lines.push(`${field.key}=${quoteIfNeeded(value)}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
