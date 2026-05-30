import { sendOrderToTelegram, type OrderPayload } from "@/lib/telegram";
import { getProductBySlug, addOrder } from "@/lib/store";

export async function POST(req: Request) {
  let body: Partial<OrderPayload>;
  try {
    body = (await req.json()) as Partial<OrderPayload>;
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
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
    orderData = {
      type: "product",
      productSlug: product.slug,
      productTitle: product.title,
      productPrice: product.price,
      name,
      contactMethod,
      contact,
      message,
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
  try {
    await addOrder(orderData);
  } catch (e) {
    console.error("[order] failed to persist:", e);
  }

  // 2. Сповіщення в Telegram (best-effort)
  await sendOrderToTelegram(payload);

  return Response.json({ ok: true });
}
