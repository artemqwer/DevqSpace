import { createInvoice, cryptoPayEnabled } from "@/lib/cryptopay";
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
  if (!cryptoPayEnabled()) {
    return Response.json(
      { ok: false, error: "Крипто-оплата тимчасово недоступна" },
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
    return Response.json({ ok: false, error: "Невірний контакт" }, { status: 400 });
  }

  const product = await getProductBySlug(body.productSlug ?? "");
  if (!product) {
    return Response.json(
      { ok: false, error: "Товар не знайдено" },
      { status: 404 },
    );
  }

  const message = (body.message ?? "").trim();

  // 1. Створюємо замовлення (поки не оплачене)
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

  // 2. Створюємо інвойс Crypto Pay
  const proto =
    req.headers.get("x-forwarded-proto") ??
    new URL(req.url).protocol.replace(":", "");
  const host = req.headers.get("x-forwarded-host") ?? new URL(req.url).host;
  const returnUrl = `${proto}://${host}/order/success?p=${product.slug}`;

  const inv = await createInvoice({
    amount: product.price,
    description: `${product.title} — NEXUS`,
    payload: order.id,
    returnUrl,
  });

  if (!inv.ok) {
    return Response.json({ ok: false, error: inv.error }, { status: 502 });
  }

  await setOrderInvoice(order.id, inv.invoiceId);

  // 3. Сповіщення в Telegram: створено замовлення з очікуванням оплати
  const payload: OrderPayload = {
    type: "product",
    productSlug: product.slug,
    productTitle: product.title,
    productPrice: product.price,
    name,
    contactMethod,
    contact,
    message: message
      ? `${message}\n\n⏳ Очікує оплати криптою`
      : "⏳ Очікує оплати криптою",
  };
  await sendOrderToTelegram(payload, order.id);

  return Response.json({ ok: true, url: inv.url });
}
