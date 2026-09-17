"use client";

import React, { useState } from "react";
import type { Product } from "@/lib/products";
import { Play, Plus, PaperPlaneTilt, Trash, ChatTeardropText, GitFork, GearSix, Sparkle } from "@phosphor-icons/react";

type FlowStep = {
  id: string;
  trigger: string;
  reply: string;
  buttons: string[];
};

export function BotConstructorDemo({ product }: { product?: Product }) {
  const [steps, setSteps] = useState<FlowStep[]>([
    {
      id: "step-1",
      trigger: "/start",
      reply: "👋 Вітаємо в офіційному боті! Чим ми можемо допомогти сьогодні?",
      buttons: ["🛍 Каталог товарів", "⚡ Швидка підтримка", "💰 Мій баланс"],
    },
    {
      id: "step-2",
      trigger: "🛍 Каталог товарів",
      reply: "📦 Оберіть категорію цифрових рішень:\n1. Telegram-боти\n2. Веб-додатки\n3. Web3 скрипти",
      buttons: ["🤖 Боти", "🌐 Веб", "🔙 Головне меню"],
    },
    {
      id: "step-3",
      trigger: "⚡ Швидка підтримка",
      reply: "👨‍💻 Черговий оператор на зв'язку! Опишіть ваше питання або натисніть кнопку нижче.",
      buttons: ["Написати менеджеру", "🔙 Головне меню"],
    },
  ]);

  const [activeStepId, setActiveStepId] = useState<string>("step-1");
  const [chatMessages, setChatMessages] = useState<{ sender: "user" | "bot"; text: string }[]>([
    { sender: "bot", text: "👋 Вітаємо в офіційному боті! Чим ми можемо допомогти сьогодні?" },
  ]);
  const [chatInput, setChatInput] = useState("");

  const activeStep = steps.find((s) => s.id === activeStepId) || steps[0];

  const handleUpdateActiveStep = (field: keyof FlowStep, value: any) => {
    setSteps(
      steps.map((s) => (s.id === activeStepId ? { ...s, [field]: value } : s))
    );
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || chatInput;
    if (!text.trim()) return;

    // Add user message
    const nextChat = [...chatMessages, { sender: "user" as const, text }];
    setChatMessages(nextChat);
    if (!textToSend) setChatInput("");

    // Look for matching step
    const matched = steps.find(
      (s) => s.trigger.toLowerCase() === text.trim().toLowerCase()
    );

    setTimeout(() => {
      if (matched) {
        setChatMessages((prev) => [
          ...prev,
          { sender: "bot" as const, text: matched.reply },
        ]);
        setActiveStepId(matched.id);
      } else if (text.trim() === "🔙 Головне меню") {
        setChatMessages((prev) => [
          ...prev,
          { sender: "bot" as const, text: steps[0].reply },
        ]);
        setActiveStepId(steps[0].id);
      } else {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: "bot" as const,
            text: "🤔 Команду не розпізнано. Спробуйте натиснути одну з кнопок меню нижче.",
          },
        ]);
      }
    }, 400);
  };

  const addStep = () => {
    const newId = `step-${steps.length + 1}`;
    const newStep: FlowStep = {
      id: newId,
      trigger: `Нова команда ${steps.length + 1}`,
      reply: "Текст відповіді бота для цієї дії.",
      buttons: ["🔙 Головне меню"],
    };
    setSteps([...steps, newStep]);
    setActiveStepId(newId);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-screen bg-[#07080c] text-slate-100 font-sans antialiased">
      {/* Left Flow Canvas / Steps Manager */}
      <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto border-b lg:border-b-0 lg:border-r border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
              <GitFork className="h-4 w-4" />
              <span>Visual Scenario Builder</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-0.5">Конструктор сценаріїв Telegram-бота</h2>
            <p className="text-xs text-slate-400">
              Створюйте ланцюжки повідомлень та одразу тестуйте їх в емуляторі справа.
            </p>
          </div>
          <button
            onClick={addStep}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold font-mono transition shadow-lg"
          >
            <Plus className="h-3.5 w-3.5 font-bold" />
            <span>Додати вузол</span>
          </button>
        </div>

        {/* Visual Graph Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {steps.map((step, idx) => {
            const isSelected = step.id === activeStepId;
            return (
              <div
                key={step.id}
                onClick={() => setActiveStepId(step.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                  isSelected
                    ? "bg-cyan-950/20 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.15)]"
                    : "bg-[#0d1017] border-white/10 hover:border-white/30"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="px-2 py-0.5 rounded bg-black/40 text-cyan-300 border border-cyan-500/30">
                    Тригер: {step.trigger}
                  </span>
                  <span className="text-slate-500 text-[10px]">#0{idx + 1}</span>
                </div>

                <div className="text-xs text-slate-200 line-clamp-2 bg-black/20 p-2 rounded-lg font-mono">
                  {step.reply}
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {step.buttons.map((btn, bIdx) => (
                    <span
                      key={bIdx}
                      className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-slate-300"
                    >
                      [{btn}]
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Step Editor */}
        <div className="p-5 rounded-2xl bg-[#0d1017] border border-cyan-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
              ⚙️ Редагування вузла: {activeStep.trigger}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">ID: {activeStep.id}</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-400">Команда активації (Trigger):</label>
            <input
              type="text"
              value={activeStep.trigger}
              onChange={(e) => handleUpdateActiveStep("trigger", e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-400">Текст відповіді бота:</label>
            <textarea
              rows={3}
              value={activeStep.reply}
              onChange={(e) => handleUpdateActiveStep("reply", e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-400">Інлайн-кнопки (через кому):</label>
            <input
              type="text"
              value={activeStep.buttons.join(", ")}
              onChange={(e) =>
                handleUpdateActiveStep(
                  "buttons",
                  e.target.value.split(",").map((b) => b.trim()).filter(Boolean)
                )
              }
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Right Live Telegram Chat Sandbox */}
      <div className="w-full lg:w-96 bg-[#0a0c12] p-4 sm:p-5 flex flex-col justify-between shrink-0">
        {/* Phone / Telegram Frame */}
        <div className="flex-1 flex flex-col rounded-3xl border border-white/10 bg-[#0e121a] overflow-hidden shadow-2xl">
          {/* Telegram Header */}
          <div className="p-3.5 bg-[#141a24] border-b border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-black font-bold text-xs">
              🤖
            </div>
            <div>
              <div className="text-xs font-bold text-white">DevqBot Emulator</div>
              <div className="text-[10px] text-emerald-400 font-mono">bot is online</div>
            </div>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 min-h-[300px]">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-cyan-500 text-black font-medium rounded-br-none"
                      : "bg-[#18202c] text-white border border-white/5 rounded-bl-none whitespace-pre-line"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Inline Buttons Pad */}
          <div className="p-3 bg-[#111620] border-t border-white/10 space-y-2">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Швидкі кнопки:</div>
            <div className="grid grid-cols-2 gap-1.5">
              {activeStep.buttons.map((btn, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(btn)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/40 text-xs text-cyan-300 font-semibold transition text-center truncate"
                >
                  {btn}
                </button>
              ))}
            </div>

            {/* Input Row */}
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Введіть /start або текст..."
                className="flex-1 rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={() => handleSendMessage()}
                className="px-3 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 transition"
              >
                <PaperPlaneTilt className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
