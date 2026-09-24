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
import {
  notifySupportOperators,
  sendSupportTgMessage,
  escapeHtml,
} from "./telegram";
import type { SupportTicket, SupportMessage } from "./types";

export type HandleUserMessageResult = {
  reply: string;
  sender: "ai" | "operator" | "system";
  ticket: SupportTicket;
  isFrozen: boolean;
};

/**
 * Сповіщення операторів у чат/групу підтримки Telegram при ескалації.
 */
async function alertOperatorsAboutEscalation(
  ticket: SupportTicket,
  reason: string,
  userMessageText: string,
): Promise<void> {
  try {
    await notifySupportOperators(ticket, userMessageText, reason);
  } catch (e) {
    console.error("[support] Failed to notify support operators via TG:", e);
  }
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
  const freshTicket = (await getTicket(ticket.id)) || ticket;

  // 2. ПЕРЕВІРКА РЕЖИМУ ЗАМОРОЗКИ (AI Freeze Mode)
  // Якщо тікет уже у статусі очікування оператора або оператор уже веде діалог — AI мовчить!
  if (freshTicket.status === "waiting_operator" || freshTicket.status === "operator_active") {
    // Сповіщаємо операторів про нове повідомлення в активному тикеті
    await alertOperatorsAboutEscalation(
      freshTicket,
      "Нове повідомлення від клієнта в активному діалозі",
      trimmed,
    );

    return {
      reply:
        "Менеджер підтримки вже сповіщений і відповість вам найближчим часом. Будь ласка, зачекайте.",
      sender: "system",
      ticket: freshTicket,
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

  // Беремо свіжі повідомлення з бази
  const currentTicket = (await getTicket(ticket.id)) || freshTicket;
  const recentMsgs = currentTicket.messages.slice(-10);
  for (const m of recentMsgs) {
    if (m.sender === "user" && m.text?.trim()) {
      historyForLLM.push({ role: "user", content: m.text.trim() });
    } else if (m.sender === "ai" && m.text?.trim()) {
      historyForLLM.push({ role: "assistant", content: m.text.trim() });
    }
  }

  // Завжди гарантуємо наявність повідомлення користувача в історії
  if (!historyForLLM.some((m) => m.role === "user")) {
    historyForLLM.push({ role: "user", content: trimmed });
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

  const msg: SupportMessage = {
    id: `msg_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`,
    sender: "operator",
    text: replyText,
    timestamp: Date.now(),
  };

  ticket.messages.push(msg);
  if (ticket.messages.length > 40) {
    ticket.messages = ticket.messages.slice(-40);
  }
  ticket.status = "operator_active";
  ticket.unreadForOperator = false;
  ticket.unreadForUser = true;

  // Якщо це клієнт з Telegram (sessionId = "tg_<chatId>") — надсилаємо повідомлення йому в чат
  if (ticket.sessionId.startsWith("tg_")) {
    const clientChatId = ticket.sessionId.replace("tg_", "");
    try {
      await sendSupportTgMessage(
        clientChatId,
        `👨‍💻 <b>Підтримка DevqSpace:</b>\n\n${escapeHtml(replyText)}`,
        "HTML",
      );
    } catch (e) {
      console.error("[support] Failed to push operator reply to TG client:", e);
    }
  }

  return await saveTicket(ticket);
}

/**
 * Розморозка AI (повернення керування назад боту).
 */
export async function unfreezeAI(ticketId: string): Promise<SupportTicket | null> {
  const ticket = await getTicket(ticketId);
  if (!ticket) return null;

  ticket.status = "ai";
  ticket.unreadForOperator = false;
  const sysMsg: SupportMessage = {
    id: `msg_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`,
    sender: "system",
    text: "Діалог з оператором завершено. AI-асистент знову активний і готовий допомогти з іншими питаннями.",
    timestamp: Date.now(),
  };
  ticket.messages.push(sysMsg);
  return await saveTicket(ticket);
}

/**
 * Закриття звернення.
 */
export async function closeTicket(ticketId: string): Promise<SupportTicket | null> {
  const ticket = await getTicket(ticketId);
  if (!ticket) return null;

  ticket.status = "closed";
  ticket.unreadForOperator = false;
  const sysMsg: SupportMessage = {
    id: `msg_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`,
    sender: "system",
    text: "Звернення успішно закрито. Якщо виникнуть нові питання — напишіть нам у будь-який час!",
    timestamp: Date.now(),
  };
  ticket.messages.push(sysMsg);
  return await saveTicket(ticket);
}
