// Telegram Bot API helper — серверна частина (Route Handler / Server Action only)
import { getExtraAdmins } from "./store";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

export const TG_CONFIG = {
  hasToken: Boolean(BOT_TOKEN),
  hasAdmin: Boolean(ADMIN_CHAT_ID),
  adminChatId: ADMIN_CHAT_ID,
};

// Усі chat_id адмінів: головний (env) + додані через запрошення.
export async function getAllAdminChatIds(): Promise<string[]> {
  const ids = new Set<string>();
  if (ADMIN_CHAT_ID) ids.add(String(ADMIN_CHAT_ID));
  for (const id of await getExtraAdmins()) ids.add(String(id));
  return [...ids];
}

// Розсилка повідомлення всім адмінам (напр. сповіщення про замовлення).
export async function notifyAllAdmins(
  text: string,
  keyboard?: InlineKeyboard,
): Promise<void> {
  const ids = await getAllAdminChatIds();
  await Promise.all(ids.map((id) => tgSendMessage(id, text, "HTML", keyboard)));
}

export type InlineKeyboard = { inline_keyboard: InlineButton[][] };

export async function tgSendMessage(
  chatId: string | number,
  text: string,
  parseMode: "HTML" | "Markdown" | "" = "HTML",
  keyboard?: InlineKeyboard,
): Promise<boolean> {
  if (!BOT_TOKEN) {
    console.warn("[telegram] BOT_TOKEN not set, skipping sendMessage");
    return false;
  }
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: parseMode || undefined,
          disable_web_page_preview: true,
          reply_markup: keyboard,
        }),
        cache: "no-store",
      },
    );
    const data = (await res.json()) as { ok: boolean; description?: string };
    if (!data.ok) console.error("[telegram] sendMessage failed:", data);
    return data.ok;
  } catch (e) {
    console.error("[telegram] sendMessage error:", e);
    return false;
  }
}

// Редагує текст (і клавіатуру) вже надісланого повідомлення — для навігації
// по інлайн-меню бота без спаму новими повідомленнями.
export async function tgEditMessageText(
  chatId: string | number,
  messageId: number,
  text: string,
  keyboard?: InlineKeyboard,
): Promise<boolean> {
  if (!BOT_TOKEN) return false;
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
          reply_markup: keyboard,
        }),
        cache: "no-store",
      },
    );
    const data = (await res.json()) as { ok: boolean; description?: string };
    if (!data.ok) console.error("[telegram] editMessageText failed:", data);
    return data.ok;
  } catch (e) {
    console.error("[telegram] editMessageText error:", e);
    return false;
  }
}

// Надсилає файл (документ) у чат. document — публічний URL, Telegram сам його
// підтягне. Використовується для видачі ZIP-архіву клієнту.
export async function tgSendDocument(
  chatId: string | number,
  documentUrl: string,
  caption?: string,
): Promise<boolean> {
  if (!BOT_TOKEN) return false;
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          document: documentUrl,
          caption,
          parse_mode: caption ? "HTML" : undefined,
        }),
        cache: "no-store",
      },
    );
    const data = (await res.json()) as { ok: boolean; description?: string };
    if (!data.ok) console.error("[telegram] sendDocument failed:", data);
    return data.ok;
  } catch (e) {
    console.error("[telegram] sendDocument error:", e);
    return false;
  }
}

// Username бота (для deep-link t.me/<bot>?start=...). Кешується на час процесу.
let cachedBotUsername: string | null | undefined;
export async function tgGetBotUsername(): Promise<string | null> {
  if (cachedBotUsername !== undefined) return cachedBotUsername;
  if (!BOT_TOKEN) return (cachedBotUsername = null);
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`, {
      cache: "no-store",
    });
    const data = (await res.json()) as {
      ok: boolean;
      result?: { username?: string };
    };
    cachedBotUsername = data.ok ? (data.result?.username ?? null) : null;
  } catch {
    cachedBotUsername = null;
  }
  return cachedBotUsername;
}

export async function tgSetWebhook(
  url: string,
  secretToken: string,
): Promise<{ ok: boolean; description?: string }> {
  if (!BOT_TOKEN) {
    return { ok: false, description: "BOT_TOKEN not set" };
  }
  const res = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        secret_token: secretToken,
        allowed_updates: ["message", "callback_query"],
        drop_pending_updates: true,
      }),
      cache: "no-store",
    },
  );
  return (await res.json()) as { ok: boolean; description?: string };
}

export async function tgGetWebhookInfo(): Promise<unknown> {
  if (!BOT_TOKEN) return { ok: false, description: "BOT_TOKEN not set" };
  const res = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`,
    { cache: "no-store" },
  );
  return await res.json();
}

// Встановлює кнопку "Меню" біля поля вводу як вхід у Mini App.
export async function tgSetChatMenuButton(
  chatId: string | number,
  text: string,
  url: string,
): Promise<boolean> {
  if (!BOT_TOKEN) return false;
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/setChatMenuButton`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          menu_button: { type: "web_app", text, web_app: { url } },
        }),
        cache: "no-store",
      },
    );
    const data = (await res.json()) as { ok: boolean };
    return data.ok;
  } catch (e) {
    console.error("[telegram] setChatMenuButton error:", e);
    return false;
  }
}

// Заповнює список команд бота (меню "/" у клієнті Telegram).
export async function tgSetMyCommands(
  commands: { command: string; description: string }[],
): Promise<boolean> {
  if (!BOT_TOKEN) return false;
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/setMyCommands`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commands }),
        cache: "no-store",
      },
    );
    const data = (await res.json()) as { ok: boolean };
    return data.ok;
  } catch (e) {
    console.error("[telegram] setMyCommands error:", e);
    return false;
  }
}

