import { validateInitData, isAdminUser } from "@/lib/tgAuth";
import { getMiniAppOverview, getProductAnalytics } from "@/lib/store";

// API для Telegram Mini App (сторінка /tg). Авторизація — через initData,
// підписаний ботом. Доступ лише в адміна (user.id === TELEGRAM_ADMIN_CHAT_ID).
//
// POST body: { initData: string, slug?: string }
//   без slug  → overview (тотали + список товарів)
//   зі slug   → детальна аналітика товару + денний тренд (14 днів)

function last14Trend(daily: Record<string, number>): { date: string; count: number }[] {
  const out: { date: string; count: number }[] = [];
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000).toISOString().slice(0, 10);
    out.push({ date: d, count: daily[d] ?? 0 });
  }
  return out;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    initData?: string;
    slug?: string;
  } | null;

  const check = validateInitData(body?.initData ?? "");
  if (!check.ok) {
    return Response.json(
      { ok: false, error: "auth", reason: check.reason },
      { status: 401 },
    );
  }
  if (!isAdminUser(check.userId)) {
    return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  // Деталі одного товару
  if (body?.slug) {
    const a = await getProductAnalytics(body.slug);
    if (!a) {
      return Response.json({ ok: false, error: "not_found" }, { status: 404 });
    }
    return Response.json({
      ok: true,
      product: {
        slug: a.product.slug,
        title: a.product.title,
        tagline: a.product.tagline,
        price: a.product.price,
        category: a.product.category,
        accent: a.product.accent,
        image: a.product.image,
        rating: a.product.rating,
        ratingCount: a.product.ratingCount,
        sold: a.product.sold,
      },
      views: a.views,
      orderStats: a.orderStats,
      conversion: a.conversion,
      trend: last14Trend(a.views.daily),
    });
  }

  // Overview
  const overview = await getMiniAppOverview();
  return Response.json({ ok: true, ...overview, user: { username: check.username } });
}
