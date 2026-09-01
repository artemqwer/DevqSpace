import { getSession } from "@/lib/session";
import { setContentOverrides, resetContent } from "@/lib/store";
import { bustContentCache, defaultsFlat, type Locale } from "@/lib/content";

function pickLocale(value: unknown): Locale | null {
  return value === "uk" || value === "en" ? value : null;
}

// Зберігає правки. Порожній рядок = «скинути до тексту з файлу», щоб адмін не
// міг випадково зробити текст порожнім і отримати діру на сайті.
export async function PUT(req: Request) {
  if (!(await getSession()))
    return Response.json({ ok: false }, { status: 401 });

  const body = (await req.json().catch(() => null)) as {
    locale?: unknown;
    values?: Record<string, unknown>;
  } | null;

  const locale = pickLocale(body?.locale);
  if (!locale || !body?.values)
    return Response.json({ ok: false }, { status: 400 });

  const known = defaultsFlat(locale);
  const patch: Record<string, string | null> = {};
  for (const [key, raw] of Object.entries(body.values)) {
    // Приймаємо лише ключі, які існують у messages — інакше сховище засмітиться
    // правками для текстів, яких на сайті вже немає.
    if (!(key in known)) continue;
    const value = typeof raw === "string" ? raw.trim() : "";
    patch[key] = !value || value === known[key] ? null : value;
  }

  if (!Object.keys(patch).length)
    return Response.json({ ok: false, error: "Немає що зберігати" }, { status: 400 });

  await setContentOverrides(locale, patch);
  bustContentCache();
  return Response.json({ ok: true, saved: Object.keys(patch).length });
}

// Скидає всі правки локалі.
export async function DELETE(req: Request) {
  if (!(await getSession()))
    return Response.json({ ok: false }, { status: 401 });

  const locale = pickLocale(new URL(req.url).searchParams.get("locale"));
  if (!locale) return Response.json({ ok: false }, { status: 400 });

  await resetContent(locale);
  bustContentCache();
  return Response.json({ ok: true });
}
