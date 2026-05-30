import {
  verifyIpnSignature,
  isPaidStatus,
  type NowIpn,
} from "@/lib/nowpayments";
import { markOrderPaid, getOrder } from "@/lib/store";
import { tgSendMessage, TG_CONFIG } from "@/lib/telegram";

// IPN callback від NOWPayments. URL вказується при створенні інвойсу
// (ipn_callback_url) і має збігатися з тим, що в налаштуваннях акаунта.

export async function POST(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get("x-nowpayments-sig");

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  if (!verifyIpnSignature(parsed, sig)) {
    return new Response("invalid signature", { status: 401 });
  }

  const ipn = parsed as NowIpn;
  const orderId = ipn.order_id;
  if (!orderId || !isPaidStatus(ipn.payment_status)) {
    return Response.json({ ok: true }); // інші статуси ігноруємо
  }

  const order = await getOrder(orderId);
  if (!order) return Response.json({ ok: true });
  if (order.paid) return Response.json({ ok: true }); // ідемпотентність

  await markOrderPaid(orderId, {
    invoiceId: Number(ipn.payment_id) || undefined,
    amount: ipn.pay_amount ? String(ipn.pay_amount) : undefined,
    asset: ipn.pay_currency?.toUpperCase(),
  });

  if (TG_CONFIG.adminChatId) {
    const lines = [
      "💰 <b>ОПЛАЧЕНО</b>",
      "",
      `📦 ${order.productTitle ?? "—"}`,
      `💵 $${order.productPrice} (${ipn.pay_amount ?? ""} ${ipn.pay_currency?.toUpperCase() ?? ""})`.trim(),
      `👤 ${order.name} · ${order.contact}`,
      "",
      "Можна видавати товар 🚀",
    ];
    await tgSendMessage(TG_CONFIG.adminChatId, lines.join("\n"));
  }

  return Response.json({ ok: true });
}

export function GET() {
  return new Response("NOWPayments IPN. POST only.", { status: 405 });
}
