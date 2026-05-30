import {
  TG_CONFIG,
  tgSendMessage,
  tgAnswerCallback,
  tgEditReplyMarkup,
  ORDER_STATUS_LABEL,
} from "@/lib/telegram";
import { updateOrderStatus, type OrderStatus } from "@/lib/store";

// Telegram webhook endpoint. Викликається тільки Telegram-ом — кожне
// повідомлення вашому боту приходить сюди як POST з JSON update.
//
// Захист: ми перевіряємо secret_token header. Telegram передає його
// тільки якщо ми його встановили через setWebhook. Невідповідність — 401.

const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

type TgUser = { id: number; username?: string; first_name?: string };
type TgChat = { id: number; type: string; username?: string };
type TgMessage = {
  message_id: number;
  from?: TgUser;
  chat: TgChat;
  date: number;
  text?: string;
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

const VALID_STATUS: OrderStatus[] = [
  "new",
  "in_progress",
  "done",
  "rejected",
];

export async function POST(req: Request) {
  // 1. Secret token check
  const secret = req.headers.get("x-telegram-bot-api-secret-token");
  if (!WEBHOOK_SECRET || secret !== WEBHOOK_SECRET) {
    return new Response("unauthorized", { status: 401 });
  }

  // 2. Parse update
  let update: TgUpdate;
  try {
    update = (await req.json()) as TgUpdate;
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  // 2a. Callback від inline-кнопок (зміна статусу замовлення)
  if (update.callback_query) {
    await handleCallback(update.callback_query);
    return Response.json({ ok: true });
  }

  const msg = update.message;
  if (!msg || !msg.text) return Response.json({ ok: true });

  // 3. Admin guard — на команди реагуємо тільки в LS адміна.
  // (sendMessage з сайту йде сюди ж назад як update — це нормально, бо
  //  chat_id буде ADMIN, але text без leading "/" — отже команд не буде.)
  const adminId = TG_CONFIG.adminChatId;
  const isAdmin = adminId ? String(msg.chat.id) === String(adminId) : false;

  const text = msg.text.trim();
  const [rawCmd] = text.split(/\s+/);
  const cmd = rawCmd.split("@")[0].toLowerCase();

  // 4. Команди
  if (cmd === "/where") {
    // Корисно для першого налаштування — будь-хто може дізнатися свій id
    await tgSendMessage(
      msg.chat.id,
      `<b>chat_id:</b> <code>${msg.chat.id}</code>\n` +
        `username: @${msg.from?.username ?? "—"}\n\n` +
        `<i>Скопіюйте chat_id в ENV TELEGRAM_ADMIN_CHAT_ID на Vercel.</i>`,
    );
    return Response.json({ ok: true });
  }

  if (!isAdmin) {
    // Не адмін — мовчимо, нічого не відповідаємо (крім /where)
    return Response.json({ ok: true });
  }

  if (cmd === "/start") {
    await tgSendMessage(
      msg.chat.id,
      "👋 <b>NEXUS Admin Bot online</b>\n\n" +
        "Замовлення з сайту приходитимуть сюди автоматично.\n\n" +
        "Доступні команди:\n" +
        "/help — список команд\n" +
        "/ping — перевірити що сервер живий\n" +
        "/where — повертає ваш chat_id",
    );
    return Response.json({ ok: true });
  }

  if (cmd === "/help") {
    await tgSendMessage(
      msg.chat.id,
      "🛠 <b>Команди</b>\n\n" +
        "/start — привітання\n" +
        "/ping — перевірити доступність\n" +
        "/where — дізнатися chat_id\n\n" +
        "<i>Замовлення приходять окремими повідомленнями — без команд.</i>",
    );
    return Response.json({ ok: true });
  }

  if (cmd === "/ping") {
    await tgSendMessage(msg.chat.id, "🟢 pong");
    return Response.json({ ok: true });
  }

  // Невідома команда / просто текст — мовчимо.
  return Response.json({ ok: true });
}

async function handleCallback(cb: TgCallbackQuery): Promise<void> {
  const adminId = TG_CONFIG.adminChatId;
  const fromId = cb.message?.chat.id ?? cb.from.id;
  const isAdmin = adminId ? String(fromId) === String(adminId) : false;

  if (!isAdmin) {
    await tgAnswerCallback(cb.id, "Немає доступу");
    return;
  }

  // data формат: "st:<orderId>:<status>"
  const parts = (cb.data ?? "").split(":");
  if (parts[0] !== "st" || parts.length !== 3) {
    await tgAnswerCallback(cb.id, "?");
    return;
  }
  const [, orderId, status] = parts;
  if (!VALID_STATUS.includes(status as OrderStatus)) {
    await tgAnswerCallback(cb.id, "Невідомий статус");
    return;
  }

  const ok = await updateOrderStatus(orderId, status as OrderStatus);
  await tgAnswerCallback(
    cb.id,
    ok
      ? `Статус: ${ORDER_STATUS_LABEL[status]}`
      : "Замовлення не знайдено",
  );

  // Оновлюємо кнопки під повідомленням (позначка активного статусу)
  if (ok && cb.message) {
    await tgEditReplyMarkup(
      cb.message.chat.id,
      cb.message.message_id,
      orderId,
      status,
    );
  }
}

export async function GET() {
  // Якщо хтось зайде в браузер — невелика підказка.
  return new Response(
    "NEXUS Telegram webhook. POST only. Налаштуйте через /api/tg-webhook/setup",
    { status: 405, headers: { Allow: "POST" } },
  );
}
