"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { ACCENT_BUTTON, type Product } from "@/lib/products";
import type { EnvValues } from "@/lib/envFields";
import ProductThumb from "@/components/ProductThumb";
import EnvFieldsForm from "./EnvFieldsForm";
import { ORDER_INPUT_CLS } from "./styles";

export default function OrderForm({
  product,
  cryptoEnabled = false,
  jarEnabled = false,
  jarAmountUah = 0,
  botUsername,
}: {
  product: Product;
  cryptoEnabled?: boolean;
  jarEnabled?: boolean;
  jarAmountUah?: number;
  botUsername?: string | null;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [contactMethod, setContactMethod] = useState<
    "telegram" | "email" | "phone"
  >("telegram");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [envValues, setEnvValues] = useState<EnvValues>(() =>
    Object.fromEntries(
      (product.envFields ?? [])
        .filter((f) => f.defaultValue)
        .map((f) => [f.key, f.defaultValue as string]),
    ),
  );
  const envFields = product.envFields ?? [];
  // Немає полів .env — нічого блокувати, поведінка як була.
  const [envValid, setEnvValid] = useState(envFields.length === 0);
  const onEnvValidity = useCallback((v: boolean) => setEnvValid(v), []);
  const [submitting, setSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [jarPaying, setJarPaying] = useState(false);
  const [jarInfo, setJarInfo] = useState<{
    orderId: string;
    jarUrl: string;
    amountUah: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleJar = async () => {
    setError(null);
    if (!name.trim() || !contact.trim()) {
      setError("Заповніть ім'я та контакт — щоб ми надіслали вам товар");
      return;
    }
    setJarPaying(true);
    try {
      const res = await fetch("/api/pay/jar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: product.slug,
          name: name.trim(),
          contactMethod,
          contact: contact.trim(),
          message: message.trim(),
          company,
          envData: envValues,
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        orderId?: string;
        jarUrl?: string;
        amountUah?: number;
        error?: string;
      };
      if (!data.ok || !data.jarUrl || !data.orderId) {
        setError(data.error || "Не вдалося створити оплату");
        setJarPaying(false);
        return;
      }
      setJarInfo({
        orderId: data.orderId,
        jarUrl: data.jarUrl,
        amountUah: data.amountUah ?? jarAmountUah,
      });
    } catch {
      setError("Помилка мережі");
    } finally {
      setJarPaying(false);
    }
  };

  const handlePay = async () => {
    setError(null);
    if (!name.trim() || !contact.trim()) {
      setError("Заповніть ім'я та контакт — щоб ми надіслали вам товар");
      return;
    }
    setPaying(true);
    try {
      const res = await fetch("/api/pay/now", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: product.slug,
          name: name.trim(),
          contactMethod,
          contact: contact.trim(),
          message: message.trim(),
          company,
          envData: envValues,
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        url?: string;
        error?: string;
      };
      if (!data.ok || !data.url) {
        setError(data.error || "Не вдалося створити оплату");
        setPaying(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Помилка мережі");
      setPaying(false);
    }
  };

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
          company,
          envData: envValues,
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        orderId?: string;
        error?: string;
      };
      if (!data.ok) {
        setError(data.error || "Не вдалося відправити");
        setSubmitting(false);
        return;
      }
      const o = data.orderId ? `&o=${data.orderId}` : "";
      router.push(`/order/success?p=${product.slug}${o}`);
    } catch {
      setError("Помилка мережі");
      setSubmitting(false);
    }
  };

  // Екран інструкцій після створення замовлення на банку
  if (jarInfo) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="rounded-2xl border border-neon-green/30 bg-surface/50 p-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-neon-green/10 border border-neon-green/30 mb-4">
            <i className="ph-fill ph-credit-card text-neon-green text-2xl" />
          </div>
          <h2 className="text-xl font-display font-bold text-white mb-1">
            Замовлення створено
          </h2>
          <p className="text-xs font-mono text-gray-500 mb-5">
            #{jarInfo.orderId}
          </p>

          <div className="bg-surface2 rounded-xl p-4 mb-4 text-left space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-gray-400">До сплати:</span>
              <span className="text-2xl font-display font-bold text-white">
                {jarInfo.amountUah} грн
              </span>
            </div>
            <div className="text-xs text-gray-500 font-mono">
              ≈ ${product.price} · картка будь-якого банку
            </div>
          </div>

          <a
            href={jarInfo.jarUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-neon-green text-black font-display font-bold rounded-xl px-6 py-4 active:scale-[0.98] transition-transform mb-4"
          >
            <i className="ph-bold ph-credit-card text-lg" />
            Перейти до оплати на банку
          </a>

          <div className="text-left text-sm text-gray-400 space-y-2 mb-2">
            <p className="flex items-start gap-2">
              <i className="ph-bold ph-number-circle-one text-neon-green mt-0.5" />
              Переказати <b className="text-white">{jarInfo.amountUah} грн</b> на
              банку
            </p>
            <p className="flex items-start gap-2">
              <i className="ph-bold ph-number-circle-two text-neon-green mt-0.5" />У
              коментарі вказати{" "}
              <b className="text-white">#{jarInfo.orderId}</b>
            </p>
            <p className="flex items-start gap-2">
              <i className="ph-bold ph-number-circle-three text-neon-green mt-0.5" />
              Після оплати надішлемо товар на{" "}
              <b className="text-white">{contact}</b>
            </p>
          </div>

          {contactMethod === "telegram" && botUsername && (
            <a
              href={`https://t.me/${botUsername}?start=ord_${jarInfo.orderId}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-neon-blue to-neon-purple text-black font-display font-bold rounded-xl px-6 py-3.5 active:scale-[0.98] transition-transform"
            >
              <i className="ph-fill ph-telegram-logo text-lg" />
              Підключити Telegram для отримання файлу
            </a>
          )}

          <p className="text-[11px] font-mono text-gray-600 mt-4">
            Підтверджуємо оплату вручну — зазвичай протягом 1–2 годин.
          </p>
        </div>
      </div>
    );
  }

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
        {/* Honeypot — приховане поле для ботів */}
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="absolute -left-[9999px] w-px h-px opacity-0"
        />
        <Field label="Як до вас звертатися?" required>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Артем"
            required
            className={ORDER_INPUT_CLS}
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
            className={ORDER_INPUT_CLS}
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

        <EnvFieldsForm
          fields={envFields}
          values={envValues}
          onChange={setEnvValues}
          onValidityChange={onEnvValidity}
          disabled={submitting || paying || jarPaying}
        />

        {error && (
          <div className="text-sm text-neon-pink font-mono flex items-center gap-2">
            <i className="ph-fill ph-warning-circle" /> {error}
          </div>
        )}

        {jarEnabled && (
          <button
            type="button"
            onClick={handleJar}
            disabled={jarPaying || paying || submitting || !envValid}
            className="w-full flex items-center justify-center gap-2 font-display font-bold rounded-xl px-6 py-4 bg-white text-black shadow-[0_10px_30px_-10px_rgba(255,255,255,0.3)] active:scale-[0.98] transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {jarPaying ? (
              <>
                <i className="ph-bold ph-circle-notch animate-spin" />
                Створюємо...
              </>
            ) : (
              <>
                <i className="ph-bold ph-credit-card text-lg" />
                Сплатити карткою{jarAmountUah ? ` · ${jarAmountUah} грн` : ""}
              </>
            )}
          </button>
        )}

        {cryptoEnabled && (
          <button
            type="button"
            onClick={handlePay}
            disabled={paying || jarPaying || submitting || !envValid}
            className="w-full flex items-center justify-center gap-2 font-display font-bold rounded-xl px-6 py-4 bg-gradient-to-r from-neon-green to-neon-blue text-black shadow-[0_10px_30px_-10px_rgba(0,255,102,0.5)] active:scale-[0.98] transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {paying ? (
              <>
                <i className="ph-bold ph-circle-notch animate-spin" />
                Створюємо інвойс...
              </>
            ) : (
              <>
                <i className="ph-bold ph-currency-circle-dollar text-lg" />
                Сплатити криптою · ${product.price}
              </>
            )}
          </button>
        )}

        <button
          type="submit"
          // Свідомо БЕЗ envValid: якщо клієнт не розібрався в налаштуваннях,
          // він має змогу просто залишити заявку — оформимо підтримкою.
          disabled={submitting || paying || jarPaying}
          className={
            cryptoEnabled || jarEnabled
              ? "w-full flex items-center justify-center gap-2 font-display font-medium rounded-xl px-6 py-3.5 bg-surface2 border border-white/10 text-white hover:border-neon-blue/50 active:scale-[0.98] transition-all disabled:opacity-60"
              : `w-full flex items-center justify-center gap-2 font-display font-bold rounded-xl px-6 py-4 active:scale-[0.98] transition-transform disabled:opacity-60 disabled:cursor-not-allowed ${ACCENT_BUTTON[product.accent]}`
          }
        >
          {submitting ? (
            <>
              <i className="ph-bold ph-circle-notch animate-spin" />
              Відправляємо...
            </>
          ) : (
            <>
              <i className="ph-bold ph-paper-plane-tilt" />
              {cryptoEnabled ? "Або залишити заявку" : "Надіслати заявку"}
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 font-mono text-center">
          {envFields.length > 0 && !envValid
            ? "Щоб оплатити — заповніть налаштування вище. Не розібрались? Залиште заявку, допоможемо."
            : cryptoEnabled || jarEnabled
              ? "Оплата карткою чи криптою. Або просто залиште заявку."
              : "Відповімо в Telegram протягом 2 годин у робочий час"}
        </p>
      </form>

      {/* Order summary — desktop only */}
      <aside className="hidden lg:block lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-2xl border border-white/10 bg-surface/50 backdrop-blur p-5 md:p-6">
          <div className="text-[10px] font-mono text-neon-blue tracking-widest uppercase mb-3">
            {"// ВАШЕ ЗАМОВЛЕННЯ"}
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
