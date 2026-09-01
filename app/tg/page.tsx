"use client";

import { useCallback, useEffect, useState } from "react";

// =====================================================================
// Telegram Mini App — адмін-дашборд. Відкривається кнопкою в боті.
// Авторизація через initData (перевіряється на /api/tg-miniapp).
// =====================================================================

type MiniProduct = {
  slug: string;
  title: string;
  price: number;
  category: string;
  accent: string;
  image?: string;
  views: number;
  orders: number;
  paid: number;
  revenue: number;
};

type Overview = {
  totals: {
    views: number;
    products: number;
    orders: number;
    ordersLast7: number;
    paidRevenue: number;
    doneRevenue: number;
    newOrders: number;
  };
  products: MiniProduct[];
  user?: { username?: string };
};

type Detail = {
  product: {
    slug: string;
    title: string;
    tagline: string;
    price: number;
    category: string;
    accent: string;
    rating: number;
    ratingCount: number;
    sold: number;
  };
  views: { total: number; last7: number; last30: number; today: number };
  orderStats: { orders: number; paid: number; paidRevenue: number; doneRevenue: number };
  conversion: number;
  trend: { date: string; count: number }[];
};

/* eslint-disable @typescript-eslint/no-explicit-any */
type TG = any;

const ACCENT: Record<string, string> = {
  blue: "text-neon-blue",
  purple: "text-neon-purple",
  pink: "text-neon-pink",
  green: "text-neon-green",
};
const ACCENT_BAR: Record<string, string> = {
  blue: "bg-neon-blue",
  purple: "bg-neon-purple",
  pink: "bg-neon-pink",
  green: "bg-neon-green",
};

function fmt(n: number): string {
  return Math.round(n).toLocaleString("uk-UA");
}

