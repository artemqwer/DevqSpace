"use client";

import React, { useState } from "react";
import { Sparkle, CheckCircle, Calculator, RocketLaunch, ShieldCheck, Cpu } from "@phosphor-icons/react";

interface ProjectArchetype {
  id: string;
  name: string;
  basePrice: number;
  baseWeeks: number;
  desc: string;
}

interface ScopeAddon {
  id: string;
  name: string;
  price: number;
  weeks: number;
  desc: string;
}

const ARCHETYPES: ProjectArchetype[] = [
  { id: "saas", name: "Next.js SaaS Platform", basePrice: 18000, baseWeeks: 4, desc: "Full-stack dashboard, billing, auth & telemetry" },
  { id: "web3", name: "Web3 Protocol Portal", basePrice: 24000, baseWeeks: 5, desc: "Smart contract integration, wallet connect & live DEX feeds" },
  { id: "brand", name: "Corporate Brand Flagship", basePrice: 14000, baseWeeks: 3, desc: "Art-directed 3D visuals, typography & headless CMS" },
  { id: "ecom", name: "Headless E-Commerce", basePrice: 20000, baseWeeks: 4, desc: "Shopify/Stripe checkout, catalog virtualization & instant search" },
];

const ADDONS: ScopeAddon[] = [
  { id: "tokens", name: "Design System & Token Architecture", price: 4500, weeks: 1, desc: "Figma tokens sync, component library & dark mode" },
  { id: "cms", name: "Sanity / Strapi Headless CMS", price: 3500, weeks: 0.5, desc: "Real-time content editing, i18n & visual previews" },
  { id: "seo", name: "100/100 Lighthouse Speed & SEO Hardening", price: 2200, weeks: 0.5, desc: "Sub-second FCP, structured schema & edge caching" },
  { id: "sla", name: "90-Day SLA Priority Engineering Support", price: 4000, weeks: 0, desc: "Guaranteed 4-hour response time & weekly maintenance" },
];

