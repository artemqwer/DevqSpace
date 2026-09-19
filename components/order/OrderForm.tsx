"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ACCENT_BUTTON, type Product } from "@/lib/products";
import type { EnvValues } from "@/lib/envFields";
import { validateContact, contactErrorKey } from "@/lib/contact";
import ProductThumb from "@/components/ProductThumb";
import EnvFieldsForm from "./EnvFieldsForm";
import { ORDER_INPUT_CLS } from "./styles";

// Зовнішні скрипти платіжок вішають глобали у window.
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
    createLemonSqueezy?: () => void;
    LemonSqueezy?: {
      Setup?: (opts: { eventHandler?: (e: { event?: string }) => void }) => void;
      Url?: { Open?: (url: string) => void; Close?: () => void };
    };
    Paddle?: {
      Environment?: { set: (env: string) => void };
      Initialize?: (opts: {
        token: string;
        eventCallback?: (e: { name?: string }) => void;
      }) => void;
      Checkout?: { open: (opts: Record<string, unknown>) => void };
    };
  }
}

let paddleReady = false; // paddle.js ініціалізується один раз на сторінку

// Вантажить зовнішній скрипт один раз (ідемпотентно за id).
function loadScript(id: string, src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(id);
    if (existing) {
      if (existing.getAttribute("data-loaded")) return resolve();
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error(id)));
      return;
    }
    const s = document.createElement("script");
    s.id = id;
    s.src = src;
    s.async = true;
    s.onload = () => {
      s.setAttribute("data-loaded", "1");
      resolve();
    };
    s.onerror = () => reject(new Error(id));
    document.body.appendChild(s);
  });
}

const loadWfpWidget = () =>
  window.Wayforpay
    ? Promise.resolve()
    : loadScript(
        "wfp-widget-script",
        "https://secure.wayforpay.com/server/pay-widget.js",
      );

const loadLemon = () =>
  window.LemonSqueezy
    ? Promise.resolve()
    : loadScript("lemon-script", "https://assets.lemonsqueezy.com/lemon.js");

const loadPaddle = () =>
  window.Paddle
    ? Promise.resolve()
    : loadScript("paddle-script", "https://cdn.paddle.com/paddle/v2/paddle.js");

