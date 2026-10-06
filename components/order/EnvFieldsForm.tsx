"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { EnvField } from "@/lib/products";
import { requiredFilled, TG_TOKEN_RE, type EnvValues } from "@/lib/envFields";
import {
  SlidersHorizontal,
  Eye,
  EyeSlash,
  CheckCircle,
  WarningCircle,
  CircleNotch,
  ArrowSquareOut,
  Sparkle,
  Terminal,
} from "@phosphor-icons/react";

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
  const t = useTranslations("orderForm");
  const [tokens, setTokens] = useState<Record<string, TokenState>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const aborters = useRef<Record<string, AbortController>>({});

  const tokenKeys = fields
    .filter((f) => f.type === "telegram_token")
    .map((f) => f.key);

  const toggleShowSecret = (key: string) => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    const filled = requiredFilled(fields, values);
    const tokensOk = tokenKeys.every((key) => {
      const value = (values[key] ?? "").trim();
      const field = fields.find((f) => f.key === key);
      if (!value) return !field?.required;
      return tokens[key]?.status === "ok";
    });
    onValidityChange(filled && tokensOk);
  }, [fields, values, tokens, onValidityChange, tokenKeys]);

  useEffect(() => {
    const t = timers.current;
    const a = aborters.current;
    return () => {
      Object.values(t).forEach(clearTimeout);
      Object.values(a).forEach((c) => c.abort());
    };
  }, []);

  const checkToken = useCallback(
    (key: string, token: string) => {
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
              : { status: "error", message: data.error ?? t("tokenInvalid") },
          }));
        })
        .catch((e: unknown) => {
          if (e instanceof DOMException && e.name === "AbortError") return;
          setTokens((prev) => ({
            ...prev,
            [key]: { status: "error", message: t("netError") },
          }));
        });
    },
    [t],
  );

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
      setTokens((prev) => ({ ...prev, [field.key]: { status: "idle" } }));
      return;
    }

    timers.current[field.key] = setTimeout(
      () => checkToken(field.key, trimmed),
      DEBOUNCE_MS,
    );
  };

  if (!fields.length) return null;

  const filledCount = fields.filter((f) => Boolean((values[f.key] ?? "").trim())).length;
  const isAllFilled = filledCount === fields.length;

  return (
    <div className="rounded-2xl border border-neon-purple/30 bg-gradient-to-b from-[#13111e]/90 to-[#0c0a14]/90 p-5 space-y-5 shadow-2xl relative overflow-hidden backdrop-blur-md">
      {/* Top Cyber Glow Ambient */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-neon-purple/20 blur-3xl rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-neon-purple/15 text-neon-purple border border-neon-purple/30 flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4" weight="bold" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-white flex items-center gap-2 tracking-wider uppercase">
              <span>{t("envTitle")}</span>
              <span className="text-[10px] bg-neon-purple/20 text-neon-purple px-1.5 py-0.2 rounded border border-neon-purple/30 font-bold lowercase">
                auto-inject .env
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {t("envHint")}
            </p>
          </div>
        </div>

        {/* Progress Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 border border-white/10 text-[11px] font-mono">
          <span
            className={`w-2 h-2 rounded-full ${
              isAllFilled ? "bg-neon-green animate-pulse" : "bg-amber-400"
            }`}
          />
          <span className="text-slate-300">
            {filledCount}/{fields.length}
          </span>
        </div>
      </div>

      {/* Inputs List */}
      <div className="space-y-4">
        {fields.map((field) => {
          const state = tokens[field.key] ?? { status: "idle" };
          const isToken = field.type === "telegram_token";
          const isSecret = field.type === "secret";
          const isVisible = showSecrets[field.key] || false;
          const isOk = state.status === "ok";
          const isErr = state.status === "error";

          return (
            <div
              key={field.key}
              className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2 hover:border-white/10 transition group"
            >
              {/* Field Label & Metadata */}
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <span>{field.label}</span>
                  {field.required ? (
                    <span className="text-neon-pink" title="Обов'язкове">*</span>
                  ) : (
                    <span className="text-[10px] text-slate-500 normal-case font-normal">
                      (опціонально)
                    </span>
                  )}
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-neon-purple/70 bg-neon-purple/10 px-1.5 py-0.5 rounded border border-neon-purple/20">
                    {field.key}
                  </span>
                  {isToken && (
                    <a
                      href="https://t.me/BotFather"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-mono text-neon-blue hover:text-white flex items-center gap-1 bg-neon-blue/10 px-2 py-0.5 rounded border border-neon-blue/30 transition"
                      title="Відкрити @BotFather у Telegram"
                    >
                      <span>@BotFather</span>
                      <ArrowSquareOut className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Input Control with Show/Hide and Status */}
              <div className="relative">
                <input
                  type={
                    (isSecret || isToken) && !isVisible
                      ? "password"
                      : "text"
                  }
                  inputMode={field.type === "number" ? "numeric" : undefined}
                  value={values[field.key] ?? ""}
                  onChange={(e) => setValue(field, e.target.value)}
                  placeholder={field.placeholder}
                  disabled={disabled}
                  autoComplete="off"
                  spellCheck={false}
                  required={field.required}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-[#090b10] text-white text-xs font-mono border transition focus:outline-none ${
                    isOk
                      ? "border-neon-green/60 shadow-[0_0_12px_rgba(0,255,102,0.15)]"
                      : isErr
                        ? "border-neon-pink/60 shadow-[0_0_12px_rgba(255,0,127,0.15)]"
                        : "border-white/10 focus:border-neon-purple/60"
                  } ${isToken || isSecret ? "pr-20" : "pr-4"}`}
                />

                {/* Right Input Badges & Actions */}
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center space-x-1.5">
                  {(isToken || isSecret) && (
                    <button
                      type="button"
                      onClick={() => toggleShowSecret(field.key)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                      title={isVisible ? "Приховати" : "Показати"}
                    >
                      {isVisible ? (
                        <EyeSlash className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  )}

                  {isToken && state.status !== "idle" && (
                    <span className="flex items-center">
                      {state.status === "checking" && (
                        <CircleNotch className="w-4 h-4 animate-spin text-neon-blue" />
                      )}
                      {state.status === "ok" && (
                        <CheckCircle className="w-4 h-4 text-neon-green" weight="fill" />
                      )}
                      {state.status === "error" && (
                        <WarningCircle className="w-4 h-4 text-neon-pink" weight="fill" />
                      )}
                    </span>
                  )}
                </div>
              </div>

              {/* Status & Hints */}
              {isToken && isOk && (
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-neon-green mt-1">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" weight="fill" />
                  <span>
                    {t("botFound")}
                    {state.username ? ` (@${state.username})` : ""}
                  </span>
                </div>
              )}

              {isToken && isErr && (
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-neon-pink mt-1">
                  <WarningCircle className="w-3.5 h-3.5 shrink-0" weight="fill" />
                  <span>{state.message}</span>
                </div>
              )}

              {field.hint && (!isToken || state.status === "idle") && (
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {field.hint}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Live .env Terminal Preview Snippet */}
      <div className="p-3 rounded-xl bg-black/60 border border-white/5 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-1 text-neon-purple">
            <Terminal className="w-3.5 h-3.5" />
            <span>.env preview (готовий до старту):</span>
          </div>
          <span className="text-slate-500">буде зашито в архів</span>
        </div>
        <div className="text-[11px] font-mono text-slate-300 space-y-0.5 overflow-x-auto scrollbar-none">
          {fields.map((f) => {
            const val = values[f.key] || "";
            const isSecret = f.type === "secret" || f.type === "telegram_token";
            const masked =
              isSecret && val
                ? val.slice(0, 4) + "••••••••" + val.slice(-4)
                : val;
            return (
              <div key={f.key} className="truncate">
                <span className="text-neon-blue">{f.key}</span>
                <span className="text-slate-500">=</span>
                <span className={val ? "text-neon-green" : "text-slate-600"}>
                  {val ? `"${masked}"` : `""`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
