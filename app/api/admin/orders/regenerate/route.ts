import { getSession } from "@/lib/session";
import { getOrder, updateOrder } from "@/lib/store";
import { deliverOrder } from "@/lib/delivery";

// Ручна пересборка й повторна видача — для замовлень, що впали (FAILED) або
// коли треба переслати архів заново.

export const maxDuration = 60;

export async function POST(req: Request) {
  if (!(await getSession())) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { id?: string } | null;
  const id = body?.id;
  if (!id) {
    return Response.json({ ok: false, error: "Немає id" }, { status: 400 });
  }

  const order = await getOrder(id);
  if (!order) {
    return Response.json(
      { ok: false, error: "Замовлення не знайдено" },
      { status: 404 },
    );
  }
  if (!order.paid) {
    return Response.json(
      { ok: false, error: "Замовлення не оплачене" },
      { status: 400 },
    );
  }

  // deliverOrder ідемпотентна і одразу виходить, якщо delivered — для
  // повторної видачі прапорець треба зняти.
  const reset = await updateOrder(id, {
    delivered: false,
    deliveryStatus: "GENERATING",
    errorMessage: undefined,
    packageUrl: undefined,
    packageName: undefined,
  });
  if (!reset) {
    return Response.json(
      { ok: false, error: "Не вдалося оновити замовлення" },
      { status: 500 },
    );
  }

  const result = await deliverOrder(reset, new URL(req.url).origin);

  if (!result.ok) {
    const fresh = await getOrder(id);
    return Response.json({
      ok: false,
      error: fresh?.errorMessage ?? result.note ?? "Видача не вдалася",
    });
  }

  return Response.json({ ok: true, note: `Видано (${result.channel})` });
}
