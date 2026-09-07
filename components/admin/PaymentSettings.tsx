"use client";

import { useState } from "react";

type Toggles = { jar: boolean; crypto: boolean; wfp: boolean; lemon: boolean };
type MethodKey = keyof Toggles;

const METHODS: {
  key: MethodKey;
  label: string;
  desc: string;
  icon: string;
  envHint: string;
}[] = [
  {
    key: "lemon",
    label: "Lemon Squeezy",
    desc: "Картки / Apple Pay без ФОПа (Merchant of Record). Автовидача.",
    icon: "ph-lemon",
    envHint: "LEMON_API_KEY, LEMON_STORE_ID, LEMON_VARIANT_ID",
  },
  {
    key: "jar",
    label: "Банка Monobank",
    desc: "Оплата карткою на банку. Підтвердження вручну.",
    icon: "ph-credit-card",
    envHint: "MONOBANK_JAR_URL",
  },
  {
    key: "crypto",
    label: "Крипта (NOWPayments)",
    desc: "Оплата криптою. Автовидача після підтвердження мережі.",
    icon: "ph-currency-btc",
    envHint: "NOWPAYMENTS_API_KEY",
  },
  {
    key: "wfp",
    label: "WayForPay",
    desc: "Картки / Apple Pay. Потрібен ФОП.",
    icon: "ph-wallet",
    envHint: "WAYFORPAY_MERCHANT_ACCOUNT, WAYFORPAY_MERCHANT_SECRET",
  },
];

export default function PaymentSettings({
  initialToggles,
  configured,
}: {
  initialToggles: Toggles;
  configured: Record<MethodKey, boolean>;
}) {
  const [toggles, setToggles] = useState<Toggles>(initialToggles);
  const [saving, setSaving] = useState<MethodKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  const flip = async (key: MethodKey) => {
    const next = !toggles[key];
    setToggles((t) => ({ ...t, [key]: next })); // оптимістично
    setSaving(key);
    setError(null);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: next }),
      });
      const data = (await res.json()) as { ok: boolean; toggles?: Toggles };
      if (!data.ok || !data.toggles) throw new Error();
      setToggles(data.toggles);
    } catch {
      setToggles((t) => ({ ...t, [key]: !next })); // відкат
      setError("Не вдалося зберегти. Спробуй ще раз.");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="text-sm text-neon-pink font-mono flex items-center gap-2">
          <i className="ph-fill ph-warning-circle" /> {error}
        </div>
      )}

      {METHODS.map((m) => {
        const on = toggles[m.key];
        const hasEnv = configured[m.key];
        return (
          <div
            key={m.key}
            className="flex items-start gap-4 rounded-xl border border-white/10 bg-surface/50 p-4"
          >
            <i
              className={`ph-fill ${m.icon} text-2xl mt-0.5 ${on && hasEnv ? "text-neon-blue" : "text-gray-600"}`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display font-bold text-white">
                  {m.label}
                </span>
                {!hasEnv && (
                  <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/30">
                    нема ключів
                  </span>
                )}
                {on && hasEnv && (
                  <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-neon-green/10 text-neon-green border border-neon-green/30">
                    на сайті
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400 mt-0.5">{m.desc}</p>
              {!hasEnv && (
                <p className="text-[11px] font-mono text-gray-600 mt-1">
                  env: {m.envHint}
                </p>
              )}
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={on}
              aria-label={m.label}
              disabled={saving === m.key}
              onClick={() => flip(m.key)}
              className={`relative shrink-0 w-12 h-7 rounded-full transition-colors disabled:opacity-50 ${
                on ? "bg-neon-blue" : "bg-white/15"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
                  on ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        );
      })}

      <p className="text-[11px] font-mono text-gray-600 pt-1">
        Вимкнений метод одразу зникає з форми замовлення. «Нема ключів» = метод
        не запуститься, доки не додаси змінні на Vercel і не зробиш redeploy.
      </p>
    </div>
  );
}
