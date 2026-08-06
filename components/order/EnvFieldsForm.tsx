"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { EnvField } from "@/lib/products";
import { requiredFilled, TG_TOKEN_RE, type EnvValues } from "@/lib/envFields";
import { ORDER_INPUT_CLS } from "./styles";

type TokenState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "ok"; username: string | null }
  | { status: "error"; message: string };

const DEBOUNCE_MS = 500;

export default function EnvFieldsForm({
  fields,
  values,
  onChange,
  onValidityChange,
  disabled,
}: {
  fields: EnvField[];
  values: EnvValues;
  onChange: (values: EnvValues) => void;
  onValidityChange: (valid: boolean) => void;
  disabled?: boolean;
}) {
  const [tokens, setTokens] = useState<Record<string, TokenState>>({});
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const aborters = useRef<Record<string, AbortController>>({});

  const tokenKeys = fields
    .filter((f) => f.type === "telegram_token")
    .map((f) => f.key);

  // Кнопка оплати розблокована, лише коли заповнено все обов'язкове І кожен
  // введений токен підтверджено Telegram-ом.
  useEffect(() => {
    const filled = requiredFilled(fields, values);
    const tokensOk = tokenKeys.every((key) => {
      const value = (values[key] ?? "").trim();
      const field = fields.find((f) => f.key === key);
      if (!value) return !field?.required;
      return tokens[key]?.status === "ok";
    });
    onValidityChange(filled && tokensOk);
    // onValidityChange стабільний у батька (useCallback), tokenKeys похідні.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields, values, tokens]);

  useEffect(() => {
    const t = timers.current;
    const a = aborters.current;
    return () => {
      Object.values(t).forEach(clearTimeout);
      Object.values(a).forEach((c) => c.abort());
    };
  }, []);

  const checkToken = useCallback((key: string, token: string) => {
    aborters.current[key]?.abort();
    const controller = new AbortController();
    aborters.current[key] = controller;

    setTokens((prev) => ({ ...prev, [key]: { status: "checking" } }));

    fetch("/api/validate-tg-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      signal: controller.signal,
    })
      .then((r) => r.json() as Promise<{ ok: boolean; username?: string; error?: string }>)
      .then((data) => {
        setTokens((prev) => ({
          ...prev,
          [key]: data.ok
            ? { status: "ok", username: data.username ?? null }
            : { status: "error", message: data.error ?? "Токен не підійшов" },
        }));
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setTokens((prev) => ({
          ...prev,
          [key]: { status: "error", message: "Помилка мережі" },
        }));
      });
  }, []);

  const setValue = (field: EnvField, value: string) => {
    onChange({ ...values, [field.key]: value });

    if (field.type !== "telegram_token") return;

    clearTimeout(timers.current[field.key]);
    aborters.current[field.key]?.abort();

    const trimmed = value.trim();
    if (!trimmed) {
      setTokens((prev) => ({ ...prev, [field.key]: { status: "idle" } }));
      return;
    }
    if (!TG_TOKEN_RE.test(trimmed)) {
      // Поки формат явно неповний — не смикаємо Telegram на кожну літеру.
      setTokens((prev) => ({ ...prev, [field.key]: { status: "idle" } }));
      return;
    }

    timers.current[field.key] = setTimeout(
      () => checkToken(field.key, trimmed),
      DEBOUNCE_MS,
    );
  };

  if (!fields.length) return null;

  return (
    <div className="rounded-xl border border-neon-purple/20 bg-surface/40 p-4 space-y-4">
      <div className="flex items-start gap-2">
        <i className="ph-bold ph-sliders-horizontal mt-0.5 text-neon-purple" />
        <div>
          <div className="text-xs font-mono text-neon-purple uppercase tracking-wider">
            Налаштування вашої копії
          </div>
          <p className="text-[11px] font-mono text-gray-500 mt-0.5">
            Підставимо у файл .env — архів прийде вже налаштованим.
          </p>
        </div>
      </div>

      {fields.map((field) => {
        const state = tokens[field.key] ?? { status: "idle" };
        const isToken = field.type === "telegram_token";
        return (
          <div key={field.key}>
            <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">
              {field.label}
              {field.required && <span className="text-neon-pink ml-1">*</span>}
              <span className="text-gray-600 normal-case ml-2">
                {field.key}
              </span>
            </label>

            <div className="relative">
              <input
                type={field.type === "secret" ? "password" : "text"}
                inputMode={field.type === "number" ? "numeric" : undefined}
                value={values[field.key] ?? ""}
                onChange={(e) => setValue(field, e.target.value)}
                placeholder={field.placeholder}
                disabled={disabled}
                autoComplete="off"
                spellCheck={false}
                required={field.required}
                className={
                  ORDER_INPUT_CLS +
                  (isToken ? " pr-11" : "") +
                  (state.status === "ok"
                    ? " border-neon-green/50"
                    : state.status === "error"
                      ? " border-neon-pink/50"
                      : "")
                }
              />
              {isToken && state.status !== "idle" && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-base">
                  {state.status === "checking" && (
                    <i className="ph-bold ph-circle-notch animate-spin text-gray-400" />
                  )}
                  {state.status === "ok" && (
                    <i className="ph-fill ph-check-circle text-neon-green" />
                  )}
                  {state.status === "error" && (
                    <i className="ph-fill ph-warning-circle text-neon-pink" />
                  )}
                </span>
              )}
            </div>

            {isToken && state.status === "ok" && (
              <p className="mt-1.5 text-[11px] font-mono text-neon-green">
                Бот знайдений
                {state.username ? ` — @${state.username}` : ""}
              </p>
            )}
            {isToken && state.status === "error" && (
              <p className="mt-1.5 text-[11px] font-mono text-neon-pink">
                {state.message}
              </p>
            )}
            {field.hint && state.status === "idle" && (
              <p className="mt-1.5 text-[11px] font-mono text-gray-600">
                {field.hint}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
