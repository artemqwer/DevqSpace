import {
  verifyWebhookSignature,
  type CryptoPayUpdate,
} from "@/lib/cryptopay";
import { markOrderPaid, getOrder } from "@/lib/store";
import { tgSendMessage, TG_CONFIG } from "@/lib/telegram";

// Webhook Crypto Pay. Налаштовується в @CryptoBot → Crypto Pay →
// My Apps → ваш app → Webhooks → URL: https://<домен>/api/pay/crypto/webhook

export async function POST(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get("crypto-pay-api-signature");

  if (!verifyWebhookSignature(raw, sig)) {
    return new Response("invalid signature", { status: 401 });
  }

  let update: CryptoPayUpdate;
  try {
    update = JSON.parse(raw) as CryptoPayUpdate;
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  if (update.update_type !== "invoice_paid" || !update.payload) {
    return Response.json({ ok: true });
  }

  const inv = update.payload;
  const orderId = inv.payload;
  if (!orderId) return Response.json({ ok: true });

  const order = await getOrder(orderId);
  if (!order) return Response.json({ ok: true });
  if (order.paid) return Response.json({ ok: true }); // ідемпотентність

  await markOrderPaid(orderId, {
    invoiceId: inv.invoice_id,
    amount: inv.amount,
    asset: inv.asset,
  });

  // Сповіщення «оплачено»
  if (TG_CONFIG.adminChatId) {
    const lines = [
      "💰 <b>ОПЛАЧЕНО</b>",
      "",
      `📦 ${order.productTitle ?? "—"}`,
      `💵 ${inv.amount ?? order.productPrice} ${inv.asset ?? ""}`.trim(),
      `👤 ${order.name} · ${order.contact}`,
      "",
      "Можна видавати товар 🚀",
    ];
    await tgSendMessage(TG_CONFIG.adminChatId, lines.join("\n"));
  }

  return Response.json({ ok: true });
}

export function GET() {
  return new Response("Crypto Pay webhook. POST only.", { status: 405 });
}
