"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ACCENT_BUTTON, type Product } from "@/lib/products";
import ProductThumb from "@/components/ProductThumb";

export default function OrderForm({ product }: { product: Product }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [contactMethod, setContactMethod] = useState<
    "telegram" | "email" | "phone"
  >("telegram");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !contact.trim()) {
      setError("Заповніть ім'я та контакт");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "product",
          productSlug: product.slug,
          name: name.trim(),
          contactMethod,
          contact: contact.trim(),
          message: message.trim(),
        }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) {
        setError(data.error || "Не вдалося відправити");
        setSubmitting(false);
        return;
      }
      router.push(`/order/success?p=${product.slug}`);
    } catch {
      setError("Помилка мережі");
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 md:gap-8">
      {/* Mobile: compact summary chip first */}
      <div className="lg:hidden rounded-xl border border-white/10 bg-surface/50 p-3 flex items-center gap-3">
        <ProductThumb
          product={product}
          className="w-12 h-12 shrink-0 rounded-lg border border-white/10"
          iconClassName="text-xl"
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-display font-bold text-white leading-tight line-clamp-1">
            {product.title}
          </h3>
          <p className="text-[10px] font-mono text-gray-500 line-clamp-1">
            {product.delivery} · {product.warranty}
          </p>
        </div>
        <div className="text-xl font-display font-bold text-white shrink-0">
          ${product.price}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Як до вас звертатися?" required>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Артем"
            required
            className="w-full bg-surface2 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-blue/50 transition-colors font-mono text-sm"
          />
        </Field>

        <Field label="Як зв'язатися" required>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <ContactTab
              active={contactMethod === "telegram"}
              onClick={() => setContactMethod("telegram")}
              icon="ph-telegram-logo"
              label="Telegram"
            />
            <ContactTab
              active={contactMethod === "email"}
              onClick={() => setContactMethod("email")}
              icon="ph-envelope-simple"
              label="Email"
            />
            <ContactTab
              active={contactMethod === "phone"}
              onClick={() => setContactMethod("phone")}
              icon="ph-phone"
              label="Телефон"
            />
          </div>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder={
              contactMethod === "telegram"
                ? "@username"
                : contactMethod === "email"
                  ? "you@email.com"
                  : "+380..."
            }
            required
            className="w-full bg-surface2 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-blue/50 transition-colors font-mono text-sm"
          />
        </Field>

        <Field label="Деталі замовлення (необов'язково)">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="Які зміни / інтеграції / коментарі..."
            className="w-full bg-surface2 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-blue/50 transition-colors font-mono text-sm resize-none"
          />
        </Field>

        {error && (
          <div className="text-sm text-neon-pink font-mono flex items-center gap-2">
            <i className="ph-fill ph-warning-circle" /> {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className={`w-full flex items-center justify-center gap-2 font-display font-bold rounded-xl px-6 py-4 active:scale-[0.98] transition-transform disabled:opacity-60 disabled:cursor-not-allowed ${ACCENT_BUTTON[product.accent]}`}
        >
          {submitting ? (
            <>
              <i className="ph-bold ph-circle-notch animate-spin" />
              Відправляємо...
            </>
          ) : (
            <>
              <i className="ph-bold ph-paper-plane-tilt" />
              Надіслати заявку
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 font-mono text-center">
          Відповімо в Telegram протягом 2 годин у робочий час
        </p>
      </form>

      {/* Order summary — desktop only */}
      <aside className="hidden lg:block lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-2xl border border-white/10 bg-surface/50 backdrop-blur p-5 md:p-6">
          <div className="text-[10px] font-mono text-neon-blue tracking-widest uppercase mb-3">
            // ВАШЕ ЗАМОВЛЕННЯ
          </div>

          <div className="flex gap-3 mb-5">
            <ProductThumb
              product={product}
              className="w-20 h-20 shrink-0 rounded-lg border border-white/10"
              iconClassName="text-2xl"
            />
            <div className="min-w-0">
              <h3 className="text-sm font-display font-bold text-white leading-tight line-clamp-2 mb-1">
                {product.title}
              </h3>
              <p className="text-[11px] text-gray-500 font-mono line-clamp-1">
                {product.tagline}
              </p>
            </div>
          </div>

          <div className="space-y-2 py-4 border-y border-white/5 text-sm">
            <SummaryRow label="Доставка" value={product.delivery} />
            <SummaryRow label="Гарантія" value={product.warranty} />
            <SummaryRow label="Сорс-код" value="Включено" />
            <SummaryRow label="Апдейти" value="Безкоштовно" />
          </div>

          <div className="flex items-baseline justify-between pt-4">
            <span className="text-gray-400 font-mono text-sm">Разом</span>
            <span className="text-3xl font-display font-bold text-white">
              ${product.price}
            </span>
          </div>

          <Link
            href={`/catalog/${product.slug}`}
            className="mt-4 inline-flex items-center gap-1 text-xs font-mono text-gray-500 hover:text-white transition-colors"
          >
            <i className="ph-bold ph-arrow-left" /> повернутись до товару
          </Link>
        </div>
      </aside>
    </div>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">
        {label}
        {required && <span className="text-neon-pink ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function ContactTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-xs font-mono transition-all ${
        active
          ? "bg-neon-blue/10 border-neon-blue/50 text-neon-blue"
          : "bg-surface2 border-white/10 text-gray-400 hover:border-white/20"
      }`}
    >
      <i className={`ph-bold ${icon}`} /> {label}
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs font-mono">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-300">{value}</span>
    </div>
  );
}
