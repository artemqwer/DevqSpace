import "server-only";
import { randomUUID } from "node:crypto";
import {
  getProductBySlug,
  setOrderDownloadToken,
  setReviewToken,
  markOrderDelivered,
  updateOrder,
  type StoredOrder,
} from "./store";
import { tgSendDocument, tgSendMessage, TG_CONFIG } from "./telegram";
import { sendDeliveryEmail, emailEnabled } from "./email";
import { packageOrder, type PackageResult } from "./packager";
import { getObject } from "./blob";
import { decryptJson } from "./crypto";
import type { EnvValues } from "./envFields";
import { isLocalDeliveryActive } from "./devStubs";
import { saveLocalDelivery } from "./devStorage";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export type DeliveryResult = {
  ok: boolean;
  channel: "telegram" | "email" | "manual" | "local" | "-";
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
  let pkgBytes: Uint8Array | undefined;
  let pkgName: string | undefined;

  if (dynamicMode) {
    await updateOrder(order.id, {
      deliveryStatus: "GENERATING",
      errorMessage: undefined,
    });
    let pkg: PackageResult;
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
    pkgBytes = pkg.bytes;
    pkgName = pkg.name;
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

  // Одноразове запрошення лишити відгук — видається тут же: момент видачі
  // єдиний, коли ми точно знаємо, що людина справді купила товар.
  const reviewToken = randomUUID().replace(/-/g, "");
  await setReviewToken(reviewToken, order.id);
  const reviewUrl = `${baseUrl}/review/${reviewToken}`;

  const targetEmail = (
    order.email || (order.contactMethod === "email" ? order.contact : "")
  ).trim().toLowerCase();

  let emailSuccess = false;
  let emailError: string | undefined;

  // ---- Локальна видача (локальне dev-середовище або LOCAL_DELIVERY=true) ----
  // Строго відокремлена від продакшну: на диску в .local_deliveries зберігається
  // згенерований ZIP та JSON-маніфест, без спаму в реальний Telegram чи email.
  if (isLocalDeliveryActive()) {
    try {
      const fileBytes = pkgBytes ?? (await getObject(fileUrl));
      if (!fileBytes) {
        throw new Error("Не вдалося отримати байти файлу товару");
      }

      const rawValues = order.envData
        ? decryptJson<EnvValues>(order.envData) ?? undefined
        : undefined;

      const safeSlug =
        product.slug.replace(/[^a-zA-Z0-9_-]/g, "") || "product";
      const deliveryFileName =
        pkgName ?? `${safeSlug}-${order.id}.zip`;

      const saved = await saveLocalDelivery({
        orderId: order.id,
        productSlug: product.slug,
        productTitle: product.title,
        customerName: order.name,
        customerContact: order.contact,
        customerEmail: targetEmail || undefined,
        contactMethod: order.contactMethod,
        fileName: deliveryFileName,
        fileBytes,
        envValues: rawValues,
        downloadUrl: dlUrl,
      });

      const note = `локально збережено: ${saved.fileName} (${saved.orderDir})`;
      await markOrderDelivered(order.id, "local", note);
      await updateOrder(order.id, {
        deliveryStatus: "SENT",
        errorMessage: undefined,
      });

      console.log(
        `[delivery:local] Замовлення ${order.id} успішно збережено: ${saved.filePath}`,
      );

      return {
        ok: true,
        channel: "local",
        note,
      };
    } catch (e) {
      console.error("[delivery:local] Помилка локальної видачі:", e);
      const errMsg =
        e instanceof Error
          ? `Локальна видача впала: ${e.message}`
          : "Локальна видача впала з помилкою";
      await updateOrder(order.id, {
        deliveryStatus: "FAILED",
        errorMessage: errMsg,
      });
      return { ok: false, channel: "local", note: errMsg };
    }
  }

  // ---- Автоматична видача: Email (гарантований) + Telegram (паралельний) ----
  if (targetEmail) {
    if (emailEnabled()) {
      const r = await sendDeliveryEmail(
        targetEmail,
        product.title,
        dlUrl,
        reviewUrl,
      );
      if (r.ok) {
        emailSuccess = true;
      } else {
        emailError = r.error ?? "помилка Resend";
      }
    } else {
      emailError = "RESEND_API_KEY не задано (локальний режим)";
    }
  } else {
    emailError = "email не вказано";
  }

  let tgSuccess = false;
  let tgNote: string | undefined;

  if (order.contactMethod === "telegram") {
    if (order.tgChatId) {
      // Спроба 1: надіслати сам файл документом.
      const ok = await tgSendDocument(
        order.tgChatId,
        fileUrl,
        `✅ <b>${esc(product.title)}</b>\nДякуємо за покупку! Ваш архів у вкладенні. Гарантія 1 рік 🚀\n\n★ Розкажете, як вам? ${reviewUrl}`,
      );
      if (ok) {
        tgSuccess = true;
      } else {
        // Спроба 2: файл не пішов (напр. >20 МБ для URL) — шлемо посилання в чат.
        const linkOk = await tgSendMessage(
          order.tgChatId,
          `✅ <b>${esc(product.title)}</b>\nДякуємо за покупку! Завантажте архів за посиланням:\n${dlUrl}\n\n★ Розкажете, як вам? ${reviewUrl}`,
        );
        if (linkOk) {
          tgSuccess = true;
          tgNote = "надіслано посиланням";
        } else {
          tgNote = "помилка надсилання в Telegram";
        }
      }
    } else {
      tgNote = "клієнт не підключив Telegram";
    }
  }

  // 1. Обидва канали спрацювали
  if (emailSuccess && tgSuccess) {
    await markOrderDelivered(order.id, "email", "видано на email + Telegram");
    await updateOrder(order.id, { deliveryStatus: "SENT", errorMessage: undefined });
    if (admin) {
      await tgSendMessage(
        admin,
        `🚀 <b>Товар видано усюди!</b>\n` +
          `Email: ${esc(targetEmail)}\n` +
          `Telegram: ${esc(order.contact)}\n` +
          `Товар: <b>${esc(product.title)}</b>`,
      );
    }
    return { ok: true, channel: "email" };
  }

  // 2. Email успішно надіслано (основний канал доставки)
  if (emailSuccess) {
    const note = tgNote ? `email надіслано (${tgNote})` : undefined;
    await markOrderDelivered(order.id, "email", note);
    await updateOrder(order.id, { deliveryStatus: "SENT", errorMessage: undefined });
    if (admin) {
      await tgSendMessage(
        admin,
        `📧 <b>Авто-видано на email:</b> ${esc(targetEmail)} — ${esc(product.title)}\n` +
          `Клієнт: ${esc(order.name)} · Спосіб зв'язку (${order.contactMethod}): ${esc(order.contact)}` +
          (tgNote ? `\n<i>(${esc(tgNote)})</i>` : ""),
      );
    }
    return { ok: true, channel: "email" };
  }

  // 3. Telegram успішно надіслано (запасний/прямий канал)
  if (tgSuccess) {
    const note = emailError ? `telegram (email: ${emailError})` : undefined;
    await markOrderDelivered(order.id, "telegram", note);
    await updateOrder(order.id, { deliveryStatus: "SENT", errorMessage: undefined });
    if (admin) {
      await tgSendMessage(
        admin,
        `📤 <b>Видано в Telegram:</b> ${esc(order.name)} · ${esc(order.contact)} — ${esc(product.title)}` +
          (targetEmail ? `\n<i>(Email ${esc(targetEmail)}: ${esc(emailError ?? "")})</i>` : ""),
      );
    }
    return { ok: true, channel: "telegram" };
  }

  // 4. Жоден канал не спрацював — ручна видача адміном
  const reasons: string[] = [];
  if (targetEmail) {
    reasons.push(`Email: ${emailError ?? "помилка"}`);
  } else {
    reasons.push("Email не вказано");
  }
  if (order.contactMethod === "telegram") {
    reasons.push(`Telegram: ${tgNote ?? "не підключено"}`);
  } else if (order.contactMethod === "phone") {
    reasons.push(`Контакт: телефон (${order.contact})`);
  }
  const failReason = reasons.join(" · ");

  await markOrderDelivered(order.id, "manual", failReason);
  await updateOrder(order.id, {
    deliveryStatus: "FAILED",
    errorMessage: failReason,
  });

  if (admin) {
    await tgSendMessage(
      admin,
      `⚠️ <b>Не вдалося авто-видати товар!</b>\n` +
        `<b>Причина:</b> ${esc(failReason)}\n` +
        `Клієнт: ${esc(order.name)} · ${esc(order.contact)}` +
        (targetEmail ? `\nEmail: ${esc(targetEmail)}` : "") +
        `\n\nПосилання для ручної відправки:\n${dlUrl}`,
    );
  }

  return { ok: false, channel: "manual", note: failReason };
}
