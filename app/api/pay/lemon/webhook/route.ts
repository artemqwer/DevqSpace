import {
  verifyWebhook,
  isPaidEvent,
  type LemonWebhook,
} from "@/lib/lemonsqueezy";
import { markOrderPaid, getOrder } from "@/lib/store";
import { tgSendMessage, TG_CONFIG } from "@/lib/telegram";
import { deliverOrder } from "@/lib/delivery";

// Вебхук Lemon Squeezy. Підпис — X-Signature (HMAC-SHA256 сирого тіла).
export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyWebhook(raw, req.headers.get("x-signature"))) {
    return new Response("invalid signature", { status: 401 });
  }

  let body: LemonWebhook;
  try {
    body = JSON.parse(raw) as LemonWebhook;
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  const orderId = body.meta?.custom_data?.order_id;
  if (!orderId || !isPaidEvent(body)) return Response.json({ ok: true });

  const order = await getOrder(orderId);
  if (!order || order.paid) return Response.json({ ok: true }); // ідемпотентність

  const attrs = body.data?.attributes;
  await markOrderPaid(orderId, {
    amount: attrs?.total ? String(attrs.total / 100) : undefined,
    asset: attrs?.currency ?? "USD",
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
        "💰 <b>ОПЛАЧЕНО</b> (Lemon Squeezy)",
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
  return new Response("Lemon Squeezy webhook. POST only.", { status: 405 });
}
