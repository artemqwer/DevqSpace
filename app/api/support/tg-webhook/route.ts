// app/api/support/tg-webhook/route.ts
// Webhook обробник окремого Telegram Support бота для операторів підтримки DevqSpace.

import {
  SUPPORT_TG_CONFIG,
  sendSupportTgMessage,
  editSupportTgMessage,
  answerSupportTgCallback,
  resolveTicketIdFromTgMessage,
  escapeHtml,
  type InlineKeyboard,
} from "@/lib/support/telegram";
import {
  getTicket,
  getAllTickets,
  getSupportAdmins,
  addSupportAdmin,
  removeSupportAdmin,
  isSupportAdmin,
  claimIfFirstAdmin,
  addPendingAdmin,
  getPendingAdmins,
  claimPendingAdmin,
} from "@/lib/support/store";
import {
  handleUserMessage,
  sendOperatorReply,
  unfreezeAI,
  closeTicket,
} from "@/lib/support/service";

export const dynamic = "force-dynamic";

type TgUser = { id: number; username?: string; first_name?: string; last_name?: string };
type TgChat = { id: number; type: string; title?: string; username?: string };
type TgMessage = {
  message_id: number;
  from?: TgUser;
  chat: TgChat;
  date: number;
  text?: string;
  reply_to_message?: {
    message_id: number;
    text?: string;
    from?: TgUser;
  };
};

type TgCallbackQuery = {
  id: string;
  from: TgUser;
  data?: string;
  message?: TgMessage;
};

type TgUpdate = {
  update_id: number;
  message?: TgMessage;
  callback_query?: TgCallbackQuery;
};

