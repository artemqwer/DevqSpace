import { getSession } from "@/lib/session";
import { setOfflineCounters } from "@/lib/store";

const clean = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
};

export async function PUT(req: Request) {
  if (!(await getSession()))
    return Response.json({ ok: false }, { status: 401 });

  const body = (await req.json().catch(() => null)) as {
    products?: unknown;
    clients?: unknown;
  } | null;
  if (!body) return Response.json({ ok: false }, { status: 400 });

  await setOfflineCounters({
    products: clean(body.products),
    clients: clean(body.clients),
  });
  return Response.json({ ok: true });
}
