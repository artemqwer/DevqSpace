import "server-only";
import { getOrder, type StoredOrder } from "@/lib/store";
import {
  getVerificationState,
  saveVerificationState,
  getSupportSettings,
} from "./store";

export type OrderVerificationResult =
  | {
      success: true;
      order: {
        id: string;
        title: string;
        statusText: string;
        rawStatus: string;
        isPaid: boolean;
        isDelivered: boolean;
        maskedEmail: string;
        maskedPhone: string;
        maskedContact: string;
        createdAt: string;
        downloadReady: boolean;
      };
    }
  | {
      success: false;
      error:
        | "LOCKED"
        | "ORDER_NOT_FOUND"
        | "VERIFICATION_REQUIRED"
        | "VERIFICATION_FAILED";
      message: string;
      remainingAttempts?: number;
    };

/**
 * Нормалізація контактів для безпомилкового порівняння:
 * видаляємо пробіли, тире, дужки, переводимо в нижній регістр.
 */
function normalizeContact(c: string): string {
  return c
    .toLowerCase()
    .replace(/[@+()\s-_.]/g, "")
    .trim();
}

/**
 * Маскування Email: "vasya.pupkin@example.com" -> "v***n@example.com"
 */
export function maskEmail(email?: string): string {
  if (!email || !email.includes("@")) return "—";
  const [user, domain] = email.split("@");
  if (user.length <= 2) return `${user[0]}***@${domain}`;
  return `${user[0]}***${user[user.length - 1]}@${domain}`;
}

/**
 * Маскування Телефону: "+380991234567" -> "+380******4567"
 */
export function maskPhone(phone?: string): string {
  if (!phone) return "—";
  const clean = phone.replace(/[^\d+]/g, "");
  if (clean.length < 7) return "***";
  const prefix = clean.slice(0, 4);
  const suffix = clean.slice(-4);
  return `${prefix}******${suffix}`;
}

/**
 * Безпечна верифікація та отримання інформації про замовлення.
 *
 * @param sessionId Ідентифікатор поточної сесії користувача
 * @param rawOrderId Номер замовлення (напр. "ORD-12345" або "ord_...")
 * @param confirmationData Підтверджуючий контакт клієнта (email, телефон або ПІБ)
 */
