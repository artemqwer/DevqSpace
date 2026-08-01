import "server-only";
import crypto from "node:crypto";

// Валідація Telegram Mini App initData.
// Telegram підписує initData HMAC-ключем, похідним від токена бота. Перевірка
// підпису доводить, що дані справді від Telegram і не підроблені. Далі
// звіряємо user.id з ADMIN_CHAT_ID — доступ лише в адміна.
// Док: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

// Скільки initData вважається свіжим (сек). Telegram кладе auth_date.
const MAX_AGE_SEC = 24 * 60 * 60;

export type InitDataCheck = {
  ok: boolean;
  userId?: number;
  username?: string;
  reason?: string;
};

export function validateInitData(initData: string): InitDataCheck {
  if (!BOT_TOKEN) return { ok: false, reason: "no_bot_token" };
  if (!initData) return { ok: false, reason: "empty" };

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return { ok: false, reason: "no_hash" };

  // 1. data_check_string: усі поля крім hash, відсортовані, як key=value через \n
  const pairs: string[] = [];
  for (const [key, value] of params.entries()) {
    if (key === "hash") continue;
    pairs.push(`${key}=${value}`);
  }
  pairs.sort();
  const dataCheckString = pairs.join("\n");

  // 2. secret_key = HMAC_SHA256(key="WebAppData", data=bot_token)
  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(BOT_TOKEN)
    .digest();
  const calcHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  // 3. Порівняння в постійному часі
  const a = Buffer.from(calcHash, "hex");
  const b = Buffer.from(hash, "hex");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { ok: false, reason: "bad_hash" };
  }

  // 4. Свіжість
  const authDate = Number(params.get("auth_date") ?? 0);
  if (authDate && Date.now() / 1000 - authDate > MAX_AGE_SEC) {
    return { ok: false, reason: "expired" };
  }

  // 5. Розбір user
  let userId: number | undefined;
  let username: string | undefined;
  try {
    const user = JSON.parse(params.get("user") ?? "{}") as {
      id?: number;
      username?: string;
    };
    userId = user.id;
    username = user.username;
  } catch {
    return { ok: false, reason: "bad_user" };
  }

  return { ok: true, userId, username };
}

// Чи є цей user адміном (id збігається з TELEGRAM_ADMIN_CHAT_ID).
export function isAdminUser(userId?: number): boolean {
  if (!ADMIN_CHAT_ID || userId === undefined) return false;
  return String(userId) === String(ADMIN_CHAT_ID);
}
