"use client";

import React, { useState } from "react";
import { Sparkle, Copy, Check, CaretDown, Lightning } from "@phosphor-icons/react";

type PresetId = "ai" | "devtools" | "fintech" | "marketing" | "workspace";

export function SaasKitDemo() {
  const [preset, setPreset] = useState<PresetId>("ai");
  const [yearly, setYearly] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const presets: Record<
    PresetId,
    {
      badge: string;
      title: string;
      desc: string;
      code: string;
      priceStarter: number;
      pricePro: number;
    }
  > = {
    ai: {
      badge: "Autonomous AI Intelligence",
      title: "Deploy Multi-Modal AI Agents with Sub-100ms Streaming",
      desc: "Instant LLM orchestration, structured tool execution, and zero data training leaks.",
      code: `const agent = new DevqAgent({\n  model: "claude-3-5-sonnet",\n  tools: [sqlQuery, webSearch],\n  streaming: true\n});\nawait agent.execute("Generate quarterly forecast");`,
      priceStarter: yearly ? 19 : 24,
      pricePro: yearly ? 79 : 99,
    },
    devtools: {
      badge: "Serverless Edge Cloud",
      title: "Ship Distributed Microservices in a Single Git Push",
      desc: "Zero-configuration V8 isolates deployed instantaneously across 300+ edge locations.",
      code: `$ devq deploy --production\n✔ Bundled in 18ms\n✔ Edge latency: 4.2ms P99\n✨ Live at https://api.devq.io`,
      priceStarter: yearly ? 15 : 19,
      pricePro: yearly ? 69 : 89,
    },
    fintech: {
      badge: "Global Treasury & Ledger",
      title: "Multi-Rail Cross-Border Settlement & Issuing Engine",
      desc: "Unified SEPA Instant, Visa Direct, and stablecoin payouts with double-entry precision.",
      code: `POST /v1/transfers\n{\n  "rail": "SEPA_INSTANT",\n  "amount": 250000,\n  "currency": "EUR"\n}\n// Settled in 2.8s`,
      priceStarter: yearly ? 29 : 39,
      pricePro: yearly ? 99 : 129,
    },
    marketing: {
      badge: "Growth Engine & Viral SEO",
      title: "Automate High-Velocity Landing Pages & Dynamic OG Assets",
      desc: "Programmatic SEO landing generator with sub-second image generation and A/B tracking.",
      code: `export const marketing = new CampaignBuilder({\n  keywords: ["best telegram bots", "saas templates"],\n  autoPublish: true\n});`,
      priceStarter: yearly ? 22 : 28,
      pricePro: yearly ? 75 : 95,
    },
    workspace: {
      badge: "Realtime Collaboration",
      title: "Multiplayer State Engine with Offline-First Sync",
      desc: "CRDT-based document state with end-to-end encryption and sub-20ms cursor broadcasting.",
      code: `const room = new WorkspaceRoom("board-42");\nroom.on("presence", (users) => renderCursors(users));\nroom.syncState();`,
      priceStarter: yearly ? 25 : 32,
      pricePro: yearly ? 89 : 110,
    },
  };

  const cur = presets[preset];

  const handleCopyCode = () => {
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const faqs = [
    {
      q: "Чи входить повний відкритий вихідний код у поставку?",
      a: "Так, ви отримуєте 100% сорс-код на Next.js 15 (App Router), Tailwind CSS та TypeScript без обмежень на кількість клієнтських проєктів.",
    },
    {
      q: "Як швидко можна розгорнути лендінг на Vercel або VPS?",
      a: "Деплой займає менше 2 хвилин: просто підключіть репозиторій на Vercel або запустіть `npm run build && npm start` на вашому сервері.",
    },
    {
      q: "Чи підтримується темна і світла тема?",
      a: "Всі 5 архетипів оптимізовані під сучасний кіберпанк dark mode з легким перемиканням Tailwind класів.",
    },
  ];

  return (
    <div className="flex-1 p-4 sm:p-6 max-w-5xl mx-auto space-y-12 antialiased font-sans text-slate-100">
      {/* Preset Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
        <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
          <Sparkle className="h-3.5 w-3.5" />
          <span>Select SaaS Archetype (5 Available):</span>
        </span>
        <div className="flex flex-wrap gap-1.5">
          {(["ai", "devtools", "fintech", "marketing", "workspace"] as PresetId[]).map((p) => (
            <button
              key={p}
              onClick={() => setPreset(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize font-mono transition ${
                preset === p
                  ? "bg-cyan-400 text-black font-bold shadow-md"
                  : "bg-black/30 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Hero */}
      <div className="text-center space-y-4 pt-2">
        <div className="inline-block px-3.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-bold">
          {cur.badge}
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight text-white">
          {cur.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          {cur.desc}
        </p>
      </div>

      {/* Code Sandbox */}
      <div className="rounded-2xl border border-white/10 bg-[#0d1017] p-5 font-mono text-xs text-cyan-300 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3 text-slate-500 text-[11px]">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-2 font-bold text-slate-300">interactive_{preset}_runtime.ts</span>
          </div>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            {copiedCode ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span>{copiedCode ? "Copied" : "Copy Snippet"}</span>
          </button>
        </div>
        <pre className="overflow-x-auto py-2 leading-relaxed">{cur.code}</pre>
      </div>

      {/* Pricing Matrix */}
      <div className="pt-6 border-t border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-lg font-bold text-white">Interactive Billing Matrix</h3>
            <p className="text-xs text-slate-400">Toggle billing period to inspect dynamic pricing states.</p>
          </div>
          <div className="flex items-center bg-slate-900 border border-white/10 rounded-xl p-1 text-xs font-mono">
            <button
              onClick={() => setYearly(false)}
              className={`px-3 py-1 rounded-lg transition ${
                !yearly ? "bg-cyan-500 text-black font-bold" : "text-slate-400"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-3 py-1 rounded-lg transition ${
                yearly ? "bg-cyan-500 text-black font-bold" : "text-slate-400"
              }`}
            >
              Yearly (-20%)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto font-mono">
          <div className="p-6 rounded-2xl bg-[#0e121a] border border-white/10 space-y-4">
            <div className="text-xs text-slate-400">STARTER PLAN</div>
            <div className="text-3xl font-black text-white">
              ${cur.priceStarter} <span className="text-xs text-slate-400 font-normal">/mo</span>
            </div>
            <ul className="text-xs text-slate-400 space-y-2">
              <li>✓ Up to 100k requests/mo</li>
              <li>✓ 3 global edge regions</li>
              <li>✓ Community support</li>
            </ul>
            <button className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition">
              Choose Starter
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-[#0e121a] border border-cyan-500/40 space-y-4 shadow-xl shadow-cyan-500/10">
            <div className="flex justify-between items-center text-xs">
              <span className="text-cyan-400 font-bold">ORGANIZATION PRO</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 font-bold">POPULAR</span>
            </div>
            <div className="text-3xl font-black text-white">
              ${cur.pricePro} <span className="text-xs text-slate-400 font-normal">/mo</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-2">
              <li>✓ Unlimited invocations</li>
              <li>✓ Dedicated SLA &amp; priority routing</li>
              <li>✓ Custom domain &amp; SSL included</li>
            </ul>
            <button className="w-full py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs transition">
              Start 14-Day Free Trial →
            </button>
          </div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="pt-6 border-t border-white/10 space-y-4">
        <h3 className="text-base font-bold text-white text-center">Часті запитання (FAQ)</h3>
        <div className="max-w-2xl mx-auto space-y-2">
          {faqs.map((f, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-[#0e121a] border border-white/10 cursor-pointer transition"
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <div className="flex justify-between items-center text-xs font-semibold text-white">
                <span>{f.q}</span>
                <CaretDown
                  className={`h-4 w-4 transition-transform ${
                    openFaq === i ? "rotate-180 text-cyan-400" : "text-slate-400"
                  }`}
                />
              </div>
              {openFaq === i && (
                <div className="mt-2.5 pt-2.5 border-t border-white/5 text-xs text-slate-400 leading-relaxed">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
