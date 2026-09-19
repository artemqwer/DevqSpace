"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { Monitor, DeviceTablet, DeviceMobile, ArrowSquareOut } from "@phosphor-icons/react";

interface DemoFrameProps {
  product: Product;
}

type DeviceMode = "desktop" | "tablet" | "mobile";
type AccentTheme = "cyan" | "green" | "purple" | "pink" | "amber";

const ACCENT_COLORS: Record<AccentTheme, { hex: string; name: string }> = {
  cyan: { hex: "#00f0ff", name: "Cyber Cyan" },
  green: { hex: "#00ff66", name: "Matrix Green" },
  purple: { hex: "#b98cff", name: "Neon Purple" },
  pink: { hex: "#ff007a", name: "Sunset Pink" },
  amber: { hex: "#ffb800", name: "Solar Amber" },
};

export function DemoFrame({ product }: DemoFrameProps) {
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [accent, setAccent] = useState<AccentTheme>("cyan");
  const [customizerOpen, setCustomizerOpen] = useState(false);

  return (
    <div
      className="min-h-screen bg-[#06070a] text-slate-100 flex flex-col antialiased"
      style={{ ["--theme-accent" as any]: ACCENT_COLORS[accent].hex }}
    >
      {/* Top Floating Control Bar */}
      <header className="sticky top-0 z-50 h-14 bg-[#0d1017]/95 backdrop-blur-md border-b border-white/10 px-3 sm:px-6 flex items-center justify-between shadow-lg">
        {/* Left: Brand & Product Info */}
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <Link
            href={`/catalog/${product.slug}`}
            className="flex items-center space-x-1.5 text-slate-400 hover:text-white transition group shrink-0"
            title="Назад до сторінки товару"
          >
            <span className="text-sm font-mono group-hover:-translate-x-0.5 transition-transform">←</span>
            <span className="text-xs font-mono hidden sm:inline">Каталог</span>
          </Link>

          <div className="h-4 w-px bg-white/10 hidden sm:block shrink-0" />

          <div className="flex items-center space-x-2 min-w-0">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neon-green/10 text-neon-green border border-neon-green/30 shrink-0">
              LIVE DEMO
            </span>
            <span className="text-xs font-bold text-white truncate max-w-[120px] sm:max-w-[200px] md:max-w-[280px]">
              {product.title}
            </span>
          </div>
        </div>

        {/* Center: Device Viewport Switcher & Theme Customizer */}
        <div className="flex items-center gap-2">
          {/* Device Switcher */}
          <div className="hidden md:flex items-center bg-black/40 border border-white/10 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setDevice("desktop")}
              className={`px-3 py-1 rounded font-mono text-[11px] transition flex items-center space-x-1.5 ${
                device === "desktop"
                  ? "bg-white/15 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
              <span>Desktop</span>
            </button>
            <button
              onClick={() => setDevice("tablet")}
              className={`px-3 py-1 rounded font-mono text-[11px] transition flex items-center space-x-1.5 ${
                device === "tablet"
                  ? "bg-white/15 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <DeviceTablet className="h-3.5 w-3.5" />
              <span>Tablet (768px)</span>
            </button>
            <button
              onClick={() => setDevice("mobile")}
              className={`px-3 py-1 rounded font-mono text-[11px] transition flex items-center space-x-1.5 ${
                device === "mobile"
                  ? "bg-white/15 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <DeviceMobile className="h-3.5 w-3.5" />
              <span>Mobile (390px)</span>
            </button>
          </div>

          {/* Open in New Tab Button */}
          <a
            href={`/demo/view/${product.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition"
            title="Відкрити чистий продукт у новій вкладці на весь екран"
          >
            <ArrowSquareOut className="h-3.5 w-3.5" />
            <span className="text-[11px]">Нова вкладка</span>
          </a>

          {/* Theme / Palette Customizer Button */}
          <div className="relative">
            <button
              onClick={() => setCustomizerOpen(!customizerOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 transition"
              title="Кастомізатор кольору та стилю"
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: ACCENT_COLORS[accent].hex }}
              />
              <span className="hidden lg:inline text-[11px]">Колір</span>
            </button>

            {/* Customizer Popover */}
            {customizerOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 p-3 rounded-2xl bg-[#0e121a] border border-white/20 shadow-2xl z-50 space-y-2.5 font-mono text-xs">
                <div className="flex justify-between items-center pb-1.5 border-b border-white/10 text-[11px] text-slate-400">
                  <span>АКЦЕНТНИЙ КОЛІР:</span>
                  <button
                    onClick={() => setCustomizerOpen(false)}
                    className="text-slate-500 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-1">
                  {(Object.keys(ACCENT_COLORS) as AccentTheme[]).map((key) => {
                    const c = ACCENT_COLORS[key];
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          setAccent(key);
                          setCustomizerOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] transition ${
                          accent === key
                            ? "bg-white/10 text-white font-bold"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span>{c.name}</span>
                        </div>
                        {accent === key && <span>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Direct Checkout CTA */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          <Link
            href={`/order/${product.slug}`}
            className="px-3.5 sm:px-4 py-1.5 bg-neon-green hover:bg-neon-green/90 text-black font-bold text-xs rounded-lg transition-all shadow-[0_0_15px_rgba(0,255,102,0.3)] flex items-center space-x-1.5"
          >
            <span className="hidden sm:inline">Купити сорс-код</span>
            <span className="sm:hidden">Купити</span>
            <span className="font-mono bg-black/20 text-black px-1.5 py-0.2 rounded font-black">
              ${product.price}
            </span>
            <span>→</span>
          </Link>
        </div>
      </header>

      {/* Main Demo Workspace */}
      <main className="flex-1 flex items-start justify-center bg-[#050608] overflow-y-auto">
        {device === "desktop" && (
          <div className="w-full h-[calc(100vh-56px)] flex flex-col bg-[#0b0c10]">
            <iframe
              src={`/demo/view/${product.slug}`}
              className="w-full h-full border-0 bg-[#06070a]"
              title={product.title}
            />
          </div>
        )}

        {device === "tablet" && (
          <div
            className="my-6 rounded-2xl border-[8px] border-[#181c28] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] bg-[#0b0c10] overflow-hidden flex flex-col shrink-0 transition-all duration-300"
            style={{ width: "768px", height: "min(920px, calc(100vh - 80px))" }}
          >
            <iframe
              src={`/demo/view/${product.slug}`}
              className="w-full h-full border-0 bg-[#06070a]"
              title={product.title}
            />
          </div>
        )}

        {device === "mobile" && (
          <div
            className="my-6 rounded-[48px] border-[10px] border-[#181c28] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] bg-[#0b0c10] overflow-hidden flex flex-col relative shrink-0 transition-all duration-300"
            style={{ width: "390px", height: "min(844px, calc(100vh - 80px))" }}
          >
            {/* Top Phone Speaker / Dynamic Island */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-20 h-4 w-28 bg-black rounded-full flex items-center justify-between px-3 pointer-events-none border border-white/10 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-[#111624]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#030712] border border-blue-900/50" />
            </div>
            <iframe
              src={`/demo/view/${product.slug}`}
              className="w-full h-full border-0 pt-3 bg-[#06070a]"
              title={product.title}
            />
          </div>
        )}
      </main>
    </div>
  );
}
