import {
  wayForPayEnabled,
  buildWidgetParams,
  makeOrderRef,
} from "@/lib/wayforpay";
import {
  getProductBySlug,
  addOrder,
  rateLimit,
} from "@/lib/store";
import { usdToUah } from "@/lib/monojar";
import { prepareEnvData } from "@/lib/orderEnv";
import { sendOrderToTelegram, type OrderPayload } from "@/lib/telegram";
import { parseContact } from "@/lib/contact";

type Body = {
  productSlug?: string;
  name?: string;
  contactMethod?: "telegram" | "email" | "phone";
  contact?: string;
  message?: string;
  company?: string; // honeypot
  envValues?: Record<string, string>;
};

export async function POST(req: Request) {
  if (!wayForPayEnabled()) {
    return Response.json(
      { ok: false, error: "Оплата карткою тимчасово недоступна" },
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

  const parsed = parseContact(body);
  if (!parsed.ok) {
    return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  }
  const { name, contact, contactMethod } = parsed;

  const product = await getProductBySlug(body.productSlug ?? "");
  if (!product) {
    return Response.json({ ok: false, error: "Товар не знайдено" }, { status: 404 });
  }

  const message = (body.message ?? "").trim();

  // Поля .env перевіряються заново на сервері (включно з getMe для токенів).
  const env = await prepareEnvData(product, body.envValues);
  if (!env.ok) {
    return Response.json({ ok: false, error: env.error }, { status: 400 });
  }

  const order = await addOrder({
    type: "product",
    productSlug: product.slug,
    productTitle: product.title,
    productPrice: product.price,
    name,
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

  const isEn = /(?:^|;\s*)NEXT_LOCALE=en\b/.test(
    req.headers.get("cookie") ?? "",
  );
  const amountUah = await usdToUah(product.price);
  const params = buildWidgetParams({
    amountUah,
    productName: `${product.title} — DevqSpace`,
    orderRef: makeOrderRef(order.id),
    serviceUrl: `${origin}/api/pay/wfp/callback`,
    returnUrl: `${origin}/order/success?p=${product.slug}&o=${order.id}`,
    language: isEn ? "EN" : "UA",
  });

  if (!params) {
    return Response.json(
      { ok: false, error: "WayForPay не налаштовано" },
      { status: 502 },
    );
  }

  const payload: OrderPayload = {
    type: "product",
    productSlug: product.slug,
    productTitle: product.title,
    productPrice: product.price,
    name,
    contactMethod,
    contact,
    message: message
      ? `${message}\n\n⏳ Очікує оплати (WayForPay · ${amountUah} ₴)`
      : `⏳ Очікує оплати (WayForPay · ${amountUah} ₴)`,
  };
  await sendOrderToTelegram(payload, order.id);

  return Response.json({ ok: true, params, orderId: order.id });
}
