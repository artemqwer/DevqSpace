import { paddleEnabled, createTransaction } from "@/lib/paddle";
import {
  getProductBySlug,
  addOrder,
  rateLimit,
  validatePromoCode,
  incrementPromoUsage,
} from "@/lib/store";
import { prepareEnvData } from "@/lib/orderEnv";
import { sendOrderToTelegram, type OrderPayload } from "@/lib/telegram";
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
  if (!paddleEnabled()) {
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
    return Response.json({ ok: false, error: "Товар не знайдено" }, { status: 404 });
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

  const tx = await createTransaction({
    amountUsd: finalPriceToCharge,
    productName: `${product.title} — DevqSpace`,
    orderId: order.id,
  });

  if (!tx.ok) {
    return Response.json({ ok: false, error: tx.error }, { status: 502 });
  }

  const promoNote = validPromoCode
    ? `🏷 Промокод: ${validPromoCode} (-$${discountAmount})`
    : "";

  const payload: OrderPayload = {
    type: "product",
    productSlug: product.slug,
    productTitle: product.title,
    productPrice: finalPriceToCharge,
    name,
    email,
    contactMethod,
    contact,
    message: [message, promoNote, "⏳ Очікує оплати (Paddle)"]
      .filter(Boolean)
      .join("\n\n"),
  };
  await sendOrderToTelegram(payload, order.id);

  return Response.json({
    ok: true,
    transactionId: tx.transactionId,
    orderId: order.id,
    email: email ?? (contactMethod === "email" ? contact : undefined),
  });
}
