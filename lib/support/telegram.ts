import {
  saveTgMessageTicket,
  getTicketIdByTgMessage,
  getAllSupportAdminChatIds,
} from "./store";
import type { SupportTicket } from "./types";

const SUPPORT_BOT_TOKEN = process.env.SUPPORT_TELEGRAM_BOT_TOKEN || "";
const SUPPORT_ADMIN_CHAT_ID =
  process.env.SUPPORT_TELEGRAM_ADMIN_CHAT_ID || process.env.TELEGRAM_ADMIN_CHAT_ID;
const SUPPORT_WEBHOOK_SECRET =
  process.env.SUPPORT_TELEGRAM_WEBHOOK_SECRET ||
  process.env.TELEGRAM_WEBHOOK_SECRET ||
  "devq_support_webhook_secret_32chars_long";
const SUPPORT_SETUP_KEY =
  process.env.SUPPORT_TELEGRAM_SETUP_KEY ||
  process.env.TELEGRAM_SETUP_KEY ||
  "devq_support_setup_2026";

export const SUPPORT_TG_CONFIG = {
  hasToken: Boolean(SUPPORT_BOT_TOKEN),
  hasAdmin: Boolean(SUPPORT_ADMIN_CHAT_ID),
  adminChatId: SUPPORT_ADMIN_CHAT_ID,
  webhookSecret: SUPPORT_WEBHOOK_SECRET,
  setupKey: SUPPORT_SETUP_KEY,
};

export type InlineButton = {
  text: string;
  callback_data?: string;
  url?: string;
};

export type InlineKeyboard = { inline_keyboard: InlineButton[][] };

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Надіслати повідомлення через Support Bot.
 */
export async function sendSupportTgMessage(
  chatId: string | number,
  text: string,
  parseMode: "HTML" | "Markdown" | "" = "HTML",
  keyboard?: InlineKeyboard,
  replyToMessageId?: number,
): Promise<{ ok: boolean; message_id?: number; description?: string }> {
  if (!SUPPORT_BOT_TOKEN) {
    console.warn("[support-telegram] SUPPORT_TELEGRAM_BOT_TOKEN not configured");
    return { ok: false, description: "SUPPORT_TELEGRAM_BOT_TOKEN not set" };
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${SUPPORT_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: parseMode || undefined,
          disable_web_page_preview: true,
          reply_markup: keyboard,
          reply_to_message_id: replyToMessageId,
        }),
        cache: "no-store",
      },
    );

    const data = (await res.json()) as {
      ok: boolean;
      description?: string;
      result?: { message_id: number };
    };

    if (!data.ok) {
      console.error("[support-telegram] sendMessage error:", data);
      return { ok: false, description: data.description };
    }

    return { ok: true, message_id: data.result?.message_id };
  } catch (e: any) {
    console.error("[support-telegram] sendMessage fetch error:", e);
    return { ok: false, description: e.message };
  }
}

/**
 * Відредагувати текст повідомлення через Support Bot.
 */
export async function editSupportTgMessage(
  chatId: string | number,
  messageId: number,
  text: string,
  keyboard?: InlineKeyboard,
): Promise<boolean> {
  if (!SUPPORT_BOT_TOKEN) return false;

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${SUPPORT_BOT_TOKEN}/editMessageText`,
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
    const data = (await res.json()) as { ok: boolean };
    return data.ok;
  } catch (e) {
    console.error("[support-telegram] editMessageText error:", e);
    return false;
  }
}

/**
 * Відповісти на callback_query через Support Bot.
 */
export async function answerSupportTgCallback(
  callbackQueryId: string,
  text?: string,
): Promise<void> {
  if (!SUPPORT_BOT_TOKEN) return;

  try {
    await fetch(
      `https://api.telegram.org/bot${SUPPORT_BOT_TOKEN}/answerCallbackQuery`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
        cache: "no-store",
      },
    );
  } catch (e) {
    console.error("[support-telegram] answerCallback error:", e);
  }
}

/**
 * Сповіщення операторів у чат підтримки про новий тікет чи повідомлення від клієнта.
 */
