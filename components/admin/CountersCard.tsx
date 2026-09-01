"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { roundCounter } from "@/lib/products";
import type { SiteCounters } from "@/lib/store";

// «30+ продуктів · 320+ клієнтів» у шапці сайту й на «Про нас». Реальні числа
// рахуються самі, адмін лише додає те, що сталося поза сайтом.

const INPUT_CLS =
  "w-24 bg-surface2 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-neon-blue/50 focus:outline-none";

export default function CountersCard({ counters }: { counters: SiteCounters }) {
  const router = useRouter();
  const [products, setProducts] = useState(String(counters.offline.products));
  const [clients, setClients] = useState(String(counters.offline.clients));
  const [saving, setSaving] = useState(false);

  const num = (v: string) => Math.max(0, Math.floor(Number(v) || 0));
  const dirty =
    num(products) !== counters.offline.products ||
    num(clients) !== counters.offline.clients;

  const save = async () => {
    setSaving(true);
    await fetch("/api/admin/counters", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ products: num(products), clients: num(clients) }),
    });
    setSaving(false);
    router.refresh();
  };

  const row = (
    label: string,
    real: number,
    value: string,
    onChange: (v: string) => void,
    total: number,
  ) => (
    <div className="flex flex-wrap items-center gap-3">
      <span className="w-24 text-sm text-gray-400">{label}</span>
      <span className="font-mono text-xs text-gray-600">реальних {real}</span>
      <span className="font-mono text-xs text-gray-600">+</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={INPUT_CLS}
        title="Скільки додати до реальних"
      />
      <span className="font-mono text-xs text-gray-600">
        = на сайті{" "}
        <span className="text-white">
          {roundCounter(total) > 0 ? `${roundCounter(total)}+` : "не показуємо"}
        </span>
      </span>
    </div>
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-surface/50 p-4 md:p-5 space-y-4">
      <div>
        <div className="text-sm font-display font-bold text-white">
          Числа в шапці сайту
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Реальні рахуються самі: товари — з каталогу, клієнти — унікальні
          покупці серед оплачених замовлень. У друге поле впишіть те, що було
          поза сайтом (продажі в Telegram, знайомим). На сайті число
          округлюється вниз до кратного п&apos;яти й показується як «30+» —
          менше за 5 не показуємо взагалі, бо «2 клієнти» гірше за нічого.
        </p>
      </div>

      <div className="space-y-2">
        {row(
          "Товарів",
          counters.realProducts,
          products,
          setProducts,
          counters.realProducts + num(products),
        )}
        {row(
          "Клієнтів",
          counters.realClients,
          clients,
          setClients,
          counters.realClients + num(clients),
        )}
      </div>

      <button
        onClick={save}
        disabled={!dirty || saving}
        className="flex items-center gap-2 rounded-lg bg-neon-blue px-4 py-2 font-display text-sm font-bold text-black transition-transform active:scale-[0.98] disabled:opacity-40"
      >
        <i
          className={`ph-bold ${saving ? "ph-circle-notch animate-spin" : "ph-floppy-disk"}`}
        />
        Зберегти
      </button>
    </div>
  );
}
