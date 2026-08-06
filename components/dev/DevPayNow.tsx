"use client";

import { useState } from "react";

// Імітація hosted-checkout NOWPayments. Кнопка «Оплатити» надсилає справжній
// підписаний IPN у бойовий вебхук — далі все йде продовим кодом.

export default function DevPayNow({
  orderId,
  amount,
  successUrl,
  cancelUrl,
}: {
  orderId: string;
  amount: number;
  successUrl: string;
  cancelUrl: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pay = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/dev/pay/now/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) {
        setError(data.error || "Вебхук не прийняв оплату");
        setBusy(false);
        return;
      }
      window.location.href = successUrl;
    } catch {
      setError("Помилка мережі");
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div
        className="grid-bg grid-fade pointer-events-none fixed inset-0 z-0"
        aria-hidden
      />
      <main className="relative mx-auto flex min-h-screen max-w-md items-center px-4 py-10">
        <div className="w-full rounded-2xl border border-neon-pink/30 bg-surface/50 p-6 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full border border-neon-pink/30 bg-neon-pink/10">
            <i className="ph-fill ph-currency-circle-dollar text-2xl text-neon-pink" />
          </div>

          <div className="mono-label mb-2 text-neon-pink">
            {"// dev-заглушка checkout"}
          </div>
          <h1 className="mb-1 font-display text-xl font-bold text-white">
            Оплата криптою
          </h1>
          <p className="mb-5 font-mono text-xs text-gray-500">#{orderId}</p>

          <div className="mb-5 rounded-xl bg-surface2 p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-gray-400">До сплати:</span>
              <span className="font-display text-2xl font-bold text-white">
                ${amount}
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-4 flex items-center justify-center gap-2 font-mono text-sm text-neon-pink">
              <i className="ph-fill ph-warning-circle" /> {error}
            </div>
          )}

          <button
            onClick={pay}
            disabled={busy}
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon-green to-neon-blue px-6 py-4 font-display font-bold text-black transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? (
              <>
                <i className="ph-bold ph-circle-notch animate-spin" />
                Надсилаємо IPN...
              </>
            ) : (
              <>
                <i className="ph-bold ph-check-circle text-lg" />
                Оплатити
              </>
            )}
          </button>

          <a
            href={cancelUrl}
            className="block font-mono text-xs text-gray-500 transition-colors hover:text-white"
          >
            скасувати
          </a>

          <p className="mt-5 font-mono text-[11px] leading-relaxed text-gray-600">
            Надсилає підписаний IPN у справжній
            <br />
            /api/pay/now/webhook — далі продовий код.
          </p>
        </div>
      </main>
    </div>
  );
}