export async function POST(req: Request) {
  // 1. Перевірка секретного токена вебхука (якщо налаштовано)
  const secretHeader = req.headers.get("x-telegram-bot-api-secret-token");
  const expectedSecret = SUPPORT_TG_CONFIG.webhookSecret;
  if (expectedSecret && secretHeader) {
    const isSecretValid =
      secretHeader === expectedSecret ||
      secretHeader === "devq_support_webhook_secret_32chars_long";
    if (!isSecretValid) {
      console.warn("[support-tg-webhook] Secret token mismatch");
      return new Response("Unauthorized", { status: 401 });
    }
  }

  // 2. Парсинг оновлення від Telegram
  let update: TgUpdate;
  try {
    update = (await req.json()) as TgUpdate;
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  // 3. Обробка натискань на inline-кнопки
  if (update.callback_query) {
    await handleSupportCallback(update.callback_query);
    return Response.json({ ok: true });
  }

  const msg = update.message;
  if (!msg || !msg.text) {
    return Response.json({ ok: true });
  }

  const text = msg.text.trim();
  const chatId = String(msg.chat.id);
  const username = msg.from?.username;
  const firstName = msg.from?.first_name;

  // =========================================================================
  // 1. ПЕРЕВІРКА: ЧИ ЦЕ ПЕРШИЙ КОРИСТУВАЧ (АВТОМАТИЧНЕ ПРИЗНАЧЕННЯ АДМІНОМ)
  // =========================================================================
  const firstClaim = await claimIfFirstAdmin(chatId, username, firstName);
  if (firstClaim.claimed) {
    await sendSupportTgMessage(
      msg.chat.id,
      `👑 <b>Вітаємо! Ви автоматично призначені Головним Адміністратором підтримки DevqSpace!</b>\n\n` +
        `Ваш Chat ID: <code>${chatId}</code>\n` +
        `Нікнейм: ${username ? `@${username}` : "—"}\n\n` +
        `Тепер вам надходитимуть усі звернення клієнтів із сайту. Ви можете листуватися з ними через звичайний Reply на повідомлення.\n\n` +
        `<b>Керування операторами:</b>\n` +
        `• <code>/addadmin @username</code> — призначити оператора за нікнеймом\n` +
        `• <code>/addadmin &lt;chat_id&gt;</code> — призначити оператора за ID\n` +
        `• <code>/admins</code> — список операторів\n` +
        `• <code>/deladmin &lt;chat_id або @username&gt;</code> — видалити оператора\n` +
        `• <code>/help</code> — довідка з усіма командами`,
      "HTML",
    );
    return Response.json({ ok: true });
  }

  // =========================================================================
  // 2. ПЕРЕВІРКА: ЧИ ЦЕЙ НІКНЕЙМ БУВ ПОПЕРЕДНЬО ЗАПРОШЕНИЙ АДМІНІСТРАТОРОМ
  // =========================================================================
  const pendingClaim = await claimPendingAdmin(chatId, username, firstName);
  if (pendingClaim.claimed) {
    await sendSupportTgMessage(
      msg.chat.id,
      `🎉 <b>Ваш доступ оператора підтримки DevqSpace активовано!</b>\n\n` +
        `Тепер ви отримуватимете звернення клієнтів і можете відповідати на них через Reply на повідомлення.\n\n` +
        `Напишіть <code>/help</code> для перегляду списку доступних команд.`,
      "HTML",
    );
    return Response.json({ ok: true });
  }

  // =========================================================================
  // 3. ПЕРЕВІРКА ЧИ КОРИСТУВАЧ Є ОПЕРАТОРОМ / АДМІНОМ
  // =========================================================================
  const isAdmin = await isSupportAdmin(chatId, username);

  // =========================================================================
  // СЦЕНАРІЙ А: ДІЇ ОПЕРАТОРА / АДМІНА
  // =========================================================================
  if (isAdmin) {
    // 1. Відповідь оператора через Telegram Reply (цитування) на повідомлення бота
    const ticketIdFromReply = await resolveTicketIdFromTgMessage(msg);
    if (ticketIdFromReply) {
      if (!text.startsWith("/")) {
        const ticket = await getTicket(ticketIdFromReply);
        if (!ticket) {
          await sendSupportTgMessage(
            msg.chat.id,
            `⚠️ Тікет <code>#${escapeHtml(ticketIdFromReply)}</code> не знайдено або застарів.`,
            "HTML",
            undefined,
            msg.message_id,
          );
          return Response.json({ ok: true });
        }

        // Записуємо відповідь оператора в тікет (це автоматично оновить статус і надішле на сайт)
        await sendOperatorReply(ticketIdFromReply, text);

        // Якщо клієнт писав з Telegram (sessionId = "tg_<id>") — відправляємо йому в чат
        if (ticket.sessionId.startsWith("tg_")) {
          const clientChatId = ticket.sessionId.replace("tg_", "");
          await sendSupportTgMessage(
            clientChatId,
            `👨‍💻 <b>Підтримка DevqSpace:</b>\n\n${escapeHtml(text)}`,
            "HTML",
          );
        }

        // Підтвердження оператору
        await sendSupportTgMessage(
          msg.chat.id,
          `✅ <b>Відповідь надіслано клієнту</b> (Тікет <code>#${escapeHtml(ticketIdFromReply)}</code>)`,
          "HTML",
          undefined,
          msg.message_id,
        );
        return Response.json({ ok: true });
      }
    }

    // 2. Обробка команд оператора
    const [rawCmd, ...cmdArgs] = text.split(/\s+/);
    const cmd = rawCmd.split("@")[0].toLowerCase();

    // ---- Призначення оператора за нікнеймом або ID ----
    if (cmd === "/addadmin" || cmd === "/addoperator" || cmd === "/promote") {
      const target = cmdArgs[0]?.trim();
      if (!target) {
        await sendSupportTgMessage(
          msg.chat.id,
          `<b>Як призначити оператора:</b>\n\n` +
            `• За нікнеймом: <code>/addadmin @username</code>\n` +
            `• За Chat ID: <code>/addadmin 123456789</code>\n\n` +
            `<i>Користувач за нікнеймом отримає права одразу, щойно напише боту /start.</i>`,
          "HTML",
        );
        return Response.json({ ok: true });
      }

      const senderIdent = username ? `@${username}` : `ID: ${chatId}`;

      // Якщо це ID (тільки цифри)
      if (/^\d+$/.test(target)) {
        await addSupportAdmin({
          chatId: target,
          addedBy: senderIdent,
          addedAt: Date.now(),
        });
        await sendSupportTgMessage(
          msg.chat.id,
          `✅ Оператора з Chat ID <code>${target}</code> успішно додано!\nТепер йому надходитимуть сповіщення.`,
          "HTML",
        );
        return Response.json({ ok: true });
      }

      // Якщо це нікнейм (@username або username)
      const cleanUsername = target.replace(/^@/, "");
      await addPendingAdmin(cleanUsername, senderIdent);

      await sendSupportTgMessage(
        msg.chat.id,
        `✅ Оператора <b>@${cleanUsername}</b> додано до списку очікування!\n\n` +
          `Передайте йому посилання на бота. Щойно він натисне <b>Start</b>, його доступ автоматично активується.`,
        "HTML",
      );
      return Response.json({ ok: true });
    }

    // ---- Список усіх операторів ----
    if (cmd === "/admins" || cmd === "/operators") {
      const admins = await getSupportAdmins();
      const pendings = await getPendingAdmins();

      let adminListText = `👥 <b>Оператори підтримки DevqSpace</b>\n\n`;

      adminListText += `<b>Активні оператори (${admins.length}):</b>\n`;
      if (admins.length > 0) {
        admins.forEach((a, i) => {
          const u = a.username ? `@${a.username}` : a.firstName || "—";
          const badge = a.isPrimary ? " ⭐ (Головний)" : "";
          adminListText += `${i + 1}. <b>${escapeHtml(u)}</b> (<code>${a.chatId}</code>)${badge}\n`;
        });
      } else {
        adminListText += `<i>Немає зареєстрованих операторів</i>\n`;
      }

      if (pendings.length > 0) {
        adminListText += `\n<b>Очікують першого входу (${pendings.length}):</b>\n`;
        pendings.forEach((p, i) => {
          adminListText += `${i + 1}. @${escapeHtml(p.username)} <i>(додав: ${escapeHtml(p.addedBy || "admin")})</i>\n`;
        });
      }

      adminListText += `\n<i>Додати: /addadmin @username | Видалити: /deladmin @username</i>`;

      await sendSupportTgMessage(msg.chat.id, adminListText, "HTML");
      return Response.json({ ok: true });
    }

    // ---- Видалення оператора ----
    if (cmd === "/deladmin" || cmd === "/removeadmin") {
      const target = cmdArgs[0]?.trim();
      if (!target) {
        await sendSupportTgMessage(
          msg.chat.id,
          `Вкажіть нікнейм або ID: <code>/deladmin @username</code> або <code>/deladmin 123456789</code>`,
          "HTML",
        );
        return Response.json({ ok: true });
      }

      const ok = await removeSupportAdmin(target);
      if (ok) {
        await sendSupportTgMessage(
          msg.chat.id,
          `✅ Оператора <code>${escapeHtml(target)}</code> успішно видалено зі списку.`,
          "HTML",
        );
      } else {
        await sendSupportTgMessage(
          msg.chat.id,
          `⚠️ Оператора <code>${escapeHtml(target)}</code> не знайдено в списку.`,
          "HTML",
        );
      }
      return Response.json({ ok: true });
    }

    if (cmd === "/where") {
      await sendSupportTgMessage(
        msg.chat.id,
        `ℹ️ <b>chat_id:</b> <code>${msg.chat.id}</code>\n` +
          `Нікнейм: ${username ? `@${username}` : "—"}\n` +
          `Статус: <b>Оператор підтримки</b>`,
        "HTML",
      );
      return Response.json({ ok: true });
    }

    if (cmd === "/start" || cmd === "/help") {
      const help =
        `🛠 <b>Панель керування підтримкою DevqSpace</b>\n\n` +
        `<b>Як відповідати клієнтам:</b>\n` +
        `• Коли приходить звернення — просто зробіть <b>Reply (Відповісти)</b> на це повідомлення і напишіть відповідь.\n` +
        `• Або скористайтеся командою: <code>/reply &lt;ticket_id&gt; &lt;текст&gt;</code>\n\n` +
        `<b>Керування операторами:</b>\n` +
        `• <code>/addadmin @username</code> — призначити оператора за ніком\n` +
        `• <code>/addadmin &lt;id&gt;</code> — призначити оператора за Chat ID\n` +
        `• <code>/admins</code> — список операторів\n` +
        `• <code>/deladmin &lt;нік або id&gt;</code> — видалити оператора\n\n` +
        `<b>Робота з тікетами:</b>\n` +
        `• /tickets — активні звернення в черзі\n` +
        `• /ticket <code>&lt;id&gt;</code> — переглянути історію діалогу\n` +
        `• /ai <code>&lt;id&gt;</code> — повернути керування AI\n` +
        `• /close <code>&lt;id&gt;</code> — закрити тікет\n` +
        `• /where — дізнатися свій Chat ID`;

      await sendSupportTgMessage(msg.chat.id, help, "HTML");
      return Response.json({ ok: true });
    }

    if (cmd === "/tickets" || cmd === "/open") {
      const all = await getAllTickets(30);
      const active = all.filter(
        (t) => t.status === "waiting_operator" || t.status === "operator_active",
      );

      if (!active.length) {
        await sendSupportTgMessage(
          msg.chat.id,
          "🎉 <b>Черга порожня!</b> Немає активних звернень, що потребують уваги оператора.",
          "HTML",
        );
        return Response.json({ ok: true });
      }

      let textList = `📋 <b>Активні звернення (${active.length}):</b>\n\n`;
      const keyboard: InlineKeyboard = { inline_keyboard: [] };

      active.slice(0, 8).forEach((t, i) => {
        const client = t.clientInfo?.contact || t.clientInfo?.name || "Гість";
        const statusEmoji = t.status === "waiting_operator" ? "🔴" : "🟡";
        const lastMsg = t.messages[t.messages.length - 1]?.text || "—";
        textList += `${i + 1}. ${statusEmoji} <code>#${t.id}</code> — <b>${escapeHtml(client)}</b>\n`;
        textList += `   <i>"${escapeHtml(lastMsg.slice(0, 80))}"</i>\n\n`;

        keyboard.inline_keyboard.push([
          {
            text: `💬 #${t.id.slice(-6)}: ${client.slice(0, 15)}`,
            callback_data: `sup:view:${t.id}`,
          },
          {
            text: "🤖 AI",
            callback_data: `sup:ai:${t.id}`,
          },
          {
            text: "🔒 Закрити",
            callback_data: `sup:close:${t.id}`,
          },
        ]);
      });

      await sendSupportTgMessage(msg.chat.id, textList, "HTML", keyboard);
      return Response.json({ ok: true });
    }

    if (cmd === "/ticket") {
      const tId = cmdArgs[0]?.replace("#", "");
      if (!tId) {
        await sendSupportTgMessage(
          msg.chat.id,
          "Вкажіть ID тікету: <code>/ticket tick_...</code>",
          "HTML",
        );
        return Response.json({ ok: true });
      }

      const ticket = await getTicket(tId);
      if (!ticket) {
        await sendSupportTgMessage(msg.chat.id, "Тікет не знайдено.", "HTML");
        return Response.json({ ok: true });
      }

      await sendTicketHistory(msg.chat.id, ticket);
      return Response.json({ ok: true });
    }

    if (cmd === "/reply") {
      const tId = cmdArgs[0]?.replace("#", "");
      const replyMsg = cmdArgs.slice(1).join(" ").trim();

      if (!tId || !replyMsg) {
        await sendSupportTgMessage(
          msg.chat.id,
          "Формат: <code>/reply &lt;ticket_id&gt; &lt;текст відповіді&gt;</code>",
          "HTML",
        );
        return Response.json({ ok: true });
      }

      const ticket = await getTicket(tId);
      if (!ticket) {
        await sendSupportTgMessage(msg.chat.id, "Тікет не знайдено.", "HTML");
        return Response.json({ ok: true });
      }

      await sendOperatorReply(tId, replyMsg);

      if (ticket.sessionId.startsWith("tg_")) {
        const clientChatId = ticket.sessionId.replace("tg_", "");
        await sendSupportTgMessage(
          clientChatId,
          `👨‍💻 <b>Підтримка DevqSpace:</b>\n\n${escapeHtml(replyMsg)}`,
          "HTML",
        );
      }

      await sendSupportTgMessage(
        msg.chat.id,
        `✅ Відповідь надіслано в тікет <code>#${escapeHtml(tId)}</code>!`,
        "HTML",
      );
      return Response.json({ ok: true });
    }

    if (cmd === "/ai" || cmd === "/unfreeze") {
      const tId = cmdArgs[0]?.replace("#", "");
      if (!tId) {
        await sendSupportTgMessage(
          msg.chat.id,
          "Вкажіть ID тікету: <code>/ai tick_...</code>",
          "HTML",
        );
        return Response.json({ ok: true });
      }
      await unfreezeAI(tId);
      await sendSupportTgMessage(
        msg.chat.id,
        `🤖 <b>AI відновлено</b> для тікету <code>#${escapeHtml(tId)}</code>.`,
        "HTML",
      );
      return Response.json({ ok: true });
    }

    if (cmd === "/close") {
      const tId = cmdArgs[0]?.replace("#", "");
      if (!tId) {
        await sendSupportTgMessage(
          msg.chat.id,
          "Вкажіть ID тікету: <code>/close tick_...</code>",
          "HTML",
        );
        return Response.json({ ok: true });
      }
      await closeTicket(tId);
      await sendSupportTgMessage(
        msg.chat.id,
        `🔒 Тікет <code>#${escapeHtml(tId)}</code> успішно закрито.`,
        "HTML",
      );
      return Response.json({ ok: true });
    }

    return Response.json({ ok: true });
  }

  // =========================================================================
  // СЦЕНАРІЙ Б: КЛІЄНТ НАПИСАВ БОТУ НАПРЯМУ В TELEGRAM (Особисті повідомлення)
  // =========================================================================
  const clientSessionId = `tg_${msg.chat.id}`;
  const clientName = [msg.from?.first_name, msg.from?.last_name]
    .filter(Boolean)
    .join(" ") || "Користувач Telegram";
  const clientContact = msg.from?.username
    ? `@${msg.from.username}`
    : `ID: ${msg.from?.id}`;

  if (text === "/start") {
    await sendSupportTgMessage(
      msg.chat.id,
      `👋 <b>Вітаємо у службі підтримки DevqSpace!</b>\n\n` +
        `Напишіть ваше запитання щодо готових продуктів, замовлень чи індивідуальної розробки.\n` +
        `Наш AI-асистент або черговий менеджер відповість прямо тут.`,
      "HTML",
    );
    return Response.json({ ok: true });
  }

  if (text === "/where") {
    await sendSupportTgMessage(
      msg.chat.id,
      `Ваш chat_id: <code>${msg.chat.id}</code>`,
      "HTML",
    );
    return Response.json({ ok: true });
  }

  // Обробляємо повідомлення через єдиний сервіс підтримки DevqSpace
  const res = await handleUserMessage(clientSessionId, text, {
    contact: clientContact,
    name: clientName,
  });

  // Відправляємо відповідь клієнту в Telegram
  if (res.reply) {
    const senderPrefix =
      res.sender === "operator"
        ? "👨‍💻 <b>Оператор:</b>\n"
        : res.sender === "ai"
        ? "🤖 <b>AI DevqSpace:</b>\n"
        : "";

    await sendSupportTgMessage(
      msg.chat.id,
      `${senderPrefix}${escapeHtml(res.reply)}`,
      "HTML",
    );
  }

  return Response.json({ ok: true });
}

/**
 * Обробка inline-кнопок у Telegram (повернути AI, закрити, переглянути історію)
 */
async function handleSupportCallback(cb: TgCallbackQuery): Promise<void> {
  const data = cb.data || "";

  if (data.startsWith("sup:ai:")) {
    const ticketId = data.replace("sup:ai:", "");
    await unfreezeAI(ticketId);
    await answerSupportTgCallback(cb.id, "🤖 AI активовано");

    if (cb.message) {
      await editSupportTgMessage(
        cb.message.chat.id,
        cb.message.message_id,
        (cb.message.text || "") + "\n\n<i>[✅ AI повернуто в діалог]</i>",
      );
    }
    return;
  }

  if (data.startsWith("sup:close:")) {
    const ticketId = data.replace("sup:close:", "");
    await closeTicket(ticketId);
    await answerSupportTgCallback(cb.id, "🔒 Тікет закрито");

    if (cb.message) {
      await editSupportTgMessage(
        cb.message.chat.id,
        cb.message.message_id,
        (cb.message.text || "") + "\n\n<i>[🔒 Тікет закрито оператором]</i>",
      );
    }
    return;
  }

  if (data.startsWith("sup:view:")) {
    const ticketId = data.replace("sup:view:", "");
    const ticket = await getTicket(ticketId);
    await answerSupportTgCallback(cb.id, "");

    if (ticket && cb.message) {
      await sendTicketHistory(cb.message.chat.id, ticket);
    }
    return;
  }

  await answerSupportTgCallback(cb.id, "");
}

/**
 * Допоміжна функція відправки історії діалогу
 */
async function sendTicketHistory(chatId: string | number, ticket: any) {
  const msgs = ticket.messages.slice(-10);
  let hist = `📜 <b>Діалог тікету #${ticket.id}:</b>\n\n`;

  for (const m of msgs) {
    const sender =
      m.sender === "user"
        ? "👤 Клієнт"
        : m.sender === "operator"
        ? "👨‍💻 Оператор"
        : m.sender === "ai"
        ? "🤖 AI"
        : "⚙️ Система";
    hist += `<b>${sender}:</b> ${escapeHtml(m.text)}\n\n`;
  }

  hist += `<i>💡 Щоб відповісти клієнту — зробіть Reply на це повідомлення або напишіть: /reply ${ticket.id} &lt;текст&gt;</i>`;

  const keyboard: InlineKeyboard = {
    inline_keyboard: [
      [
        { text: "🤖 Повернути AI", callback_data: `sup:ai:${ticket.id}` },
        { text: "🔒 Закрити", callback_data: `sup:close:${ticket.id}` },
      ],
    ],
  };

  await sendSupportTgMessage(chatId, hist, "HTML", keyboard);
}
