import { devRouteBlocked } from "@/lib/devStubs";
import { getOrder, markOrderPaid } from "@/lib/store";
import { deliverOrder } from "@/lib/delivery";

// Повторює те, що в проді робить адмін кнопкою «💰 Оплачено» в Telegram:
// позначає замовлення оплаченим і запускає видачу. Банка Monobank не має
// вебхука, тож підтвердження там теж ручне — логіка та сама.

export const maxDuration = 60;

export async function POST(req: Request) {
  if (devRouteBlocked()) return new Response(null, { status: 404 });

  const body = (await req.json().catch(() => null)) as {
    orderId?: string;
  } | null;
  const orderId = body?.orderId;
  if (!orderId) {
    return Response.json({ ok: false, error: "Немає orderId" }, { status: 400 });
  }

  const order = await getOrder(orderId);
  if (!order) {
    return Response.json(
      { ok: false, error: "Замовлення не знайдено" },
      { status: 404 },
    );
  }

  if (!order.paid) {
    await markOrderPaid(orderId, { asset: "UAH" });
  }

  const fresh = await getOrder(orderId);
  const result = fresh
    ? await deliverOrder(fresh, new URL(req.url).origin)
    : null;

  return Response.json({ ok: true, delivery: result });
}
