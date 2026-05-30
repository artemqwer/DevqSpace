import { createSession, verifyPassword } from "@/lib/session";

export async function POST(req: Request) {
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
