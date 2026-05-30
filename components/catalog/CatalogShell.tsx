"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CATEGORIES,
  ACCENT_TEXT,
  ACCENT_BORDER,
  type CategoryId,
  type Product,
} from "@/lib/products";
import ProductThumb from "@/components/ProductThumb";

type Filter = "all" | CategoryId;

export default function CatalogShell({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (filter !== "all" && p.category !== filter) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.stack.some((s) => s.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [filter, query, products]);

  return (
    <div className="pt-20 md:pt-32 pb-28 md:pb-24 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-5 md:mb-10">
        <div className="text-[10px] md:text-xs font-mono text-neon-blue tracking-widest uppercase mb-2">
          // CATALOG
        </div>
        <h1 className="text-2xl md:text-5xl font-display font-bold text-white mb-2 md:mb-3">
          Усі <span className="text-gradient">продукти</span>
        </h1>
        <p className="text-xs md:text-base text-gray-400 font-light max-w-2xl">
          {products.length} готових рішень з підтримкою. Або замовте кастомну
          розробку.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-4 md:mb-6 max-w-xl">
        <i className="ph ph-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-neon-blue text-base md:text-lg" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Шукати: shop, AI, CRM, RN..."
          className="w-full pl-10 md:pl-12 pr-4 py-3 md:py-3.5 bg-surface2/80 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/50 transition-all font-mono"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 md:gap-2 mb-6 md:mb-8 overflow-x-auto custom-scrollbar pb-1 -mx-4 px-4 md:mx-0 md:px-0">
        <CategoryButton
          active={filter === "all"}
          onClick={() => setFilter("all")}
          label="Усі"
          count={products.length}
        />
        {CATEGORIES.map((c) => {
          const count = products.filter((p) => p.category === c.id).length;
          return (
            <CategoryButton
              key={c.id}
              active={filter === c.id}
              onClick={() => setFilter(c.id)}
              icon={c.icon}
              label={c.label}
              count={count}
            />
          );
        })}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center text-gray-500 font-mono">
          Нічого не знайдено
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
          {filtered.map((p) => (
            <Link
              key={p.slug}
              href={`/catalog/${p.slug}`}
              className="neon-card rounded-xl overflow-hidden flex flex-col bg-surface group"
            >
              <ProductThumb
                product={p}
                className="aspect-[4/3] border-b border-white/5"
                iconClassName="text-4xl md:text-6xl"
              />

              <div className="p-3 md:p-5 flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span
                      className={`text-[9px] md:text-[10px] font-mono px-1.5 py-0.5 rounded border bg-black/40 ${ACCENT_TEXT[p.accent]} ${ACCENT_BORDER[p.accent]}`}
                    >
                      {p.badge}
                    </span>
                  </div>
                  <h3 className="text-sm md:text-lg font-display font-bold text-white leading-tight line-clamp-2 mb-1 md:mb-2">
                    {p.title}
                  </h3>
                  <p className="hidden md:block text-xs text-gray-500 font-mono line-clamp-2 mb-3">
                    {p.tagline}
                  </p>
                  <div className="hidden md:flex flex-wrap gap-1 mb-3">
                    {p.stack.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="text-[10px] font-mono px-2 py-0.5 bg-surface2 border border-white/10 rounded text-gray-400"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 md:pt-3 border-t border-white/5">
                  <div className="flex items-center gap-1 text-[10px] md:text-[11px] font-mono text-gray-400">
                    <i className="ph-fill ph-star text-yellow-500" />
                    {p.rating}
                  </div>
                  <div className="text-base md:text-lg font-display font-bold text-white">
                    ${p.price}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Custom CTA */}
      <div className="mt-10 md:mt-16 relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-surface via-surface2 to-surface p-5 md:p-10">
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-neon-pink/20 blur-3xl" />
        <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 md:gap-6 items-start md:items-center">
          <div>
            <div className="text-[10px] md:text-xs font-mono text-neon-pink tracking-widest uppercase mb-2">
              // CUSTOM_DEV
            </div>
            <h2 className="text-xl md:text-2xl font-display font-bold text-white mb-2">
              Не знайшли потрібного?
            </h2>
            <p className="text-xs md:text-sm text-gray-400 font-light max-w-xl">
              Зробимо під вашу задачу з нуля. Брифінг 30 хв, фіксована вартість,
              MVP за 2-4 тижні.
            </p>
          </div>
          <Link
            href="/custom"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-neon-blue to-neon-purple text-black font-display font-bold rounded-xl px-5 md:px-6 py-3 md:py-3.5 shadow-[0_10px_30px_-10px_rgba(0,240,255,0.5)] active:scale-[0.98] transition-transform"
          >
            <i className="ph-bold ph-paper-plane-tilt" />
            Замовити кастом
          </Link>
        </div>
      </div>
    </div>
  );
}

function CategoryButton({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon?: string;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full border transition-all font-mono text-[11px] md:text-xs ${
        active
          ? "bg-neon-blue text-black border-neon-blue"
          : "bg-surface2 text-gray-400 border-white/10 hover:text-white hover:border-white/20"
      }`}
    >
      {icon && <i className={`ph ${icon} text-sm md:text-base`} />}
      {label}
      <span
        className={`text-[10px] ${active ? "text-black/60" : "text-gray-600"}`}
      >
        {count}
      </span>
    </button>
  );
}
