"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { type Product } from "@/lib/products";
import ProductThumb from "@/components/ProductThumb";

const CAT_LABEL: Record<string, string> = {
  "telegram-bots": "Telegram",
  web: "Web / SaaS",
  mobile: "Mobile",
  automation: "Автоматизація",
  web3: "Web3",
  templates: "Шаблони",
};

type View = "rows" | "compact" | "grid";
type Sort = "category" | "title" | "price" | "priceAsc";

const VIEWS: { id: View; icon: string; title: string }[] = [
  { id: "rows", icon: "ph-rows", title: "Рядки" },
  { id: "compact", icon: "ph-list-dashes", title: "Компактно" },
  { id: "grid", icon: "ph-squares-four", title: "Плитка" },
];

const SORTS: { id: Sort; label: string }[] = [
  { id: "category", label: "За категорією" },
  { id: "title", label: "За назвою" },
  { id: "price", label: "Дорожчі спершу" },
  { id: "priceAsc", label: "Дешевші спершу" },
];

export default function ProductsList({ products }: { products: Product[] }) {
  const router = useRouter();
  const [items, setItems] = useState(products);
  const [busy, setBusy] = useState<string | null>(null);
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [view, setView] = useState<View>("rows");
  const [sort, setSort] = useState<Sort>("category");

  const remove = async (slug: string, title: string) => {
    if (!confirm(`Видалити «${title}»?`)) return;
    setBusy(slug);
    setItems((prev) => prev.filter((p) => p.slug !== slug));
    await fetch(`/api/admin/products?slug=${encodeURIComponent(slug)}`, {
      method: "DELETE",
    });
    setBusy(null);
    router.refresh();
  };

  // Товар без архіву не можна видати автоматично — це найважливіше, що видно
  // зі списку, тож виносимо в лічильник із фільтром.
  const missing = useMemo(() => items.filter((p) => !p.fileUrl), [items]);

  const categories = useMemo(
    () => [...new Set(items.map((p) => p.category))],
    [items],
  );

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = items.filter(
      (p) =>
        (!onlyMissing || !p.fileUrl) &&
        (!category || p.category === category) &&
        (!q ||
          p.title.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q)),
    );
    return list.sort((a, b) => {
      if (sort === "price") return b.price - a.price;
      if (sort === "priceAsc") return a.price - b.price;
      if (sort === "title") return a.title.localeCompare(b.title);
      return a.category === b.category
        ? a.title.localeCompare(b.title)
        : a.category.localeCompare(b.category);
    });
  }, [items, query, category, onlyMissing, sort]);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-surface/50 p-10 text-center text-sm font-mono text-gray-500">
        Товарів немає. Додайте перший.
      </div>
    );
  }

  const zipBadge = (p: Product, compact = false) => (
    <span
      className={`shrink-0 flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-[10px] ${
        p.fileUrl
          ? "border-neon-green/30 bg-neon-green/10 text-neon-green"
          : "border-neon-pink/30 bg-neon-pink/10 text-neon-pink"
      }`}
      title={
        p.fileUrl
          ? p.fileName || "архів завантажено"
          : "Немає архіву — автовидача не спрацює"
      }
    >
      <i className={`ph-bold ${p.fileUrl ? "ph-file-zip" : "ph-file-dashed"}`} />
      {!compact && (
        <span className="hidden sm:inline">{p.fileUrl ? "ZIP" : "нема"}</span>
      )}
    </span>
  );

  const envBadge = (p: Product) =>
    p.envFields?.length ? (
      <span
        className="shrink-0 hidden sm:flex items-center gap-1 rounded border border-neon-purple/30 bg-neon-purple/10 px-2 py-0.5 font-mono text-[10px] text-neon-purple"
        title={`Конфіг перед покупкою: ${p.envFields.map((e) => e.key).join(", ")}`}
      >
        <i className="ph-bold ph-sliders-horizontal" />
        {p.envFields.length}
      </span>
    ) : null;

  const editLink = (p: Product, className: string) => (
    <Link
      href={`/admin/products/${p.slug}`}
      className={className}
      title="Редагувати"
    >
      <i className="ph-bold ph-pencil-simple" />
    </Link>
  );

  const deleteButton = (p: Product, className: string) => (
    <button
      onClick={() => remove(p.slug, p.title)}
      disabled={busy === p.slug}
      className={`${className} disabled:opacity-40`}
      title="Видалити"
    >
      <i className="ph-bold ph-trash" />
    </button>
  );

  const iconBtn =
    "shrink-0 w-8 h-8 rounded-lg bg-surface2 border border-white/10 flex items-center justify-center text-gray-400 transition-colors";

  return (
    <div className="space-y-3">
      {/* Панель: пошук, фільтри, сортування, вид */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[180px] flex-1">
          <i className="ph ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Пошук за назвою або slug…"
            className="w-full rounded-lg border border-white/10 bg-surface2 py-2 pl-9 pr-3 text-sm text-white placeholder-gray-600 transition-colors focus:border-neon-blue/50 focus:outline-none"
          />
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="rounded-lg border border-white/10 bg-surface2 px-3 py-2 font-mono text-xs text-gray-300 focus:border-neon-blue/50 focus:outline-none"
        >
          {SORTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-surface2 p-1">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              title={v.title}
              className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
                view === v.id
                  ? "bg-neon-blue/15 text-neon-blue"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              <i className={`ph-bold ${v.icon}`} />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setOnlyMissing((v) => !v)}
          disabled={missing.length === 0}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-xs transition-all disabled:opacity-40 ${
            onlyMissing
              ? "border-neon-pink bg-neon-pink text-black"
              : "border-white/10 bg-surface2 text-gray-400 hover:text-white"
          }`}
        >
          <i className="ph-bold ph-file-dashed" />
          Без архіву
          <span className={onlyMissing ? "text-black/60" : "text-gray-600"}>
            {missing.length}
          </span>
        </button>

        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory((prev) => (prev === c ? "" : c))}
            className={`rounded-full border px-3 py-1.5 font-mono text-xs transition-all ${
              category === c
                ? "border-neon-blue bg-neon-blue text-black"
                : "border-white/10 bg-surface2 text-gray-400 hover:text-white"
            }`}
          >
            {CAT_LABEL[c] ?? c}
          </button>
        ))}

        <span className="font-mono text-xs text-gray-600">
          {shown.length === items.length
            ? `усього ${items.length}`
            : `${shown.length} з ${items.length}`}
        </span>
      </div>

      {shown.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-surface/50 p-8 text-center font-mono text-sm text-gray-500">
          Нічого не знайдено
        </div>
      )}

      {view === "grid" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <div
              key={p.slug}
              className="flex flex-col gap-3 rounded-xl border border-white/10 bg-surface/50 p-3"
            >
              <div className="flex items-start gap-3">
                <ProductThumb
                  product={p}
                  className="h-12 w-12 shrink-0 rounded-lg border border-white/10"
                  iconClassName="text-xl"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-white">{p.title}</div>
                  <div className="truncate font-mono text-[11px] text-gray-500">
                    {CAT_LABEL[p.category]} · {p.slug}
                  </div>
                </div>
                <span className="shrink-0 font-display text-sm font-bold text-white">
                  ${p.price}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {zipBadge(p)}
                {envBadge(p)}
                <div className="flex-1" />
                {editLink(p, `${iconBtn} hover:text-neon-blue hover:border-neon-blue/30`)}
                {deleteButton(p, `${iconBtn} hover:text-neon-pink hover:border-neon-pink/30`)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={view === "compact" ? "space-y-1" : "space-y-2"}>
          {shown.map((p) => (
            <div
              key={p.slug}
              className={`flex items-center gap-3 rounded-xl border border-white/10 bg-surface/50 ${
                view === "compact" ? "px-3 py-1.5" : "p-3"
              }`}
            >
              {view === "rows" && (
                <ProductThumb
                  product={p}
                  className="h-10 w-10 shrink-0 rounded-lg border border-white/10"
                  iconClassName="text-lg"
                />
              )}
              <div className="min-w-0 flex-1">
                <div
                  className={`truncate text-white ${view === "compact" ? "text-[13px]" : "text-sm"}`}
                >
                  {p.title}
                </div>
                {view === "rows" && (
                  <div className="truncate font-mono text-[11px] text-gray-500">
                    {CAT_LABEL[p.category]} · {p.slug}
                  </div>
                )}
              </div>

              {view === "compact" && (
                <span className="hidden shrink-0 font-mono text-[11px] text-gray-600 md:inline">
                  {p.slug}
                </span>
              )}

              {envBadge(p)}
              {zipBadge(p, view === "compact")}

              <span
                className={`shrink-0 font-display font-bold text-white ${
                  view === "compact" ? "w-14 text-right text-[13px]" : "text-sm"
                }`}
              >
                ${p.price}
              </span>

              {view === "compact" ? (
                <div className="flex shrink-0 items-center gap-1">
                  {editLink(
                    p,
                    "w-7 h-7 rounded flex items-center justify-center text-gray-500 hover:text-neon-blue transition-colors",
                  )}
                  {deleteButton(
                    p,
                    "w-7 h-7 rounded flex items-center justify-center text-gray-500 hover:text-neon-pink transition-colors",
                  )}
                </div>
              ) : (
                <>
                  {editLink(p, `${iconBtn} hover:text-neon-blue hover:border-neon-blue/30`)}
                  {deleteButton(p, `${iconBtn} hover:text-neon-pink hover:border-neon-pink/30`)}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
