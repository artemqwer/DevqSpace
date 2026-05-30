import { createHash, createHmac } from "crypto";

// Crypto Pay (@CryptoBot) — оплата криптою для готових товарів.
// Док: https://help.crypt.bot/crypto-pay-api

const TOKEN = process.env.CRYPTO_PAY_TOKEN;
const IS_TESTNET = process.env.CRYPTO_PAY_TESTNET === "1";
const ASSET = process.env.CRYPTO_PAY_ASSET || "USDT";

const BASE = IS_TESTNET
  ? "https://testnet-pay.crypt.bot/api"
  : "https://pay.crypt.bot/api";

export function cryptoPayEnabled(): boolean {
  return Boolean(TOKEN);
}

type InvoiceResult = {
  invoice_id: number;
  status: string;
  hash: string;
  bot_invoice_url?: string;
  mini_app_invoice_url?: string;
  web_app_invoice_url?: string;
  pay_url?: string;
};

export async function createInvoice(opts: {
  amount: number;
  description: string;
  payload: string; // orderId
  returnUrl?: string;
}): Promise<
  { ok: true; url: string; invoiceId: number } | { ok: false; error: string }
> {
  if (!TOKEN) return { ok: false, error: "CRYPTO_PAY_TOKEN не налаштовано" };

  try {
    const res = await fetch(`${BASE}/createInvoice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Crypto-Pay-API-Token": TOKEN,
      },
      body: JSON.stringify({
        currency_type: "crypto",
        asset: ASSET,
        amount: String(opts.amount),
        description: opts.description.slice(0, 1024),
        payload: opts.payload,
        ...(opts.returnUrl
          ? { paid_btn_name: "callback", paid_btn_url: opts.returnUrl }
          : {}),
        expires_in: 3600,
        allow_comments: false,
      }),
      cache: "no-store",
    });

    const data = (await res.json()) as {
      ok: boolean;
      result?: InvoiceResult;
      error?: { name?: string; code?: number };
    };

    if (!data.ok || !data.result) {
      console.error("[cryptopay] createInvoice failed:", data);
      return {
        ok: false,
        error: data.error?.name ?? "Не вдалося створити інвойс",
      };
    }

    const r = data.result;
    const url =
      r.bot_invoice_url ?? r.mini_app_invoice_url ?? r.pay_url ?? "";
    if (!url) return { ok: false, error: "Інвойс без URL" };

    return { ok: true, url, invoiceId: r.invoice_id };
  } catch (e) {
    console.error("[cryptopay] error:", e);
    return { ok: false, error: "Помилка зв'язку з Crypto Pay" };
  }
}

// Перевірка підпису вебхука Crypto Pay.
// secret = SHA256(token); signature = HMAC_SHA256(body, secret) у hex.
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  if (!TOKEN || !signature) return false;
  const secret = createHash("sha256").update(TOKEN).digest();
  const hmac = createHmac("sha256", secret).update(rawBody).digest("hex");
  // порівняння без раннього виходу
  if (hmac.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < hmac.length; i++) {
    diff |= hmac.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

export type CryptoPayUpdate = {
  update_id: number;
  update_type: string;
  payload?: {
    invoice_id: number;
    status: string;
    payload?: string; // наш orderId
    amount?: string;
    asset?: string;
  };
};
