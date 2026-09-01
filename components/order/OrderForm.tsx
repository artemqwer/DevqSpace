"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { ACCENT_BUTTON, type Product } from "@/lib/products";
import type { EnvValues } from "@/lib/envFields";
import { validateContact, contactErrorKey } from "@/lib/contact";
import ProductThumb from "@/components/ProductThumb";
import EnvFieldsForm from "./EnvFieldsForm";
import { ORDER_INPUT_CLS } from "./styles";

// WayForPay pay-widget.js вішає конструктор у window.Wayforpay.
declare global {
  interface Window {
    Wayforpay?: new () => {
      run: (
        params: Record<string, unknown>,
        approved: () => void,
        declined: () => void,
        pending: () => void,
      ) => void;
    };
  }
}

const WFP_SCRIPT = "https://secure.wayforpay.com/server/pay-widget.js";

function loadWfpWidget(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Wayforpay) return resolve();
    const existing = document.getElementById("wfp-widget-script");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("wfp")));
      return;
    }
    const s = document.createElement("script");
    s.id = "wfp-widget-script";
    s.src = WFP_SCRIPT;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("wfp"));
    document.body.appendChild(s);
  });
}

export default function OrderForm({
  product,
  wfpEnabled = false,
  wfpAmountUah = 0,
  cryptoEnabled = false,
  jarEnabled = false,
  jarAmountUah = 0,
  botUsername,
}: {
  product: Product;
  wfpEnabled?: boolean;
  wfpAmountUah?: number;
  cryptoEnabled?: boolean;
  jarEnabled?: boolean;
  jarAmountUah?: number;
  botUsername?: string | null;
}) {
  const to = useTranslations("orderForm");
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
  const [wfpPaying, setWfpPaying] = useState(false);
  const [jarPaying, setJarPaying] = useState(false);
  const [jarInfo, setJarInfo] = useState<{
    orderId: string;
    jarUrl: string;
    amountUah: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Показуємо помилку формату лише коли в полі вже щось є — інакше червоне
  // спалахує на порожній формі, щойно людина клікнула у поле.
  const contactCheck = validateContact(contactMethod, contact);
  const contactError =
    contact.trim() && !contactCheck.ok
      ? to(contactErrorKey(contactMethod, contactCheck.reason))
      : null;
  const contactOk = contactCheck.ok;

  const handleWfp = async () => {
    setError(null);
    if (!name.trim() || !contactOk) {
      setError(contactError ?? to("errNameContact"));
      return;
    }
    setWfpPaying(true);
    try {
      const res = await fetch("/api/pay/wfp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: product.slug,
          name: name.trim(),
          contactMethod,
          contact: contact.trim(),
          message: message.trim(),
          company,
          envValues,
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        params?: Record<string, unknown>;
        orderId?: string;
        error?: string;
      };
      if (!data.ok || !data.params) {
        setError(data.error || to("errCreate"));
        setWfpPaying(false);
        return;
      }
      await loadWfpWidget();
      const Ctor = window.Wayforpay;
      if (!Ctor) {
        setError(to("errNet"));
        setWfpPaying(false);
        return;
      }
      const success = () =>
        router.push(
          `/order/success?p=${product.slug}${data.orderId ? `&o=${data.orderId}` : ""}`,
        );
      new Ctor().run(
        data.params,
        success, // approved
        () => setWfpPaying(false), // declined
        success, // pending — заявка створена, видача піде по callback
      );
      // Модалка відкрита. Якщо юзер закриє її без оплати — callback не
      // прийде, тому просто знімаємо спінер із кнопки.
      setWfpPaying(false);
    } catch {
      setError(to("errNet"));
      setWfpPaying(false);
    }
  };

  const handleJar = async () => {
    setError(null);
    if (!name.trim() || !contactOk) {
      setError(contactError ?? to("errNameContact"));
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
          envValues,
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
        setError(data.error || to("errCreate"));
        setJarPaying(false);
        return;
      }
      setJarInfo({
        orderId: data.orderId,
        jarUrl: data.jarUrl,
        amountUah: data.amountUah ?? jarAmountUah,
      });
    } catch {
      setError(to("errNet"));
    } finally {
      setJarPaying(false);
    }
  };

  const handlePay = async () => {
    setError(null);
    if (!name.trim() || !contactOk) {
      setError(contactError ?? to("errNameContact"));
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
          envValues,
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        url?: string;
        error?: string;
      };
      if (!data.ok || !data.url) {
        setError(data.error || to("errCreate"));
        setPaying(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError(to("errNet"));
      setPaying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !contactOk) {
      setError(contactError ?? to("errNameContact2"));
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
          envValues,
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        orderId?: string;
        error?: string;
      };
      if (!data.ok) {
        setError(data.error || to("errSend"));
        setSubmitting(false);
        return;
      }
      const o = data.orderId ? `&o=${data.orderId}` : "";
      router.push(`/order/success?p=${product.slug}${o}`);
    } catch {
      setError(to("errNet"));
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
            {to("jarCreated")}
          </h2>
          <p className="text-xs font-mono text-gray-500 mb-5">
            #{jarInfo.orderId}
          </p>

          <div className="bg-surface2 rounded-xl p-4 mb-4 text-left space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-gray-400">{to("toPay")}</span>
              <span className="text-2xl font-display font-bold text-white">
                {jarInfo.amountUah} грн
              </span>
            </div>
            <div className="text-xs text-gray-500 font-mono">
              ≈ ${product.price} · {to("jarSub")}
            </div>
          </div>

          <a
            href={jarInfo.jarUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-neon-green text-black font-display font-bold rounded-xl px-6 py-4 active:scale-[0.98] transition-transform mb-4"
          >
            <i className="ph-bold ph-credit-card text-lg" />
            {to("goPay")}
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
              {to("step3")}{" "}
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
              {to("tgConnect")}
            </a>
          )}

          <p className="text-[11px] font-mono text-gray-600 mt-4">
            {to("manualNote")}
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
        <Field label={to("nameLabel")} required>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={to("namePh")}
            required
            className={ORDER_INPUT_CLS}
          />
        </Field>

        <Field label={to("contactLabel")} required>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <ContactTab
              active={contactMethod === "telegram"}
              onClick={() => setContactMethod("telegram")}
              icon="ph-telegram-logo"
              label={to("telegram")}
            />
            <ContactTab
              active={contactMethod === "email"}
              onClick={() => setContactMethod("email")}
              icon="ph-envelope-simple"
              label={to("email")}
            />
            <ContactTab
              active={contactMethod === "phone"}
              onClick={() => setContactMethod("phone")}
              icon="ph-phone"
              label={to("phone")}
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
            className={`${ORDER_INPUT_CLS} ${contactError ? "border-neon-pink/60" : ""}`}
          />
          {contactError && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-neon-pink">
              <i className="ph-bold ph-warning-circle" />
              {contactError}
            </p>
          )}
        </Field>

        <Field label={to("detailsLabel")}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder={to("detailsPh")}
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

        {wfpEnabled && (
          <button
            type="button"
            onClick={handleWfp}
            disabled={wfpPaying || paying || jarPaying || submitting || !envValid}
            className="w-full flex items-center justify-center gap-2 font-display font-bold rounded-xl px-6 py-4 bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-[0_10px_30px_-10px_rgba(80,120,255,0.6)] active:scale-[0.98] transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {wfpPaying ? (
              <>
                <i className="ph-bold ph-circle-notch animate-spin" />
                {to("creating")}
              </>
            ) : (
              <>
                <i className="ph-fill ph-credit-card text-lg" />
                {to("payCard")}{wfpAmountUah ? ` · ${wfpAmountUah} ₴` : ""}
              </>
            )}
          </button>
        )}

        {jarEnabled && (
          <button
            type="button"
            onClick={handleJar}
            disabled={jarPaying || paying || wfpPaying || submitting || !envValid}
            className="w-full flex items-center justify-center gap-2 font-display font-bold rounded-xl px-6 py-4 bg-white text-black shadow-[0_10px_30px_-10px_rgba(255,255,255,0.3)] active:scale-[0.98] transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {jarPaying ? (
              <>
                <i className="ph-bold ph-circle-notch animate-spin" />
                {to("creating")}
              </>
            ) : (
              <>
                <i className="ph-bold ph-credit-card text-lg" />
                {to("payCard")}{jarAmountUah ? ` · ${jarAmountUah} ₴` : ""}
              </>
            )}
          </button>
        )}

        {cryptoEnabled && (
          <button
            type="button"
            onClick={handlePay}
            disabled={paying || jarPaying || wfpPaying || submitting || !envValid}
            className="w-full flex items-center justify-center gap-2 font-display font-bold rounded-xl px-6 py-4 bg-gradient-to-r from-neon-green to-neon-blue text-black shadow-[0_10px_30px_-10px_rgba(0,255,102,0.5)] active:scale-[0.98] transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {paying ? (
              <>
                <i className="ph-bold ph-circle-notch animate-spin" />
                {to("creatingInv")}
              </>
            ) : (
              <>
                <i className="ph-bold ph-currency-circle-dollar text-lg" />
                {to("payCrypto")} · ${product.price}
              </>
            )}
          </button>
        )}

        <button
          type="submit"
          // Свідомо БЕЗ envValid: якщо клієнт не розібрався в налаштуваннях,
          // він має змогу просто залишити заявку — оформимо підтримкою.
          disabled={submitting || paying || jarPaying || wfpPaying}
          className={
            cryptoEnabled || jarEnabled || wfpEnabled
              ? "w-full flex items-center justify-center gap-2 font-display font-medium rounded-xl px-6 py-3.5 bg-surface2 border border-white/10 text-white hover:border-neon-blue/50 active:scale-[0.98] transition-all disabled:opacity-60"
              : `w-full flex items-center justify-center gap-2 font-display font-bold rounded-xl px-6 py-4 active:scale-[0.98] transition-transform disabled:opacity-60 disabled:cursor-not-allowed ${ACCENT_BUTTON[product.accent]}`
          }
        >
          {submitting ? (
            <>
              <i className="ph-bold ph-circle-notch animate-spin" />
              {to("sending")}
            </>
          ) : (
            <>
              <i className="ph-bold ph-paper-plane-tilt" />
              {cryptoEnabled || jarEnabled || wfpEnabled ? to("submitOr") : to("submit")}
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 font-mono text-center">
          {envFields.length > 0 && !envValid
            ? to("noteConfig")
            : cryptoEnabled || jarEnabled || wfpEnabled
              ? to("noteBoth")
              : to("noteReq")}
        </p>
      </form>

      {/* Order summary — desktop only */}
      <aside className="hidden lg:block lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-2xl border border-white/10 bg-surface/50 backdrop-blur p-5 md:p-6">
          <div className="text-[10px] font-mono text-neon-blue tracking-widest uppercase mb-3">
            {to("summaryTitle")}
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
            <SummaryRow label={to("sumDelivery")} value={product.delivery} />
            <SummaryRow label={to("sumWarranty")} value={product.warranty} />
            <SummaryRow label={to("sumSource")} value={to("sumSourceV")} />
            <SummaryRow label={to("sumUpdates")} value={to("sumUpdatesV")} />
          </div>

          <div className="flex items-baseline justify-between pt-4">
            <span className="text-gray-400 font-mono text-sm">{to("total")}</span>
            <span className="text-3xl font-display font-bold text-white">
              ${product.price}
            </span>
          </div>

          <Link
            href={`/catalog/${product.slug}`}
            className="mt-4 inline-flex items-center gap-1 text-xs font-mono text-gray-500 hover:text-white transition-colors"
          >
            <i className="ph-bold ph-arrow-left" /> {to("back")}
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
