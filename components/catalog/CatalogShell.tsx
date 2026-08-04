"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MagnifyingGlass, PaperPlaneTilt } from "@phosphor-icons/react";
import { CATEGORIES, type CategoryId, type Product } from "@/lib/products";
import { ProductCard } from "@/components/site/ProductCard";

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
    <div className="mx-auto max-w-7xl px-4 pb-28 pt-28 md:px-6 md:pb-24 md:pt-32">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 md:mb-10">
        <span className="mono-label text-neon-blue">{"// каталог"}</span>
        <h1 className="text-balance font-display text-3xl font-bold tracking-tight text-foreground md:text-5xl">
          Усі <span className="text-gradient">продукти</span>
        </h1>
        <p className="max-w-2xl text-pretty leading-relaxed text-muted-foreground">
          {products.length} готових рішень з підтримкою й повним сорс-кодом. Або
          замовте кастомну розробку під ключ.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-xl">
        <MagnifyingGlass className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neon-blue" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Шукати: shop, AI, CRM, RN..."
          className="w-full rounded-xl border border-border bg-surface-2/60 py-3.5 pl-11 pr-4 font-mono text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-neon-blue/50 focus:outline-none focus:ring-1 focus:ring-neon-blue/40"
        />
      </div>

      {/* Category tabs */}
      <div className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
        <CategoryButton
          active={filter === "all"}
          onClick={() => setFilter("all")}
          label="Усі"
          count={products.length}
        />
        {CATEGORIES.map((c) => (
          <CategoryButton
            key={c.id}
            active={filter === c.id}
            onClick={() => setFilter(c.id)}
            icon={c.icon}
            label={c.label}
            count={products.filter((p) => p.category === c.id).length}
          />
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="mono-label py-20 text-center text-muted-foreground">
          Нічого не знайдено
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}

      {/* Custom CTA */}
      <div className="grad-border relative mt-12 overflow-hidden rounded-3xl border border-border bg-surface/40 p-6 md:mt-16 md:p-10">
        <div className="orb -left-16 -top-16 h-64 w-64 bg-neon-pink opacity-20" aria-hidden />
        <div className="relative grid grid-cols-1 items-start gap-5 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex flex-col gap-2">
            <span className="mono-label text-neon-pink">{"// розробка під ключ"}</span>
            <h2 className="font-display text-xl font-bold text-foreground md:text-2xl">
              Не знайшли потрібного?
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              Зробимо під вашу задачу з нуля. Брифінг 30 хв, фіксована вартість,
              MVP за 2–4 тижні.
            </p>
          </div>
          <Link
            href="/custom"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            <PaperPlaneTilt weight="fill" className="h-4 w-4" />
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
      className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
        active
          ? "border-neon-blue bg-neon-blue text-black"
          : "border-border bg-surface-2 text-muted-foreground hover:border-border-strong hover:text-foreground"
      }`}
    >
      {icon && <i className={`ph ${icon} text-base`} />}
      {label}
      <span className={active ? "text-black/60" : "text-muted-foreground/70"}>
        {count}
      </span>
    </button>
  );
}
