import { getSession } from "@/lib/session";
import {
  listPromoCodes,
  savePromoCode,
  deletePromoCode,
  type PromoCode,
} from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await getSession())) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const promos = await listPromoCodes();
  return Response.json({ ok: true, promos });
}

export async function POST(req: Request) {
  if (!(await getSession())) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: { promo?: PromoCode };
  try {
    body = (await req.json()) as { promo?: PromoCode };
  } catch {
    return Response.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }

  if (!body.promo || !body.promo.code?.trim()) {
    return Response.json({ ok: false, error: "Вкажіть промокод" }, { status: 400 });
  }

  await savePromoCode(body.promo);
  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!(await getSession())) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code) {
    return Response.json({ ok: false, error: "Відсутній параметр code" }, { status: 400 });
  }

  await deletePromoCode(code);
  return Response.json({ ok: true });
}
