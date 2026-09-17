"use client";

import React, { useState } from "react";
import type { Product } from "@/lib/products";
import { Copy, Eye, Sliders, Check, Sparkle, ShoppingCartSimple, ArrowsClockwise } from "@phosphor-icons/react";

export function LandingBuilderDemo({ product }: { product?: Product }) {
  const [activeBlocks, setActiveBlocks] = useState<string[]>([
    "hero",
    "features",
    "pricing",
    "cta",
  ]);
  const [colorTheme, setColorTheme] = useState<"cyan" | "purple" | "green" | "amber">("cyan");
  const [headline, setHeadline] = useState("Build & Launch Your SaaS in Hours");
  const [copied, setCopied] = useState(false);

  const availableBlocks = [
    { id: "hero", name: "Hero Section", desc: "Title, badge, CTA buttons and preview" },
    { id: "stats", name: "Social Proof & Metrics", desc: "4-column counter with verified icons" },
    { id: "features", name: "Feature Grid", desc: "3x2 feature cards with glow borders" },
    { id: "pricing", name: "Pricing Table", desc: "Tiered monthly & annual subscriptions" },
    { id: "testimonials", name: "Customer Testimonials", desc: "Reviews slider with ratings" },
    { id: "cta", name: "Final CTA Banner", desc: "High-conversion newsletter & signup strip" },
  ];

  const themeColors = {
    cyan: {
      accent: "#00f0ff",
      badge: "border-cyan-500/40 text-cyan-400 bg-cyan-500/10",
      btn: "bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.3)]",
      border: "border-cyan-500/30",
      glow: "from-cyan-500/10 via-transparent to-transparent",
    },
    purple: {
      accent: "#b98cff",
      badge: "border-purple-500/40 text-purple-400 bg-purple-500/10",
      btn: "bg-purple-500 text-white hover:bg-purple-400 shadow-[0_0_20px_rgba(185,140,255,0.3)]",
      border: "border-purple-500/30",
      glow: "from-purple-500/10 via-transparent to-transparent",
    },
    green: {
      accent: "#00ff66",
      badge: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
      btn: "bg-emerald-400 text-black hover:bg-emerald-300 shadow-[0_0_20px_rgba(0,255,102,0.3)]",
      border: "border-emerald-500/30",
      glow: "from-emerald-500/10 via-transparent to-transparent",
    },
    amber: {
      accent: "#ffb800",
      badge: "border-amber-500/40 text-amber-400 bg-amber-500/10",
      btn: "bg-amber-400 text-black hover:bg-amber-300 shadow-[0_0_20px_rgba(255,184,0,0.3)]",
      border: "border-amber-500/30",
      glow: "from-amber-500/10 via-transparent to-transparent",
    },
  };

  const currentTheme = themeColors[colorTheme];

  const toggleBlock = (id: string) => {
    if (activeBlocks.includes(id)) {
      if (activeBlocks.length > 1) {
        setActiveBlocks(activeBlocks.filter((b) => b !== id));
      }
    } else {
      setActiveBlocks([...activeBlocks, id]);
    }
  };

  const copyCode = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-screen bg-[#07080c] text-slate-100 font-sans antialiased">
      {/* Left Control Panel */}
      <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-white/10 bg-[#0d1017] p-5 space-y-6 shrink-0">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
            <Sliders className="h-4 w-4" />
            <span>Interactive Builder</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Landing Page Config</h2>
          <p className="text-xs text-slate-400 mt-1">
            Toggle modules, customize headings, and switch palette in real-time.
          </p>
        </div>

        {/* Theme Palette */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-slate-400 block">Accent Color Palette</label>
          <div className="grid grid-cols-4 gap-2">
            {(["cyan", "purple", "green", "amber"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setColorTheme(t)}
                className={`py-2 px-1 rounded-xl text-xs font-mono font-bold capitalize transition border flex items-center justify-center gap-1.5 ${
                  colorTheme === t
                    ? "bg-white/10 border-white text-white shadow-sm"
                    : "bg-black/30 border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: themeColors[t].accent }}
                />
                <span className="hidden sm:inline">{t}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Live Title Editor */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-slate-400 block">Hero Title Editor</label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
            placeholder="Введіть заголовок..."
          />
        </div>

        {/* Blocks Toggle */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-slate-400 block">Active Layout Modules ({activeBlocks.length})</label>
          <div className="space-y-1.5">
            {availableBlocks.map((block) => {
              const active = activeBlocks.includes(block.id);
              return (
                <button
                  key={block.id}
                  onClick={() => toggleBlock(block.id)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition flex items-center justify-between ${
                    active
                      ? "bg-white/10 border-white/30 text-white"
                      : "bg-black/20 border-white/5 text-slate-400 hover:bg-white/5"
                  }`}
                >
                  <div>
                    <div className="font-semibold">{block.name}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">{block.desc}</div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                      active ? "bg-cyan-400 text-black font-bold" : "border border-white/20 text-transparent"
                    }`}
                  >
                    ✓
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Export Action */}
        <div className="pt-2 border-t border-white/10">
          <button
            onClick={copyCode}
            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition flex items-center justify-center gap-2"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? "Tailwind Code Copied!" : "Export Clean Tailwind Code"}</span>
          </button>
        </div>
      </aside>

      {/* Right Live Preview Canvas */}
      <div className="flex-1 p-4 sm:p-8 overflow-y-auto space-y-12">
        {/* Top Preview Bar Indicator */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Interactive Live Output</span>
          </div>
          <div className="text-[11px] text-slate-400">Theme: {colorTheme.toUpperCase()}</div>
        </div>

        {/* HERO MODULE */}
        {activeBlocks.includes("hero") && (
          <section className="text-center space-y-6 pt-4 max-w-3xl mx-auto">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold border ${currentTheme.badge}`}>
              <Sparkle className="h-3.5 w-3.5" />
              <span>Next.js 15 + Tailwind CSS Starter</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {headline}
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
              Production-ready frontend architecture with responsive primitives, SEO metadata, and instant deployment configurations.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button className={`px-6 py-3 rounded-xl font-bold text-xs transition ${currentTheme.btn}`}>
                Get Started Now →
              </button>
              <button className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-semibold text-xs text-white transition">
                Documentation
              </button>
            </div>
          </section>
        )}

        {/* STATS MODULE */}
        {activeBlocks.includes("stats") && (
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto py-6 border-y border-white/10">
            {[
              { val: "99.99%", label: "Uptime SLA" },
              { val: "< 14ms", label: "Edge Latency" },
              { val: "12,400+", label: "Active Nodes" },
              { val: "$48.2M", label: "Volume Processed" },
            ].map((st, i) => (
              <div key={i} className="text-center p-3">
                <div className="font-mono text-2xl sm:text-3xl font-bold text-white">{st.val}</div>
                <div className="text-xs text-slate-400 mt-1 font-mono uppercase">{st.label}</div>
              </div>
            ))}
          </section>
        )}

        {/* FEATURES MODULE */}
        {activeBlocks.includes("features") && (
          <section className="space-y-6 max-w-4xl mx-auto">
            <div className="text-center space-y-2">
              <span className="text-xs font-mono uppercase text-slate-400">Core Capabilities</span>
              <h2 className="text-2xl font-bold text-white">Engineered for Maximum Developer Velocity</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: "Zero Config TypeScript", desc: "Strict type safety out of the box with zero runtime penalty." },
                { title: "Dynamic Themes", desc: "Switch color tokens and dark/light modes without layout shift." },
                { title: "Responsive Layouts", desc: "Tested across mobile, tablet, and ultra-wide monitor viewports." },
              ].map((feat, i) => (
                <div key={i} className={`p-5 rounded-2xl bg-[#0e121a] border ${currentTheme.border} space-y-2`}>
                  <div className="text-xs font-mono text-cyan-400 font-bold">0{i + 1} // FAST</div>
                  <h3 className="text-base font-bold text-white">{feat.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* PRICING MODULE */}
        {activeBlocks.includes("pricing") && (
          <section className="space-y-6 max-w-4xl mx-auto">
            <div className="text-center space-y-2">
              <span className="text-xs font-mono uppercase text-slate-400">Simple Transparent Pricing</span>
              <h2 className="text-2xl font-bold text-white">Choose Your Workspace Tier</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="p-6 rounded-2xl bg-[#0e121a] border border-white/10 space-y-4">
                <div className="text-xs font-mono text-slate-400">STARTER LICENSE</div>
                <div className="text-3xl font-black text-white font-mono">$49</div>
                <ul className="text-xs text-slate-400 space-y-2">
                  <li>✓ Single website deployment</li>
                  <li>✓ Lifetime updates</li>
                  <li>✓ Standard email support</li>
                </ul>
                <button className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition">
                  Select Starter
                </button>
              </div>

              <div className={`p-6 rounded-2xl bg-[#0e121a] border ${currentTheme.border} space-y-4 shadow-xl`}>
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-cyan-400 font-bold">EXTENDED AGENCY</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${currentTheme.badge}`}>POPULAR</span>
                </div>
                <div className="text-3xl font-black text-white font-mono">$129</div>
                <ul className="text-xs text-slate-300 space-y-2">
                  <li>✓ Unlimited client commercial projects</li>
                  <li>✓ Priority 24/7 engineering assistance</li>
                  <li>✓ Private Figma source files included</li>
                </ul>
                <button className={`w-full py-2.5 rounded-xl font-bold text-xs transition ${currentTheme.btn}`}>
                  Select Extended License
                </button>
              </div>
            </div>
          </section>
        )}

        {/* CTA MODULE */}
        {activeBlocks.includes("cta") && (
          <section className={`p-8 rounded-3xl bg-gradient-to-r ${currentTheme.glow} border ${currentTheme.border} text-center space-y-4 max-w-3xl mx-auto`}>
            <h3 className="text-2xl font-extrabold text-white">Ready to Deploy Your Digital Product?</h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Join 1,200+ creators building scalable software solutions with DevqSpace.
            </p>
            <button className={`px-8 py-3 rounded-xl font-bold text-xs transition ${currentTheme.btn}`}>
              Launch Your Site Today →
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
