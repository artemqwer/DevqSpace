"use client";

import React, { useState } from "react";
import {
  Crown,
  Lock,
  LockOpen,
  PlayCircle,
  BookOpen,
  Sparkle,
  CheckCircle,
  Lightning,
} from "@phosphor-icons/react";

interface Plan {
  id: "basic" | "pro" | "vip";
  name: string;
  price: number;
  period: string;
  badge?: string;
  features: string[];
}

interface CourseModule {
  id: string;
  title: string;
  duration: string;
  type: "video" | "article";
  isLocked: boolean;
  views: number;
}

const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Member Pass",
    price: 29,
    period: "на місяць",
    features: ["Доступ до закритого чату", "Щотижневі аналітичні огляди", "Базовий курс (12 уроків)"],
  },
  {
    id: "pro",
    name: "Alpha Trader Pro",
    price: 69,
    period: "на місяць",
    badge: "НАЙПОПУЛЯРНІШИЙ",
    features: [
      "Усе з тарифу Member Pass",
      "Сигнали та сетапи в реальному часі",
      "Повний курс з торгівлі (34 уроки)",
      "Щотижневі живі стріми Q&A",
    ],
  },
  {
    id: "vip",
    name: "Inner Circle VIP",
    price: 199,
    period: "назавжди",
    features: [
      "Довічний доступ без щомісячних оплат",
      "Приватна група з фаундерами",
      "Персональний менторинг",
      "Ранній доступ до аллокацій",
    ],
  },
];

const MODULES: CourseModule[] = [
  { id: "1", title: "Вступ до стратегії: Risk Management & Психологія", duration: "18 хв", type: "video", isLocked: false, views: 1240 },
  { id: "2", title: "Структура ринку та аналіз ліквідності (Smart Money)", duration: "32 хв", type: "video", isLocked: false, views: 980 },
  { id: "3", title: "Пошук інсайдерських сигналів через On-Chain сканери", duration: "25 хв", type: "video", isLocked: true, views: 850 },
  { id: "4", title: "Гайд: Налаштування автоматичного захисту депозиту", duration: "12 хв читання", type: "article", isLocked: true, views: 720 },
  { id: "5", title: "Закрита торгова сесія: Розбір 5 угод наживо", duration: "48 хв", type: "video", isLocked: true, views: 640 },
];

export function TmaPaywallClubDemo() {
  const [activeTab, setActiveTab] = useState<"modules" | "subscribe">("modules");
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "pro" | "vip">("pro");
  const [hasSubscribed, setHasSubscribed] = useState(false);
  const [watchingLesson, setWatchingLesson] = useState<CourseModule | null>(null);

  const currentPlan = PLANS.find((p) => p.id === selectedPlan) || PLANS[1];

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#0b0a12] text-slate-100 flex flex-col font-sans select-none pb-20 shadow-2xl relative">
      {/* Header Bar */}
      <div className="bg-[#141220] px-4 py-3 border-b border-purple-500/20 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm border border-purple-500/30">
            👑
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>ALPHA CLUB TMA</span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-mono">
                PAYWALL
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              {hasSubscribed ? "Статус: PRO Підписка активна" : "Статус: Демо-доступ (Гість)"}
            </div>
          </div>
        </div>
        <button
          onClick={() => setActiveTab(activeTab === "modules" ? "subscribe" : "modules")}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 border ${
            hasSubscribed
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : "bg-purple-500 text-white border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)]"
          }`}
        >
          {hasSubscribed ? <CheckCircle className="w-3.5 h-3.5" /> : <Lightning className="w-3.5 h-3.5" />}
          <span>{hasSubscribed ? "Активно" : "Оформити"}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#100f1a] border-b border-white/5 p-1 text-xs">
        <button
          onClick={() => setActiveTab("modules")}
          className={`flex-1 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === "modules"
              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Навчальні модулі</span>
        </button>
        <button
          onClick={() => setActiveTab("subscribe")}
          className={`flex-1 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === "subscribe"
              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Crown className="w-3.5 h-3.5" />
          <span>Тарифи клубу</span>
        </button>
      </div>

      {/* Tab: Modules */}
      {activeTab === "modules" && (
        <div className="p-3.5 space-y-3 flex-1">
          <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-900/30 to-indigo-900/20 border border-purple-500/20 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1">
                <Sparkle className="w-3.5 h-3.5 text-purple-400" />
                <span>База знань & Стріми</span>
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">
                5 модулів • 2 відкрито для демо
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                2,480 Учасників
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {MODULES.map((mod) => {
              const isLocked = !hasSubscribed && mod.isLocked;
              return (
                <div
                  key={mod.id}
                  onClick={() => {
                    if (isLocked) {
                      setActiveTab("subscribe");
                    } else {
                      setWatchingLesson(mod);
                    }
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition ${
                    isLocked
                      ? "bg-[#141220]/60 border-white/5 opacity-70 hover:opacity-100"
                      : "bg-[#161324] border-purple-500/30 hover:border-purple-500/60"
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        isLocked
                          ? "bg-black/30 border-white/10 text-slate-500"
                          : "bg-purple-500/20 border-purple-500/40 text-purple-400"
                      }`}
                    >
                      {isLocked ? <Lock className="w-4 h-4" /> : <PlayCircle className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{mod.title}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{mod.duration}</span>
                        <span>•</span>
                        <span>{mod.views} переглядів</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isLocked ? (
                      <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                        PRO
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                        Дивитись
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Subscribe Plans */}
      {activeTab === "subscribe" && (
        <div className="p-3.5 space-y-3 flex-1">
          <div className="text-center py-1">
            <h3 className="text-sm font-bold text-white">Оберіть ваш рівень доступу</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Миттєве підключення до каналу та розблокування всіх матеріалів
            </p>
          </div>

          <div className="space-y-2.5">
            {PLANS.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition relative ${
                    isSelected
                      ? "bg-purple-900/20 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                      : "bg-[#141220] border-white/5 hover:border-white/10"
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-2 right-4 px-2 py-0.5 bg-purple-500 text-black font-extrabold text-[9px] rounded-full uppercase tracking-wider">
                      {plan.badge}
                    </span>
                  )}

                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-xs font-bold text-white">{plan.name}</div>
                      <div className="text-[10px] text-slate-400">{plan.period}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-mono font-black text-purple-400">${plan.price}</span>
                    </div>
                  </div>

                  <div className="space-y-1 border-t border-white/5 pt-2">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center space-x-1.5 text-[11px] text-slate-300">
                        <CheckCircle className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              onClick={() => {
                setHasSubscribed(true);
                setActiveTab("modules");
              }}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-extrabold rounded-xl transition flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(168,85,247,0.4)] text-xs"
            >
              <Crown className="w-4 h-4" weight="fill" />
              <span>
                {hasSubscribed ? "Оновити тариф" : `Активувати доступ за $${currentPlan.price}`}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Lesson Viewer Modal */}
      {watchingLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#161324] border border-purple-500/40 rounded-2xl p-5 max-w-sm w-full space-y-3 shadow-2xl">
            <div className="aspect-video bg-black rounded-xl border border-white/10 flex items-center justify-center text-purple-400 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                <span className="text-xs font-mono text-purple-300">▶ Відтворення у TMA плеєрі...</span>
              </div>
              <PlayCircle className="w-12 h-12 text-purple-400 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">{watchingLesson.title}</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Відео транслюється прямо у WebApp без виходу з Telegram.
              </p>
            </div>
            <button
              onClick={() => setWatchingLesson(null)}
              className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
            >
              Закрити
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
