import "server-only";
import {
  getOrCreateTicket,
  getTicket,
  addMessage,
  updateTicketStatus,
  getSupportSettings,
  saveTicket,
} from "./store";
import { askLLM, type LLMChatMessage } from "./llm";
import { analyzeMessageTriggers } from "./triggers";
import { notifyAllAdmins, type InlineKeyboard } from "@/lib/telegram";
import type { SupportTicket, SupportMessage } from "./types";

export type HandleUserMessageResult = {
  reply: string;
  sender: "ai" | "operator" | "system";
  ticket: SupportTicket;
  isFrozen: boolean;
};

/**
 * Сповіщення операторів у закритий адмін-чат/канал Telegram при ескалації.
 */
async function alertOperatorsAboutEscalation(
  ticket: SupportTicket,
  reason: string,
  userMessageText: string,
): Promise<void> {
  const shortId = ticket.id.slice(0, 15);
  const recentHistory = ticket.messages
    .slice(-4)
    .map((m) => `<b>${m.sender === "user" ? "👤 Клієнт" : "🤖 AI"}:</b> ${escapeHtml(m.text.slice(0, 150))}`)
    .join("\n");

  const adminText =
    `🚨 <b>Виклик оператора підтримки DevqSpace!</b>\n\n` +
    `📋 <b>Тікет:</b> <code>#${shortId}</code>\n` +
    `⚡ <b>Причина:</b> ${escapeHtml(reason)}\n` +
    `👤 <b>Клієнт:</b> ${escapeHtml(ticket.clientInfo?.contact || ticket.clientInfo?.name || "Гість сайту")}\n\n` +
    `💬 <b>Останнє повідомлення:</b>\n<i>"${escapeHtml(userMessageText)}"</i>\n\n` +
    `📜 <b>Контекст діалогу:</b>\n${recentHistory || "Початок діалогу"}\n\n` +
    `<i>AI заморожено для цього клієнта. Відповідайте в адмінці /admin/support.</i>`;

  const keyboard: InlineKeyboard = {
    inline_keyboard: [
      [
        {
          text: "💬 Відкрити в адмінці",
          url: "https://devq.space/admin/support",
        },
      ],
    ],
  };

  try {
    await notifyAllAdmins(adminText, keyboard);
  } catch (e) {
    console.error("[support] Failed to notify telegram admins:", e);
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Головний оркестратор обробки повідомлення від клієнта.
 */
export async function handleUserMessage(
  sessionId: string,
  messageText: string,
  clientMeta?: { ip?: string; userAgent?: string; contact?: string; name?: string },
): Promise<HandleUserMessageResult> {
  const ticket = await getOrCreateTicket(sessionId, clientMeta);
  const trimmed = messageText.trim();

  // 1. Додаємо повідомлення користувача в історію
  await addMessage(ticket.id, "user", trimmed);

  // 2. ПЕРЕВІРКА РЕЖИМУ ЗАМОРОЗКИ (AI Freeze Mode)
  // Якщо тікет уже у статусі очікування оператора або оператор уже веде діалог — AI мовчить!
  if (ticket.status === "waiting_operator" || ticket.status === "operator_active") {
    // Сповіщаємо операторів про нове повідомлення в активному тикеті
    ticket.unreadForOperator = true;
    await saveTicket(ticket);

    return {
      reply:
        "Менеджер підтримки вже сповіщений і відповість вам найближчим часом. Будь ласка, зачекайте.",
      sender: "system",
      ticket,
      isFrozen: true,
    };
  }

  // 3. АНАЛІЗ ТРИГЕРІВ ЕСКАЛАЦІЇ (L2 Human Handoff)
  const recentUserTexts = ticket.messages
    .filter((m) => m.sender === "user")
    .map((m) => m.text);

  const triggerResult = analyzeMessageTriggers(trimmed, recentUserTexts);

  if (triggerResult.shouldEscalate) {
    const reason = triggerResult.reason || "Запит на оператора";
    await updateTicketStatus(ticket.id, "waiting_operator", reason);

    await alertOperatorsAboutEscalation(ticket, reason, trimmed);

    const handoffNotice =
      "🔔 Передаю ваш діалог черговому спеціалісту підтримки DevqSpace. Оператор підключиться та відповість вам прямо в цьому чаті протягом декількох хвилин.";

    await addMessage(ticket.id, "system", handoffNotice, {
      escalationReason: reason,
    });

    const updated = (await getTicket(ticket.id)) || ticket;
    return {
      reply: handoffNotice,
      sender: "system",
      ticket: updated,
      isFrozen: true,
    };
  }

  // 4. L1: ОБРОБКА ЧЕРЕЗ AI (Перша лінія)
  const settings = await getSupportSettings();

  // Якщо AI вимкнено або немає ключа
  if (!settings.aiEnabled || !settings.apiKey) {
    // Автоматично ескалюємо на людину
    await updateTicketStatus(ticket.id, "waiting_operator", "AI деактивовано");
    await alertOperatorsAboutEscalation(ticket, "AI деактивовано (потрібен оператор)", trimmed);

    const noAiReply =
      "Дякуємо за звернення! Наш менеджер підтримки вже отримав ваше повідомлення та відповість найближчим часом.";
    await addMessage(ticket.id, "system", noAiReply);

    const updated = (await getTicket(ticket.id)) || ticket;
    return {
      reply: noAiReply,
      sender: "system",
      ticket: updated,
      isFrozen: true,
    };
  }

  // Збираємо контекст для LLM
  const historyForLLM: LLMChatMessage[] = [
    {
      role: "system",
      content: settings.systemPrompt || "Ти — AI-консультант DevqSpace.",
    },
  ];

  // Додаємо останні 10 реплік
  const recentMsgs = ticket.messages.slice(-10);
  for (const m of recentMsgs) {
    if (m.sender === "user") {
      historyForLLM.push({ role: "user", content: m.text });
    } else if (m.sender === "ai") {
      historyForLLM.push({ role: "assistant", content: m.text });
    }
  }

  // Викликаємо LLM з Tool-Calling
  const llmRes = await askLLM(historyForLLM, {
    sessionId,
    onEscalate: async (reason: string) => {
      await updateTicketStatus(ticket.id, "waiting_operator", reason);
      await alertOperatorsAboutEscalation(ticket, reason, trimmed);
    },
  });

  if (!llmRes.success) {
    // При технічному збої AI — м'яка ескалація без помилки для клієнта
    await updateTicketStatus(ticket.id, "waiting_operator", `Збій LLM: ${llmRes.error}`);
    await alertOperatorsAboutEscalation(ticket, `Збій зв'язку з LLM (${llmRes.error})`, trimmed);

    const fallbackReply =
      "Вибачте, виникла технічна затримка зв'язку. Я передав ваше звернення оператору, фахівець підключиться найближчим часом.";
    await addMessage(ticket.id, "system", fallbackReply);

    const updated = (await getTicket(ticket.id)) || ticket;
    return {
      reply: fallbackReply,
      sender: "system",
      ticket: updated,
      isFrozen: true,
    };
  }

  // Якщо під час роботи інструментів сталася ескалація
  if (llmRes.escalated) {
    await updateTicketStatus(ticket.id, "waiting_operator", llmRes.escalationReason);
    await addMessage(ticket.id, "ai", llmRes.reply, {
      toolCalls: llmRes.toolCalls,
      escalationReason: llmRes.escalationReason,
    });
    const updated = (await getTicket(ticket.id)) || ticket;
    return {
      reply: llmRes.reply,
      sender: "ai",
      ticket: updated,
      isFrozen: true,
    };
  }

  // Звичайний успішний AI-відповідь
  await addMessage(ticket.id, "ai", llmRes.reply, {
    toolCalls: llmRes.toolCalls,
  });

  const updated = (await getTicket(ticket.id)) || ticket;
  return {
    reply: llmRes.reply,
    sender: "ai",
    ticket: updated,
    isFrozen: false,
  };
}

/**
 * Відповідь оператора клієнту з адмін-панелі.
 */
export async function sendOperatorReply(
  ticketId: string,
  replyText: string,
): Promise<SupportTicket | null> {
  const ticket = await getTicket(ticketId);
  if (!ticket) return null;

  await addMessage(ticket.id, "operator", replyText);
  await updateTicketStatus(ticket.id, "operator_active");
  ticket.unreadForOperator = false;
  ticket.unreadForUser = true;

  return await saveTicket(ticket);
}

/**
 * Розморозка AI (повернення керування назад боту).
 */
export async function unfreezeAI(ticketId: string): Promise<SupportTicket | null> {
  const ticket = await getTicket(ticketId);
  if (!ticket) return null;

  await updateTicketStatus(ticket.id, "ai");
  await addMessage(
    ticket.id,
    "system",
    "Діалог з оператором завершено. AI-асистент знову активний і готовий допомогти з іншими питаннями.",
  );

  return (await getTicket(ticketId)) || ticket;
}

/**
 * Закриття звернення.
 */
export async function closeTicket(ticketId: string): Promise<SupportTicket | null> {
  const ticket = await getTicket(ticketId);
  if (!ticket) return null;

  await updateTicketStatus(ticket.id, "closed");
  await addMessage(
    ticket.id,
    "system",
    "Звернення успішно закрито. Якщо виникнуть нові питання — напишіть нам у будь-який час!",
  );

  return (await getTicket(ticketId)) || ticket;
}
