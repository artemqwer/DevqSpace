import { createHmac, timingSafeEqual } from "crypto";

// Lemon Squeezy — Merchant of Record: платформа юридичний продавець, ФОП не
// потрібен. Checkout-overlay (lemon.js) поверх сайту + вебхук order_created
// на автовидачу. Док: https://docs.lemonsqueezy.com/api/checkouts

const API_KEY = process.env.LEMON_API_KEY;
const STORE_ID = process.env.LEMON_STORE_ID;
const VARIANT_ID = process.env.LEMON_VARIANT_ID; // «catch-all» варіант із custom_price
const WEBHOOK_SECRET = process.env.LEMON_WEBHOOK_SECRET;
const BASE = "https://api.lemonsqueezy.com/v1";

export function lemonEnabled(): boolean {
  return Boolean(API_KEY && STORE_ID && VARIANT_ID);
}

export async function createCheckout(opts: {
  amountUsd: number;
  productName: string;
  orderId: string;
  email?: string;
  redirectUrl: string;
}): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  if (!API_KEY || !STORE_ID || !VARIANT_ID)
    return { ok: false, error: "Lemon Squeezy не налаштовано" };

  try {
    const res = await fetch(`${BASE}/checkouts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            custom_price: Math.round(opts.amountUsd * 100), // центи
            product_options: {
              name: opts.productName.slice(0, 200),
              redirect_url: opts.redirectUrl,
            },
            checkout_options: { embed: true },
            checkout_data: {
              ...(opts.email ? { email: opts.email } : {}),
              custom: { order_id: opts.orderId }, // повернеться у вебхуку
            },
          },
          relationships: {
            store: { data: { type: "stores", id: String(STORE_ID) } },
            variant: { data: { type: "variants", id: String(VARIANT_ID) } },
          },
        },
      }),
      cache: "no-store",
    });

    const data = (await res.json()) as {
      data?: { attributes?: { url?: string } };
      errors?: { detail?: string }[];
    };
    const url = data.data?.attributes?.url;
    if (!res.ok || !url) {
      console.error("[lemon] createCheckout failed:", JSON.stringify(data));
      return { ok: false, error: data.errors?.[0]?.detail ?? "Не вдалося створити checkout" };
    }
    return { ok: true, url };
  } catch (e) {
    console.error("[lemon] error:", e);
    return { ok: false, error: "Помилка зв'язку з Lemon Squeezy" };
  }
}

// X-Signature = HMAC-SHA256(hex) від сирого тіла, ключ — webhook secret.
export function verifyWebhook(raw: string, signature: string | null): boolean {
  if (!WEBHOOK_SECRET || !signature) return false;
  const expected = createHmac("sha256", WEBHOOK_SECRET).update(raw).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

export type LemonWebhook = {
  meta?: { event_name?: string; custom_data?: { order_id?: string } };
  data?: { attributes?: { status?: string; total?: number; currency?: string } };
};

// order_created зі статусом paid — успішна оплата.
export function isPaidEvent(body: LemonWebhook): boolean {
  return (
    body.meta?.event_name === "order_created" &&
    body.data?.attributes?.status === "paid"
  );
}
