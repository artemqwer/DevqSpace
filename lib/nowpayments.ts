import { createHmac } from "crypto";

// NOWPayments — крипто-оплата без Telegram. Hosted checkout (адреса + QR).
// Док: https://documenter.getpostman.com/view/7907941/S1a32n38

const API_KEY = process.env.NOWPAYMENTS_API_KEY;
const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;
const BASE = "https://api.nowpayments.io/v1";

export function nowPaymentsEnabled(): boolean {
  return Boolean(API_KEY);
}

export async function createInvoice(opts: {
  amount: number;
  description: string;
  orderId: string;
  successUrl: string;
  cancelUrl: string;
  ipnUrl: string;
}): Promise<
  { ok: true; url: string; invoiceId: string } | { ok: false; error: string }
> {
  if (!API_KEY) return { ok: false, error: "NOWPAYMENTS_API_KEY не задано" };

  try {
    const res = await fetch(`${BASE}/invoice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({
        price_amount: opts.amount,
        price_currency: "usd",
        order_id: opts.orderId,
        order_description: opts.description.slice(0, 250),
        ipn_callback_url: opts.ipnUrl,
        success_url: opts.successUrl,
        cancel_url: opts.cancelUrl,
      }),
      cache: "no-store",
    });

    const data = (await res.json()) as {
      id?: string;
      invoice_url?: string;
      message?: string;
      status?: string;
    };

    if (!res.ok || !data.invoice_url) {
      console.error("[nowpayments] createInvoice failed:", data);
      return {
        ok: false,
        error: data.message ?? "Не вдалося створити інвойс",
      };
    }

    return { ok: true, url: data.invoice_url, invoiceId: String(data.id) };
  } catch (e) {
    console.error("[nowpayments] error:", e);
    return { ok: false, error: "Помилка зв'язку з NOWPayments" };
  }
}

// IPN підпис: HMAC-SHA512 від JSON з ВІДСОРТОВАНИМИ ключами, ключ — IPN secret.
function sortObject(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.keys(obj)
    .sort()
    .reduce<Record<string, unknown>>((acc, key) => {
      const v = obj[key];
      acc[key] =
        v && typeof v === "object" && !Array.isArray(v)
          ? sortObject(v as Record<string, unknown>)
          : v;
      return acc;
    }, {});
}

export function verifyIpnSignature(
  parsed: Record<string, unknown>,
  signature: string | null,
): boolean {
  if (!IPN_SECRET || !signature) return false;
  const sorted = JSON.stringify(sortObject(parsed));
  const hmac = createHmac("sha512", IPN_SECRET).update(sorted).digest("hex");
  if (hmac.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < hmac.length; i++) {
    diff |= hmac.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

export type NowIpn = {
  payment_id?: number | string;
  payment_status?: string;
  order_id?: string; // наш orderId
  pay_amount?: number;
  pay_currency?: string;
  price_amount?: number;
  price_currency?: string;
};

// Статуси, які вважаємо успішною оплатою
export function isPaidStatus(status?: string): boolean {
  return status === "finished" || status === "confirmed";
}
