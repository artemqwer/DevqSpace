"use client";

import { useState } from "react";

// Імітація банки Monobank. У проді підтвердження теж ручне (адмін тисне
// «💰 Оплачено» в Telegram) — тут та сама дія, тільки без Telegram.

export default function DevPayJar({
  orderId,
  amountUah,
  priceUsd,
  productTitle,
  alreadyPaid,
}: {
  orderId: string;
  amountUah: number;
  priceUsd: number;
  productTitle: string;
  alreadyPaid: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(alreadyPaid);
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/dev/pay/jar/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) {
        setError(data.error || "Не вдалося підтвердити");
        setBusy(false);
        return;
      }
      setDone(true);
    } catch {
      setError("Помилка мережі");
    } finally {
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
            <i className="ph-fill ph-credit-card text-2xl text-neon-pink" />
          </div>

          <div className="mono-label mb-2 text-neon-pink">
            {"// dev-заглушка банки"}
          </div>
          <h1 className="mb-1 font-display text-xl font-bold text-white">
            {productTitle}
          </h1>
          <p className="mb-5 font-mono text-xs text-gray-500">#{orderId}</p>

          <div className="mb-5 rounded-xl bg-surface2 p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-gray-400">До сплати:</span>
              <span className="font-display text-2xl font-bold text-white">
                {amountUah} грн
              </span>
            </div>
            <div className="mt-1 text-left font-mono text-xs text-gray-500">
              ≈ ${priceUsd}
            </div>
          </div>

          {error && (
            <div className="mb-4 flex items-center justify-center gap-2 font-mono text-sm text-neon-pink">
              <i className="ph-fill ph-warning-circle" /> {error}
            </div>
          )}

          {done ? (
            <div className="rounded-xl border border-neon-green/30 bg-neon-green/10 px-6 py-4 font-display font-bold text-neon-green">
              <i className="ph-fill ph-check-circle mr-1" />
              Оплату підтверджено — товар видано
            </div>
          ) : (
            <button
              onClick={confirm}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-neon-green px-6 py-4 font-display font-bold text-black transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (
                <>
                  <i className="ph-bold ph-circle-notch animate-spin" />
                  Підтверджуємо...
                </>
              ) : (
                <>
                  <i className="ph-bold ph-check text-lg" />
                  Підтвердити оплату (за адміна)
                </>
              )}
            </button>
          )}

          <p className="mt-5 font-mono text-[11px] leading-relaxed text-gray-600">
            У проді цю кнопку тисне адмін
            <br />у Telegram після надходження на банку.
          </p>
        </div>
      </main>
    </div>
  );
}