export default function MiniApp() {
  const [tg, setTg] = useState<TG>(null);
  const [initData, setInitData] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "error" | "no-tg">(
    "loading",
  );
  const [error, setError] = useState<string>("");
  const [data, setData] = useState<Overview | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Оголошено до ефекту, який його викликає: підйом функції працює в
  // рантаймі, але лінтер справедливо не любить використання до оголошення.
  function initTg(web: TG) {
    try {
      web.ready();
      web.expand();
      web.setHeaderColor?.("#050505");
      web.setBackgroundColor?.("#050505");
    } catch {
      /* ignore */
    }
    setTg(web);
    const id = web.initData as string;
    if (!id) {
      setStatus("no-tg");
      return;
    }
    setInitData(id);
  }

  // 1. Підвантажуємо Telegram SDK
  useEffect(() => {
    const w = window as unknown as { Telegram?: { WebApp?: TG } };
    if (w.Telegram?.WebApp) {
      // SDK уже в сторінці. initTg виставляє стан, а синхронний setState у
      // тілі ефекту дає зайвий каскадний рендер одразу після першого
      // малювання — відкладаємо на мікротаск, щоб шлях був такий самий, як
      // у гілці з onload нижче.
      const web = w.Telegram.WebApp;
      queueMicrotask(() => initTg(web));
      return;
    }
    const s = document.createElement("script");
    s.src = "https://telegram.org/js/telegram-web-app.js";
    s.async = true;
    s.onload = () => {
      const web = (window as unknown as { Telegram?: { WebApp?: TG } }).Telegram
        ?.WebApp;
      if (web) initTg(web);
      else setStatus("no-tg");
    };
    s.onerror = () => setStatus("no-tg");
    document.body.appendChild(s);
  }, []);

  // 2. Вантажимо overview
  useEffect(() => {
    if (!initData) return;
    (async () => {
      try {
        const res = await fetch("/api/tg-miniapp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData }),
        });
        const json = await res.json();
        if (!json.ok) {
          setError(
            json.error === "forbidden"
              ? "Доступ лише для адміністратора."
              : "Помилка авторизації.",
          );
          setStatus("error");
          return;
        }
        setData(json as Overview);
        setStatus("ok");
      } catch {
        setError("Не вдалося завантажити дані.");
        setStatus("error");
      }
    })();
  }, [initData]);

  // 3. Деталі товару
  const openDetail = useCallback(
    async (slug: string) => {
      if (!initData) return;
      setDetailLoading(true);
      setDetail(null);
      tg?.BackButton?.show?.();
      tg?.HapticFeedback?.impactOccurred?.("light");
      try {
        const res = await fetch("/api/tg-miniapp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData, slug }),
        });
        const json = await res.json();
        if (json.ok) setDetail(json as Detail);
      } finally {
        setDetailLoading(false);
      }
    },
    [initData, tg],
  );

  const closeDetail = useCallback(() => {
    setDetail(null);
    setDetailLoading(false);
    tg?.BackButton?.hide?.();
  }, [tg]);

  // BackButton закриває деталі
  useEffect(() => {
    if (!tg?.BackButton) return;
    const handler = () => closeDetail();
    tg.BackButton.onClick(handler);
    return () => tg.BackButton.offClick?.(handler);
  }, [tg, closeDetail]);

  // ---- Рендер станів ----
  if (status === "loading") {
    return <Centered>Завантаження…</Centered>;
  }
  if (status === "no-tg") {
    return (
      <Centered>
        <div className="text-center">
          <div className="text-2xl mb-2">📊</div>
          <p className="text-gray-300 font-medium mb-1">DevqSpace Dashboard</p>
          <p className="text-sm text-gray-500">
            Відкрийте цю сторінку через кнопку в Telegram-боті.
          </p>
        </div>
      </Centered>
    );
  }
  if (status === "error") {
    return (
      <Centered>
        <div className="text-center">
          <div className="text-2xl mb-2">🔒</div>
          <p className="text-gray-300">{error}</p>
        </div>
      </Centered>
    );
  }
  if (!data) return null;

  const { totals, products } = data;
  const maxViews = Math.max(1, ...products.map((p) => p.views));
  const topViewed = products.filter((p) => p.views > 0).slice(0, 6);

  return (
    <main className="min-h-screen bg-bg text-white px-4 py-5 pb-24 max-w-xl mx-auto">
      <header className="mb-5">
        <div className="flex items-center gap-2">
          <span className="text-neon-blue font-display font-bold text-lg">
            DevqSpace
          </span>
          <span className="text-gray-600 text-xs font-mono">/ dashboard</span>
        </div>
        {data.user?.username && (
          <p className="text-xs text-gray-500 mt-0.5">@{data.user.username}</p>
        )}
      </header>

      {/* Тотали */}
      <section className="grid grid-cols-2 gap-3 mb-6">
        <Tile icon="👁" label="Перегляди" value={fmt(totals.views)} accent="blue" />
        <Tile
          icon="🛒"
          label="Замовлення"
          value={fmt(totals.orders)}
          sub={`+${fmt(totals.ordersLast7)} за 7 днів`}
          accent="purple"
        />
        <Tile
          icon="💰"
          label="Виторг (оплач.)"
          value={`$${fmt(totals.paidRevenue)}`}
          accent="green"
        />
        <Tile
          icon="🆕"
          label="Нові заявки"
          value={fmt(totals.newOrders)}
          sub={`${fmt(totals.products)} товарів`}
          accent="pink"
        />
      </section>

      {/* Топ за переглядами */}
      {topViewed.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-display font-bold text-gray-300 mb-3">
            🔥 Топ за переглядами
          </h2>
          <div className="space-y-2.5">
            {topViewed.map((p) => (
              <button
                key={p.slug}
                onClick={() => openDetail(p.slug)}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-200 truncate pr-2">{p.title}</span>
                  <span className="text-gray-400 font-mono shrink-0">
                    {fmt(p.views)}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-surface2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${ACCENT_BAR[p.accent] ?? "bg-neon-blue"}`}
                    style={{ width: `${(p.views / maxViews) * 100}%` }}
                  />
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Список товарів */}
      <section>
        <h2 className="text-sm font-display font-bold text-gray-300 mb-3">
          📦 Товари ({products.length})
        </h2>
        <div className="space-y-2">
          {products.map((p) => (
            <button
              key={p.slug}
              onClick={() => openDetail(p.slug)}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface border border-white/5 active:bg-surface2 transition-colors text-left"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {p.title}
                </div>
                <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                  👁 {fmt(p.views)} · 🛒 {fmt(p.orders)} · 💰 ${fmt(p.revenue)}
                </div>
              </div>
              <div className={`text-sm font-display font-bold ${ACCENT[p.accent] ?? "text-white"}`}>
                ${p.price}
              </div>
              <span className="text-gray-600">›</span>
            </button>
          ))}
        </div>
      </section>

      {/* Деталі товару (bottom sheet) */}
      {(detail || detailLoading) && (
        <DetailSheet
          detail={detail}
          loading={detailLoading}
          onClose={closeDetail}
        />
      )}
    </main>
  );
}

// =====================================================================
// Компоненти
// =====================================================================

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-gray-400 flex items-center justify-center px-6 text-sm">
      {children}
    </div>
  );
}

function Tile({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl bg-surface border border-white/5 p-3.5">
      <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-1">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <div className={`text-xl font-display font-bold ${ACCENT[accent] ?? "text-white"}`}>
        {value}
      </div>
      {sub && <div className="text-[10px] text-gray-600 font-mono mt-0.5">{sub}</div>}
    </div>
  );
}

function DetailSheet({
  detail,
  loading,
  onClose,
}: {
  detail: Detail | null;
  loading: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-surface border-t border-white/10 rounded-t-2xl p-5 pb-8 max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4" />

        {loading || !detail ? (
          <div className="py-10 text-center text-gray-500 text-sm">Завантаження…</div>
        ) : (
          <>
            <h3 className="text-lg font-display font-bold text-white">
              {detail.product.title}
            </h3>
            <p className="text-sm text-gray-500 mb-1">{detail.product.tagline}</p>
            <div className="flex items-center gap-3 text-xs font-mono text-gray-400 mb-4">
              <span className={ACCENT[detail.product.accent] ?? "text-white"}>
                ${detail.product.price}
              </span>
              <span>⭐ {detail.product.rating} ({fmt(detail.product.ratingCount)})</span>
              <span>📦 {fmt(detail.product.sold)} продано</span>
            </div>

            {/* Тренд переглядів 14 днів */}
            <Sparkline trend={detail.trend} accent={detail.product.accent} />

            {/* Метрики */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              <MiniStat label="Всього" value={fmt(detail.views.total)} sub="переглядів" />
              <MiniStat label="7 днів" value={fmt(detail.views.last7)} sub="переглядів" />
              <MiniStat label="Сьогодні" value={fmt(detail.views.today)} sub="переглядів" />
              <MiniStat label="Замовлень" value={fmt(detail.orderStats.orders)} />
              <MiniStat label="Оплачено" value={fmt(detail.orderStats.paid)} />
              <MiniStat
                label="Конверсія"
                value={`${detail.conversion.toFixed(1)}%`}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <MiniStat
                label="Виторг (оплач.)"
                value={`$${fmt(detail.orderStats.paidRevenue)}`}
              />
              <MiniStat
                label="Виторг (закрито)"
                value={`$${fmt(detail.orderStats.doneRevenue)}`}
              />
            </div>

            <button
              onClick={onClose}
              className="w-full mt-5 py-3 rounded-xl bg-surface2 border border-white/10 text-gray-300 text-sm font-medium active:bg-white/5"
            >
              Закрити
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg bg-surface2 border border-white/5 p-2.5 text-center">
      <div className="text-base font-display font-bold text-white">{value}</div>
      <div className="text-[10px] text-gray-500 mt-0.5">{label}</div>
      {sub && <div className="text-[9px] text-gray-600">{sub}</div>}
    </div>
  );
}

function Sparkline({
  trend,
  accent,
}: {
  trend: { date: string; count: number }[];
  accent: string;
}) {
  const max = Math.max(1, ...trend.map((t) => t.count));
  const barColor =
    ({
      blue: "#00f0ff",
      purple: "#8a2be2",
      pink: "#ff007f",
      green: "#00ff66",
    } as Record<string, string>)[accent] ?? "#00f0ff";
  return (
    <div>
      <div className="text-[11px] text-gray-500 mb-1.5">Перегляди за 14 днів</div>
      <div className="flex items-end gap-1 h-16">
        {trend.map((t) => (
          <div
            key={t.date}
            className="flex-1 rounded-sm bg-white/5 relative group"
            style={{ height: "100%" }}
            title={`${t.date}: ${t.count}`}
          >
            <div
              className="absolute bottom-0 left-0 right-0 rounded-sm transition-all"
              style={{
                height: `${Math.max(t.count > 0 ? 8 : 2, (t.count / max) * 100)}%`,
                backgroundColor: t.count > 0 ? barColor : "rgba(255,255,255,0.06)",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
