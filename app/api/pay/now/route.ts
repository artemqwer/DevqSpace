import { createInvoice, nowPaymentsEnabled } from "@/lib/nowpayments";
import {
  getProductBySlug,
  addOrder,
  setOrderInvoice,
  rateLimit,
} from "@/lib/store";
import { sendOrderToTelegram, type OrderPayload } from "@/lib/telegram";

type Body = {
  productSlug?: string;
  name?: string;
  contactMethod?: "telegram" | "email" | "phone";
  contact?: string;
  message?: string;
  company?: string; // honeypot
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

  const name = (body.name ?? "").trim();
  const contact = (body.contact ?? "").trim();
  const contactMethod = body.contactMethod;
  if (!name || !contact) {
    return Response.json(
      { ok: false, error: "Вкажіть ім'я та контакт для доставки" },
      { status: 400 },
    );
  }
  if (
    contactMethod !== "telegram" &&
    contactMethod !== "email" &&
    contactMethod !== "phone"
  ) {
    return Response.json(
      { ok: false, error: "Невірний контакт" },
      { status: 400 },
    );
  }

  const product = await getProductBySlug(body.productSlug ?? "");
  if (!product) {
    return Response.json(
      { ok: false, error: "Товар не знайдено" },
      { status: 404 },
    );
  }

  const message = (body.message ?? "").trim();

  const order = await addOrder({
    type: "product",
    productSlug: product.slug,
    productTitle: product.title,
    productPrice: product.price,
    name,
    contactMethod,
    contact,
    message,
  });

  const proto =
    req.headers.get("x-forwarded-proto") ??
    new URL(req.url).protocol.replace(":", "");
  const host = req.headers.get("x-forwarded-host") ?? new URL(req.url).host;
  const origin = `${proto}://${host}`;

  const inv = await createInvoice({
    amount: product.price,
    description: `${product.title} — NEXUS`,
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
    productPrice: product.price,
    name,
    contactMethod,
    contact,
    message: message
      ? `${message}\n\n⏳ Очікує оплати (NOWPayments)`
      : "⏳ Очікує оплати (NOWPayments)",
  };
  await sendOrderToTelegram(payload, order.id);

  return Response.json({ ok: true, url: inv.url });
}
