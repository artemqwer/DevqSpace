import {
  verifyWebhook,
  isPaidEvent,
  type WhopWebhook,
} from "@/lib/whop";
import { markOrderPaid, getOrder } from "@/lib/store";
import { tgSendMessage, TG_CONFIG } from "@/lib/telegram";
import { deliverOrder } from "@/lib/delivery";

// Вебхук Whop (Standard Webhooks / Svix).
// Перевіряє заголовки webhook-signature (або svix-signature), webhook-id, webhook-timestamp.
export async function POST(req: Request) {
  const raw = await req.text();

  const id = req.headers.get("webhook-id") || req.headers.get("svix-id");
  const timestamp =
    req.headers.get("webhook-timestamp") || req.headers.get("svix-timestamp");
  const signature =
    req.headers.get("webhook-signature") || req.headers.get("svix-signature");

  if (!verifyWebhook(raw, { id, timestamp, signature })) {
    console.warn("[whop-webhook] Invalid signature or timestamp");
    return new Response("Invalid signature", { status: 401 });
  }

  let body: WhopWebhook;
  try {
    body = JSON.parse(raw) as WhopWebhook;
  } catch {
    return Response.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }

  if (!isPaidEvent(body)) {
    return Response.json({ ok: true, ignored: true });
  }

  const orderId =
    body.data?.metadata?.order_id ||
    body.data?.custom_data?.order_id ||
    body.data?.plan?.metadata?.order_id ||
    body.metadata?.order_id;

  if (!orderId) {
    console.warn("[whop-webhook] No order_id found in metadata");
    return Response.json({ ok: true, ignored: true });
  }

  const order = await getOrder(orderId);
  if (!order || order.paid) {
    return Response.json({ ok: true }); // ідемпотентність
  }

  const total = body.data?.total ?? order.productPrice;
  await markOrderPaid(orderId, {
    amount: String(total),
    asset: body.data?.currency?.toUpperCase() ?? "USD",
  });

  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host =
    req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  const fresh = await getOrder(orderId);
  if (fresh) {
    await deliverOrder(fresh, `${proto}://${host}`);
  }

  if (TG_CONFIG.adminChatId) {
    await tgSendMessage(
      TG_CONFIG.adminChatId,
      [
        "💰 <b>ОПЛАЧЕНО</b> (Whop)",
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
  return new Response("Whop webhook endpoint. POST only.", { status: 405 });
}
