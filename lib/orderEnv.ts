import "server-only";
import type { Product } from "./products";
import { validateEnvValues, type EnvValues } from "./envFields";
import { checkTelegramToken } from "./tgToken";
import { encryptJson } from "./crypto";

// Серверна підготовка .env-даних замовлення: перевірка → перевірка токенів у
// Telegram → шифрування. Спільна для /api/order, /api/pay/now і /api/pay/jar,
// щоб правила не розповзлися по трьох роутах.

export type PreparedEnv =
  | { ok: true; envData?: string; values: EnvValues; warnings: string[] }
  | { ok: false; error: string };

// strict  — шлях оплати: неповні або невірні дані відхиляються, бо архів
//           збереться зіпсованим.
// lenient — шлях «просто залишити заявку»: клієнт міг не розібратися в
//           налаштуваннях, і це нормально — оформимо вручну. Зберігаємо те,
//           що заповнено правильно, решту віддаємо попередженнями адміну.
export async function prepareEnvData(
  product: Product,
  input: unknown,
  mode: "strict" | "lenient" = "strict",
): Promise<PreparedEnv> {
  const fields = product.envFields ?? [];
  if (!fields.length) return { ok: true, values: {}, warnings: [] };

  const warnings: string[] = [];

  const validated = validateEnvValues(fields, input, {
    // У м'якому режимі порожні обов'язкові поля не є помилкою.
    ignoreRequired: mode === "lenient",
  });
  if (!validated.ok) {
    if (mode === "strict") return validated;
    // Значення не пройшло навіть формат — заявку все одно приймаємо, але
    // нічого не зберігаємо, щоб не потрапило сміття.
    return { ok: true, values: {}, warnings: [validated.error] };
  }

  const values = { ...validated.values };

  // Токени перевіряємо повторно на сервері: клієнт міг обійти форму.
  for (const field of fields) {
    if (field.type !== "telegram_token") continue;
    const value = values[field.key];
    if (!value) continue;
    const check = await checkTelegramToken(value);
    if (check.ok) continue;

    if (mode === "strict") {
      return { ok: false, error: `«${field.label}»: ${check.error}` };
    }
    // М'який режим: не зберігаємо неробочий токен, але й заявку не втрачаємо.
    delete values[field.key];
    warnings.push(`«${field.label}»: ${check.error}`);
  }

  if (mode === "lenient") {
    const missing = fields
      .filter((f) => f.required && !values[f.key])
      .map((f) => f.label);
    if (missing.length) {
      warnings.push(`не заповнено: ${missing.join(", ")}`);
    }
  }

  const hasValues = Object.keys(values).length > 0;

  return {
    ok: true,
    values,
    warnings,
    envData: hasValues ? encryptJson(values) : undefined,
  };
}
