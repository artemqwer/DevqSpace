import { getSession } from "@/lib/session";
import { updateOrderStatus, deleteOrder, type OrderStatus } from "@/lib/store";

const STATUSES: OrderStatus[] = ["new", "in_progress", "done", "rejected"];

export async function PATCH(req: Request) {
  if (!(await getSession())) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  let body: { id?: string; status?: string };
  try {
    body = (await req.json()) as { id?: string; status?: string };
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
  const { id, status } = body;
  if (!id || !status || !STATUSES.includes(status as OrderStatus)) {
    return Response.json({ ok: false, error: "Bad data" }, { status: 400 });
  }
  const ok = await updateOrderStatus(id, status as OrderStatus);
  return Response.json({ ok });
}

export async function DELETE(req: Request) {
  if (!(await getSession())) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return Response.json({ ok: false }, { status: 400 });
  await deleteOrder(id);
  return Response.json({ ok: true });
}