export async function tgDeleteWebhook(): Promise<unknown> {
  if (!BOT_TOKEN) return { ok: false, description: "BOT_TOKEN not set" };
  const res = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`,
    { method: "POST", cache: "no-store" },
  );
  return await res.json();
}

export type OrderPayload = {
  type: "product" | "custom";
  productTitle?: string;
  productSlug?: string;
  productPrice?: number;
  // Custom-fields
  customType?: string;
  budget?: string;
  deadline?: string;
  // Common contact
  name: string;
  contactMethod: "telegram" | "email" | "phone";
  contact: string;
  message: string;
};

export function formatOrderMessage(payload: OrderPayload): string {
  const lines: string[] = [];

  if (payload.type === "product") {
    lines.push("🛒 <b>Нове замовлення продукту</b>");
    lines.push("");
    lines.push(`📦 <b>Товар:</b> ${escape(payload.productTitle ?? "—")}`);
    if (payload.productPrice !== undefined) {
      lines.push(`💵 <b>Ціна:</b> $${payload.productPrice}`);
    }
    if (payload.productSlug) {
      lines.push(`🔗 <code>${escape(payload.productSlug)}</code>`);
    }
  } else {
    lines.push("🔧 <b>Заявка на кастомну розробку</b>");
    lines.push("");
    if (payload.customType) {
      lines.push(`🧱 <b>Тип:</b> ${escape(payload.customType)}`);
    }
    if (payload.budget) {
      lines.push(`💵 <b>Бюджет:</b> ${escape(payload.budget)}`);
    }
    if (payload.deadline) {
      lines.push(`⏱ <b>Дедлайн:</b> ${escape(payload.deadline)}`);
    }
  }

  lines.push("");
  lines.push("👤 <b>Клієнт</b>");
  lines.push(`Ім'я: ${escape(payload.name)}`);
  lines.push(
    `${contactLabel(payload.contactMethod)}: ${escape(payload.contact)}`,
  );

  if (payload.message?.trim()) {
    lines.push("");
    lines.push("📝 <b>ТЗ / Деталі</b>");
    lines.push(`<pre>${escape(payload.message)}</pre>`);
  }

  lines.push("");
  lines.push(`<i>${new Date().toLocaleString("uk-UA")}</i>`);

  return lines.join("\n");
}

function contactLabel(m: OrderPayload["contactMethod"]): string {
  if (m === "telegram") return "Telegram";
  if (m === "email") return "Email";
  return "Телефон";
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ---- Inline keyboard для замовлень ----------------------------------

export const ORDER_STATUS_LABEL: Record<string, string> = {
  new: "🆕 Нове",
  in_progress: "⏳ В роботі",
  done: "✅ Закрито",
  rejected: "❌ Відхилено",
};

type InlineButton = { text: string } & (
  | { callback_data: string }
  | { url: string }
  | { web_app: { url: string } }
);

export function buildOrderKeyboard(
  orderId: string,
  current?: string,
): { inline_keyboard: InlineButton[][] } {
  const btn = (label: string, status: string): InlineButton => ({
    text: current === status ? `• ${label} •` : label,
    callback_data: `st:${orderId}:${status}`,
  });
  return {
    inline_keyboard: [
      [btn("⏳ В роботі", "in_progress"), btn("✅ Закрити", "done")],
      [
        btn("❌ Відхилити", "rejected"),
        { text: "💰 Оплачено", callback_data: `paid:${orderId}` },
      ],
    ],
  };
}

export async function tgAnswerCallback(
  callbackQueryId: string,
  text: string,
): Promise<void> {
  if (!BOT_TOKEN) return;
  try {
    await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
        cache: "no-store",
      },
    );
  } catch (e) {
    console.error("[telegram] answerCallback error:", e);
  }
}

export async function tgEditReplyMarkup(
  chatId: string | number,
  messageId: number,
  orderId: string,
  current: string,
): Promise<void> {
  if (!BOT_TOKEN) return;
  try {
    await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/editMessageReplyMarkup`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
          reply_markup: buildOrderKeyboard(orderId, current),
        }),
        cache: "no-store",
      },
    );
  } catch (e) {
    console.error("[telegram] editReplyMarkup error:", e);
  }
}

export async function sendOrderToTelegram(
  payload: OrderPayload,
  orderId?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!BOT_TOKEN || !ADMIN_CHAT_ID) {
    console.warn(
      "[telegram] TELEGRAM_BOT_TOKEN або TELEGRAM_ADMIN_CHAT_ID не задано — повідомлення не надіслано",
    );
    console.log("[telegram] dry-run message:\n" + formatOrderMessage(payload));
    return { ok: true };
  }

  const text = formatOrderMessage(payload);
  const keyboard = orderId ? buildOrderKeyboard(orderId, "new") : undefined;
  const admins = await getAllAdminChatIds();

  try {
    // Надсилаємо всім адмінам (головний + додані). Успіх, якщо хоч комусь дійшло.
    const results = await Promise.all(
      admins.map((id) => tgSendMessage(id, text, "HTML", keyboard)),
    );
    if (results.some(Boolean)) return { ok: true };
    return { ok: false, error: "Telegram API error" };
  } catch (e) {
    console.error("[telegram] fetch error:", e);
    return { ok: false, error: "Не вдалось зв'язатися з Telegram" };
  }
}
