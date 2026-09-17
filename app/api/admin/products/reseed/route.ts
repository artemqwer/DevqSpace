import { getSession } from "@/lib/session";
import { reseedProducts } from "@/lib/store";

export async function POST() {
  if (!(await getSession())) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (process.env.NODE_ENV === "production") {
    return Response.json(
      {
        ok: false,
        error:
          "Пересівання вимкнено на production для захисту завантажених файлів та правок",
      },
      { status: 403 },
    );
  }
  const count = await reseedProducts();
  return Response.json({ ok: true, count });
}
