"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Flat = Record<string, string>;
type Locale = "uk" | "en";
type ByLocale<T> = Record<Locale, T>;

// Розділи беруться з messages/*.json — тут лише людські назви й порядок.
// Немає назви — показуємо технічний ключ, розділ усе одно редагується.
const SECTION_LABEL: Record<string, string> = {
  nav: "Меню",
  hero: "Головний екран",
  trust: "Довіра",
  categories: "Категорії (блок)",
  top: "Топ товарів",
  process: "Як працюємо",
  cases: "Кейси (блок)",
  guarantee: "Гарантії",
  finalCta: "Заклик наприкінці",
  footer: "Підвал",
  mobile: "Мобільне меню",
  cat: "Назви категорій",
  catalog: "Каталог",
  product: "Сторінка товару",
  custom: "Замовлення під ключ",
  customForm: "Форма під ключ",
  order: "Оформлення",
  orderForm: "Форма замовлення",
  success: "Сторінка «Дякуємо»",
  casesPage: "Сторінка кейсів",
  about: "Про нас",
  homeCases: "Кейси на головній",
};

const INPUT_CLS =
  "w-full bg-surface2 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-neon-blue/50 focus:outline-none transition-colors";

export default function ContentEditor({
  defaults,
  overrides,
}: {
  defaults: ByLocale<Flat>;
  overrides: ByLocale<Flat>;
}) {
  const router = useRouter();

  // Поточний текст = дефолт, перекритий правкою. Правимо саме його.
  const initial = useMemo<ByLocale<Flat>>(
    () => ({
      uk: { ...defaults.uk, ...overrides.uk },
      en: { ...defaults.en, ...overrides.en },
    }),
    [defaults, overrides],
  );

  const [values, setValues] = useState<ByLocale<Flat>>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const sections = useMemo(
    () => [...new Set(Object.keys(defaults.uk).map((k) => k.split(".")[0]))],
    [defaults.uk],
  );
  const [section, setSection] = useState(sections[0] ?? "");

  const isChanged = (key: string, locale: Locale) =>
    values[locale][key] !== defaults[locale][key];

  const dirty = useMemo(() => {
    const keys = new Set<string>();
    for (const locale of ["uk", "en"] as Locale[]) {
      for (const key of Object.keys(defaults[locale])) {
        if (values[locale][key] !== initial[locale][key]) keys.add(key);
      }
    }
    return keys;
  }, [values, initial, defaults]);

  // Скільки правок узагалі є в розділі — щоб було видно, де щось міняли.
  const changedInSection = (name: string) =>
    Object.keys(defaults.uk).filter(
      (k) =>
        k.startsWith(`${name}.`) && (isChanged(k, "uk") || isChanged(k, "en")),
    ).length;

  const visibleKeys = useMemo(() => {
    const q = query.trim().toLowerCase();
    const keys = Object.keys(defaults.uk);
    if (q) {
      return keys.filter(
        (k) =>
          k.toLowerCase().includes(q) ||
          defaults.uk[k].toLowerCase().includes(q) ||
          defaults.en[k].toLowerCase().includes(q),
      );
    }
    return keys.filter((k) => k.startsWith(`${section}.`));
  }, [query, section, defaults]);

  const setValue = (locale: Locale, key: string, value: string) =>
    setValues((prev) => ({
      ...prev,
      [locale]: { ...prev[locale], [key]: value },
    }));

  const resetKey = (key: string) =>
    setValues((prev) => ({
      uk: { ...prev.uk, [key]: defaults.uk[key] },
      en: { ...prev.en, [key]: defaults.en[key] },
    }));

  const save = async () => {
    if (!dirty.size) return;
    setSaving(true);
    setError(null);
    for (const locale of ["uk", "en"] as Locale[]) {
      const payload: Flat = {};
      for (const key of dirty) payload[key] = values[locale][key];
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, values: payload }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(data?.error ?? "Не вдалося зберегти");
        setSaving(false);
        return;
      }
    }
    setSaving(false);
    router.refresh();
  };

  const resetAll = async () => {
    if (!confirm("Скинути ВСІ правки текстів і повернути початкові?")) return;
    setSaving(true);
    await Promise.all(
      (["uk", "en"] as Locale[]).map((l) =>
        fetch(`/api/admin/content?locale=${l}`, { method: "DELETE" }),
      ),
    );
    setValues({ uk: { ...defaults.uk }, en: { ...defaults.en } });
    setSaving(false);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <i className="ph ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Пошук за текстом або ключем…"
            className={`${INPUT_CLS} pl-9`}
          />
        </div>
        <button
          onClick={save}
          disabled={!dirty.size || saving}
          className="flex items-center gap-2 rounded-lg bg-neon-blue px-4 py-2 font-display text-sm font-bold text-black transition-transform active:scale-[0.98] disabled:opacity-40"
        >
          <i className={`ph-bold ${saving ? "ph-circle-notch animate-spin" : "ph-floppy-disk"}`} />
          Зберегти{dirty.size > 0 ? ` (${dirty.size})` : ""}
        </button>
        <button
          onClick={resetAll}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-surface2 px-3 py-2 font-mono text-xs text-gray-400 transition-colors hover:border-neon-pink/30 hover:text-neon-pink disabled:opacity-40"
        >
          <i className="ph-bold ph-arrow-counter-clockwise" />
          Скинути все
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-neon-pink/30 bg-neon-pink/10 px-3 py-2 text-sm text-neon-pink">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-[200px_1fr]">
        <nav className="flex gap-1 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
          {sections.map((name) => {
            const count = changedInSection(name);
            const active = !query && name === section;
            return (
              <button
                key={name}
                onClick={() => {
                  setQuery("");
                  setSection(name);
                }}
                className={`flex shrink-0 items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-colors md:shrink ${
                  active
                    ? "border-neon-blue/30 bg-neon-blue/10 text-neon-blue"
                    : "border-transparent text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="truncate">{SECTION_LABEL[name] ?? name}</span>
                {count > 0 && (
                  <span className="shrink-0 rounded bg-neon-purple/20 px-1.5 font-mono text-[10px] text-neon-purple">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="space-y-3">
          {visibleKeys.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-surface/50 p-8 text-center font-mono text-sm text-gray-500">
              Нічого не знайдено
            </div>
          )}

          {visibleKeys.map((key) => {
            const changed = isChanged(key, "uk") || isChanged(key, "en");
            // Довгий текст зручніше правити в кілька рядків.
            const long = defaults.uk[key].length > 70;
            return (
              <div
                key={key}
                className={`rounded-xl border bg-surface/50 p-3 ${
                  changed ? "border-neon-purple/30" : "border-white/10"
                }`}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-mono text-[11px] text-gray-500">
                    {key}
                  </span>
                  {changed && (
                    <>
                      <span className="rounded bg-neon-purple/20 px-1.5 font-mono text-[10px] text-neon-purple">
                        змінено
                      </span>
                      <button
                        onClick={() => resetKey(key)}
                        className="font-mono text-[10px] text-gray-500 hover:text-neon-pink"
                        title={`Початковий текст: ${defaults.uk[key]}`}
                      >
                        скинути
                      </button>
                    </>
                  )}
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {(["uk", "en"] as Locale[]).map((locale) => (
                    <label key={locale} className="block">
                      <span className="mb-1 block font-mono text-[10px] uppercase text-gray-600">
                        {locale}
                      </span>
                      {long ? (
                        <textarea
                          rows={3}
                          value={values[locale][key]}
                          onChange={(e) => setValue(locale, key, e.target.value)}
                          className={`${INPUT_CLS} resize-y`}
                        />
                      ) : (
                        <input
                          value={values[locale][key]}
                          onChange={(e) => setValue(locale, key, e.target.value)}
                          className={INPUT_CLS}
                        />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
