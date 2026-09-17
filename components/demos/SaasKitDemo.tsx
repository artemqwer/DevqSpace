"use client";

import React, { useState } from "react";

type PresetId = "ai" | "devtools" | "fintech";

export function SaasKitDemo() {
  const [preset, setPreset] = useState<PresetId>("ai");
  const [yearly, setYearly] = useState(true);

  const presets = {
    ai: {
      badge: "Autonomous AI Intelligence",
      title: "Deploy Multi-Modal AI Agents with Sub-100ms Streaming",
      desc: "Instant LLM orchestration, structured tool execution, and zero data training leaks.",
      code: `const copilot = new DevqAgent({\n  model: "claude-3-5-sonnet",\n  tools: [sqlQuery, webFetch]\n});\nawait copilot.run("Summarize ARR");`,
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
  };

  const cur = presets[preset];

  return (
    <div className="flex-1 p-6 max-w-5xl mx-auto space-y-10 antialiased font-sans text-slate-100">
      {/* Preset Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
        <span className="text-xs font-mono text-slate-400">✨ Select Archetype:</span>
        <div className="flex gap-2">
          {(["ai", "devtools", "fintech"] as PresetId[]).map((p) => (
            <button
              key={p}
              onClick={() => setPreset(p)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                preset === p ? "bg-neon-blue text-black shadow-sm" : "bg-white/5 text-slate-300 hover:text-white"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Hero */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono">
          {cur.badge}
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
          {cur.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">{cur.desc}</p>
      </div>

      {/* Code Sandbox */}
      <div className="rounded-xl border border-slate-800 bg-[#0d1017] p-4 font-mono text-xs text-cyan-300 overflow-x-auto shadow-2xl">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-800/80 mb-3 text-slate-500 text-[11px]">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
          <span className="ml-2">interactive_runtime.ts</span>
        </div>
        <pre>{cur.code}</pre>
      </div>

      {/* Pricing Matrix */}
      <div className="pt-6 border-t border-slate-800 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-white">Interactive Billing Matrix</h3>
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
            <button
              onClick={() => setYearly(false)}
              className={`px-3 py-1 rounded transition ${!yearly ? "bg-cyan-500 text-black font-bold" : "text-slate-400"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-3 py-1 rounded transition ${yearly ? "bg-cyan-500 text-black font-bold" : "text-slate-400"}`}
            >
              Yearly (-20%)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono text-slate-400 uppercase">Starter Plan</div>
              <div className="text-2xl font-black mt-1 text-white">${cur.priceStarter} <span className="text-xs text-slate-500">/mo</span></div>
              <p className="text-xs text-slate-400 mt-2">Up to 100k requests/mo & 3 edge regions.</p>
            </div>
            <button className="w-full mt-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg">
              Choose Starter
            </button>
          </div>

          <div className="p-6 rounded-xl bg-gradient-to-b from-cyan-950/40 to-slate-900 border border-cyan-500/50 flex flex-col justify-between shadow-lg">
            <div>
              <div className="text-xs font-mono text-cyan-400 uppercase">Organization Pro</div>
              <div className="text-2xl font-black mt-1 text-white">${cur.pricePro} <span className="text-xs text-slate-500">/mo</span></div>
              <p className="text-xs text-slate-300 mt-2">Unlimited invocations, dedicated SLA & priority routing.</p>
            </div>
            <button className="w-full mt-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded-lg">
              Start 14-Day Trial →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
