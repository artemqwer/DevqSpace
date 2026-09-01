import { jarEnabled, getJarUrl, usdToUah } from "@/lib/monojar";
import { getProductBySlug, addOrder, rateLimit } from "@/lib/store";
import { sendOrderToTelegram, type OrderPayload } from "@/lib/telegram";
import { prepareEnvData } from "@/lib/orderEnv";

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
  if (!jarEnabled()) {
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
  const amountUah = await usdToUah(product.price);

  // Ті самі перевірки .env, що й у крипто-оплаті.
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
    payMethod: "jar",
    envData: env.envData,
    envDataAt: env.envData ? Date.now() : undefined,
    deliveryStatus: "PENDING",
  });

  // Telegram: очікує оплати на банку (з кнопками статусу + 💰 Оплачено)
  const payload: OrderPayload = {
    type: "product",
    productSlug: product.slug,
    productTitle: product.title,
    productPrice: product.price,
    name,
    contactMethod,
    contact,
    message: message
      ? `${message}\n\n🟡 Очікує оплати на банку (${amountUah} грн). Замовлення #${order.id}`
      : `🟡 Очікує оплати на банку (${amountUah} грн). Замовлення #${order.id}`,
  };
  await sendOrderToTelegram(payload, order.id);

  return Response.json({
    ok: true,
    orderId: order.id,
    jarUrl: getJarUrl(order.id),
    amountUah,
    priceUsd: product.price,
  });
}
