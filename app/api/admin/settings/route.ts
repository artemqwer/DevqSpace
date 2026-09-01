import { getSession } from "@/lib/session";
import { setSiteSettings } from "@/lib/store";
import { bustSettingsCache, SETTINGS_DEFAULTS } from "@/lib/settings";

// Приймаємо лише відомі ключі — інакше в сховище натече будь-що з форми.
const ALLOWED = new Set(Object.keys(SETTINGS_DEFAULTS));

const MAX_LEN = 300;

export async function PUT(req: Request) {
  if (!(await getSession()))
    return Response.json({ ok: false }, { status: 401 });

  const body = (await req.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body) return Response.json({ ok: false }, { status: 400 });

  const patch: Record<string, string | null> = {};
  for (const [key, raw] of Object.entries(body)) {
    if (!ALLOWED.has(key)) continue;
    // Тумблер їде як boolean, решта — рядки. Зберігаємо все рядком.
    if (typeof raw === "boolean") {
      patch[key] = raw ? "1" : null;
      continue;
    }
    const value = typeof raw === "string" ? raw.trim().slice(0, MAX_LEN) : "";
    patch[key] = value || null;
  }

  if (!Object.keys(patch).length)
    return Response.json({ ok: false, error: "Немає що зберігати" }, { status: 400 });

  await setSiteSettings(patch);
  bustSettingsCache();
  return Response.json({ ok: true });
}
