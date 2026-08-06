import { sendOrderToTelegram, type OrderPayload } from "@/lib/telegram";
import { getProductBySlug, addOrder, rateLimit } from "@/lib/store";
import { prepareEnvData } from "@/lib/orderEnv";

type OrderBody = Partial<OrderPayload> & {
  company?: string;
  envData?: Record<string, string>;
};

export async function POST(req: Request) {
  let body: OrderBody;
  try {
    body = (await req.json()) as OrderBody;
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  // 1. Honeypot — приховане поле "company". Боти його заповнюють.
  //    Вдаємо успіх, але нічого не робимо.
  if (body.company && body.company.trim() !== "") {
    return Response.json({ ok: true });
  }

  // 2. Rate-limit по IP: максимум 5 заявок за 10 хвилин.
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const allowed = await rateLimit(`order:${ip}`, 5, 600);
  if (!allowed) {
    return Response.json(
      { ok: false, error: "Забагато заявок. Спробуйте за кілька хвилин." },
      { status: 429 },
    );
  }

  const name = (body.name ?? "").trim();
  const contact = (body.contact ?? "").trim();
  const contactMethod = body.contactMethod;
  const type = body.type;

  if (!name || !contact) {
    return Response.json(
      { ok: false, error: "Вкажіть ім'я та контакт" },
      { status: 400 },
    );
  }
  if (
    contactMethod !== "telegram" &&
    contactMethod !== "email" &&
    contactMethod !== "phone"
  ) {
    return Response.json(
      { ok: false, error: "Невірний contactMethod" },
      { status: 400 },
    );
  }
  if (type !== "product" && type !== "custom") {
    return Response.json({ ok: false, error: "Невірний type" }, { status: 400 });
  }

  const message = (body.message ?? "").trim();
  let payload: OrderPayload;
  let orderData: Parameters<typeof addOrder>[0];

  if (type === "product") {
    const slug = body.productSlug ?? "";
    const product = await getProductBySlug(slug);
    if (!product) {
      return Response.json(
        { ok: false, error: "Товар не знайдено" },
        { status: 404 },
      );
    }
    payload = {
      type: "product",
      productSlug: product.slug,
      productTitle: product.title,
      productPrice: product.price,
      name,
      contactMethod,
      contact,
      message,
    };
    const env = await prepareEnvData(product, body.envData);
    if (!env.ok) {
      return Response.json({ ok: false, error: env.error }, { status: 400 });
    }
    orderData = {
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
    };
  } else {
    const customType = (body.customType ?? "").trim() || "—";
    const budget = (body.budget ?? "").trim() || "—";
    const deadline = (body.deadline ?? "").trim() || "—";
    payload = {
      type: "custom",
      customType,
      budget,
      deadline,
      name,
      contactMethod,
      contact,
      message,
    };
    orderData = {
      type: "custom",
      customType,
      budget,
      deadline,
      name,
      contactMethod,
      contact,
      message,
    };
  }

  // 1. Зберігаємо замовлення (головне — не втратити заявку)
  let orderId: string | undefined;
  try {
    const saved = await addOrder(orderData);
    orderId = saved.id;
  } catch (e) {
    console.error("[order] failed to persist:", e);
  }

  // 2. Сповіщення в Telegram з inline-кнопками статусу (best-effort)
  await sendOrderToTelegram(payload, orderId);

  return Response.json({ ok: true, orderId });
}
