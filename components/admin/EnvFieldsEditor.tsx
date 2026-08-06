"use client";

import { useState } from "react";
import type { EnvField, EnvFieldType } from "@/lib/products";
import { parseEnvExample, normalizeEnvKey, MAX_ENV_FIELDS } from "@/lib/productInput";

const TYPES: { id: EnvFieldType; label: string }[] = [
  { id: "text", label: "Текст" },
  { id: "telegram_token", label: "Telegram-токен" },
  { id: "secret", label: "Секрет" },
  { id: "number", label: "Число" },
  { id: "url", label: "URL" },
];

const inputCls =
  "w-full bg-surface2 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-neon-blue/50 transition-colors text-sm";

export default function EnvFieldsEditor({
  fields,
  onChange,
}: {
  fields: EnvField[];
  onChange: (fields: EnvField[]) => void;
}) {
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");

  const update = (i: number, patch: Partial<EnvField>) => {
    onChange(fields.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  };

  const add = () => {
    if (fields.length >= MAX_ENV_FIELDS) return;
    onChange([
      ...fields,
      { key: "", label: "", type: "text", required: true },
    ]);
  };

  const remove = (i: number) => onChange(fields.filter((_, idx) => idx !== i));

  const doImport = () => {
    const parsed = parseEnvExample(importText);
    if (!parsed.length) return;
    // Уже наявні ключі не чіпаємо — додаємо лише нові.
    const have = new Set(fields.map((f) => f.key));
    onChange([...fields, ...parsed.filter((f) => !have.has(f.key))]);
    setImportText("");
    setImportOpen(false);
  };

  return (
    <div className="space-y-3">
      {fields.length === 0 && !importOpen && (
        <p className="text-xs font-mono text-gray-600">
          Полів немає — товар видається як звичайний ZIP, без збірки під клієнта.
        </p>
      )}

      {fields.map((field, i) => (
        <div
          key={i}
          className="rounded-lg border border-white/10 bg-surface2/50 p-3 space-y-2"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              value={field.key}
              onChange={(e) =>
                update(i, { key: normalizeEnvKey(e.target.value) })
              }
              className={inputCls + " font-mono"}
              placeholder="BOT_TOKEN"
              aria-label="Ключ .env"
            />
            <input
              value={field.label}
              onChange={(e) => update(i, { label: e.target.value })}
              className={inputCls}
              placeholder="Токен Telegram-бота"
              aria-label="Підпис поля"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <select
              value={field.type}
              onChange={(e) =>
                update(i, { type: e.target.value as EnvFieldType })
              }
              className={inputCls}
              aria-label="Тип поля"
            >
              {TYPES.map((t) => (
                <option key={t.id} value={t.id} className="bg-surface2">
                  {t.label}
                </option>
              ))}
            </select>
            <input
              value={field.placeholder ?? ""}
              onChange={(e) => update(i, { placeholder: e.target.value })}
              className={inputCls}
              placeholder="Підказка в полі (placeholder)"
              aria-label="Placeholder"
            />
          </div>

          <input
            value={field.hint ?? ""}
            onChange={(e) => update(i, { hint: e.target.value })}
            className={inputCls}
            placeholder="Пояснення під полем і коментар у .env"
            aria-label="Підказка"
          />

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-mono text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => update(i, { required: e.target.checked })}
                className="accent-neon-blue"
              />
              обов&apos;язкове
            </label>
            <button
              type="button"
              onClick={() => remove(i)}
              className="ml-auto text-xs font-mono text-gray-500 hover:text-neon-pink transition-colors"
            >
              прибрати
            </button>
          </div>
        </div>
      ))}

      {importOpen && (
        <div className="rounded-lg border border-neon-blue/30 bg-surface2/50 p-3 space-y-2">
          <p className="text-xs font-mono text-gray-400">
            Вставте вміст .env.example із шаблону — розберемо на поля.
          </p>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={7}
            className={inputCls + " resize-y font-mono text-xs"}
            placeholder={"# Токен бота від @BotFather\nBOT_TOKEN=123456:ABC-DEF\nADMIN_CHAT_ID=123456789"}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={doImport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neon-blue/30 bg-neon-blue/10 text-neon-blue text-xs font-mono"
            >
              <i className="ph-bold ph-magic-wand" /> Розібрати
            </button>
            <button
              type="button"
              onClick={() => setImportOpen(false)}
              className="text-xs font-mono text-gray-500 hover:text-white transition-colors"
            >
              скасувати
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={add}
          disabled={fields.length >= MAX_ENV_FIELDS}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface2 border border-white/10 text-gray-300 text-xs font-mono hover:border-neon-blue/40 transition-colors disabled:opacity-40"
        >
          <i className="ph-bold ph-plus" /> Додати поле
        </button>
        {!importOpen && (
          <button
            type="button"
            onClick={() => setImportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface2 border border-white/10 text-gray-300 text-xs font-mono hover:border-neon-blue/40 transition-colors"
          >
            <i className="ph-bold ph-clipboard-text" /> Імпортувати з .env.example
          </button>
        )}
      </div>
    </div>
  );
}
