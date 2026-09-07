"use client";

import type { DemoStep } from "@/lib/products";
import { MAX_DEMO_STEPS } from "@/lib/productInput";

const inputCls =
  "w-full bg-surface2 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-neon-blue/50 transition-colors text-sm";

export default function DemoScriptEditor({
  steps,
  onChange,
}: {
  steps: DemoStep[];
  onChange: (steps: DemoStep[]) => void;
}) {
  const update = (i: number, patch: Partial<DemoStep>) =>
    onChange(steps.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  const add = () => {
    if (steps.length >= MAX_DEMO_STEPS) return;
    onChange([
      ...steps,
      steps.length === 0
        ? { trigger: "/start", reply: "", buttons: [] }
        : { trigger: "", reply: "", buttons: [] },
    ]);
  };

  const remove = (i: number) => onChange(steps.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      {steps.length === 0 && (
        <p className="text-xs font-mono text-gray-600">
          Кроків немає — блок «спробуй бота» на сторінці товару не показується.
          Перший крок роби з тригером <span className="text-gray-400">/start</span>{" "}
          — це початок чату.
        </p>
      )}

      {steps.map((step, i) => (
        <div
          key={i}
          className="rounded-lg border border-white/10 bg-surface2/50 p-3 space-y-2"
        >
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-gray-500 shrink-0">
              #{i + 1}
            </span>
            <input
              value={step.trigger}
              onChange={(e) => update(i, { trigger: e.target.value })}
              className={inputCls + " font-mono"}
              placeholder="/start  або текст кнопки, яку тисне юзер"
              aria-label="Тригер (команда або кнопка)"
            />
          </div>

          <textarea
            value={step.reply}
            onChange={(e) => update(i, { reply: e.target.value })}
            rows={3}
            className={inputCls + " resize-y"}
            placeholder="Відповідь бота на цей тригер"
            aria-label="Відповідь бота"
          />

          <input
            value={(step.buttons ?? []).join(", ")}
            onChange={(e) =>
              update(i, {
                buttons: e.target.value
                  .split(",")
                  .map((b) => b.trim())
                  .filter(Boolean),
              })
            }
            className={inputCls}
            placeholder="Кнопки під відповіддю через кому (кожна = тригер іншого кроку)"
            aria-label="Кнопки"
          />

          <button
            type="button"
            onClick={() => remove(i)}
            className="text-xs font-mono text-gray-500 hover:text-neon-pink transition-colors"
          >
            прибрати крок
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        disabled={steps.length >= MAX_DEMO_STEPS}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface2 border border-white/10 text-gray-300 text-xs font-mono hover:border-neon-blue/40 transition-colors disabled:opacity-40"
      >
        <i className="ph-bold ph-plus" /> Додати крок
      </button>

      <p className="text-[11px] font-mono text-gray-600">
        Кнопка спрацьовує, якщо її текст = тригеру іншого кроку. Немає збігу —
        бот у демо відповість «не розумію».
      </p>
    </div>
  );
}
