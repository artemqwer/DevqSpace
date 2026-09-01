import {
  verifyCallback,
  isPaidStatus,
  acceptResponse,
  orderIdFromRef,
  type WfpCallback,
} from "@/lib/wayforpay";
import { markOrderPaid, getOrder } from "@/lib/store";
import { tgSendMessage, TG_CONFIG } from "@/lib/telegram";
import { deliverOrder } from "@/lib/delivery";

// serviceUrl callback від WayForPay. Тіло — JSON (іноді form-encoded,
// де весь JSON лежить у першому ключі). Обробляємо обидва варіанти.
async function parseBody(req: Request): Promise<WfpCallback | null> {
  const raw = await req.text();
  if (!raw) return null;
  try {
    return JSON.parse(raw) as WfpCallback;
  } catch {
    // form-encoded: перший ключ = сам JSON
    const key = new URLSearchParams(raw).keys().next().value;
    if (!key) return null;
    try {
      return JSON.parse(key) as WfpCallback;
    } catch {
      return null;
    }
  }
}

export async function POST(req: Request) {
  const cb = await parseBody(req);
  if (!cb || !cb.orderReference) {
    return Response.json({ ok: false }, { status: 400 });
  }

  if (!verifyCallback(cb)) {
    return new Response("invalid signature", { status: 401 });
  }

  const orderId = orderIdFromRef(cb.orderReference);

  // Відповідь WayForPay готуємо завжди (інакше він шле callback повторно).
  const ack = Response.json(acceptResponse(cb.orderReference));

  if (!isPaidStatus(cb.transactionStatus)) return ack; // Declined/Pending — ігноруємо

  const order = await getOrder(orderId);
  if (!order || order.paid) return ack; // немає / вже оплачено — ідемпотентність

  await markOrderPaid(orderId, {
    amount: cb.amount ? String(cb.amount) : undefined,
    asset: cb.currency ?? "UAH",
  });

  // Автоматична видача товару
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host =
    req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  const fresh = await getOrder(orderId);
  if (fresh) await deliverOrder(fresh, `${proto}://${host}`);

  if (TG_CONFIG.adminChatId) {
    const lines = [
      "💰 <b>ОПЛАЧЕНО</b> (WayForPay)",
      "",
      `📦 ${order.productTitle ?? "—"}`,
      `💵 $${order.productPrice} (${cb.amount ?? ""} ${cb.currency ?? "UAH"})`.trim(),
      `👤 ${order.name} · ${order.contact}`,
      "",
      "Товар видано автоматично 🚀",
    ];
    await tgSendMessage(TG_CONFIG.adminChatId, lines.join("\n"));
  }

  return ack;
}

export function GET() {
  return new Response("WayForPay service URL. POST only.", { status: 405 });
}
