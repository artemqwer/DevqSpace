import { createInvoice, nowPaymentsEnabled } from "@/lib/nowpayments";
import {
  getProductBySlug,
  addOrder,
  setOrderInvoice,
  rateLimit,
  validatePromoCode,
  incrementPromoUsage,
} from "@/lib/store";
import { sendOrderToTelegram, type OrderPayload } from "@/lib/telegram";
import { prepareEnvData } from "@/lib/orderEnv";
import { parseContact } from "@/lib/contact";

type Body = {
  productSlug?: string;
  name?: string;
  email?: string;
  contactMethod?: "telegram" | "email" | "phone";
  contact?: string;
  message?: string;
  company?: string; // honeypot
  envValues?: Record<string, string>;
  customPrice?: number;
  promoCode?: string;
};


export async function POST(req: Request) {
  if (!nowPaymentsEnabled()) {
    return Response.json(
      { ok: false, error: "Оплата тимчасово недоступна" },
      { status: 501 },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  if (body.company && body.company.trim() !== "") {
    return Response.json({ ok: false }, { status: 400 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (!(await rateLimit(`pay:${ip}`, 10, 600))) {
    return Response.json(
      { ok: false, error: "Забагато спроб. Зачекайте трохи." },
      { status: 429 },
    );
  }

  const parsed = parseContact(body, { requireDeliveryEmail: true });
  if (!parsed.ok) {
    return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  }
  const { name, contact, contactMethod, email } = parsed;

  const product = await getProductBySlug(body.productSlug ?? "");
  if (!product) {
    return Response.json(
      { ok: false, error: "Товар не знайдено" },
      { status: 404 },
    );
  }

  const message = (body.message ?? "").trim();
  const rawCustom = typeof body.customPrice === "number" ? body.customPrice : undefined;
  const effectivePrice =
    rawCustom && (rawCustom === product.price || rawCustom === product.price + 39 || rawCustom === product.price + 15)
      ? rawCustom
      : product.price;

  let discountAmount = 0;
  let validPromoCode: string | undefined;
  if (body.promoCode && typeof body.promoCode === "string" && body.promoCode.trim()) {
    const pCheck = await validatePromoCode(body.promoCode.trim(), product.slug, effectivePrice);
    if (pCheck.ok) {
      discountAmount = pCheck.discountAmount;
      validPromoCode = pCheck.promo.code;
    }
  }
  const finalPriceToCharge = Math.max(1, effectivePrice - discountAmount);

  // Поля .env перевіряються заново на сервері (включно з getMe для токенів) —
  // те, що форма їх уже показала зеленими, нічого не гарантує.
  const env = await prepareEnvData(product, body.envValues);
  if (!env.ok) {
    return Response.json({ ok: false, error: env.error }, { status: 400 });
  }

  const order = await addOrder({
    type: "product",
    productSlug: product.slug,
    productTitle: product.title,
    productPrice: finalPriceToCharge,
    originalPrice: discountAmount > 0 ? effectivePrice : undefined,
    discountAmount: discountAmount > 0 ? discountAmount : undefined,
    promoCode: validPromoCode,
    name,
    email,
    contactMethod,
    contact,
    message,
    envData: env.envData,
    envDataAt: env.envData ? Date.now() : undefined,
    deliveryStatus: "PENDING",
  });

  if (validPromoCode) {
    await incrementPromoUsage(validPromoCode).catch(() => {});
  }

  const proto =
    req.headers.get("x-forwarded-proto") ??
    new URL(req.url).protocol.replace(":", "");
  const host = req.headers.get("x-forwarded-host") ?? new URL(req.url).host;
  const origin = `${proto}://${host}`;

  const inv = await createInvoice({
    amount: finalPriceToCharge,
    description: `${product.title} — DevqSpace`,
    orderId: order.id,
    successUrl: `${origin}/order/success?p=${product.slug}`,
    cancelUrl: `${origin}/catalog/${product.slug}`,
    ipnUrl: `${origin}/api/pay/now/webhook`,
  });

  if (!inv.ok) {
    return Response.json({ ok: false, error: inv.error }, { status: 502 });
  }

  await setOrderInvoice(order.id, Number(inv.invoiceId) || 0);

  const payload: OrderPayload = {
    type: "product",
    productSlug: product.slug,
    productTitle: product.title,
    productPrice: finalPriceToCharge,
    name,
    email,
    contactMethod,
    contact,
    message: message
      ? `${message}\n\n⏳ Очікує оплати (NOWPayments)`
      : "⏳ Очікує оплати (NOWPayments)",
  };
  await sendOrderToTelegram(payload, order.id);

  return Response.json({ ok: true, url: inv.url });
}