export async function verifyAndGetOrder(
  sessionId: string,
  rawOrderId: string,
  confirmationData?: string,
): Promise<OrderVerificationResult> {
  const settings = await getSupportSettings();
  const cleanOrderId = rawOrderId.trim().replace(/^#/, "");

  // 1. Перевірка статусу блокування (Anti-Brute Force)
  const state = await getVerificationState(sessionId, cleanOrderId);
  const now = Date.now();

  if (state.lockedUntil && state.lockedUntil > now) {
    const minsLeft = Math.ceil((state.lockedUntil - now) / 60000);
    return {
      success: false,
      error: "LOCKED",
      message: `⛔ Перевищено кількість спроб верифікації для замовлення #${cleanOrderId}. З метою безпеки функцію заблоковано на ${minsLeft} хв. Зверніться до оператора.`,
    };
  }

  // Якщо блокування минуло — скидаємо лічильник
  if (state.lockedUntil && state.lockedUntil <= now) {
    state.failedAttempts = 0;
    state.lockedUntil = undefined;
    await saveVerificationState(sessionId, cleanOrderId, state);
  }

  // 2. Пошук замовлення в базі
  const order: StoredOrder | null = await getOrder(cleanOrderId);
  if (!order) {
    // Не розкриваємо, чи існує замовлення взагалі, або пишемо що не знайдено
    return {
      success: false,
      error: "ORDER_NOT_FOUND",
      message: `Замовлення з номером #${cleanOrderId} не знайдено в системі. Будь ласка, перевірте правильність номера у вашому чеку або листі.`,
    };
  }

  // 3. Якщо замовлення вже було успішно верифіковано в цій сесії раніше
  const alreadyVerified = state.verifiedOrderIds?.includes(order.id);

  // 4. Якщо підтверджуючі дані не надані взагалі
  if (!alreadyVerified && (!confirmationData || !confirmationData.trim())) {
    return {
      success: false,
      error: "VERIFICATION_REQUIRED",
      message: `Для захисту ваших персональних даних та деталей замовлення #${order.id}, будь ласка, вкажіть ваш Email або номер телефону, який ви зазначали при оформленні.`,
    };
  }

  // 5. Перевірка збігу підтверджуючих даних (Dual-Check Verification)
  if (!alreadyVerified && confirmationData) {
    const normInput = normalizeContact(confirmationData);
    const normEmail = order.email ? normalizeContact(order.email) : "";
    const normContact = order.contact ? normalizeContact(order.contact) : "";
    const normName = order.name ? normalizeContact(order.name) : "";

    const isEmailMatch = normEmail && normInput === normEmail;
    const isContactMatch = normContact && (normInput === normContact || normContact.endsWith(normInput) || normInput.endsWith(normContact));
    const isNameMatch = normName && normName.length > 3 && (normInput.includes(normName) || normName.includes(normInput));

    const matched = isEmailMatch || isContactMatch || isNameMatch;

    if (!matched) {
      // Фіксуємо невдалу спробу
      state.failedAttempts = (state.failedAttempts || 0) + 1;
      const maxAttempts = settings.maxFailedVerifications || 3;
      const remaining = Math.max(0, maxAttempts - state.failedAttempts);

      if (remaining <= 0) {
        state.lockedUntil = now + (settings.lockoutMinutes || 15) * 60 * 1000;
        await saveVerificationState(sessionId, cleanOrderId, state);
        return {
          success: false,
          error: "LOCKED",
          message: `⛔ Невірні підтверджуючі дані. Досягнуто ліміт спроб (${maxAttempts}). Запит заблоковано на ${settings.lockoutMinutes} хв для захисту конфіденційності.`,
        };
      }

      await saveVerificationState(sessionId, cleanOrderId, state);
      return {
        success: false,
        error: "VERIFICATION_FAILED",
        remainingAttempts: remaining,
        message: `Вказаний контакт не збігається з даними замовлення #${order.id}. Залишилось спроб: ${remaining}. Перевірте коректність email або номера телефону.`,
      };
    }

    // Успішна верифікація! Додаємо до списку верифікованих у сесії
    state.failedAttempts = 0;
    state.verifiedOrderIds = Array.from(new Set([...(state.verifiedOrderIds || []), order.id]));
    await saveVerificationState(sessionId, cleanOrderId, state);
  }

  // 6. Формування безпечного результату (Zero-Leakage & Masked PII)
  const STATUS_MAP: Record<string, string> = {
    new: "Прийнято в обробку",
    in_progress: "В роботі / Формується",
    done: "Виконано / Готово до видачі",
    rejected: "Скасовано",
  };

  const statusText = STATUS_MAP[order.status] ?? order.status;
  const isPaid = Boolean(order.paid);
  const isDelivered = Boolean(order.delivered || order.deliveryStatus === "SENT");
  const downloadReady = Boolean(order.paid && (order.packageUrl || order.downloadToken || order.deliverFileUrl));

  const createdAtFormatted = new Date(order.createdAt).toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return {
    success: true,
    order: {
      id: order.id,
      title: order.productTitle || (order.type === "custom" ? "Кастомна розробка" : "Цифровий продукт"),
      statusText: `${statusText}${isPaid ? " (Оплачено ✅)" : " (Очікує оплати ⏳)"}`,
      rawStatus: order.status,
      isPaid,
      isDelivered,
      maskedEmail: maskEmail(order.email),
      maskedPhone: maskPhone(order.contactMethod === "phone" ? order.contact : undefined),
      maskedContact: order.contactMethod === "telegram" ? `@${order.contact.replace(/^@/, "")}` : maskEmail(order.email),
      createdAt: createdAtFormatted,
      downloadReady,
    },
  };
}
