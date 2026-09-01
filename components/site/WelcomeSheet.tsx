"use client";

import { useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight } from "@phosphor-icons/react";

// Слайдер першого візиту: вибір мови + згода на cookie.
const KEY = "dq_prefs";

// Значення в localStorage міняє лише ця сама вкладка (choose нижче), тож
// підписка нікуди не потрібна — але useSyncExternalStore її вимагає.
const subscribeNoop = () => () => {};

function setLocaleCookie(lang: "uk" | "en") {
  document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000; samesite=lax`;
}

export function WelcomeSheet() {
  // null — ще не знаємо (перший рендер і SSR), далі true/false.
  // localStorage недоступний на сервері, тож стан визначається після
  // монтування; useSyncExternalStore дає це без setState всередині ефекту,
  // який спричиняв каскадний ререндер одразу після першого малювання.
  const seen = useSyncExternalStore(
    subscribeNoop,
    () => localStorage.getItem(KEY) !== null,
    () => true, // на сервері вважаємо, що вже бачив — щоб нічого не блимнуло
  );
  const [dismissed, setDismissed] = useState(false);

  // Рендериться з кореневого layout, тобто і над адмінкою. Адміну вибір мови
  // й cookie-згода не потрібні — вони перекривають панель.
  const isAdmin = usePathname()?.startsWith("/admin") ?? false;

  function choose(lang: "uk" | "en") {
    localStorage.setItem(KEY, JSON.stringify({ lang, consent: true, ts: Date.now() }));
    setLocaleCookie(lang);
    setDismissed(true);
    if (lang !== "uk") location.reload();
  }

  if (seen || dismissed || isAdmin) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center">
      <div className="reveal glass grad-border relative w-full max-w-md overflow-hidden rounded-3xl border border-border p-6 shadow-[0_0_70px_-12px_rgba(0,240,255,0.4)] sm:p-7">
        <div className="orb -right-12 -top-12 h-44 w-44 bg-neon-purple opacity-30" aria-hidden />
        <div className="orb -bottom-12 -left-12 h-44 w-44 bg-neon-blue opacity-25" aria-hidden />

        <div className="relative">
          <div className="mono-label mb-3 flex items-center gap-2 text-neon-blue">
            <span className="pulse-dot h-2 w-2 rounded-full bg-neon-green" /> language · мова
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Оберіть <span className="text-gradient">мову</span>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Choose your language</p>

          <div className="mt-5 flex flex-col gap-3">
            <LangButton
              onClick={() => choose("uk")}
              flag="🇺🇦"
              title="Українська"
              sub="Ukrainian"
              accent="blue"
            />
            <LangButton
              onClick={() => choose("en")}
              flag="🇬🇧"
              title="English"
              sub="Англійська"
              accent="purple"
            />
          </div>

          <p className="mt-5 text-[11px] leading-relaxed text-muted-foreground">
            🍪 Ми використовуємо cookie для роботи сайту й аналітики. Продовжуючи —
            погоджуєтесь. · We use cookies for the site and analytics.
          </p>
        </div>
      </div>
    </div>
  );
}

function LangButton({
  onClick,
  flag,
  title,
  sub,
  accent,
}: {
  onClick: () => void;
  flag: string;
  title: string;
  sub: string;
  accent: "blue" | "purple";
}) {
  const hover =
    accent === "blue"
      ? "hover:border-neon-blue/60 hover:shadow-[0_0_28px_-6px_rgba(0,240,255,0.5)]"
      : "hover:border-neon-purple/60 hover:shadow-[0_0_28px_-6px_rgba(138,43,226,0.5)]";
  const arrow = accent === "blue" ? "group-hover:text-neon-blue" : "group-hover:text-neon-purple";
  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-3.5 rounded-2xl border border-border-strong bg-surface-2/50 p-4 text-left transition-all active:scale-[0.99] ${hover}`}
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-border bg-background/60 text-2xl">
        {flag}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display font-bold leading-tight text-foreground">{title}</span>
        <span className="mono-label block text-muted-foreground">{sub}</span>
      </span>
      <ArrowRight className={`h-5 w-5 shrink-0 text-muted-foreground transition-all group-hover:translate-x-1 ${arrow}`} />
    </button>
  );
}
