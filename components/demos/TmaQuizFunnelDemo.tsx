"use client";

import React, { useState } from "react";
import {
  Sparkle,
  ArrowRight,
  CheckCircle,
  ChatCircleDots,
  ShieldCheck,
  PaperPlaneTilt,
} from "@phosphor-icons/react";

interface Question {
  id: number;
  title: string;
  subtitle: string;
  options: { label: string; icon: string; desc: string; addPrice: number }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    title: "Який цифровий продукт вам потрібен?",
    subtitle: "Оберіть головний фокус проєкту для точного розрахунку",
    options: [
      { label: "Telegram Mini App (TMA)", icon: "📱", desc: "Сучасний веб-додаток усередині Telegram", addPrice: 600 },
      { label: "Telegram Чат-Бот під ключ", icon: "🤖", desc: "Автоворонки, підтримка клієнтів, CRM", addPrice: 350 },
      { label: "SaaS Платформа / Веб-сервіс", icon: "💻", desc: "Повноцінний веб-сайт з адмінкою", addPrice: 900 },
      { label: "Крипто-інтеграція / Web3", icon: "🪙", desc: "DApp, смарт-контракти, токени", addPrice: 750 },
    ],
  },
  {
    id: 2,
    title: "Яка терміновість реалізації?",
    subtitle: "Швидкість розробки впливає на розподіл команди",
    options: [
      { label: "Експрес (до 3–5 днів)", icon: "⚡", desc: "Максимальний пріоритет у черзі", addPrice: 200 },
      { label: "Стандарт (1–2 тижні)", icon: "⏱️", desc: "Оптимальний плановий графік", addPrice: 0 },
      { label: "Гнучкий дедлайн (1 місяць)", icon: "📅", desc: "Знижка на поетапну оплату", addPrice: -100 },
    ],
  },
  {
    id: 3,
    title: "Чи потрібна інтеграція з оплатою?",
    subtitle: "Приймання платежів від клієнтів",
    options: [
      { label: "Так: Stars + Картки + Крипта", icon: "💳", desc: "Мультивалютний еквайринг", addPrice: 150 },
      { label: "Лише банківські карти", icon: "🏦", desc: "Apple Pay, Google Pay, Visa/MC", addPrice: 80 },
      { label: "Оплата не потрібна", icon: "💬", desc: "Лише збір лідів та консультація", addPrice: 0 },
    ],
  },
];

export function TmaQuizFunnelDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSelectOption = (optionIndex: number) => {
    const nextAnswers = [...answers];
    nextAnswers[currentStep] = optionIndex;
    setAnswers(nextAnswers);

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(QUESTIONS.length); // go to lead form
    }
  };

  const calculatedBase = 500;
  const calculatedEstimate = answers.reduce((sum, optIdx, qIdx) => {
    const q = QUESTIONS[qIdx];
    if (q && q.options[optIdx]) {
      return sum + q.options[optIdx].addPrice;
    }
    return sum;
  }, calculatedBase);

  const handleSubmitLead = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const isFormStep = currentStep === QUESTIONS.length;
  const progressPercent = Math.min(100, Math.round(((currentStep + 1) / (QUESTIONS.length + 1)) * 100));

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans select-none pb-20 shadow-2xl relative">
      {/* Header Bar */}
      <div className="bg-[#0e1424] px-4 py-3 border-b border-cyan-500/20 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm border border-cyan-500/30">
            🎯
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>DevqSpace Lead Quiz</span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded font-mono">
                TMA
              </span>
            </div>
            <div className="text-[10px] text-slate-400">Калькулятор кошторису за 60 сек</div>
          </div>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/30">
          Знижка -15%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#0b101c] h-1.5 relative overflow-hidden">
        <div
          className="bg-cyan-400 h-full transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step Indicator */}
      <div className="px-4 py-2 flex items-center justify-between text-[11px] text-slate-400 border-b border-white/5">
        <span>Крок {Math.min(currentStep + 1, QUESTIONS.length + 1)} з {QUESTIONS.length + 1}</span>
        <span className="font-mono text-cyan-400">Прогрес: {progressPercent}%</span>
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-center">
        {!isFormStep && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h3 className="text-base font-bold text-white leading-snug">
                {QUESTIONS[currentStep].title}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {QUESTIONS[currentStep].subtitle}
              </p>
            </div>

            <div className="space-y-2">
              {QUESTIONS[currentStep].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className="w-full p-3.5 rounded-2xl bg-[#0f172a] border border-white/10 hover:border-cyan-400/60 hover:bg-[#131f38] text-left transition flex items-center justify-between group cursor-pointer shadow-sm"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="text-2xl group-hover:scale-110 transition-transform">
                      {option.icon}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {option.label}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{option.desc}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition shrink-0" />
                </button>
              ))}
            </div>

            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1 pt-1"
              >
                <span>← Повернутись до попереднього питання</span>
              </button>
            )}
          </div>
        )}

        {/* Final Lead Capture Step */}
        {isFormStep && !isSubmitted && (
          <form onSubmit={handleSubmitLead} className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-center space-y-1">
              <span className="text-2xl">🎉</span>
              <h3 className="text-sm font-bold text-white">Розрахунок готовий!</h3>
              <div className="text-xl font-mono font-black text-cyan-400">
                Орієнтовно: ${calculatedEstimate}
              </div>
              <p className="text-[11px] text-slate-300">
                Залишіть контакт для закріплення знижки 15% та детального PDF-кошторису.
              </p>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Ваше ім'я</label>
                <input
                  type="text"
                  required
                  placeholder="Олександр"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0f172a] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Telegram Username або Телефон
                </label>
                <input
                  type="text"
                  required
                  placeholder="@username або +380 99..."
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0f172a] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold rounded-xl transition flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] text-xs"
            >
              <PaperPlaneTilt className="w-4 h-4" weight="bold" />
              <span>Отримати кошторис зі знижкою 15%</span>
            </button>

            <div className="text-[10px] text-center text-slate-500 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Дані захищені та автоматично надсилаються в CRM</span>
            </div>
          </form>
        )}

        {/* Lead Submitted Confirmation */}
        {isSubmitted && (
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-cyan-500/40 text-center space-y-3 animate-fade-in shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center">
              <CheckCircle className="w-6 h-6" weight="bold" />
            </div>
            <h3 className="text-base font-bold text-white">Дякуємо, {contactName || "друже"}!</h3>
            <p className="text-xs text-slate-300">
              Лід з усіма відповідями та розрахунком <span className="font-mono text-cyan-400 font-bold">${calculatedEstimate}</span> успішно відправлено менеджеру в Telegram.
            </p>
            <button
              onClick={() => {
                setIsSubmitted(false);
                setCurrentStep(0);
                setAnswers([]);
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
            >
              Пройти знову
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
