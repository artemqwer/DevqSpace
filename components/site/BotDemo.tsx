"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { DemoStep } from "@/lib/products";

type Msg = { from: "bot" | "user"; text: string; buttons?: string[] };

const norm = (s: string) => s.trim().toLowerCase();

function findStep(steps: DemoStep[], trigger: string): DemoStep | undefined {
  return steps.find((s) => norm(s.trigger) === norm(trigger));
}

function entryStep(steps: DemoStep[]): DemoStep | undefined {
  return findStep(steps, "/start") ?? steps[0];
}

export function BotDemo({
  steps,
  botName,
  accentHex = "00F0FF",
}: {
  steps: DemoStep[];
  botName: string;
  accentHex?: string;
}) {
  const t = useTranslations("demo");
  const entry = entryStep(steps);
  const [messages, setMessages] = useState<Msg[]>(
    entry ? [{ from: "bot", text: entry.reply, buttons: entry.buttons }] : [],
  );
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text || typing) return;
    setInput("");
    setMessages((m) => [...m, { from: "user", text }]);
    setTyping(true);
    const step = findStep(steps, text);
    // Легка затримка «бот друкує» — для відчуття живого чату.
    window.setTimeout(() => {
      setTyping(false);
      setMessages((m) => [
        ...m,
        step
          ? { from: "bot", text: step.reply, buttons: step.buttons }
          : { from: "bot", text: t("noMatch") },
      ]);
    }, 500);
  };

  const restart = () => {
    setInput("");
    setTyping(false);
    setMessages(entry ? [{ from: "bot", text: entry.reply, buttons: entry.buttons }] : []);
  };

  if (!entry) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0e1621] shadow-[0_20px_60px_-30px_rgba(0,240,255,0.4)]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/10 bg-[#17212b] px-4 py-3">
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold text-black"
          style={{ background: `#${accentHex}` }}
        >
          {botName.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-white">{botName}</div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> bot
          </div>
        </div>
        <button
          type="button"
          onClick={restart}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-mono text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <i className="ph-bold ph-arrow-counter-clockwise" /> {t("restart")}
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="h-80 space-y-2 overflow-y-auto px-3 py-4"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 0%, rgba(0,240,255,0.04), transparent 60%)",
        }}
      >
        {messages.map((m, i) => (
          <div key={i} className={m.from === "user" ? "flex justify-end" : "flex justify-start"}>
            <div className="max-w-[80%] space-y-1.5">
              <div
                className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                  m.from === "user"
                    ? "rounded-br-md bg-neon-blue text-black"
                    : "rounded-bl-md bg-[#182533] text-gray-100"
                }`}
              >
                {m.text}
              </div>
              {m.buttons && m.buttons.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  {m.buttons.map((b, bi) => (
                    <button
                      key={bi}
                      type="button"
                      onClick={() => send(b)}
                      className="rounded-lg border border-neon-blue/30 bg-neon-blue/10 px-3 py-2 text-xs font-medium text-neon-blue transition-colors hover:bg-neon-blue/20"
                    >
                      {b}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md bg-[#182533] px-4 py-3">
              <span className="flex gap-1">
                <Dot /> <Dot delay="150ms" /> <Dot delay="300ms" />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-white/10 bg-[#17212b] px-3 py-2.5"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("placeholder")}
          className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || typing}
          aria-label={t("send")}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-neon-blue text-black transition-opacity disabled:opacity-40"
        >
          <i className="ph-fill ph-paper-plane-right" />
        </button>
      </form>
    </div>
  );
}

function Dot({ delay = "0ms" }: { delay?: string }) {
  return (
    <span
      className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
      style={{ animationDelay: delay }}
    />
  );
}
