import { validatePromoCode, getProductBySlug } from "@/lib/store";

type Body = {
  code?: string;
  productSlug?: string;
  price?: number;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ ok: false, error: "Некоректний запит" }, { status: 400 });
  }

  const code = (body.code ?? "").trim();
  if (!code) {
    return Response.json({ ok: false, error: "Введіть промокод" }, { status: 400 });
  }

  let basePrice = typeof body.price === "number" && body.price > 0 ? body.price : undefined;

  if (body.productSlug && basePrice === undefined) {
    const product = await getProductBySlug(body.productSlug);
    if (product) {
      basePrice = product.price;
    }
  }

  const result = await validatePromoCode(code, body.productSlug, basePrice);
  if (!result.ok) {
    return Response.json({ ok: false, error: result.error }, { status: 400 });
  }

  return Response.json({
    ok: true,
    code: result.promo.code,
    discountType: result.promo.discountType,
    discountValue: result.promo.discountValue,
    discountAmount: result.discountAmount,
    finalPrice: result.finalPrice,
    description: result.promo.description,
  });
}
