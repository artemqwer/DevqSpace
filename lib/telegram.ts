// Telegram Bot API helper — серверна частина (Route Handler / Server Action only)

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

export const TG_CONFIG = {
  hasToken: Boolean(BOT_TOKEN),
  hasAdmin: Boolean(ADMIN_CHAT_ID),
  adminChatId: ADMIN_CHAT_ID,
};

export async function tgSendMessage(
  chatId: string | number,
  text: string,
  parseMode: "HTML" | "Markdown" | "" = "HTML",
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

type InlineButton = { text: string; callback_data: string };

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
      [btn("❌ Відхилити", "rejected")],
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
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_markup: orderId ? buildOrderKeyboard(orderId, "new") : undefined,
      }),
      cache: "no-store",
    });

    const data = (await res.json()) as { ok: boolean; description?: string };
    if (!data.ok) {
      console.error("[telegram] API error:", data);
      return { ok: false, error: data.description ?? "Telegram API error" };
    }
    return { ok: true };
  } catch (e) {
    console.error("[telegram] fetch error:", e);
    return { ok: false, error: "Не вдалось зв'язатися з Telegram" };
  }
}
