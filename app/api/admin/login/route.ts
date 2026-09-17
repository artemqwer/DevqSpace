import { createSession, verifyPassword } from "@/lib/session";
import { rateLimit } from "@/lib/store";

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const allowed = await rateLimit(`adminlogin:${ip}`, 5, 300);
  if (!allowed) {
    return Response.json(
      { ok: false, error: "Забагато спроб входу. Зачекайте 5 хвилин." },
      { status: 429 },
    );
  }

  let body: { password?: string };
  try {
    body = (await req.json()) as { password?: string };
  } catch {
    return Response.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  if (!process.env.ADMIN_PASSWORD) {
    return Response.json(
      { ok: false, error: "ADMIN_PASSWORD не налаштовано на сервері" },
      { status: 500 },
    );
  }

  if (!body.password || !verifyPassword(body.password)) {
    return Response.json(
      { ok: false, error: "Невірний пароль" },
      { status: 401 },
    );
  }

  await createSession();
  return Response.json({ ok: true });
}
