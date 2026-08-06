import { rateLimit } from "@/lib/store";
import { TG_TOKEN_RE } from "@/lib/envFields";
import { checkTelegramToken } from "@/lib/tgToken";

// Проксі до api.telegram.org/getMe для перевірки токена бота просто у формі
// замовлення. Токен НІКОЛИ не логується і не потрапляє у відповідь.

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  // Ендпоінт дозволяє перебирати чужі токени — тримаємо ліміт вузьким.
  if (!(await rateLimit(`tgcheck:${ip}`, 20, 600))) {
    return Response.json(
      { ok: false, error: "Забагато перевірок. Зачекайте кілька хвилин." },
      { status: 429 },
    );
  }

  const body = (await req.json().catch(() => null)) as {
    token?: string;
  } | null;
  const token = (body?.token ?? "").trim();

  if (!token) {
    return Response.json({ ok: false, error: "Порожній токен" }, { status: 400 });
  }
  // Формат відсікаємо локально — не витрачаємо запит до Telegram на очевидне.
  if (!TG_TOKEN_RE.test(token)) {
    return Response.json({
      ok: false,
      error: "Не схоже на токен. Формат: 1234567890:AA...",
    });
  }

  const result = await checkTelegramToken(token);
  return Response.json(result);
}
