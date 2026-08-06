import "server-only";

// Перевірка токена бота через getMe. Використовується і роутом живої перевірки
// у формі, і серверною валідацією при створенні замовлення — клієнтській
// перевірці довіряти не можна.

export type TokenCheck =
  | { ok: true; username: string | null; firstName: string | null }
  | { ok: false; error: string };

export async function checkTelegramToken(token: string): Promise<TokenCheck> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getMe`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    const data = (await res.json()) as {
      ok: boolean;
      description?: string;
      result?: { username?: string; first_name?: string };
    };

    if (!data.ok) {
      // Опис від Telegram буває технічним — показуємо людською мовою.
      const reason = data.description?.includes("Unauthorized")
        ? "Токен недійсний або відкликаний"
        : (data.description ?? "Telegram відхилив токен");
      return { ok: false, error: reason };
    }

    return {
      ok: true,
      username: data.result?.username ?? null,
      firstName: data.result?.first_name ?? null,
    };
  } catch (e) {
    // Свідомо не логуємо сам токен — лише факт помилки.
    const aborted = e instanceof Error && e.name === "TimeoutError";
    console.error("[tgToken] getMe failed:", aborted ? "timeout" : "network");
    return {
      ok: false,
      error: aborted
        ? "Telegram не відповів вчасно — спробуйте ще раз"
        : "Не вдалось зв'язатися з Telegram",
    };
  }
}
