import { lemonEnabled, createCheckout } from "@/lib/lemonsqueezy";
import { getProductBySlug, addOrder, rateLimit } from "@/lib/store";
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
};

export async function POST(req: Request) {
  if (!lemonEnabled()) {
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

  const env = await prepareEnvData(product, body.envValues);
  if (!env.ok) {
    return Response.json({ ok: false, error: env.error }, { status: 400 });
  }

  const order = await addOrder({
    type: "product",
    productSlug: product.slug,
    productTitle: product.title,
    productPrice: effectivePrice,
    name,
    email,
    contactMethod,
    contact,
    message,
    envData: env.envData,
    envDataAt: env.envData ? Date.now() : undefined,
    deliveryStatus: "PENDING",
  });

  const proto =
    req.headers.get("x-forwarded-proto") ??
    new URL(req.url).protocol.replace(":", "");
  const host = req.headers.get("x-forwarded-host") ?? new URL(req.url).host;
  const origin = `${proto}://${host}`;

  const co = await createCheckout({
    amountUsd: effectivePrice,
    productName: `${product.title} — DevqSpace`,
    orderId: order.id,
    email: email ?? (contactMethod === "email" ? contact : undefined),
    redirectUrl: `${origin}/order/success?p=${product.slug}&o=${order.id}`,
  });

  if (!co.ok) {
    return Response.json({ ok: false, error: co.error }, { status: 502 });
  }

  const payload: OrderPayload = {
    type: "product",
    productSlug: product.slug,
    productTitle: product.title,
    productPrice: effectivePrice,
    name,
    email,
    contactMethod,
    contact,
    message: message
      ? `${message}\n\n⏳ Очікує оплати (Lemon Squeezy)`
      : "⏳ Очікує оплати (Lemon Squeezy)",
  };
  await sendOrderToTelegram(payload, order.id);

  return Response.json({ ok: true, url: co.url });
}
