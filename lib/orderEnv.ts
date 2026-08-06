import "server-only";
import type { Product } from "./products";
import { validateEnvValues, type EnvValues } from "./envFields";
import { checkTelegramToken } from "./tgToken";
import { encryptJson } from "./crypto";

// Серверна підготовка .env-даних замовлення: перевірка → перевірка токенів у
// Telegram → шифрування. Спільна для /api/order, /api/pay/now і /api/pay/jar,
// щоб правила не розповзлися по трьох роутах.

export type PreparedEnv =
  | { ok: true; envData?: string; values: EnvValues }
  | { ok: false; error: string };

export async function prepareEnvData(
  product: Product,
  input: unknown,
): Promise<PreparedEnv> {
  const fields = product.envFields ?? [];
  if (!fields.length) return { ok: true, values: {} };

  const validated = validateEnvValues(fields, input);
  if (!validated.ok) return validated;

  // Токени перевіряємо повторно на сервері: клієнт міг обійти форму.
  for (const field of fields) {
    if (field.type !== "telegram_token") continue;
    const value = validated.values[field.key];
    if (!value) continue;
    const check = await checkTelegramToken(value);
    if (!check.ok) {
      return { ok: false, error: `«${field.label}»: ${check.error}` };
    }
  }

  return {
    ok: true,
    values: validated.values,
    envData: encryptJson(validated.values),
  };
}
