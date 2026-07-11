"use client";

import Link from "next/link";
import { useState } from "react";
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

export default function ProductsList({ products }: { products: Product[] }) {
  const router = useRouter();
  const [items, setItems] = useState(products);
  const [busy, setBusy] = useState<string | null>(null);

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

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-surface/50 p-10 text-center text-sm font-mono text-gray-500">
        Товарів немає. Додайте перший.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((p) => (
        <div
          key={p.slug}
          className="rounded-xl border border-white/10 bg-surface/50 p-3 flex items-center gap-3"
        >
          <ProductThumb
            product={p}
            className="w-10 h-10 rounded-lg border border-white/10 shrink-0"
            iconClassName="text-lg"
          />
          <div className="min-w-0 flex-1">
            <div className="text-sm text-white truncate">{p.title}</div>
            <div className="text-[11px] font-mono text-gray-500 truncate">
              {CAT_LABEL[p.category]} · {p.slug}
            </div>
          </div>
          <span className="text-sm font-display font-bold text-white shrink-0">
            ${p.price}
          </span>
          <Link
            href={`/admin/products/${p.slug}`}
            className="shrink-0 w-8 h-8 rounded-lg bg-surface2 border border-white/10 flex items-center justify-center text-gray-400 hover:text-neon-blue hover:border-neon-blue/30 transition-colors"
            title="Редагувати"
          >
            <i className="ph-bold ph-pencil-simple" />
          </Link>
          <button
            onClick={() => remove(p.slug, p.title)}
            disabled={busy === p.slug}
            className="shrink-0 w-8 h-8 rounded-lg bg-surface2 border border-white/10 flex items-center justify-center text-gray-400 hover:text-neon-pink hover:border-neon-pink/30 transition-colors disabled:opacity-40"
            title="Видалити"
          >
            <i className="ph-bold ph-trash" />
          </button>
        </div>
      ))}
    </div>
  );
}
