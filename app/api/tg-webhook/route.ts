import {
  TG_CONFIG,
  tgSendMessage,
  tgEditMessageText,
  tgAnswerCallback,
  tgEditReplyMarkup,
  tgSetChatMenuButton,
  tgSetMyCommands,
  ORDER_STATUS_LABEL,
} from "@/lib/telegram";
import {
  updateOrderStatus,
  markOrderPaid,
  getOrder,
  setOrderTgChat,
  type OrderStatus,
} from "@/lib/store";
import { deliverOrder } from "@/lib/delivery";
import {
  startText,
  helpText,
  statsReply,
  viewsRankingReply,
  productsListReply,
  productDetailReply,
  findReply,
  addProductReply,
  setPriceReply,
  deletePromptReply,
  doDeleteReply,
  pricePromptReply,
  type BotReply,
} from "@/lib/botAdmin";

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

// Базовий https-URL поточного деплою (з заголовків Vercel) — щоб зібрати
// посилання на Mini App без хардкоду домену.
function originFromReq(req: Request): string {
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host =
    req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  return `${proto}://${host}`;
}

const BOT_COMMANDS = [
  { command: "app", description: "📊 Відкрити дашборд (Mini App)" },
  { command: "stats", description: "Загальна аналітика" },
  { command: "products", description: "Каталог + керування" },
  { command: "views", description: "Топ за переглядами" },
  { command: "add", description: "Додати товар" },
  { command: "help", description: "Список команд" },
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
    await handleCallback(update.callback_query, originFromReq(req));
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
  // Аргументи команди: усе після першого токена.
  const rest = text.slice(rawCmd.length).trim();
  const args = rest.length ? rest.split(/\s+/) : [];

  const chatId = msg.chat.id;
  const reply = (r: BotReply) =>
    tgSendMessage(chatId, r.text, "HTML", r.keyboard);

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

  // Deep-link прив'язки замовлення: клієнт відкриває t.me/<bot>?start=ord_<id>
  // і тисне Start. Прив'язуємо його chat_id до замовлення для видачі файлу.
  if (cmd === "/start" && args[0]?.startsWith("ord_")) {
    const orderId = args[0].slice(4);
    const ok = await setOrderTgChat(orderId, msg.chat.id);
    if (!ok) {
      await tgSendMessage(
        msg.chat.id,
        "Не знайшли замовлення. Оформіть його на сайті й натисніть «Підключити Telegram».",
      );
      return Response.json({ ok: true });
    }
    const order = await getOrder(orderId);
    if (order?.paid && !order.delivered) {
      // Оплата вже підтверджена раніше — видаємо файл одразу.
      await deliverOrder(order, originFromReq(req));
    } else {
      await tgSendMessage(
        msg.chat.id,
        "✅ <b>Готово!</b>\nВаше замовлення прив'язано. Щойно ми підтвердимо оплату — надішлемо архів прямо сюди 🚀",
      );
    }
    return Response.json({ ok: true });
  }

  if (!isAdmin) {
    // Не адмін — мовчимо, нічого не відповідаємо (крім /where і deep-link)
    return Response.json({ ok: true });
  }

  if (cmd === "/start") {
    // Разово підхоплюємо меню-кнопку Mini App і список команд.
    const base = originFromReq(req);
    await Promise.all([
      tgSetChatMenuButton(chatId, "📊 Дашборд", `${base}/tg`),
      tgSetMyCommands(BOT_COMMANDS),
    ]);
    await tgSendMessage(chatId, startText(), "HTML", {
      inline_keyboard: [
        [{ text: "📊 Відкрити дашборд", web_app: { url: `${base}/tg` } }],
      ],
    });
    return Response.json({ ok: true });
  }

  if (cmd === "/help") {
    await tgSendMessage(chatId, helpText());
    return Response.json({ ok: true });
  }

  if (cmd === "/app" || cmd === "/dashboard" || cmd === "/menu") {
    const base = originFromReq(req);
    await tgSetChatMenuButton(chatId, "📊 Дашборд", `${base}/tg`);
    await tgSendMessage(
      chatId,
      "📊 <b>DevqSpace Dashboard</b>\n\nАналітика переглядів, замовлень і виторгу — " +
        "прямо в Telegram. Кнопка «Дашборд» також з'явилась біля поля вводу.",
      "HTML",
      {
        inline_keyboard: [
          [{ text: "📊 Відкрити дашборд", web_app: { url: `${base}/tg` } }],
        ],
      },
    );
    return Response.json({ ok: true });
  }

  if (cmd === "/ping") {
    await tgSendMessage(chatId, "🟢 pong");
    return Response.json({ ok: true });
  }

  // ---- Аналітика ----
  if (cmd === "/stats") {
    await reply(await statsReply());
    return Response.json({ ok: true });
  }

  if (cmd === "/views") {
    await reply(await viewsRankingReply());
    return Response.json({ ok: true });
  }

  if (cmd === "/product") {
    if (!args[0]) {
      await tgSendMessage(chatId, "Вкажіть slug: /product <code>назва-товару</code>");
    } else {
      await reply(await productDetailReply(args[0]));
    }
    return Response.json({ ok: true });
  }

  // ---- Каталог ----
  if (cmd === "/products" || cmd === "/catalog") {
    const page = Number(args[0]) || 0;
    await reply(await productsListReply(page));
    return Response.json({ ok: true });
  }

  if (cmd === "/find" || cmd === "/search") {
    await reply(await findReply(rest));
    return Response.json({ ok: true });
  }

  if (cmd === "/add") {
    // Тіло — усе після "/add" (поля key: value на нових рядках).
    await reply(await addProductReply(text.slice(rawCmd.length)));
    return Response.json({ ok: true });
  }

  if (cmd === "/setprice") {
    await reply(await setPriceReply(args));
    return Response.json({ ok: true });
  }

  if (cmd === "/del" || cmd === "/delete") {
    if (!args[0]) {
      await tgSendMessage(chatId, "Вкажіть slug: /del <code>назва-товару</code>");
    } else {
      await reply(await deletePromptReply(args[0]));
    }
    return Response.json({ ok: true });
  }

  // Невідома команда / просто текст — мовчимо.
  return Response.json({ ok: true });
}

