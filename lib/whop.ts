import { createHmac, timingSafeEqual } from "crypto";

// Whop — Merchant of Record (MoR): підтримка карток Visa/Mastercard,
// Apple Pay, Google Pay та Crypto. Виплати працюють глобально без ФОПа.
// Документація: https://docs.whop.com / https://api.whop.com/api/v1

const API_KEY = process.env.WHOP_API_KEY;
const WEBHOOK_SECRET = process.env.WHOP_WEBHOOK_SECRET;
const PRODUCT_ID = process.env.WHOP_PRODUCT_ID;
const API_URL = process.env.WHOP_API_URL || "https://api.whop.com/api/v1";

export function whopEnabled(): boolean {
  return Boolean(API_KEY);
}

// Кешування product_id, якщо не задано у змінних середовища
let cachedProductId: string | null = null;

async function resolveProductId(): Promise<string | null> {
  if (PRODUCT_ID) return PRODUCT_ID;
  if (cachedProductId) return cachedProductId;
  if (!API_KEY) return null;

  try {
    // 1. Спробувати знайти вже наявний товар у Whop
    const listRes = await fetch(`${API_URL}/products`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (listRes.ok) {
      const data = (await listRes.json()) as {
        data?: Array<{ id: string }>;
        products?: Array<{ id: string }>;
      };
      const items = data.data ?? data.products ?? [];
      if (items.length > 0 && items[0].id) {
        cachedProductId = items[0].id;
        return cachedProductId;
      }
    }

    // 2. Якщо товару немає — створити базовий продукт
    const createRes = await fetch(`${API_URL}/products`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "DevqSpace Marketplace",
        name: "DevqSpace Marketplace",
      }),
      cache: "no-store",
    });

    if (createRes.ok) {
      const created = (await createRes.json()) as { id?: string; data?: { id?: string } };
      const id = created.id ?? created.data?.id;
      if (id) {
        cachedProductId = id;
        return id;
      }
    }
  } catch (err) {
    console.error("[whop] Failed to resolve product ID:", err);
  }

  return null;
}

export async function createCheckout(opts: {
  amountUsd: number;
  productName: string;
  orderId: string;
  email?: string;
  redirectUrl: string;
}): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  if (!API_KEY) {
    return { ok: false, error: "Whop не налаштовано (відсутній WHOP_API_KEY)" };
  }

  const productId = await resolveProductId();

  try {
    const payload: Record<string, unknown> = {
      mode: "payment",
      plan: {
        ...(productId ? { product_id: productId } : {}),
        initial_price: opts.amountUsd,
        title: opts.productName.slice(0, 100),
        description: opts.productName.slice(0, 200),
      },
      metadata: {
        order_id: opts.orderId,
      },
      redirect_url: opts.redirectUrl,
    };

    const res = await fetch(`${API_URL}/checkout_configurations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "Api-Version-Date": "2026-09-25",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = (await res.json()) as {
      purchase_url?: string;
      url?: string;
      id?: string;
      error?: string | { message?: string; detail?: string };
      message?: string;
    };

    const checkoutUrl =
      data.purchase_url ||
      data.url ||
      (data.id ? `https://whop.com/checkout/${data.id}` : null);

    if (!res.ok || !checkoutUrl) {
      console.error("[whop] createCheckout failed:", JSON.stringify(data));
      const errMsg =
        typeof data.error === "string"
          ? data.error
          : data.error?.message ??
            data.error?.detail ??
            data.message ??
            "Не вдалося створити платіжну сесію Whop";
      return { ok: false, error: errMsg };
    }

    return { ok: true, url: checkoutUrl };
  } catch (err) {
    console.error("[whop] error:", err);
    return { ok: false, error: "Помилка зв'язку з Whop API" };
  }
}

// Стандартна перевірка підпису Webhooks (Svix / Standard Webhooks)
export function verifyWebhook(
  rawBody: string,
  headers: {
    id: string | null;
    timestamp: string | null;
    signature: string | null;
  },
): boolean {
  if (!WEBHOOK_SECRET || !headers.id || !headers.timestamp || !headers.signature) {
    return false;
  }

  // Захист від повторних атак (replay attack): допустимий вік запиту 5 хвилин
  const ts = parseInt(headers.timestamp, 10);
  if (isNaN(ts) || Math.abs(Math.floor(Date.now() / 1000) - ts) > 300) {
    return false;
  }

  try {
    let secretBytes: Buffer;
    if (WEBHOOK_SECRET.startsWith("whsec_")) {
      secretBytes = Buffer.from(WEBHOOK_SECRET.slice(6), "base64");
    } else {
      secretBytes = Buffer.from(WEBHOOK_SECRET, "utf8");
    }

    const signedPayload = `${headers.id}.${headers.timestamp}.${rawBody}`;
    const expectedSig = createHmac("sha256", secretBytes)
      .update(signedPayload)
      .digest("base64");

    const parts = headers.signature.split(" ");
    for (const part of parts) {
      const [version, signature] = part.split(",");
      if (version === "v1" && signature) {
        const sigBuf = Buffer.from(signature, "base64");
        const expBuf = Buffer.from(expectedSig, "base64");
        if (sigBuf.length === expBuf.length && timingSafeEqual(sigBuf, expBuf)) {
          return true;
        }
      }
    }
  } catch (err) {
    console.error("[whop] Webhook signature verification error:", err);
  }

  return false;
}

export type WhopWebhook = {
  id?: string;
  type?: string;
  action?: string;
  data?: {
    id?: string;
    status?: string;
    total?: number;
    currency?: string;
    metadata?: Record<string, string>;
    custom_data?: Record<string, string>;
    plan?: {
      id?: string;
      metadata?: Record<string, string>;
    };
  };
  metadata?: Record<string, string>;
};

export function isPaidEvent(body: WhopWebhook): boolean {
  const eventType = body.type || body.action;
  return (
    eventType === "payment.succeeded" ||
    (eventType === "payment.created" && body.data?.status === "paid")
  );
}
