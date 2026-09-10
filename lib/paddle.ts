import { createHmac, timingSafeEqual } from "crypto";

// Paddle Billing — Merchant of Record (без ФОПа, виплати через Payoneer).
// Потік: сервер створює transaction із кастомною ціною → клієнт відкриває
// overlay-checkout (paddle.js) із цим transactionId → вебхук
// transaction.completed → автовидача. Док: https://developer.paddle.com

const API_KEY = process.env.PADDLE_API_KEY;
const CLIENT_TOKEN = process.env.PADDLE_CLIENT_TOKEN; // публічний, для paddle.js
const WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET;
const ENVIRONMENT =
  process.env.PADDLE_ENV === "sandbox" ? "sandbox" : "production";
const API =
  ENVIRONMENT === "sandbox"
    ? "https://sandbox-api.paddle.com"
    : "https://api.paddle.com";

export function paddleEnabled(): boolean {
  return Boolean(API_KEY && CLIENT_TOKEN);
}

// Публічні дані для ініціалізації paddle.js на клієнті.
export function paddleClientConfig(): { token: string; environment: string } | null {
  if (!CLIENT_TOKEN) return null;
  return { token: CLIENT_TOKEN, environment: ENVIRONMENT };
}

// Створює transaction із non-catalog товаром (кастомна ціна нашого товару).
// Повертає transactionId для Paddle.Checkout.open({ transactionId }).
export async function createTransaction(opts: {
  amountUsd: number;
  productName: string;
  orderId: string;
}): Promise<{ ok: true; transactionId: string } | { ok: false; error: string }> {
  if (!API_KEY) return { ok: false, error: "Paddle не налаштовано" };

  const cents = String(Math.round(opts.amountUsd * 100));
  const name = opts.productName.slice(0, 200);

  try {
    const res = await fetch(`${API}/transactions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "Paddle-Version": "1",
      },
      body: JSON.stringify({
        items: [
          {
            quantity: 1,
            price: {
              name,
              description: name,
              unit_price: { amount: cents, currency_code: "USD" },
              product: { name, tax_category: "standard" },
            },
          },
        ],
        custom_data: { order_id: opts.orderId },
      }),
      cache: "no-store",
    });

    const data = (await res.json()) as {
      data?: { id?: string };
      error?: { detail?: string };
    };
    const id = data.data?.id;
    if (!res.ok || !id) {
      console.error("[paddle] createTransaction failed:", JSON.stringify(data));
      return { ok: false, error: data.error?.detail ?? "Не вдалося створити транзакцію" };
    }
    return { ok: true, transactionId: id };
  } catch (e) {
    console.error("[paddle] error:", e);
    return { ok: false, error: "Помилка зв'язку з Paddle" };
  }
}

// Підпис вебхука: header Paddle-Signature = "ts=..;h1=..".
// h1 = HMAC-SHA256(secret) від рядка "<ts>:<raw body>".
export function verifyWebhook(raw: string, header: string | null): boolean {
  if (!WEBHOOK_SECRET || !header) return false;
  const parts = Object.fromEntries(
    header.split(";").map((p) => {
      const i = p.indexOf("=");
      return [p.slice(0, i).trim(), p.slice(i + 1).trim()];
    }),
  );
  const ts = parts["ts"];
  const h1 = parts["h1"];
  if (!ts || !h1) return false;

  // Захист від replay: підпис не старший за годину.
  const age = Math.abs(Date.now() / 1000 - Number(ts));
  if (!Number.isFinite(age) || age > 3600) return false;

  const expected = createHmac("sha256", WEBHOOK_SECRET)
    .update(`${ts}:${raw}`)
    .digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(h1, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

export type PaddleWebhook = {
  event_type?: string;
  data?: {
    id?: string;
    status?: string;
    custom_data?: { order_id?: string } | null;
    currency_code?: string;
    details?: { totals?: { grand_total?: string } };
  };
};

export function isPaidEvent(body: PaddleWebhook): boolean {
  return (
    body.event_type === "transaction.completed" &&
    body.data?.status === "completed"
  );
}
