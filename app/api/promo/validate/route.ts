import { validatePromoCode, getProductBySlug } from "@/lib/store";

type Body = {
  code?: string;
  productSlug?: string;
  price?: number;
  orderAmount?: number;
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

  const rawNum = typeof body.price === "number" && body.price > 0
    ? body.price
    : typeof body.orderAmount === "number" && body.orderAmount > 0
      ? body.orderAmount
      : undefined;

  let basePrice = rawNum;

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
    promo: {
      code: result.promo.code,
      promoType: result.promo.promoType ?? "discount",
      discountType: result.promo.discountType,
      discountValue: result.promo.discountValue,
      description: result.promo.description,
    },
    code: result.promo.code,
    promoType: result.promo.promoType ?? "discount",
    discountType: result.promo.discountType,
    discountValue: result.promo.discountValue,
    discountAmount: result.discountAmount,
    finalPrice: result.finalPrice,
    description: result.promo.description,
  });
}
