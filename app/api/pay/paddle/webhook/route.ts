import {
  verifyWebhook,
  isPaidEvent,
  type PaddleWebhook,
} from "@/lib/paddle";
import { markOrderPaid, getOrder } from "@/lib/store";
import { tgSendMessage, TG_CONFIG } from "@/lib/telegram";
import { deliverOrder } from "@/lib/delivery";

// Вебхук Paddle Billing. Підпис — заголовок Paddle-Signature.
export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyWebhook(raw, req.headers.get("paddle-signature"))) {
    return new Response("invalid signature", { status: 401 });
  }

  let body: PaddleWebhook;
  try {
    body = JSON.parse(raw) as PaddleWebhook;
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  const orderId = body.data?.custom_data?.order_id;
  if (!orderId || !isPaidEvent(body)) return Response.json({ ok: true });

  const order = await getOrder(orderId);
  if (!order || order.paid) return Response.json({ ok: true }); // ідемпотентність

  const total = body.data?.details?.totals?.grand_total;
  await markOrderPaid(orderId, {
    amount: total ? String(Number(total) / 100) : undefined,
    asset: body.data?.currency_code ?? "USD",
  });

  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host =
    req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  const fresh = await getOrder(orderId);
  if (fresh) await deliverOrder(fresh, `${proto}://${host}`);

  if (TG_CONFIG.adminChatId) {
    await tgSendMessage(
      TG_CONFIG.adminChatId,
      [
        "💰 <b>ОПЛАЧЕНО</b> (Paddle)",
        "",
        `📦 ${order.productTitle ?? "—"}`,
        `💵 $${order.productPrice}`,
        `👤 ${order.name} · ${order.contact}`,
        "",
        "Товар видано автоматично 🚀",
      ].join("\n"),
    );
  }

  return Response.json({ ok: true });
}

export function GET() {
  return new Response("Paddle webhook. POST only.", { status: 405 });
}
