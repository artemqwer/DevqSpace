import { getSession } from "@/lib/session";
import {
  updateOrderStatus,
  updateOrdersStatus,
  markOrderPaid,
  deleteOrder,
  getOrder,
  type OrderStatus,
} from "@/lib/store";
import { deliverOrder } from "@/lib/delivery";

const STATUSES: OrderStatus[] = ["new", "in_progress", "done", "rejected"];

// Підтвердження оплати тягне за собою збірку архіву й видачу.
export const maxDuration = 60;

export async function PATCH(req: Request) {
  if (!(await getSession())) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  let body: { id?: string; ids?: string[]; status?: string; paid?: boolean };
  try {
    body = (await req.json()) as {
      id?: string;
      ids?: string[];
      status?: string;
      paid?: boolean;
    };
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
  const { id, ids, status, paid } = body;

  // Групове оновлення статусів
  if (Array.isArray(ids) && ids.length > 0) {
    if (!status || !STATUSES.includes(status as OrderStatus)) {
      return Response.json({ ok: false, error: "Невірний статус" }, { status: 400 });
    }
    const count = await updateOrdersStatus(ids, status as OrderStatus);
    return Response.json({ ok: true, count });
  }

  if (!id) {
    return Response.json({ ok: false, error: "Bad data" }, { status: 400 });
  }

  // Ручне підтвердження оплати (напр. надійшло на банку Monobank).
  if (paid === true) {
    const ok = await markOrderPaid(id, {});
    if (!ok) {
      return Response.json(
        { ok: false, error: "Замовлення не знайдено" },
        { status: 404 },
      );
    }

    // Раніше видача запускалась лише з кнопки «💰 Оплачено» в Telegram-боті,
    // тож підтвердження з веб-адмінки лишало клієнта без товару. Робимо те
    // саме, що й бот.
    const fresh = await getOrder(id);
    const delivery = fresh
      ? await deliverOrder(fresh, new URL(req.url).origin)
      : null;

    return Response.json({ ok: true, delivery });
  }

  if (!status || !STATUSES.includes(status as OrderStatus)) {
    return Response.json({ ok: false, error: "Bad data" }, { status: 400 });
  }
  const ok = await updateOrderStatus(id, status as OrderStatus);
  return Response.json({ ok });
}

export async function DELETE(req: Request) {
  if (!(await getSession())) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const rawIds = url.searchParams.get("ids");

  if (rawIds) {
    const ids = rawIds.split(",").map((s) => s.trim()).filter(Boolean);
    for (const i of ids) {
      await deleteOrder(i);
    }
    return Response.json({ ok: true, count: ids.length });
  }

  if (!id) return Response.json({ ok: false }, { status: 400 });
  await deleteOrder(id);
  return Response.json({ ok: true });
}
