"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Product } from "@/lib/products";

const CATEGORIES = [
  { id: "telegram-bots", label: "Telegram боти" },
  { id: "web", label: "Web / SaaS" },
  { id: "mobile", label: "Мобільні додатки" },
];

const ACCENTS = [
  { id: "blue", label: "Блакитний", dot: "bg-neon-blue" },
  { id: "purple", label: "Фіолетовий", dot: "bg-neon-purple" },
  { id: "pink", label: "Рожевий", dot: "bg-neon-pink" },
  { id: "green", label: "Зелений", dot: "bg-neon-green" },
];

type Mode = "create" | "edit";

export default function ProductForm({
  mode,
  product,
}: {
  mode: Mode;
  product?: Product;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [f, setF] = useState({
    title: product?.title ?? "",
    slug: product?.slug ?? "",
    category: product?.category ?? "telegram-bots",
    accent: product?.accent ?? "blue",
    badge: product?.badge ?? "NEW",
    tagline: product?.tagline ?? "",
    description: product?.description ?? "",
    price: String(product?.price ?? 0),
    delivery: product?.delivery ?? "1 день",
    warranty: product?.warranty ?? "3 міс. саппорту",
    stack: product?.stack.join(", ") ?? "",
    features: product?.features.join("\n") ?? "",
    whatsIncluded: product?.whatsIncluded.join("\n") ?? "",
    sold: String(product?.sold ?? 0),
    rating: String(product?.rating ?? 5),
    ratingCount: String(product?.ratingCount ?? 0),
  });

  const set = (k: keyof typeof f, v: string) =>
    setF((prev) => ({ ...prev, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!f.title.trim()) {
      setError("Вкажіть назву");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/admin/products", {
      method: mode === "create" ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, price: Number(f.price) }),
    });
    const data = (await res.json()) as { ok: boolean; error?: string };
    if (!data.ok) {
      setError(data.error || "Помилка збереження");
      setSaving(false);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="space-y-5 max-w-2xl">
      <Field label="Назва" required>
        <input
          value={f.title}
          onChange={(e) => set("title", e.target.value)}
          className={inputCls}
          placeholder="Telegram Shop з CryptoPay"
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Slug (URL)" hint={mode === "edit" ? "не змінюйте" : "авто з назви"}>
          <input
            value={f.slug}
            onChange={(e) => set("slug", e.target.value)}
            disabled={mode === "edit"}
            className={inputCls + (mode === "edit" ? " opacity-50" : "")}
            placeholder="tg-shop-cryptopay"
          />
        </Field>
        <Field label="Бейдж">
          <input
            value={f.badge}
            onChange={(e) => set("badge", e.target.value)}
            className={inputCls}
            placeholder="SHOP"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Категорія">
          <select
            value={f.category}
            onChange={(e) => set("category", e.target.value)}
            className={inputCls}
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id} className="bg-surface2">
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Колір акценту">
          <div className="flex gap-2">
            {ACCENTS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => set("accent", a.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-xs font-mono transition-all ${
                  f.accent === a.id
                    ? "border-white/40 bg-white/5 text-white"
                    : "border-white/10 bg-surface2 text-gray-500"
                }`}
                title={a.label}
              >
                <span className={`w-3 h-3 rounded-full ${a.dot}`} />
              </button>
            ))}
          </div>
        </Field>
      </div>

      <Field label="Короткий опис (tagline)">
        <input
          value={f.tagline}
          onChange={(e) => set("tagline", e.target.value)}
          className={inputCls}
          placeholder="Магазин цифрових товарів з крипто-оплатою"
        />
      </Field>

      <Field label="Повний опис">
        <textarea
          value={f.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          className={inputCls + " resize-y"}
        />
      </Field>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Field label="Ціна $">
          <input
            type="number"
            value={f.price}
            onChange={(e) => set("price", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Продано">
          <input
            type="number"
            value={f.sold}
            onChange={(e) => set("sold", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Рейтинг">
          <input
            type="number"
            step="0.1"
            value={f.rating}
            onChange={(e) => set("rating", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="К-сть відгуків">
          <input
            type="number"
            value={f.ratingCount}
            onChange={(e) => set("ratingCount", e.target.value)}
            className={inputCls}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Доставка">
          <input
            value={f.delivery}
            onChange={(e) => set("delivery", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Гарантія">
          <input
            value={f.warranty}
            onChange={(e) => set("warranty", e.target.value)}
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Стек" hint="через кому">
        <input
          value={f.stack}
          onChange={(e) => set("stack", e.target.value)}
          className={inputCls}
          placeholder="Python, Aiogram3, SQLite"
        />
      </Field>

      <Field label="Можливості" hint="кожна з нового рядка">
        <textarea
          value={f.features}
          onChange={(e) => set("features", e.target.value)}
          rows={5}
          className={inputCls + " resize-y font-mono text-xs"}
          placeholder={"Каталог товарів\nОплата CryptoBot\nАдмін-панель"}
        />
      </Field>

      <Field label="Що входить" hint="кожне з нового рядка">
        <textarea
          value={f.whatsIncluded}
          onChange={(e) => set("whatsIncluded", e.target.value)}
          rows={4}
          className={inputCls + " resize-y font-mono text-xs"}
          placeholder={"Повний вихідний код\nІнструкція\n1 рік саппорту"}
        />
      </Field>

      {error && (
        <div className="text-sm text-neon-pink font-mono flex items-center gap-2">
          <i className="ph-fill ph-warning-circle" /> {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-neon-blue text-black font-display font-bold px-6 py-3 rounded-lg active:scale-[0.98] transition-transform disabled:opacity-60"
        >
          {saving ? (
            <i className="ph-bold ph-circle-notch animate-spin" />
          ) : (
            <i className="ph-bold ph-floppy-disk" />
          )}
          {mode === "create" ? "Створити" : "Зберегти"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="px-6 py-3 rounded-lg border border-white/10 text-gray-400 hover:text-white font-mono text-sm transition-colors"
        >
          Скасувати
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "w-full bg-surface2 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-neon-blue/50 transition-colors text-sm";

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-xs font-mono text-gray-400 uppercase tracking-wider mb-1.5">
        {label}
        {required && <span className="text-neon-pink">*</span>}
        {hint && <span className="text-gray-600 normal-case">({hint})</span>}
      </label>
      {children}
    </div>
  );
}
