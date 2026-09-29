"use client";

import { useState } from "react";
import type { PromoCode } from "@/lib/store";

export default function PromosManager({
  initialPromos,
}: {
  initialPromos: PromoCode[];
}) {
  const [promos, setPromos] = useState<PromoCode[]>(initialPromos);
  const [editing, setEditing] = useState<PromoCode | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openNew = () => {
    setIsNew(true);
    setEditing({
      code: "",
      discountType: "percent",
      discountValue: 15,
      description: "",
      minOrderAmount: 0,
      maxUses: 0,
      usedCount: 0,
      active: true,
    });
    setError(null);
  };

  const toggleActive = async (p: PromoCode) => {
    const updated = { ...p, active: !p.active };
    setPromos((prev) => prev.map((item) => (item.code === p.code ? updated : item)));
    try {
      await fetch("/api/admin/promos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promo: updated }),
      });
    } catch {
      setPromos((prev) => prev.map((item) => (item.code === p.code ? p : item)));
    }
  };

  const deleteCode = async (code: string) => {
    if (!confirm(`Видалити промокод ${code}?`)) return;
    setPromos((prev) => prev.filter((p) => p.code !== code));
    try {
      await fetch(`/api/admin/promos?code=${encodeURIComponent(code)}`, {
        method: "DELETE",
      });
    } catch {
      alert("Помилка видалення");
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const cleanCode = editing.code.trim().toUpperCase();
    if (!cleanCode) {
      setError("Вкажіть код");
      return;
    }
    if (editing.discountValue <= 0) {
      setError("Вкажіть значення знижки більше 0");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/promos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promo: {
            ...editing,
            code: cleanCode,
            minOrderAmount: Number(editing.minOrderAmount) || undefined,
            maxUses: Number(editing.maxUses) || undefined,
          },
        }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) throw new Error(data.error ?? "Помилка збереження");

      setPromos((prev) => {
        const filtered = prev.filter((p) => p.code !== cleanCode);
        return [...filtered, { ...editing, code: cleanCode }];
      });
      setEditing(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Помилка");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <i className="ph-bold ph-tag text-neon-blue" />
            Список промокодів ({promos.length})
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Керуй знижками, лімітами та активністю промокодів для клієнтів.
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neon-blue text-surface font-semibold text-sm hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)]"
        >
          <i className="ph-bold ph-plus" />
          Додати промокод
        </button>
      </div>

      {promos.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-surface/50 p-8 text-center text-gray-400">
          <i className="ph ph-tag text-3xl mb-2 text-gray-500 block" />
          Немає створених промокодів. Створіть перший для приваблення клієнтів.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {promos.map((p) => (
            <div
              key={p.code}
              className={`rounded-2xl border p-4.5 transition-all flex flex-col justify-between ${
                p.active
                  ? "border-white/15 bg-surface/80 hover:border-white/25"
                  : "border-white/5 bg-surface/30 opacity-60"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-white tracking-wider bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                      {p.code}
                    </span>
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                        p.discountType === "percent"
                          ? "bg-neon-green/10 text-neon-green border border-neon-green/30"
                          : "bg-neon-purple/10 text-neon-purple border border-neon-purple/30"
                      }`}
                    >
                      {p.discountType === "percent"
                        ? `-${p.discountValue}%`
                        : `-$${p.discountValue}`}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleActive(p)}
                    className={`text-xs font-mono px-2 py-0.5 rounded-md transition-colors ${
                      p.active
                        ? "bg-neon-green/20 text-neon-green hover:bg-neon-green/30"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    }`}
                  >
                    {p.active ? "Активний" : "Вимкнений"}
                  </button>
                </div>

                {p.description && (
                  <p className="text-xs text-gray-300 mb-3">{p.description}</p>
                )}

                <div className="space-y-1 text-[11px] font-mono text-gray-400">
                  <div className="flex justify-between">
                    <span>Використано:</span>
                    <span className="text-white">
                      {p.usedCount ?? 0}
                      {p.maxUses ? ` / ${p.maxUses}` : " (безлім)"}
                    </span>
                  </div>
                  {Boolean(p.minOrderAmount) && (
                    <div className="flex justify-between">
                      <span>Мін. сума:</span>
                      <span className="text-white">${p.minOrderAmount}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setIsNew(false);
                    setEditing({ ...p });
                    setError(null);
                  }}
                  className="px-2.5 py-1 text-xs text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  <i className="ph-bold ph-pencil-simple mr-1" /> Редагувати
                </button>
                <button
                  onClick={() => deleteCode(p.code)}
                  className="px-2.5 py-1 text-xs text-neon-pink/80 hover:text-neon-pink hover:bg-neon-pink/10 rounded-lg transition-colors"
                >
                  <i className="ph-bold ph-trash mr-1" /> Видалити
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-surface border border-white/15 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display font-bold text-lg text-white">
                {isNew ? "Новий промокод" : `Редагування ${editing.code}`}
              </h3>
              <button
                onClick={() => setEditing(null)}
                className="text-gray-400 hover:text-white"
              >
                <i className="ph-bold ph-x text-lg" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-neon-pink/10 border border-neon-pink/30 text-neon-pink text-xs font-mono">
                {error}
              </div>
            )}

            <form onSubmit={save} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">
                  Код промокоду (напр. PHOTO20, DEVQ10)
                </label>
                <input
                  type="text"
                  required
                  value={editing.code}
                  onChange={(e) =>
                    setEditing({ ...editing, code: e.target.value.toUpperCase() })
                  }
                  placeholder="PHOTO20"
                  className="w-full bg-surface2 border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono text-base uppercase outline-none focus:border-neon-blue"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">
                    Тип знижки
                  </label>
                  <select
                    value={editing.discountType}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        discountType: e.target.value as "percent" | "fixed",
                      })
                    }
                    className="w-full bg-surface2 border border-white/10 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-neon-blue"
                  >
                    <option value="percent">Відсоток (%)</option>
                    <option value="fixed">Фіксована ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">
                    Розмір знижки ({editing.discountType === "percent" ? "%" : "$"})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={editing.discountType === "percent" ? "99" : "1000"}
                    required
                    value={editing.discountValue}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        discountValue: Number(e.target.value),
                      })
                    }
                    className="w-full bg-surface2 border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono outline-none focus:border-neon-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">
                  Опис для покупця (опційно)
                </label>
                <input
                  type="text"
                  value={editing.description ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                  placeholder="Знижка 20% для фотографів"
                  className="w-full bg-surface2 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-neon-blue"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">
                    Мін. сума замовлення ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editing.minOrderAmount ?? 0}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        minOrderAmount: Number(e.target.value),
                      })
                    }
                    className="w-full bg-surface2 border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono outline-none focus:border-neon-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1">
                    Макс. використань (0 = безлім)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editing.maxUses ?? 0}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        maxUses: Number(e.target.value),
                      })
                    }
                    className="w-full bg-surface2 border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono outline-none focus:border-neon-blue"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activeToggle"
                  checked={editing.active}
                  onChange={(e) =>
                    setEditing({ ...editing, active: e.target.checked })
                  }
                  className="rounded border-white/20 bg-surface2"
                />
                <label htmlFor="activeToggle" className="text-xs text-gray-300">
                  Промокод активний та готовий до застосування
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-neon-blue text-surface font-semibold hover:brightness-110 disabled:opacity-60"
                >
                  {saving ? "Збереження..." : "Зберегти"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