export function AgencyDemo() {
  const [selectedArch, setSelectedArch] = useState<string>("saas");
  const [selectedAddons, setSelectedAddons] = useState<string[]>(["tokens", "seo"]);
  const [submitted, setSubmitted] = useState(false);
  const [clientEmail, setClientEmail] = useState("cto@vortexlabs.tech");

  const toggleAddon = (id: string) => {
    if (selectedAddons.includes(id)) {
      setSelectedAddons(selectedAddons.filter((a) => a !== id));
    } else {
      setSelectedAddons([...selectedAddons, id]);
    }
  };

  const currentArch = ARCHETYPES.find((a) => a.id === selectedArch) || ARCHETYPES[0];
  const addonsTotal = selectedAddons.reduce((acc, id) => {
    const addon = ADDONS.find((a) => a.id === id);
    return acc + (addon ? addon.price : 0);
  }, 0);
  const weeksTotal = selectedAddons.reduce((acc, id) => {
    const addon = ADDONS.find((a) => a.id === id);
    return acc + (addon ? addon.weeks : 0);
  }, currentArch.baseWeeks);

  const totalPrice = currentArch.basePrice + addonsTotal;

  return (
    <div className="flex-1 p-4 sm:p-8 max-w-5xl mx-auto space-y-12 antialiased font-sans text-slate-100">
      {/* Agency Header */}
      <div className="space-y-4 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-mono">
          <Sparkle className="h-3.5 w-3.5 text-purple-400" />
          <span>DIGITAL ARCHITECTURE PRACTICE & HIGH-VELOCITY ENGINEERING</span>
        </div>
        <h1 className="text-3xl sm:text-6xl font-light tracking-tight text-white leading-tight max-w-3xl">
          Engineering dominance for{" "}
          <span className="font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
            category leaders.
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
          Full-stack web engineering, Next.js 15, headless Sanity Studio, and bespoke corporate identity systems with sub-second execution speeds.
        </p>

        {/* Client Social Proof Badges */}
        <div className="pt-2 flex flex-wrap items-center gap-6 text-xs font-mono text-slate-500 border-b border-white/10 pb-6">
          <span className="text-slate-400 uppercase font-semibold">PARTNERS & CLIENTS:</span>
          <span>// SOLANA ECOSYSTEM</span>
          <span>// MONAD FOUNDATION</span>
          <span>// VERCEL ALLIANCE</span>
          <span>// STARKNET CORE</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Client Valuation Supported", val: "$480M+", sub: "across 24 shipped systems" },
          { label: "Average Sprint Velocity", val: "14 Days", sub: "from brief to staging release" },
          { label: "Lighthouse Performance", val: "100/100", sub: "guaranteed Core Web Vitals" },
          { label: "Global Design Awards", val: "19 Wins", sub: "Awwwards, FWA & Red Dot" },
        ].map((m, i) => (
          <div key={i} className="p-4 rounded-xl bg-[#0e121a] border border-white/10 space-y-1">
            <div className="text-2xl font-bold text-white font-mono">{m.val}</div>
            <div className="text-xs font-mono text-purple-400">{m.label}</div>
            <div className="text-[10px] text-slate-500">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Interactive Scope & Budget Estimator */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0e121a] border border-purple-500/30 space-y-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-purple-400 font-bold uppercase">
              <Calculator className="h-4 w-4" />
              <span>Interactive Scope & Investment Estimator</span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">Configure Your Project Sprint</h3>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono text-slate-400">ESTIMATED LAUNCH</span>
            <div className="text-sm font-bold font-mono text-purple-300">~{weeksTotal} Weeks Timeline</div>
          </div>
        </div>

        {/* Step 1: Archetype selection */}
        <div className="space-y-3">
          <label className="block text-xs font-mono text-slate-300 font-bold uppercase">
            1. Core Architecture Archetype
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ARCHETYPES.map((arch) => {
              const isSelected = selectedArch === arch.id;
              return (
                <div
                  key={arch.id}
                  onClick={() => setSelectedArch(arch.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                    isSelected
                      ? "bg-purple-600/15 border-purple-500 text-white shadow-lg"
                      : "bg-black/40 border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-white">{arch.name}</span>
                    <span className="text-xs font-mono text-purple-400 font-bold">
                      ${arch.basePrice.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{arch.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Scope Addons */}
        <div className="space-y-3">
          <label className="block text-xs font-mono text-slate-300 font-bold uppercase">
            2. High-Yield Add-Ons & Integrations
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ADDONS.map((addon) => {
              const checked = selectedAddons.includes(addon.id);
              return (
                <div
                  key={addon.id}
                  onClick={() => toggleAddon(addon.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    checked
                      ? "bg-purple-600/10 border-purple-500/60 text-white"
                      : "bg-black/30 border-white/5 text-slate-400 hover:border-white/20"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {}}
                    className="mt-1 rounded border-slate-700 text-purple-600 focus:ring-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center text-xs font-semibold text-white">
                      <span>{addon.name}</span>
                      <span className="font-mono text-purple-400">+${addon.price.toLocaleString()}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{addon.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Total & Action */}
        <div className="p-5 rounded-xl bg-black/60 border border-white/10 flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase">Calculated Project Scope</div>
            <div className="text-3xl font-bold font-mono text-white mt-1">
              ${totalPrice.toLocaleString()}
              <span className="text-xs font-normal text-slate-400 ml-2">USD (fixed sprint cap)</span>
            </div>
            <div className="text-xs font-mono text-purple-300 mt-1">
              Includes: {currentArch.name} + {selectedAddons.length} specialized add-ons
            </div>
          </div>

          <div className="w-full sm:w-auto">
            {submitted ? (
              <div className="p-3.5 rounded-xl bg-purple-500/20 border border-purple-500 text-center font-mono text-xs text-purple-300 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-purple-400" />
                <span>RFP Dispatched to Partners ({clientEmail})</span>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="px-3 py-2.5 rounded-xl bg-black/80 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-purple-400"
                  placeholder="name@company.com"
                />
                <button
                  onClick={() => setSubmitted(true)}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-xl whitespace-nowrap flex items-center justify-center gap-2"
                >
                  <RocketLaunch className="h-4 w-4" />
                  <span>Dispatch Proposal Request →</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Disciplines Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
        {[
          { num: "01", title: "Brand Architecture & Identity", icon: ShieldCheck, desc: "Positioning matrices, generative typography, design systems, and component tokens for unified scale." },
          { num: "02", title: "Flagship Web Engineering", icon: Cpu, desc: "Next.js 15, Turbopack, Tailwind CSS, sub-second TTFB, and 100/100 Lighthouse benchmark compliance." },
          { num: "03", title: "Conversion CRO & Telemetry", icon: RocketLaunch, desc: "PostHog analytics pipelines, high-velocity acquisition funnels, and enterprise checkout flows." },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="p-6 rounded-2xl bg-[#0e121a] border border-white/10 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-purple-400 font-bold">{s.num} // CORE</span>
                <Icon className="h-5 w-5 text-slate-500" />
              </div>
              <h3 className="text-base font-bold text-white">{s.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
