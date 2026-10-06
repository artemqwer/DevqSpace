"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteSettings } from "@/lib/settings";

const INPUT_CLS =
  "w-full bg-surface2 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:border-neon-blue focus:outline-none transition-colors";

export default function AnnouncementsManager({
  settings,
}: {
  settings: SiteSettings;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    announcementEnabled: settings.announcementEnabled,
    announcementText: settings.announcementText || "",
    announcementMode: settings.announcementMode || "marquee",
    announcementBg: settings.announcementBg || "gradient",
    announcementLink: settings.announcementLink || "",
    announcementLinkText: settings.announcementLinkText || "",
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          announcementEnabled: form.announcementEnabled,
          announcementText: form.announcementText.trim(),
          announcementMode: form.announcementMode,
          announcementBg: form.announcementBg,
          announcementLink: form.announcementLink.trim(),
          announcementLinkText: form.announcementLinkText.trim(),
        }),
      });

      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Помилка збереження");

      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Помилка збереження");
    } finally {
      setSaving(false);
    }
  };

  const bgClasses: Record<SiteSettings["announcementBg"], string> = {
    gradient: "bg-gradient-to-r from-neon-blue/20 via-neon-purple/20 to-neon-pink/20 border-white/20 text-white",
    "neon-blue": "bg-neon-blue/15 border-neon-blue/40 text-neon-blue",
    "neon-purple": "bg-neon-purple/15 border-neon-purple/40 text-neon-purple",
    "neon-pink": "bg-neon-pink/15 border-neon-pink/40 text-neon-pink",
    surface: "bg-surface2 border-white/10 text-gray-200",
  };

  return (
    <div className="space-y-6">
      {/* Live Preview */}
      <div className="rounded-2xl border border-white/10 bg-surface/50 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <i className="ph-bold ph-eye text-neon-blue" /> Live Попередній перегляд (як виглядає в хедері)
          </span>
          <span
            className={`text-xs font-mono px-2 py-0.5 rounded-full ${
              form.announcementEnabled
                ? "bg-neon-green/10 text-neon-green border border-neon-green/30"
                : "bg-gray-800 text-gray-400 border border-white/10"
            }`}
          >
            {form.announcementEnabled ? "Увімкнено на сайті" : "Вимкнено"}
          </span>
        </div>

        {form.announcementText ? (
          <div
            className={`rounded-xl border px-4 py-2 text-xs md:text-sm font-medium overflow-hidden transition-all ${
              bgClasses[form.announcementMode ? form.announcementBg : "gradient"]
            }`}
          >
            {form.announcementMode === "marquee" ? (
              <div className="relative flex overflow-x-hidden">
                <div className="animate-marquee whitespace-nowrap flex items-center gap-6">
                  <span>{form.announcementText}</span>
                  {form.announcementLink && (
                    <span className="underline font-bold">
                      {form.announcementLinkText || "Детальніше →"}
                    </span>
                  )}
                  <span>•</span>
                  <span>{form.announcementText}</span>
                  {form.announcementLink && (
                    <span className="underline font-bold">
                      {form.announcementLinkText || "Детальніше →"}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-center flex-wrap">
                <span>{form.announcementText}</span>
                {form.announcementLink && (
                  <span className="underline font-bold hover:opacity-80">
                    {form.announcementLinkText || "Детальніше →"}
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 text-center text-xs text-gray-500 font-mono border border-dashed border-white/10 rounded-xl">
            Введіть текст оголошення для попереднього перегляду
          </div>
        )}
      </div>

      {/* Settings Form */}
      <form onSubmit={save} className="rounded-2xl border border-white/10 bg-surface/80 p-6 space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <i className="ph-bold ph-megaphone text-neon-blue" />
              Параметри оголошення
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Показується зверху сторінки над головним меню на всіх сторінках сайту.
            </p>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <span className="text-xs font-mono text-gray-300">Показувати оголошення:</span>
            <input
              type="checkbox"
              checked={form.announcementEnabled}
              onChange={(e) => setForm({ ...form, announcementEnabled: e.target.checked })}
              className="w-5 h-5 rounded border-white/20 bg-surface2 text-neon-blue focus:ring-0 cursor-pointer"
            />
          </label>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-neon-pink/10 border border-neon-pink/30 text-neon-pink text-xs font-mono">
            {error}
          </div>
        )}

        {saved && (
          <div className="p-3 rounded-xl bg-neon-green/10 border border-neon-green/30 text-neon-green text-xs font-mono">
            ✓ Налаштування успішно збережено та оновлено на сайті!
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">
              Текст оголошення *
            </label>
            <input
              type="text"
              required
              value={form.announcementText}
              onChange={(e) => setForm({ ...form, announcementText: e.target.value })}
              placeholder="🔥 Знижка 20% на всі Telegram-боти за промокодом PHOTO20!"
              className={INPUT_CLS}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">
                Тип відображення (як у Luminex)
              </label>
              <select
                value={form.announcementMode}
                onChange={(e) =>
                  setForm({
                    ...form,
                    announcementMode: e.target.value as "static" | "marquee",
                  })
                }
                className={INPUT_CLS}
              >
                <option value="marquee">Бегущий рядок (анімований Marquee)</option>
                <option value="static">Статичний банер (по центру)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">
                Колірна тема банера
              </label>
              <select
                value={form.announcementBg}
                onChange={(e) =>
                  setForm({
                    ...form,
                    announcementBg: e.target.value as SiteSettings["announcementBg"],
                  })
                }
                className={INPUT_CLS}
              >
                <option value="gradient">Неоновий градієнт (Blue / Purple / Pink)</option>
                <option value="neon-blue">Неоновий синій (Blue glow)</option>
                <option value="neon-purple">Неоновий фіолетовий (Purple glow)</option>
                <option value="neon-pink">Неоновий рожевий (Pink glow)</option>
                <option value="surface">Мінімалістичний темний (Dark surface)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">
                Посилання кнопки / дії (опційно)
              </label>
              <input
                type="text"
                value={form.announcementLink}
                onChange={(e) => setForm({ ...form, announcementLink: e.target.value })}
                placeholder="/catalog або /custom або https://t.me/..."
                className={INPUT_CLS}
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">
                Текст посилання (опційно)
              </label>
              <input
                type="text"
                value={form.announcementLinkText}
                onChange={(e) => setForm({ ...form, announcementLinkText: e.target.value })}
                placeholder="До каталогу →"
                className={INPUT_CLS}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <p className="text-xs text-gray-500 font-mono">
            Зміни набувають чинності миттєво після збереження.
          </p>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neon-blue text-surface font-semibold text-sm hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] disabled:opacity-60"
          >
            <i className="ph-bold ph-floppy-disk" />
            {saving ? "Збереження..." : "Зберегти налаштування"}
          </button>
        </div>
      </form>
    </div>
  );
}