export default function OrderForm({
  product,
  paddleEnabled = false,
  paddleConfig = null,
  lemonEnabled = false,
  wfpEnabled = false,
  wfpAmountUah = 0,
  cryptoEnabled = false,
  jarEnabled = false,
  jarAmountUah = 0,
  botUsername,
}: {
  product: Product;
  paddleEnabled?: boolean;
  paddleConfig?: { token: string; environment: string } | null;
  lemonEnabled?: boolean;
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
  const [paddlePaying, setPaddlePaying] = useState(false);
  const [lemonPaying, setLemonPaying] = useState(false);
  const [wfpPaying, setWfpPaying] = useState(false);
  const [jarPaying, setJarPaying] = useState(false);
  const [jarInfo, setJarInfo] = useState<{
    orderId: string;
    jarUrl: string;
    amountUah: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [serviceTier, setServiceTier] = useState<"code" | "setup" | "hosting">("code");
  const extraPrice = serviceTier === "setup" ? 39 : serviceTier === "hosting" ? 15 : 0;
  const finalPrice = product.price + extraPrice;
  const effectiveJarUah = Math.round(
    finalPrice * (product.price > 0 ? jarAmountUah / product.price : 42),
  );
  // Показуємо помилку формату лише коли в полі вже щось є — інакше червоне
  // спалахує на порожній формі, щойно людина клікнула у поле.
  const contactCheck = validateContact(contactMethod, contact);
  const contactError =
    contact.trim() && !contactCheck.ok
      ? to(contactErrorKey(contactMethod, contactCheck.reason))
      : null;
  const contactOk = contactCheck.ok;

  type PaymentMethodId = "paddle" | "lemon" | "wfp" | "jar" | "crypto";

  const availableMethods = useMemo(() => {
    const list: {
      id: PaymentMethodId;
      name: string;
      desc?: string;
      icon: string;
      badge?: string;
      amountFormatted: string;
    }[] = [];

    if (paddleEnabled) {
      list.push({
        id: "paddle",
        name: to("methodCard"),
        desc: "Visa / Mastercard",
        icon: "ph-credit-card",
        badge: "USD",
        amountFormatted: `$${finalPrice}`,
      });
    } else if (lemonEnabled) {
      list.push({
        id: "lemon",
        name: to("methodCard"),
        desc: "Visa / Mastercard",
        icon: "ph-credit-card",
        badge: "USD",
        amountFormatted: `$${finalPrice}`,
      });
    }

    if (wfpEnabled) {
      list.push({
        id: "wfp",
        name: to("methodCard"),
        desc: "Visa / Mastercard",
        icon: "ph-credit-card",
        badge: "UAH",
        amountFormatted: `≈ $${finalPrice}`,
      });
    }

    if (jarEnabled) {
      list.push({
        id: "jar",
        name: to("methodJar"),
        desc: "Monobank / Apple Pay",
        icon: "ph-bank",
        badge: `${effectiveJarUah} грн`,
        amountFormatted: `${effectiveJarUah} грн`,
      });
    }

    if (cryptoEnabled) {
      list.push({
        id: "crypto",
        name: to("methodCrypto"),
        desc: "USDT, BTC, TON, ETH",
        icon: "ph-currency-circle-dollar",
        badge: "Crypto",
        amountFormatted: `$${finalPrice}`,
      });
    }

    return list;
  }, [
    paddleEnabled,
    lemonEnabled,
    wfpEnabled,
    jarEnabled,
    cryptoEnabled,
    finalPrice,
    effectiveJarUah,
    to,
  ]);

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId>(() => {
    if (paddleEnabled) return "paddle";
    if (lemonEnabled) return "lemon";
    if (wfpEnabled) return "wfp";
    if (jarEnabled) return "jar";
    if (cryptoEnabled) return "crypto";
    return "crypto";
  });

  const getCombinedMessage = () => {
    const tierNote =
      serviceTier === "setup"
        ? "[Послуга: Встановлення під ключ (+ $39)]"
        : serviceTier === "hosting"
          ? "[Послуга: Керований VPS хостинг (+ $15/міс)]"
          : "";
    return [message.trim(), tierNote].filter(Boolean).join("\n\n");
  };

  const handlePaddle = async () => {
    setError(null);
    if (!name.trim() || !contactOk) {
      setError(contactError ?? to("errNameContact"));
      return;
    }
    if (!paddleConfig) {
      setError(to("errNet"));
      return;
    }
    setPaddlePaying(true);
    try {
      const res = await fetch("/api/pay/paddle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: product.slug,
          name: name.trim(),
          contactMethod,
          contact: contact.trim(),
          message: getCombinedMessage(),
          customPrice: finalPrice,
          company,
          envValues,
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        transactionId?: string;
        orderId?: string;
        email?: string;
        error?: string;
      };
      if (!data.ok || !data.transactionId) {
        setError(data.error || to("errCreate"));
        setPaddlePaying(false);
        return;
      }
      const success = () =>
        router.push(
          `/order/success?p=${product.slug}${data.orderId ? `&o=${data.orderId}` : ""}`,
        );
      try {
        await loadPaddle();
        const P = window.Paddle;
        if (!P?.Checkout) {
          setError(to("errNet"));
          setPaddlePaying(false);
          return;
        }
        if (!paddleReady) {
          P.Environment?.set(paddleConfig.environment);
          P.Initialize?.({
            token: paddleConfig.token,
            eventCallback: (e) => {
              if (e?.name === "checkout.completed") success();
            },
          });
          paddleReady = true;
        }
        P.Checkout.open({
          transactionId: data.transactionId,
          ...(data.email ? { customer: { email: data.email } } : {}),
          settings: {
            displayMode: "overlay",
            theme: "dark",
            successUrl: `${window.location.origin}/order/success?p=${product.slug}${data.orderId ? `&o=${data.orderId}` : ""}`,
          },
        });
      } catch {
        setError(to("errNet"));
      }
      setPaddlePaying(false);
    } catch {
      setError(to("errNet"));
      setPaddlePaying(false);
    }
  };

  const handleLemon = async () => {
    setError(null);
    if (!name.trim() || !contactOk) {
      setError(contactError ?? to("errNameContact"));
      return;
    }
    setLemonPaying(true);
    try {
      const res = await fetch("/api/pay/lemon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: product.slug,
          name: name.trim(),
          contactMethod,
          contact: contact.trim(),
          message: getCombinedMessage(),
          customPrice: finalPrice,
          company,
          envValues,
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        url?: string;
        orderId?: string;
        error?: string;
      };
      if (!data.ok || !data.url) {
        setError(data.error || to("errCreate"));
        setLemonPaying(false);
        return;
      }
      const success = () =>
        router.push(
          `/order/success?p=${product.slug}${data.orderId ? `&o=${data.orderId}` : ""}`,
        );
      try {
        await loadLemon();
        window.createLemonSqueezy?.();
        window.LemonSqueezy?.Setup?.({
          eventHandler: (e) => {
            if (e?.event === "Checkout.Success") success();
          },
        });
        if (window.LemonSqueezy?.Url?.Open) {
          window.LemonSqueezy.Url.Open(data.url);
        } else {
          window.location.href = data.url; // фолбек, якщо оверлей не завантажився
        }
      } catch {
        window.location.href = data.url; // фолбек на hosted-сторінку
      }
      setLemonPaying(false);
    } catch {
      setError(to("errNet"));
      setLemonPaying(false);
    }
  };

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
          message: getCombinedMessage(),
          customPrice: finalPrice,
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
          message: getCombinedMessage(),
          customPrice: finalPrice,
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
        amountUah: data.amountUah ?? effectiveJarUah,
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
          message: getCombinedMessage(),
          customPrice: finalPrice,
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
          message: getCombinedMessage(),
          customPrice: finalPrice,
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
          ${finalPrice}
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

        <div>
          <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">
            {to("tierLabel")}
          </label>
          <div className="grid grid-cols-1 gap-2.5">
            <button
              type="button"
              onClick={() => setServiceTier("code")}
              className={`text-left p-3.5 rounded-xl border transition-all ${
                serviceTier === "code"
                  ? "bg-neon-blue/10 border-neon-blue/50 text-white shadow-sm"
                  : "bg-surface2/60 border-white/10 text-gray-300 hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      serviceTier === "code"
                        ? "border-neon-blue bg-neon-blue"
                        : "border-gray-500"
                    }`}
                  >
                    {serviceTier === "code" && (
                      <div className="w-1.5 h-1.5 rounded-full bg-black" />
                    )}
                  </div>
                  <i className="ph-bold ph-file-code text-neon-blue" />
                  <span className="text-sm font-display font-bold text-white">
                    {to("tierCode")}
                  </span>
                </div>
                <span className="text-xs font-mono text-gray-400 font-bold">
                  ${product.price}
                </span>
              </div>
              <p className="mt-1.5 ml-7 text-xs text-gray-400 font-mono">
                {to("tierCodeDesc")}
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                setServiceTier((prev) => (prev === "setup" ? "code" : "setup"))
              }
              className={`text-left p-3.5 rounded-xl border transition-all ${
                serviceTier === "setup"
                  ? "bg-neon-blue/10 border-neon-blue/50 text-white shadow-sm"
                  : "bg-surface2/60 border-white/10 text-gray-300 hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      serviceTier === "setup"
                        ? "border-neon-blue bg-neon-blue"
                        : "border-gray-500"
                    }`}
                  >
                    {serviceTier === "setup" && (
                      <div className="w-1.5 h-1.5 rounded-full bg-black" />
                    )}
                  </div>
                  <i className="ph-bold ph-wrench text-neon-green" />
                  <span className="text-sm font-display font-bold text-white">
                    {to("tierSetup")}
                  </span>
                </div>
                <span className="text-xs font-mono text-neon-green font-bold">
                  ${product.price + 39}
                </span>
              </div>
              <p className="mt-1.5 ml-7 text-xs text-gray-400 font-mono">
                {to("tierSetupDesc")}
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                setServiceTier((prev) => (prev === "hosting" ? "code" : "hosting"))
              }
              className={`text-left p-3.5 rounded-xl border transition-all ${
                serviceTier === "hosting"
                  ? "bg-neon-blue/10 border-neon-blue/50 text-white shadow-sm"
                  : "bg-surface2/60 border-white/10 text-gray-300 hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      serviceTier === "hosting"
                        ? "border-neon-blue bg-neon-blue"
                        : "border-gray-500"
                    }`}
                  >
                    {serviceTier === "hosting" && (
                      <div className="w-1.5 h-1.5 rounded-full bg-black" />
                    )}
                  </div>
                  <i className="ph-bold ph-cloud-arrow-up text-neon-purple" />
                  <span className="text-sm font-display font-bold text-white">
                    {to("tierHosting")}
                  </span>
                </div>
                <span className="text-xs font-mono text-neon-purple font-bold">
                  ${product.price + 15}
                </span>
              </div>
              <p className="mt-1.5 ml-7 text-xs text-gray-400 font-mono">
                {to("tierHostingDesc")}
              </p>
            </button>
          </div>
        </div>

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
          disabled={submitting || paying || jarPaying || wfpPaying || lemonPaying || paddlePaying}
        />

        {error && (
          <div className="text-sm text-neon-pink font-mono flex items-center gap-2">
            <i className="ph-fill ph-warning-circle" /> {error}
          </div>
        )}

        {availableMethods.length > 0 && (
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider">
              {to("paymentMethod")}
            </label>
            <div
              className={`grid gap-2.5 ${availableMethods.length > 1 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}
            >
              {availableMethods.map((m) => {
                const isSelected = selectedMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    disabled={submitting || paddlePaying || lemonPaying || wfpPaying || jarPaying || paying}
                    onClick={() => setSelectedMethod(m.id)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all text-left ${
                      isSelected
                        ? "border-neon-blue bg-neon-blue/10 text-white shadow-[0_0_20px_rgba(80,120,255,0.2)]"
                        : "border-white/10 bg-surface2/60 text-gray-300 hover:border-white/20 hover:bg-surface2"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 ${
                          isSelected
                            ? "bg-neon-blue/20 text-neon-blue"
                            : "bg-surface border border-white/5 text-gray-400"
                        }`}
                      >
                        <i className={`ph-bold ${m.icon}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-white flex items-center gap-1.5 truncate">
                          {m.name}
                          {m.badge && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-gray-400 shrink-0">
                              {m.badge}
                            </span>
                          )}
                        </div>
                        {m.desc && (
                          <div className="text-xs text-gray-400 font-mono truncate mt-0.5">
                            {m.desc}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <div className="text-xs font-mono font-bold text-white">
                        {m.amountFormatted}
                      </div>
                      <div
                        className={`mt-1 w-4 h-4 ml-auto rounded-full border flex items-center justify-center transition-colors ${
                          isSelected
                            ? "border-neon-blue bg-neon-blue"
                            : "border-white/20"
                        }`}
                      >
                        {isSelected && (
                          <div className="w-1.5 h-1.5 rounded-full bg-surface" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                if (selectedMethod === "paddle") handlePaddle();
                else if (selectedMethod === "lemon") handleLemon();
                else if (selectedMethod === "wfp") handleWfp();
                else if (selectedMethod === "jar") handleJar();
                else if (selectedMethod === "crypto") handlePay();
              }}
              disabled={
                submitting ||
                paddlePaying ||
                lemonPaying ||
                wfpPaying ||
                jarPaying ||
                paying ||
                !envValid
              }
              className="w-full flex items-center justify-center gap-2 font-display font-bold rounded-xl px-6 py-4 bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-[0_10px_30px_-10px_rgba(80,120,255,0.6)] active:scale-[0.98] transition-transform disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {paddlePaying || lemonPaying || wfpPaying || jarPaying || paying ? (
                <>
                  <i className="ph-bold ph-circle-notch animate-spin text-lg" />
                  {selectedMethod === "crypto" ? to("creatingInv") : to("creating")}
                </>
              ) : (
                <>
                  <i
                    className={`ph-fill ${
                      selectedMethod === "crypto"
                        ? "ph-currency-circle-dollar"
                        : selectedMethod === "jar"
                          ? "ph-bank"
                          : "ph-credit-card"
                    } text-lg`}
                  />
                  {to("payAction")} ·{" "}
                  {availableMethods.find((m) => m.id === selectedMethod)?.amountFormatted ??
                    `$${product.price}`}
                </>
              )}
            </button>
          </div>
        )}

        <button
          type="submit"
          // Свідомо БЕЗ envValid: якщо клієнт не розібрався в налаштуваннях,
          // він має змогу просто залишити заявку — оформимо підтримкою.
          disabled={submitting || paying || jarPaying || wfpPaying || lemonPaying || paddlePaying}
          className={
            availableMethods.length > 0
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
              {availableMethods.length > 0 ? to("submitOr") : to("submit")}
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 font-mono text-center">
          {envFields.length > 0 && !envValid
            ? to("noteConfig")
            : availableMethods.length > 0
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
            {serviceTier === "setup" && (
              <SummaryRow label={to("sumSetup")} value="+$39" />
            )}
            {serviceTier === "hosting" && (
              <SummaryRow label={to("sumHosting")} value="+$15/mo" />
            )}
          </div>

          <div className="flex items-baseline justify-between pt-4">
            <span className="text-gray-400 font-mono text-sm">{to("total")}</span>
            <span className="text-3xl font-display font-bold text-white">
              ${finalPrice}
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
