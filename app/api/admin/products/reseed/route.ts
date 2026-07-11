import { getSession } from "@/lib/session";
import { reseedProducts } from "@/lib/store";

export async function POST() {
  if (!(await getSession())) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const count = await reseedProducts();
  return Response.json({ ok: true, count });
}
