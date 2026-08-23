import "server-only";
import { randomUUID } from "node:crypto";
import {
  getProductBySlug,
  setOrderDownloadToken,
  setOrderDeliverFile,
  markOrderDelivered,
  type StoredOrder,
} from "./store";
import { tgSendDocument, tgSendMessage, TG_CONFIG } from "./telegram";
import { sendDeliveryEmail, emailEnabled } from "./email";
import { buildCustomZip } from "./zipConfig";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export type DeliveryResult = {
  ok: boolean;
  channel: "telegram" | "email" | "manual" | "-";
  note?: string;
};

// Видає товар клієнту після підтвердження оплати. Ідемпотентна.
export async function deliverOrder(
  order: StoredOrder,
  baseUrl: string,
): Promise<DeliveryResult> {
  if (order.type !== "product" || !order.productSlug) {
    return { ok: false, channel: "-", note: "не товар" };
  }
  if (order.delivered) {
    return { ok: true, channel: order.deliveryChannel ?? "telegram" };
  }

  const admin = TG_CONFIG.adminChatId;
  const product = await getProductBySlug(order.productSlug);

  if (!product?.fileUrl) {
    if (admin)
      await tgSendMessage(
        admin,
        `⚠️ Немає файлу для товару <b>${esc(order.productTitle ?? order.productSlug)}</b>.\n` +
          `Завантажте ZIP в адмінці (товар → Файл), потім видайте вручну.`,
      );
    return { ok: false, channel: "-", note: "немає файлу" };
  }

  // Персональний ZIP із підставленим .env (для товарів-ботів з конфігом).
  let deliverUrl = product.fileUrl;
  if (product.envFields?.length && order.envValues) {
    const custom = await buildCustomZip({
      fileUrl: product.fileUrl,
      envFields: product.envFields,
      envValues: order.envValues,
      orderId: order.id,
    });
    if (custom) {
      await setOrderDeliverFile(order.id, custom);
      deliverUrl = custom;
    }
  }

  // Захищене посилання (email + запасний варіант для ручної видачі)
  const token = randomUUID().replace(/-/g, "");
  await setOrderDownloadToken(order.id, token);
  const dlUrl = `${baseUrl}/api/download?t=${token}`;

  // ---- Telegram ----
  if (order.contactMethod === "telegram") {
    if (order.tgChatId) {
      // Спроба 1: надіслати сам файл документом.
      const ok = await tgSendDocument(
        order.tgChatId,
        deliverUrl,
        `✅ <b>${esc(product.title)}</b>\nДякуємо за покупку! Ваш архів у вкладенні. Гарантія 1 рік 🚀`,
      );
      if (ok) {
        await markOrderDelivered(order.id, "telegram");
        if (admin)
          await tgSendMessage(
            admin,
            `📤 Видано в Telegram: ${esc(order.name)} · ${esc(order.contact)} — ${esc(product.title)}`,
          );
        return { ok: true, channel: "telegram" };
      }
      // Спроба 2: файл не пішов (напр. >20 МБ для URL) — шлемо посилання в чат.
      const linkOk = await tgSendMessage(
        order.tgChatId,
        `✅ <b>${esc(product.title)}</b>\nДякуємо за покупку! Завантажте архів за посиланням:\n${dlUrl}`,
      );
      if (linkOk) {
        await markOrderDelivered(order.id, "telegram", "надіслано посиланням");
        if (admin)
          await tgSendMessage(
            admin,
            `📤 Видано в Telegram (посиланням, файл великий): ${esc(order.name)} — ${esc(product.title)}`,
          );
        return { ok: true, channel: "telegram" };
      }
    }
    const note = order.tgChatId
      ? "помилка надсилання"
      : "клієнт не підключив Telegram";
    await markOrderDelivered(order.id, "manual", note);
    if (admin)
      await tgSendMessage(
        admin,
        `⚠️ Не вдалось авто-видати в Telegram (${note}).\n` +
          `Клієнт: ${esc(order.name)} · ${esc(order.contact)}\n` +
          `Надішліть посилання вручну:\n${dlUrl}`,
      );
    return { ok: false, channel: "telegram", note };
  }

  // ---- Email ----
  if (order.contactMethod === "email") {
    let reason = "RESEND_API_KEY не задано";
    if (emailEnabled()) {
      const r = await sendDeliveryEmail(order.contact, product.title, dlUrl);
      if (r.ok) {
        await markOrderDelivered(order.id, "email");
        if (admin)
          await tgSendMessage(
            admin,
            `📧 Видано на email: ${esc(order.contact)} — ${esc(product.title)}`,
          );
        return { ok: true, channel: "email" };
      }
      reason = r.error ?? "помилка Resend";
    }
    await markOrderDelivered(order.id, "manual", "email не надіслано");
    if (admin)
      await tgSendMessage(
        admin,
        `⚠️ Email не надіслано.\n<b>Причина:</b> ${esc(reason)}\n` +
          `Клієнт: ${esc(order.contact)}\nПосилання для ручної відправки:\n${dlUrl}`,
      );
    return { ok: false, channel: "email", note: "email fail" };
  }

  // ---- Phone / інше ----
  await markOrderDelivered(order.id, "manual", "контакт — телефон");
  if (admin)
    await tgSendMessage(
      admin,
      `📦 Оплачено. Спосіб зв'язку — телефон (${esc(order.contact)}).\n` +
        `Надішліть посилання вручну:\n${dlUrl}`,
    );
  return { ok: false, channel: "manual", note: "phone" };
}
