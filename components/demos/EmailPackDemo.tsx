"use client";

import React, { useState } from "react";
import { Envelope, Sun, Moon, CheckCircle, ShieldWarning, Receipt, Sparkle } from "@phosphor-icons/react";

export function EmailPackDemo() {
  const [selectedTemplate, setSelectedTemplate] = useState<"welcome" | "receipt" | "newsletter" | "security">("welcome");
  const [isDarkMode, setIsDarkMode] = useState(false);

  const templates = [
    { id: "welcome" as const, name: "01. Onboarding Welcome", desc: "Dual-column responsive welcome email with action CTA." },
    { id: "receipt" as const, name: "02. Order Receipt & VAT", desc: "Itemized transactional invoice with totals and payment method." },
    { id: "newsletter" as const, name: "03. Tech Dispatch Digest", desc: "Editorial newsletter with featured article slots and tags." },
    { id: "security" as const, name: "04. Security Alert Reset", desc: "Urgent security notification with IP metadata and action button." },
  ];

  return (
    <div className="flex-1 p-4 sm:p-6 max-w-5xl mx-auto space-y-8 antialiased font-sans text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="text-xs font-mono uppercase text-emerald-400 font-bold">
            Tested Across 30+ Major Email Clients
          </span>
          <h1 className="text-2xl font-bold text-white mt-0.5">20 Responsive HTML Email Templates</h1>
          <p className="text-xs text-slate-400">
            Table-based fluid layouts with inline CSS, dark mode media queries, and MJML source.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 transition"
          >
            {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-cyan-400" />}
            <span>{isDarkMode ? "Light Canvas" : "Dark Canvas"}</span>
          </button>
        </div>
      </div>

      {/* Template Selector Pills */}
      <div className="flex flex-wrap gap-2 text-xs font-mono">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTemplate(t.id)}
            className={`px-3.5 py-2 rounded-xl transition ${
              selectedTemplate === t.id
                ? "bg-emerald-500 text-black font-bold shadow-md"
                : "bg-white/5 border border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Simulated Email Client Viewport */}
      <div
        className={`max-w-xl mx-auto rounded-3xl border border-white/10 overflow-hidden shadow-2xl p-6 sm:p-8 transition-colors duration-300 ${
          isDarkMode ? "bg-[#0f121a] text-slate-100" : "bg-white text-slate-900"
        }`}
      >
        {/* Email Header Metadata */}
        <div
          className={`flex items-center justify-between pb-4 border-b text-xs font-mono mb-6 ${
            isDarkMode ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-500"
          }`}
        >
          <div>
            <span className="font-bold">Від:</span> DevqSpace &lt;team@devq.space&gt;
          </div>
          <div>Сьогодні, 14:32</div>
        </div>

        {/* TEMPLATE 1: WELCOME */}
        {selectedTemplate === "welcome" && (
          <div className="space-y-5">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center font-bold text-sm">
              DQ
            </div>
            <h2 className={`text-2xl font-extrabold tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Ласкаво просимо до екосистеми DevqSpace!
            </h2>
            <p className={`text-xs leading-relaxed ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
              Ваш персональний робочий простір активовано. Тепер ви маєте доступ до готових Telegram-ботів, SaaS-шаблонів та Web3 рішень із повним відкритим кодом.
            </p>
            <div
              className={`p-4 rounded-2xl border space-y-2 text-xs ${
                isDarkMode ? "bg-black/30 border-slate-800" : "bg-slate-50 border-slate-200"
              }`}
            >
              <div className="font-bold">Швидкий старт за 3 кроки:</div>
              <div>1. Завантажте ZIP-архів із репозиторію.</div>
              <div>2. Заповніть ваші ключі у файлі .env.</div>
              <div>3. Запустіть розгортання командою docker compose up.</div>
            </div>
            <div className="pt-2">
              <button className="px-6 py-3 rounded-xl bg-emerald-500 text-black font-bold text-xs shadow-md">
                Перейти до моїх завантажень →
              </button>
            </div>
          </div>
        )}

        {/* TEMPLATE 2: RECEIPT */}
        {selectedTemplate === "receipt" && (
          <div className="space-y-5 font-mono text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-dashed border-slate-300">
              <span className="font-bold text-sm">ФІСКАЛЬНИЙ ЧЕК #DQ-9412</span>
              <span className="text-emerald-500 font-bold">ОПЛАЧЕНО</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>1× CyberDash Admin Template</span>
                <span className="font-bold">$49.00</span>
              </div>
              <div className="flex justify-between">
                <span>1× Встановлення під ключ (VPS Deploy)</span>
                <span className="font-bold">$39.00</span>
              </div>
              <div className="flex justify-between text-emerald-500">
                <span>Промокод (DEVQ20 -20%)</span>
                <span>-$17.60</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-slate-300 font-bold text-sm">
                <span>РАЗОМ ДО СПЛАТИ:</span>
                <span>$70.40</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-400">
              Спосіб оплати: Monobank Visa Direct (•• 4821)
            </div>
          </div>
        )}

        {/* TEMPLATE 3: NEWSLETTER */}
        {selectedTemplate === "newsletter" && (
          <div className="space-y-4">
            <div className="inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-400">
              DISPATCH #48
            </div>
            <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Як нові Solana Geyser ноди пришвидшують снайпінг мемкоїнів
            </h2>
            <p className={`text-xs leading-relaxed ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
              Аналіз швидкості виконання транзакцій через gRPC стрімінг та Jito MEV бандли без посередництва публічних RPC нод.
            </p>
            <div className="pt-2">
              <button className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs">
                Читати повний аналіз →
              </button>
            </div>
          </div>
        )}

        {/* TEMPLATE 4: SECURITY */}
        {selectedTemplate === "security" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-rose-500 text-xs font-mono font-bold">
              <ShieldWarning className="h-4 w-4" />
              <span>SECURITY ALERT: NEW LOGIN DETECTED</span>
            </div>
            <h2 className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Виявлено вхід з нового пристрою
            </h2>
            <div
              className={`p-3 rounded-xl border text-xs font-mono space-y-1 ${
                isDarkMode ? "bg-black/40 border-slate-800" : "bg-slate-50 border-slate-200"
              }`}
            >
              <div>IP: 198.51.100.42 (Київ, Україна)</div>
              <div>Браузер: Google Chrome 128 on Windows 11</div>
              <div>Час: 17.09.2026 23:25 UTC+3</div>
            </div>
            <div className="pt-2">
              <button className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs">
                Це не я — Заблокувати сесію
              </button>
            </div>
          </div>
        )}

        {/* Email Footer */}
        <div
          className={`mt-8 pt-4 border-t text-[11px] font-mono flex justify-between ${
            isDarkMode ? "border-slate-800 text-slate-500" : "border-slate-200 text-slate-400"
          }`}
        >
          <span>DevqSpace Digital Marketplace</span>
          <span>Налаштування розсилки</span>
        </div>
      </div>
    </div>
  );
}
