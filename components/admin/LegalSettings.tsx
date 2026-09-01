"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteSettings } from "@/lib/settings";

const INPUT_CLS =
  "w-full bg-surface2 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-neon-blue/50 focus:outline-none transition-colors";

// Поля, без яких документ юридично порожній. Поки хоч одне не заповнене —
// попереджаємо, але не блокуємо: власник може хотіти подивитись, як це
// виглядає, до отримання реквізитів.
const REQUIRED: (keyof SiteSettings)[] = [
  "entityName",
  "edrpou",
  "supportEmail",
];

const FIELDS: {
  key: keyof SiteSettings;
  label: string;
  placeholder: string;
  hint?: string;
}[] = [
  { key: "entityType", label: "Форма", placeholder: "ФОП або ТОВ" },
  {
    key: "entityName",
    label: "Назва / ПІБ",
    placeholder: "Жосан Артем Сергійович",
    hint: "Як у виписці — саме це піде в оферту",
  },
  { key: "edrpou", label: "ЄДРПОУ / РНОКПП", placeholder: "1234567890" },
  {
    key: "address",
    label: "Адреса",
    placeholder: "м. Київ, вул. Прикладна, 1",
    hint: "Юридична адреса реєстрації",
  },
  {
    key: "supportEmail",
    label: "Email підтримки",
    placeholder: "support@devq.space",
    hint: "Показується у футері та в документах",
  },
  { key: "supportPhone", label: "Телефон", placeholder: "+380 67 123 45 67" },
  {
    key: "workHours",
    label: "Графік підтримки",
    placeholder: "Пн–Пт, 10:00–19:00 (Київ)",
  },
  {
    key: "supportTelegram",
    label: "Telegram підтримки",
    placeholder: "@devq_support",
    hint: "Куди ведуть кнопки «Написати в Telegram». Порожньо — візьмемо юзернейм бота",
  },
];

export default function LegalSettings({
  settings,
}: {
  settings: SiteSettings;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      FIELDS.map((f) => [f.key, String(settings[f.key] ?? "")]),
    ),
  );
  const [enabled, setEnabled] = useState(settings.legalEnabled);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const missing = REQUIRED.filter((k) => !values[k]?.trim());

  const save = async () => {
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, legalEnabled: enabled }),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {/* Тумблер публікації */}
      <div
        className={`rounded-2xl border p-4 md:p-5 ${
          enabled
            ? "border-neon-green/30 bg-neon-green/5"
            : "border-white/10 bg-surface/50"
        }`}
      >
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-neon-green"
          />
          <span>
            <span className="block text-sm font-display font-bold text-white">
              Публікувати юридичні сторінки
            </span>
            <span className="mt-1 block text-xs text-gray-500">
              Поки вимкнено — /terms, /privacy і /refund віддають 404, посилань
              у футері немає. Вмикайте, коли реквізити нижче заповнені.
            </span>
          </span>
        </label>

        {enabled && missing.length > 0 && (
          <p className="mt-3 flex items-start gap-2 rounded-lg border border-neon-pink/30 bg-neon-pink/10 px-3 py-2 text-xs text-neon-pink">
            <i className="ph-bold ph-warning-circle mt-0.5" />
            <span>
              Не заповнено: {missing.join(", ")}. Документ опублікується з
              заглушками на кшталт [ЄДРПОУ] — юридичної сили він так не має.
            </span>
          </p>
        )}
      </div>

      {/* Реквізити */}
      <div className="rounded-2xl border border-white/10 bg-surface/50 p-4 md:p-5 space-y-4">
        <div>
          <div className="text-sm font-display font-bold text-white">
            Реквізити та контакти
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Підставляються в тексти документів і у футер. Тексти самих
            документів редагуються нижче.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <label key={f.key} className="block">
              <span className="mb-1 block font-mono text-[10px] uppercase text-gray-600">
                {f.label}
              </span>
              <input
                value={values[f.key] ?? ""}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [f.key]: e.target.value }))
                }
                placeholder={f.placeholder}
                className={INPUT_CLS}
              />
              {f.hint && (
                <span className="mt-1 block text-[11px] text-gray-600">
                  {f.hint}
                </span>
              )}
            </label>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-neon-blue px-4 py-2 font-display text-sm font-bold text-black transition-transform active:scale-[0.98] disabled:opacity-40"
          >
            <i
              className={`ph-bold ${saving ? "ph-circle-notch animate-spin" : "ph-floppy-disk"}`}
            />
            Зберегти
          </button>
          {saved && !saving && (
            <span className="font-mono text-xs text-neon-green">збережено</span>
          )}
          {enabled && (
            <div className="ml-auto flex gap-3 font-mono text-xs">
              {[
                ["/terms", "оферта"],
                ["/privacy", "конфіденційність"],
                ["/refund", "повернення"],
              ].map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-neon-blue"
                >
                  {label} ↗
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