async function handleCallback(
  cb: TgCallbackQuery,
  baseUrl: string,
): Promise<void> {
  const adminId = TG_CONFIG.adminChatId;
  const fromId = cb.message?.chat.id ?? cb.from.id;
  const isAdmin = adminId ? String(fromId) === String(adminId) : false;

  if (!isAdmin) {
    await tgAnswerCallback(cb.id, "Немає доступу");
    return;
  }

  const data = cb.data ?? "";

  // ---- Навігація адмін-меню (каталог / аналітика) --------------------
  // Кнопки редагують те саме повідомлення замість спаму новими.
  const menuPrefix = data.split(":")[0];
  const menuArg = data.slice(menuPrefix.length + 1);
  const MENU = new Set(["vr", "pl", "pv", "pd", "pdy", "pp"]);
  if (MENU.has(menuPrefix)) {
    let r: BotReply;
    switch (menuPrefix) {
      case "vr":
        r = await viewsRankingReply();
        break;
      case "pl":
        r = await productsListReply(Number(menuArg) || 0);
        break;
      case "pv":
        r = await productDetailReply(menuArg);
        break;
      case "pd":
        r = await deletePromptReply(menuArg);
        break;
      case "pdy":
        r = await doDeleteReply(menuArg);
        break;
      default: // "pp"
        r = await pricePromptReply(menuArg);
        break;
    }
    await editOrSend(cb, r);
    await tgAnswerCallback(cb.id, "");
    return;
  }

  // Ручне підтвердження оплати: "paid:<orderId>"
  if (data.startsWith("paid:")) {
    const orderId = data.slice("paid:".length);
    const order = await getOrder(orderId);
    if (!order) {
      await tgAnswerCallback(cb.id, "Замовлення не знайдено");
      return;
    }
    if (order.paid) {
      await tgAnswerCallback(cb.id, "Вже оплачено ✅");
      return;
    }
    await markOrderPaid(orderId, {});
    await tgAnswerCallback(cb.id, "💰 Оплачено — видаю товар...");
    // Автоматична видача товару клієнту (Telegram-файл / email-лінк)
    const fresh = await getOrder(orderId);
    if (fresh) await deliverOrder(fresh, baseUrl);
    if (cb.message) {
      await tgEditReplyMarkup(
        cb.message.chat.id,
        cb.message.message_id,
        orderId,
        "in_progress",
      );
    }
    return;
  }

  // data формат: "st:<orderId>:<status>"
  const parts = data.split(":");
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

// Редагує повідомлення під кнопкою новим контентом; якщо повідомлення
// недоступне — надсилає нове.
async function editOrSend(
  cb: TgCallbackQuery,
  r: BotReply,
): Promise<void> {
  if (cb.message) {
    await tgEditMessageText(
      cb.message.chat.id,
      cb.message.message_id,
      r.text,
      r.keyboard,
    );
  } else {
    await tgSendMessage(cb.from.id, r.text, "HTML", r.keyboard);
  }
}

export async function GET() {
  // Якщо хтось зайде в браузер — невелика підказка.
  return new Response(
    "DevqSpace Telegram webhook. POST only. Налаштуйте через /api/tg-webhook/setup",
    { status: 405, headers: { Allow: "POST" } },
  );
}
