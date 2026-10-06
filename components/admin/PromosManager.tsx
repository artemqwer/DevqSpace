"use client";

import { useState } from "react";
import type { PromoCode, PromoCodeType } from "@/lib/store";

type ProductOption = {
  slug: string;
  title: string;
  price: number;
};

export default function PromosManager({
  initialPromos,
  availableProducts = [],
}: {
  initialPromos: PromoCode[];
  availableProducts?: ProductOption[];
}) {
  const [promos, setPromos] = useState<PromoCode[]>(initialPromos);
  const [editing, setEditing] = useState<PromoCode | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Форматування дати в рядок для input[type="date"]
  const tsToDateInput = (ts?: number) => {
    if (!ts) return "";
    const d = new Date(ts);
    return d.toISOString().slice(0, 10);
  };

  const dateInputToTs = (val: string, endOfDay = false) => {
    if (!val) return undefined;
    const d = new Date(val);
    if (isNaN(d.getTime())) return undefined;
    if (endOfDay) {
      d.setHours(23, 59, 59, 999);
    } else {
      d.setHours(0, 0, 0, 0);
    }
    return d.getTime();
  };

  const openNew = () => {
    setIsNew(true);
    setEditing({
      code: "",
      promoType: "discount",
      discountType: "percent",
      discountValue: 15,
      description: "",
      minOrderAmount: 0,
      maxUses: 0,
      usedCount: 0,
      active: true,
      applicableSlugs: [],
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

    const pType = editing.promoType || "discount";
    if (pType === "discount" && editing.discountValue <= 0) {
      setError("Вкажіть значення знижки більше 0");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payloadPromo: PromoCode = {
        ...editing,
        code: cleanCode,
        promoType: pType,
        discountValue:
          pType === "free_setup" ? 39 : pType === "free_hosting" ? 15 : editing.discountValue,
        minOrderAmount: Number(editing.minOrderAmount) || undefined,
        maxUses: Number(editing.maxUses) || undefined,
        applicableSlugs:
          editing.applicableSlugs && editing.applicableSlugs.length > 0
            ? editing.applicableSlugs
            : undefined,
      };

      const res = await fetch("/api/admin/promos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promo: payloadPromo }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) throw new Error(data.error ?? "Помилка збереження");

      setPromos((prev) => {
        const filtered = prev.filter((p) => p.code !== cleanCode);
        return [...filtered, payloadPromo];
      });
      setEditing(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Помилка");
    } finally {
      setSaving(false);
    }
  };

  const isExpired = (p: PromoCode) => p.expiresAt && Date.now() > p.expiresAt;
  const isPending = (p: PromoCode) => p.startsAt && Date.now() < p.startsAt;
  const isUsedUp = (p: PromoCode) => Boolean(p.maxUses && (p.usedCount ?? 0) >= p.maxUses);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <i className="ph-bold ph-tag text-neon-blue" />
            Список промокодів ({promos.length})
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Керуй знижками, безкоштовними послугами, періодом дії та обмеженнями за товарами.
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
          {promos.map((p) => {
            const expired = isExpired(p);
            const pending = isPending(p);
            const exhausted = isUsedUp(p);
            const effectivelyActive = p.active && !expired && !pending && !exhausted;

            return (
              <div
                key={p.code}
                className={`rounded-2xl border p-4.5 transition-all flex flex-col justify-between ${
                  effectivelyActive
                    ? "border-white/15 bg-surface/80 hover:border-white/25"
                    : "border-white/5 bg-surface/30 opacity-60"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-base text-white tracking-wider bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                        {p.code}
                      </span>
                      {p.promoType === "free_setup" ? (
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-neon-green/10 text-neon-green border border-neon-green/30">
                          Встановлення ($39)
                        </span>
                      ) : p.promoType === "free_hosting" ? (
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-neon-purple/10 text-neon-purple border border-neon-purple/30">
                          Хостинг ($15)
                        </span>
                      ) : (
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
                      )}
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

                  <div className="space-y-1.5 text-[11px] font-mono text-gray-400">
                    <div className="flex justify-between">
                      <span>Використано:</span>
                      <span className={exhausted ? "text-neon-pink font-bold" : "text-white"}>
                        {p.usedCount ?? 0}
                        {p.maxUses ? ` / ${p.maxUses}` : " (безлім)"}
                      </span>
                    </div>

                    {(p.startsAt || p.expiresAt) && (
                      <div className="flex justify-between items-center text-[10px]">
                        <span>Період:</span>
                        <span
                          className={
                            expired
                              ? "text-neon-pink"
                              : pending
                                ? "text-yellow-400"
                                : "text-gray-300"
                          }
                        >
                          {p.startsAt ? new Date(p.startsAt).toLocaleDateString("uk-UA") : "—"} до{" "}
                          {p.expiresAt ? new Date(p.expiresAt).toLocaleDateString("uk-UA") : "∞"}
                        </span>
                      </div>
                    )}

                    {Boolean(p.minOrderAmount) && (
                      <div className="flex justify-between">
                        <span>Мін. чек:</span>
                        <span className="text-white">${p.minOrderAmount}</span>
                      </div>
                    )}

                    {p.applicableSlugs && p.applicableSlugs.length > 0 && (
                      <div className="flex justify-between items-center">
                        <span>Обмеження:</span>
                        <span className="text-neon-blue truncate max-w-[140px]" title={p.applicableSlugs.join(", ")}>
                          {p.applicableSlugs.length} {p.applicableSlugs.length === 1 ? "товар" : "товарів"}
                        </span>
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
            );
          })}
        </div>
      )}

      {/* MODAL */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-surface border border-white/15 rounded-2xl p-6 shadow-2xl space-y-4 my-8">
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
                  Код промокоду (напр. PHOTO20, DEVQ10, FREESETUP)
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

              {/* ТИП ПРОМОКОДУ */}
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">
                  Тип промокоду
                </label>
                <select
                  value={editing.promoType || "discount"}
                  onChange={(e) => {
                    const nextType = e.target.value as PromoCodeType;
                    setEditing({
                      ...editing,
                      promoType: nextType,
                      discountValue:
                        nextType === "free_setup" ? 39 : nextType === "free_hosting" ? 15 : editing.discountValue,
                    });
                  }}
                  className="w-full bg-surface2 border border-white/10 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-neon-blue"
                >
                  <option value="discount">Знижка на товар (% або $)</option>
                  <option value="free_setup">Послуга: Встановлення під ключ (безкоштовно $39)</option>
                  <option value="free_hosting">Послуга: VPS хостинг на 1 міс (безкоштовно $15)</option>
                </select>
              </div>

              {/* РОЗМІР ЗНИЖКИ (ЯКЩО ТИП "discount") */}
              {(editing.promoType || "discount") === "discount" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1">
                      Формат знижки
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
              )}

              {/* ПЕРІОД ДІЇ (ДАТА ВІД І ДО) */}
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">
                  Період дії промокоду (опційно)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-gray-500 font-mono block mb-1">Початок від:</span>
                    <input
                      type="date"
                      value={tsToDateInput(editing.startsAt)}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          startsAt: dateInputToTs(e.target.value, false),
                        })
                      }
                      className="w-full bg-surface2 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs outline-none focus:border-neon-blue"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-500 font-mono block mb-1">Завершення до:</span>
                    <input
                      type="date"
                      value={tsToDateInput(editing.expiresAt)}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          expiresAt: dateInputToTs(e.target.value, true),
                        })
                      }
                      className="w-full bg-surface2 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs outline-none focus:border-neon-blue"
                    />
                  </div>
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
                  placeholder="Знижка 20% або безкоштовне налаштування"
                  className="w-full bg-surface2 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-neon-blue"
                />
              </div>

              {/* ЛІМІТИ ТА МІН СУМА */}
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

              {/* ОБМЕЖЕННЯ ЗА ТОВАРАМИ */}
              {availableProducts.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-mono text-gray-400">
                      Обмеження: застосовувати лише до обраних товарів
                    </label>
                    {editing.applicableSlugs && editing.applicableSlugs.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setEditing({ ...editing, applicableSlugs: [] })}
                        className="text-[11px] font-mono text-neon-pink hover:underline"
                      >
                        Скинути (діє на всі)
                      </button>
                    )}
                  </div>
                  <div className="max-h-36 overflow-y-auto border border-white/10 bg-surface2/60 rounded-xl p-2 space-y-1.5 custom-scrollbar text-xs">
                    {availableProducts.map((prod) => {
                      const isSelected = editing.applicableSlugs?.includes(prod.slug) ?? false;
                      return (
                        <label
                          key={prod.slug}
                          className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer text-gray-300"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const cur = editing.applicableSlugs ?? [];
                              if (e.target.checked) {
                                setEditing({ ...editing, applicableSlugs: [...cur, prod.slug] });
                              } else {
                                setEditing({
                                  ...editing,
                                  applicableSlugs: cur.filter((s) => s !== prod.slug),
                                });
                              }
                            }}
                            className="rounded border-white/20 bg-surface"
                          />
                          <span className="truncate flex-1 font-sans">{prod.title}</span>
                          <span className="font-mono text-gray-500">${prod.price}</span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="text-[11px] font-mono text-gray-500 mt-1">
                    Якщо нічого не обрано — промокод діє на весь асортимент.
                  </p>
                </div>
              )}

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
