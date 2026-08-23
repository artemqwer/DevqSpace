"use client";

import { useEffect, useState } from "react";

// Слайдер першого візиту: вибір мови + згода на cookie. Показується один раз,
// вибір зберігається в localStorage, мова — в cookie NEXT_LOCALE.
// ponytail: одна панель під обидва рішення; окремих банерів не плодимо.

const KEY = "dq_prefs";

function setLocaleCookie(lang: "uk" | "en") {
  document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000; samesite=lax`;
}

export function WelcomeSheet() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(KEY)) setOpen(true);
  }, []);

  function choose(lang: "uk" | "en") {
    localStorage.setItem(KEY, JSON.stringify({ lang, consent: true, ts: Date.now() }));
    setLocaleCookie(lang);
    setOpen(false);
    // Перезавантаження підхопить нову мову (коли переклад підключено).
    if (lang !== "uk") location.reload();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-3 pb-[max(env(safe-area-inset-bottom),12px)]">
      <div className="glass mx-auto max-w-md rounded-2xl border border-border p-5 shadow-[0_10px_60px_-10px_rgba(0,0,0,0.7)]">
        <div className="mb-1 font-display text-base font-bold text-foreground">
          🌐 Оберіть мову · Choose language
        </div>
        <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
          Ми використовуємо cookie для роботи сайту й аналітики. Продовжуючи, ви
          погоджуєтесь. · We use cookies for the site to work and for analytics.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => choose("uk")}
            className="rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple px-4 py-3 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
          >
            🇺🇦 Українська
          </button>
          <button
            onClick={() => choose("en")}
            className="rounded-xl border border-border-strong bg-surface-2/40 px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:border-neon-blue/50"
          >
            🇬🇧 English
          </button>
        </div>
      </div>
    </div>
  );
}
