"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";

const TYPES = [
  { id: "tg-bot", tk: "t1", icon: "ph-telegram-logo" },
  { id: "web", tk: "t2", icon: "ph-browsers" },
  { id: "mobile", tk: "t3", icon: "ph-device-mobile" },
  { id: "automation", tk: "t4", icon: "ph-lightning" },
  { id: "ai", tk: "t5", icon: "ph-robot" },
  { id: "other", tk: "t6", icon: "ph-question" },
] as const;

const BUDGETS = ["bud1", "bud2", "bud3", "bud4", "bud5"] as const;
const DEADLINES = ["d1", "d2", "d3", "d4"] as const;

export default function CustomForm() {
  const tr = useTranslations("customForm");
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
  const [company, setCompany] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customType) {
      setError(tr("errType"));
      return;
    }
    if (!name.trim() || !contact.trim()) {
      setError(tr("errContact"));
      return;
    }
    if (!message.trim()) {
      setError(tr("errBrief"));
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "custom",
          customType: TYPES.find((x) => x.id === customType) ? tr(TYPES.find((x) => x.id === customType)!.tk) : customType,
          budget: budget ? tr(budget) : "",
          deadline: deadline ? tr(deadline) : "",
          name: name.trim(),
          contactMethod,
          contact: contact.trim(),
          message: message.trim(),
          company,
        }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) {
        setError(data.error || tr("errSend"));
        setSubmitting(false);
        return;
      }
      router.push("/order/success?custom=1");
    } catch {
      setError(tr("errNet"));
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Honeypot */}
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
      {/* Type */}
      <section>
        <SectionLabel n="01" title={tr("sec1")} required />
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
                  {tr(t.tk)}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Budget */}
      <section>
        <SectionLabel n="02" title={tr("sec2")} />
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
                {tr(b)}
              </button>
            );
          })}
        </div>
      </section>

      {/* Deadline */}
      <section>
        <SectionLabel n="03" title={tr("sec3")} />
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
                {tr(d)}
              </button>
            );
          })}
        </div>
      </section>

      {/* Brief */}
      <section>
        <SectionLabel n="04" title={tr("sec4")} required />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          placeholder={tr("briefPh")}
          className="w-full bg-surface2 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-blue/50 transition-colors font-mono text-sm resize-y"
        />
      </section>

      {/* Contact */}
      <section>
        <SectionLabel n="05" title={tr("sec5")} required />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={tr("namePh")}
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
            label={tr("telegram")}
          />
          <ContactTab
            active={contactMethod === "email"}
            onClick={() => setContactMethod("email")}
            icon="ph-envelope-simple"
            label={tr("email")}
          />
          <ContactTab
            active={contactMethod === "phone"}
            onClick={() => setContactMethod("phone")}
            icon="ph-phone"
            label={tr("phone")}
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
            {tr("sending")}
          </>
        ) : (
          <>
            <i className="ph-bold ph-paper-plane-tilt" />
            {tr("submit")}
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 font-mono text-center">
        {tr("note")}
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
