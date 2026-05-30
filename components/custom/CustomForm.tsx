"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const TYPES = [
  { id: "tg-bot", label: "Telegram бот", icon: "ph-telegram-logo" },
  { id: "web", label: "Веб-сайт / SaaS", icon: "ph-browsers" },
  { id: "mobile", label: "Мобільний додаток", icon: "ph-device-mobile" },
  { id: "automation", label: "Автоматизація", icon: "ph-lightning" },
  { id: "ai", label: "AI рішення", icon: "ph-robot" },
  { id: "other", label: "Інше", icon: "ph-question" },
];

const BUDGETS = [
  "до $500",
  "$500 – $2,000",
  "$2,000 – $5,000",
  "$5,000+",
  "Поки не знаю",
];

const DEADLINES = ["1 тиждень", "2–4 тижні", "1–2 місяці", "Гнучко"];

export default function CustomForm() {
  const router = useRouter();
  const [customType, setCustomType] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
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

    if (!customType) {
      setError("Оберіть тип проекту");
      return;
    }
    if (!name.trim() || !contact.trim()) {
      setError("Заповніть ім'я та контакт");
      return;
    }
    if (!message.trim()) {
      setError("Опишіть задачу хоча б у двох реченнях");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "custom",
          customType: TYPES.find((t) => t.id === customType)?.label ?? customType,
          budget,
          deadline,
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
      router.push("/order/success?custom=1");
    } catch {
      setError("Помилка мережі");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Type */}
      <section>
        <SectionLabel n="01" title="Що потрібно зробити" required />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
          {TYPES.map((t) => {
            const active = customType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setCustomType(t.id)}
                className={`flex items-center gap-2 px-3 md:px-4 py-2.5 md:py-3 rounded-xl border transition-all text-left min-w-0 ${
                  active
                    ? "bg-neon-blue/10 border-neon-blue/50 text-white"
                    : "bg-surface2 border-white/10 text-gray-400 hover:border-white/20"
                }`}
              >
                <i
                  className={`ph ${t.icon} text-lg md:text-xl shrink-0 ${active ? "text-neon-blue" : ""}`}
                />
                <span className="text-xs md:text-sm font-medium truncate">
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Budget */}
      <section>
        <SectionLabel n="02" title="Бюджет" />
        <div className="flex flex-wrap gap-2">
          {BUDGETS.map((b) => {
            const active = budget === b;
            return (
              <button
                key={b}
                type="button"
                onClick={() => setBudget(b)}
                className={`px-4 py-2 rounded-full border text-xs font-mono transition-all ${
                  active
                    ? "bg-neon-purple/10 border-neon-purple/50 text-neon-purple"
                    : "bg-surface2 border-white/10 text-gray-400 hover:border-white/20"
                }`}
              >
                {b}
              </button>
            );
          })}
        </div>
      </section>

      {/* Deadline */}
      <section>
        <SectionLabel n="03" title="Дедлайн" />
        <div className="flex flex-wrap gap-2">
          {DEADLINES.map((d) => {
            const active = deadline === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setDeadline(d)}
                className={`px-4 py-2 rounded-full border text-xs font-mono transition-all ${
                  active
                    ? "bg-neon-green/10 border-neon-green/50 text-neon-green"
                    : "bg-surface2 border-white/10 text-gray-400 hover:border-white/20"
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>
      </section>

      {/* Brief */}
      <section>
        <SectionLabel n="04" title="Опишіть задачу" required />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          placeholder="Що має робити продукт, які інтеграції потрібні, чи є приклади / референси..."
          className="w-full bg-surface2 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-blue/50 transition-colors font-mono text-sm resize-y"
        />
      </section>

      {/* Contact */}
      <section>
        <SectionLabel n="05" title="Куди писати" required />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ім'я"
            required
            className="bg-surface2 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-blue/50 transition-colors font-mono text-sm"
          />
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
            className="bg-surface2 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-blue/50 transition-colors font-mono text-sm"
          />
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">
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
      </section>

      {error && (
        <div className="text-sm text-neon-pink font-mono flex items-center gap-2">
          <i className="ph-fill ph-warning-circle" /> {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-neon-blue to-neon-purple text-black font-display font-bold rounded-xl px-6 py-4 shadow-[0_10px_30px_-10px_rgba(0,240,255,0.5)] active:scale-[0.98] transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <>
            <i className="ph-bold ph-circle-notch animate-spin" />
            Відправляємо...
          </>
        ) : (
          <>
            <i className="ph-bold ph-paper-plane-tilt" />
            Надіслати бриф
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 font-mono text-center">
        Безкоштовний брифінг 30 хв · Відповімо протягом 2 годин
      </p>
    </form>
  );
}

function SectionLabel({
  n,
  title,
  required = false,
}: {
  n: string;
  title: string;
  required?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 mb-3 md:mb-4">
      <span className="text-[10px] font-mono text-neon-blue tracking-widest">
        / {n}
      </span>
      <span className="font-display font-bold text-base md:text-lg text-white">
        {title}
        {required && <span className="text-neon-pink ml-1">*</span>}
      </span>
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
