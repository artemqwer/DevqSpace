import { sendOrderToTelegram, type OrderPayload } from "@/lib/telegram";
import { getProductBySlug, addOrder, rateLimit } from "@/lib/store";
import { prepareEnvData } from "@/lib/orderEnv";
import { parseContact } from "@/lib/contact";

type OrderBody = Partial<OrderPayload> & {
  company?: string;
  envValues?: Record<string, string>;
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

  const parsed = parseContact(body);
  if (!parsed.ok) {
    return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  }
  const { name, contact, contactMethod } = parsed;
  const type = body.type;

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
    // Заявка без оплати — м'який режим: клієнт міг не розібратися в
    // налаштуваннях, і це нормальний сценарій («оформимо підтримкою»).
    // Заявку приймаємо, а адміну показуємо, чого бракує.
    const env = await prepareEnvData(product, body.envValues, "lenient");
    if (!env.ok) {
      return Response.json({ ok: false, error: env.error }, { status: 400 });
    }
    const envNote = env.warnings.length
      ? `\n\n⚠️ Налаштування заповнені не повністю:\n• ${env.warnings.join("\n• ")}`
      : "";

    payload = {
      type: "product",
      productSlug: product.slug,
      productTitle: product.title,
      productPrice: product.price,
      name,
      contactMethod,
      contact,
      message: message + envNote,
    };
    orderData = {
      type: "product",
      productSlug: product.slug,
      productTitle: product.title,
      productPrice: product.price,
      name,
      contactMethod,
      contact,
      message: message + envNote,
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
