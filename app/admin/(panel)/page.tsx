import Link from "next/link";
import { getStats, getAllOrders } from "@/lib/store";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  new: "Нові",
  in_progress: "В роботі",
  done: "Закриті",
  rejected: "Відхилені",
};

const STATUS_COLOR: Record<string, string> = {
  new: "text-neon-blue",
  in_progress: "text-yellow-400",
  done: "text-neon-green",
  rejected: "text-neon-pink",
};

export default async function DashboardPage() {
  const [stats, orders] = await Promise.all([getStats(), getAllOrders()]);
  const recent = orders.slice(0, 5);

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <div className="text-[10px] md:text-xs font-mono text-neon-blue tracking-widest uppercase mb-1">
          {"// DASHBOARD"}
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
          Огляд
        </h1>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          icon="ph-tray"
          label="Всього замовлень"
          value={stats.total}
          accent="text-neon-blue"
        />
        <StatCard
          icon="ph-sparkle"
          label="Нові"
          value={stats.byStatus.new}
          accent="text-neon-blue"
        />
        <StatCard
          icon="ph-clock-countdown"
          label="За 7 днів"
          value={stats.last7days}
          accent="text-neon-purple"
        />
        <StatCard
          icon="ph-currency-dollar"
          label={`Оплачено (${stats.paidCount})`}
          value={`$${stats.paidRevenue}`}
          accent="text-neon-green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* By status */}
        <div className="rounded-2xl border border-white/10 bg-surface/50 p-5">
          <h2 className="text-sm font-display font-bold text-white mb-4">
            За статусами
          </h2>
          <div className="space-y-3">
            {(["new", "in_progress", "done", "rejected"] as const).map((s) => {
              const count = stats.byStatus[s];
              const pct = stats.total
                ? Math.round((count / stats.total) * 100)
                : 0;
              return (
                <div key={s}>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className={STATUS_COLOR[s]}>{STATUS_LABEL[s]}</span>
                    <span className="text-gray-400">{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-neon-blue to-neon-purple"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 flex justify-between text-xs font-mono text-gray-400">
            <span>
              <i className="ph ph-package text-neon-blue" />{" "}
              {stats.byType.product} продукти
            </span>
            <span>
              <i className="ph ph-wrench text-neon-pink" /> {stats.byType.custom}{" "}
              кастом
            </span>
          </div>
        </div>

        {/* Top products */}
        <div className="rounded-2xl border border-white/10 bg-surface/50 p-5">
          <h2 className="text-sm font-display font-bold text-white mb-4">
            Топ за замовленнями
          </h2>
          {stats.topProducts.length === 0 ? (
            <p className="text-xs font-mono text-gray-500">Поки немає даних</p>
          ) : (
            <ol className="space-y-2">
              {stats.topProducts.map((p, i) => (
                <li
                  key={p.title}
                  className="flex items-center gap-3 text-sm"
                >
                  <span className="w-5 h-5 rounded bg-surface2 border border-white/10 flex items-center justify-center text-[10px] font-mono text-gray-500">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-gray-300 truncate">
                    {p.title}
                  </span>
                  <span className="text-xs font-mono text-neon-blue">
                    {p.count}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="rounded-2xl border border-white/10 bg-surface/50 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-display font-bold text-white">
            Останні замовлення
          </h2>
          <Link
            href="/admin/orders"
            className="text-xs font-mono text-neon-blue hover:text-white transition-colors"
          >
            всі →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-xs font-mono text-gray-500">
            Замовлень ще немає. Вони з&apos;являться тут після заявки з сайту.
          </p>
        ) : (
          <div className="space-y-2">
            {recent.map((o) => (
              <Link
                key={o.id}
                href="/admin/orders"
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <span
                  className={`w-8 h-8 rounded-lg bg-surface2 border border-white/10 flex items-center justify-center shrink-0 ${o.type === "product" ? "text-neon-blue" : "text-neon-pink"}`}
                >
                  <i
                    className={`ph ${o.type === "product" ? "ph-package" : "ph-wrench"}`}
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-white truncate">
                    {o.type === "product" ? o.productTitle : o.customType}
                  </div>
                  <div className="text-[11px] font-mono text-gray-500 truncate">
                    {o.name} · {o.contact}
                  </div>
                </div>
                <span
                  className={`text-[10px] font-mono shrink-0 ${STATUS_COLOR[o.status]}`}
                >
                  {STATUS_LABEL[o.status]}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: string;
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-surface/50 p-4">
      <i className={`ph ${icon} text-2xl ${accent} mb-2`} />
      <div className="text-2xl md:text-3xl font-display font-bold text-white leading-none">
        {value}
      </div>
      <div className="text-[10px] md:text-[11px] font-mono text-gray-500 mt-1.5 uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}
