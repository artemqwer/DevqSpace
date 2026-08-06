import { devRouteBlocked } from "@/lib/devStubs";
import { signIpn } from "@/lib/nowpayments";
import { getOrder } from "@/lib/store";

// Імітує IPN від NOWPayments: збирає таке саме тіло, підписує тим самим
// HMAC-SHA512 і б'є в БОЙОВИЙ /api/pay/now/webhook. Тобто перевірка підпису,
// позначення оплати, упаковка й видача проганяються тим самим кодом, що в проді.
//
// У проді роут мертвий — інакше це був би спосіб позначити чуже замовлення
// оплаченим без оплати.

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

  const ipn = {
    payment_id: Date.now(),
    payment_status: "finished",
    order_id: orderId,
    pay_amount: order.productPrice ?? 0,
    pay_currency: "usdttrc20",
    price_amount: order.productPrice ?? 0,
    price_currency: "usd",
  };

  const sig = signIpn(ipn);
  if (!sig) {
    return Response.json(
      { ok: false, error: "Немає секрету для підпису IPN" },
      { status: 500 },
    );
  }

  const origin = new URL(req.url).origin;
  const res = await fetch(`${origin}/api/pay/now/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-nowpayments-sig": sig,
    },
    body: JSON.stringify(ipn),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    return Response.json(
      { ok: false, error: `Вебхук відповів ${res.status}: ${text.slice(0, 200)}` },
      { status: 502 },
    );
  }

  return Response.json({ ok: true });
}
