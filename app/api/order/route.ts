import { sendOrderToTelegram, type OrderPayload } from "@/lib/telegram";
import { getProduct } from "@/lib/products";

export async function POST(req: Request) {
  let body: Partial<OrderPayload>;
  try {
    body = (await req.json()) as Partial<OrderPayload>;
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  // Базова валідація
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

  let payload: OrderPayload;

  if (type === "product") {
    const slug = body.productSlug ?? "";
    const product = getProduct(slug);
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
      message: (body.message ?? "").trim(),
    };
  } else {
    payload = {
      type: "custom",
      customType: (body.customType ?? "").trim() || "—",
      budget: (body.budget ?? "").trim() || "—",
      deadline: (body.deadline ?? "").trim() || "—",
      name,
      contactMethod,
      contact,
      message: (body.message ?? "").trim(),
    };
  }

  const result = await sendOrderToTelegram(payload);
  if (!result.ok) {
    return Response.json({ ok: false, error: result.error }, { status: 502 });
  }
  return Response.json({ ok: true });
}