export async function notifySupportOperators(
  ticket: SupportTicket,
  userMessageText: string,
  reason: string,
): Promise<boolean> {
  if (!SUPPORT_ADMIN_CHAT_ID) {
    console.warn("[support-telegram] SUPPORT_TELEGRAM_ADMIN_CHAT_ID not set");
    return false;
  }

  const shortId = ticket.id;
  const recentHistory = ticket.messages
    .slice(-4)
    .map(
      (m) =>
        `<b>${m.sender === "user" ? "👤 Клієнт" : m.sender === "operator" ? "👨‍💻 Оператор" : "🤖 AI"}:</b> ${escapeHtml(
          m.text.slice(0, 160),
        )}`,
    )
    .join("\n");

  const clientContact =
    ticket.clientInfo?.contact ||
    ticket.clientInfo?.name ||
    (ticket.sessionId.startsWith("tg_") ? `TG #${ticket.sessionId.replace("tg_", "")}` : "Гість сайту");

  const statusLabel =
    ticket.status === "waiting_operator"
      ? "🔴 Очікує оператора"
      : ticket.status === "operator_active"
      ? "🟡 Оператор у діалозі"
      : "🟢 AI";

  const adminText =
    `🚨 <b>Підтримка DevqSpace | Звернення клієнта</b>\n\n` +
    `📋 <b>Тікет:</b> <code>#${shortId}</code>\n` +
    `📊 <b>Статус:</b> ${statusLabel}\n` +
    `👤 <b>Клієнт:</b> ${escapeHtml(clientContact)}\n` +
    `⚡ <b>Причина:</b> ${escapeHtml(reason)}\n\n` +
    `💬 <b>Повідомлення:</b>\n<i>"${escapeHtml(userMessageText)}"</i>\n\n` +
    `📜 <b>Останній контекст:</b>\n${recentHistory || "Початок діалогу"}\n\n` +
    `<i>💡 Щоб відповісти клієнту — просто зробіть <b>Reply (Відповісти)</b> на це повідомлення в Telegram.</i>`;

  const keyboard: InlineKeyboard = {
    inline_keyboard: [
      [
        {
          text: "🤖 Повернути AI",
          callback_data: `sup:ai:${ticket.id}`,
        },
        {
          text: "🔒 Закрити тікет",
          callback_data: `sup:close:${ticket.id}`,
        },
      ],
      [
        {
          text: "💬 Відкрити в адмінці",
          url: "https://devq.space/admin/support",
        },
      ],
    ],
  };

  const adminChatIds = await getAllSupportAdminChatIds();
  if (!adminChatIds.length) {
    console.warn("[support-telegram] No support admins registered yet");
    return false;
  }

  let anySent = false;
  for (const targetChatId of adminChatIds) {
    const res = await sendSupportTgMessage(
      targetChatId,
      adminText,
      "HTML",
      keyboard,
    );

    if (res.ok && res.message_id) {
      await saveTgMessageTicket(res.message_id, ticket.id);
      anySent = true;
    }
  }

  return anySent;
}

/**
 * Визначає ticketId за повідомленням оператора (перевірка Reply та регекс).
 */
export async function resolveTicketIdFromTgMessage(msg: {
  reply_to_message?: { message_id: number; text?: string };
  text?: string;
}): Promise<string | null> {
  // 1. Якщо це Reply на повідомлення бота
  if (msg.reply_to_message) {
    const cached = await getTicketIdByTgMessage(msg.reply_to_message.message_id);
    if (cached) return cached;

    // Резервний пошук ID у тексті повідомлення, на яке відповіли:
    // шукаємо tick_... або #tick_...
    const text = msg.reply_to_message.text || "";
    const match = text.match(/(tick_[a-zA-Z0-9_-]+)/i);
    if (match && match[1]) {
      return match[1];
    }
  }

  // 2. Якщо вказано команду виду: /reply <ticket_id> <текст>
  if (msg.text) {
    const trimmed = msg.text.trim();
    if (trimmed.startsWith("/reply ")) {
      const parts = trimmed.split(/\s+/);
      if (parts[1]) {
        return parts[1].replace("#", "");
      }
    }
  }

  return null;
}

/**
 * Керування webhook Support-бота
 */
export async function setSupportTgWebhook(
  url: string,
  secretToken: string,
): Promise<{ ok: boolean; description?: string }> {
  if (!SUPPORT_BOT_TOKEN) {
    return { ok: false, description: "SUPPORT_TELEGRAM_BOT_TOKEN not configured" };
  }
  const res = await fetch(
    `https://api.telegram.org/bot${SUPPORT_BOT_TOKEN}/setWebhook`,
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

export async function getSupportTgWebhookInfo(): Promise<unknown> {
  if (!SUPPORT_BOT_TOKEN) return { ok: false, description: "SUPPORT_TELEGRAM_BOT_TOKEN not set" };
  const res = await fetch(
    `https://api.telegram.org/bot${SUPPORT_BOT_TOKEN}/getWebhookInfo`,
    { cache: "no-store" },
  );
  return await res.json();
}

export async function deleteSupportTgWebhook(): Promise<unknown> {
  if (!SUPPORT_BOT_TOKEN) return { ok: false, description: "SUPPORT_TELEGRAM_BOT_TOKEN not set" };
  const res = await fetch(
    `https://api.telegram.org/bot${SUPPORT_BOT_TOKEN}/deleteWebhook`,
    { cache: "no-store" },
  );
  return await res.json();
}
