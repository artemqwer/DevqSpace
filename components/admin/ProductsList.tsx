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
  const [onlyMissing, setOnlyMissing] = useState(false);

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

  // Товар без архіву не можна видати автоматично — це найважливіше, що видно
  // зі списку, тож виносимо в лічильник із фільтром.
  const missing = items.filter((p) => !p.fileUrl);
  const shown = onlyMissing ? missing : items;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 pb-1">
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
        <span className="font-mono text-xs text-gray-600">
          усього {items.length}
        </span>
      </div>

      {shown.map((p) => (
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

          {p.envFields?.length ? (
            <span
              className="shrink-0 hidden sm:flex items-center gap-1 rounded border border-neon-purple/30 bg-neon-purple/10 px-2 py-0.5 font-mono text-[10px] text-neon-purple"
              title={`Конфіг перед покупкою: ${p.envFields.map((e) => e.key).join(", ")}`}
            >
              <i className="ph-bold ph-sliders-horizontal" />
              {p.envFields.length}
            </span>
          ) : null}

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
            <i
              className={`ph-bold ${p.fileUrl ? "ph-file-zip" : "ph-file-dashed"}`}
            />
            <span className="hidden sm:inline">
              {p.fileUrl ? "ZIP" : "нема"}
            </span>
          </span>

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
