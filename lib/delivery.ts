import "server-only";
import { randomUUID } from "node:crypto";
import {
  getProductBySlug,
  setOrderDownloadToken,
  markOrderDelivered,
  updateOrder,
  type StoredOrder,
} from "./store";
import { tgSendDocument, tgSendMessage, TG_CONFIG } from "./telegram";
import { sendDeliveryEmail, emailEnabled } from "./email";
import { packageOrder } from "./packager";

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

  if (!product) {
    await updateOrder(order.id, {
      deliveryStatus: "FAILED",
      errorMessage: `Товар ${order.productSlug} не знайдено`,
    });
    return { ok: false, channel: "-", note: "товар не знайдено" };
  }

  // ---- Динамічна упаковка ----
  // Вмикається лише коли товар має і поля .env, і шаблон, а клієнт лишив
  // значення. Інакше нижче йде звичайна статична видача product.fileUrl.
  const dynamicMode = Boolean(
    product.envFields?.length && product.fileUrl && order.envData,
  );

  let fileUrl = product.fileUrl;

  if (dynamicMode) {
    await updateOrder(order.id, {
      deliveryStatus: "GENERATING",
      errorMessage: undefined,
    });
    let pkg;
    try {
      pkg = await packageOrder(order, product);
    } catch (e) {
      console.error("[delivery] packaging crashed:", e);
      pkg = { ok: false as const, error: "Збірка архіву впала з помилкою" };
    }

    if (!pkg.ok) {
      await updateOrder(order.id, {
        deliveryStatus: "FAILED",
        errorMessage: pkg.error,
      });
      if (admin)
        await tgSendMessage(
          admin,
          `❌ Не вдалося зібрати архів для <b>${esc(order.productTitle ?? order.productSlug)}</b>.\n` +
            `<b>Причина:</b> ${esc(pkg.error)}\n` +
            `Клієнт: ${esc(order.name)} · ${esc(order.contact)}\n` +
            `Полагодьте і натисніть «Перегенерувати» в адмінці.`,
        );
      return { ok: false, channel: "-", note: pkg.error };
    }

    fileUrl = pkg.url;
    await updateOrder(order.id, {
      packageUrl: pkg.url,
      packageName: pkg.name,
    });
  }

  if (!fileUrl) {
    if (admin)
      await tgSendMessage(
        admin,
        `⚠️ Немає файлу для товару <b>${esc(order.productTitle ?? order.productSlug)}</b>.\n` +
          `Завантажте ZIP в адмінці (товар → Файл), потім видайте вручну.`,
      );
    await updateOrder(order.id, {
      deliveryStatus: "FAILED",
      errorMessage: "Немає файлу товару",
    });
    return { ok: false, channel: "-", note: "немає файлу" };
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
        fileUrl,
        `✅ <b>${esc(product.title)}</b>\nДякуємо за покупку! Ваш архів у вкладенні. Гарантія 1 рік 🚀`,
      );
      if (ok) {
        await markOrderDelivered(order.id, "telegram");
        await updateOrder(order.id, { deliveryStatus: "SENT" });
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
        await updateOrder(order.id, { deliveryStatus: "SENT" });
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
    await updateOrder(order.id, {
      deliveryStatus: "FAILED",
      errorMessage: `Telegram: ${note}`,
    });
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
        await updateOrder(order.id, { deliveryStatus: "SENT" });
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
    await updateOrder(order.id, {
      deliveryStatus: "FAILED",
      errorMessage: `Email: ${reason}`,
    });
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
