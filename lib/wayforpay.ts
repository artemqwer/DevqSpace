import { createHmac } from "crypto";

// WayForPay — оплата карткою / Apple Pay / Google Pay / Privat24.
// Widget: підписуємо параметри на сервері → клієнт запускає pay-widget.js
// (модалка поверх сайту, юзер не йде нікуди). Оплата підтверджується
// автоматично через serviceUrl callback. Док: https://wiki.wayforpay.com

const MERCHANT = process.env.WAYFORPAY_MERCHANT_ACCOUNT;
const SECRET = process.env.WAYFORPAY_MERCHANT_SECRET;
const DOMAIN = process.env.WAYFORPAY_DOMAIN || "devq.space";

export function wayForPayEnabled(): boolean {
  return Boolean(MERCHANT && SECRET);
}

// merchantSignature = HMAC_MD5(secret) від полів через ';'.
function sign(fields: (string | number)[]): string {
  return createHmac("md5", SECRET ?? "")
    .update(fields.join(";"))
    .digest("hex");
}

// WayForPay ламається на ';' у назві — вона роздільник підпису.
function safeName(s: string): string {
  return s.replace(/;/g, ",").slice(0, 250);
}

// Параметри для pay-widget.js (window.Wayforpay().run(params, ...)).
export type WidgetParams = {
  merchantAccount: string;
  merchantDomainName: string;
  merchantAuthType: "SimpleSignature";
  merchantSignature: string;
  orderReference: string;
  orderDate: number;
  amount: number;
  currency: "UAH";
  productName: string[];
  productPrice: number[];
  productCount: number[];
  serviceUrl: string;
  returnUrl: string;
  language: "UA" | "EN";
};

export function buildWidgetParams(opts: {
  amountUah: number; // сума в гривні (ціле)
  productName: string;
  orderRef: string; // унікальний, alphanumeric + '_'
  serviceUrl: string;
  returnUrl: string;
  language?: "UA" | "EN";
}): WidgetParams | null {
  if (!MERCHANT || !SECRET) return null;

  const orderDate = Math.floor(Date.now() / 1000);
  const amount = Math.round(opts.amountUah);
  const name = safeName(opts.productName);
  const currency = "UAH" as const;

  // Порядок полів підпису фіксований: account, domain, ref, date, amount,
  // currency, productName[], productCount[], productPrice[].
  const merchantSignature = sign([
    MERCHANT,
    DOMAIN,
    opts.orderRef,
    orderDate,
    amount,
    currency,
    name,
    1,
    amount,
  ]);

  return {
    merchantAccount: MERCHANT,
    merchantDomainName: DOMAIN,
    merchantAuthType: "SimpleSignature",
    merchantSignature,
    orderReference: opts.orderRef,
    orderDate,
    amount,
    currency,
    productName: [name],
    productPrice: [amount],
    productCount: [1],
    serviceUrl: opts.serviceUrl,
    returnUrl: opts.returnUrl,
    language: opts.language ?? "UA",
  };
}

export type WfpCallback = {
  merchantAccount?: string;
  orderReference?: string;
  amount?: number;
  currency?: string;
  authCode?: string;
  cardPan?: string;
  transactionStatus?: string;
  reasonCode?: number | string;
  merchantSignature?: string;
};

// Підпис callback: account;ref;amount;currency;authCode;cardPan;status;reasonCode
export function verifyCallback(cb: WfpCallback): boolean {
  if (!SECRET || !cb.merchantSignature) return false;
  const expected = sign([
    cb.merchantAccount ?? "",
    cb.orderReference ?? "",
    cb.amount ?? "",
    cb.currency ?? "",
    cb.authCode ?? "",
    cb.cardPan ?? "",
    cb.transactionStatus ?? "",
    cb.reasonCode ?? "",
  ]);
  const a = Buffer.from(expected);
  const b = Buffer.from(cb.merchantSignature);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

// Відповідь, якої WayForPay очікує на callback (інакше повторює запити).
export function acceptResponse(orderReference: string): {
  orderReference: string;
  status: "accept";
  time: number;
  signature: string;
} {
  const time = Math.floor(Date.now() / 1000);
  return {
    orderReference,
    status: "accept",
    time,
    signature: sign([orderReference, "accept", time]),
  };
}

export function isPaidStatus(status?: string): boolean {
  return status === "Approved";
}

// orderReference = "<orderId>_<rand>" → повертає orderId.
export function makeOrderRef(orderId: string): string {
  return `${orderId}_${Date.now().toString(36)}`;
}
export function orderIdFromRef(ref: string): string {
  return ref.split("_")[0];
}
