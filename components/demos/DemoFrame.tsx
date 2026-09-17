"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { CyberDashDemo } from "./CyberDashDemo";
import { SaasKitDemo } from "./SaasKitDemo";
import { CryptoLandingDemo } from "./CryptoLandingDemo";
import { EcommerceDemo } from "./EcommerceDemo";
import { PortfolioDemo } from "./PortfolioDemo";
import { AgencyDemo } from "./AgencyDemo";
import { CrmDemo } from "./CrmDemo";
import { EmailPackDemo } from "./EmailPackDemo";

interface DemoFrameProps {
  product: Product;
}

type DeviceMode = "desktop" | "tablet" | "mobile";

export function DemoFrame({ product }: DemoFrameProps) {
  const [device, setDevice] = useState<DeviceMode>("desktop");

  const renderDemoContent = () => {
    switch (product.slug) {
      case "cyberdash-admin":
      case "dashboard-ui-kit":
        return <CyberDashDemo />;
      case "saas-landing-kit":
        return <SaasKitDemo />;
      case "crypto-landing":
        return <CryptoLandingDemo />;
      case "ecommerce-template":
        return <EcommerceDemo />;
      case "portfolio-pro":
        return <PortfolioDemo />;
      case "agency-template":
        return <AgencyDemo />;
      case "mini-crm-agency":
      case "landing-builder":
      case "bot-constructor":
        return <CrmDemo product={product} />;
      case "email-pack":
        return <EmailPackDemo />;
      default:
        return (
          <div className="flex min-h-[600px] flex-col items-center justify-center p-8 text-center text-slate-300">
            <div className="text-4xl mb-3">⚡</div>
            <h2 className="text-xl font-bold text-white mb-2">{product.title}</h2>
            <p className="text-xs text-slate-400 max-w-md mb-6">{product.description}</p>
            <Link
              href={`/order/${product.slug}`}
              className="rounded-xl bg-neon-blue px-6 py-2.5 text-xs font-bold text-black"
            >
              Купити сорс-код (${product.price}) →
            </Link>
          </div>
        );
    }
  };

  const getDeviceStyles = () => {
    switch (device) {
      case "tablet":
        return "max-w-[768px] border-x border-b border-white/10 rounded-b-2xl shadow-2xl transition-all duration-300";
      case "mobile":
        return "max-w-[390px] border-x border-b border-white/10 rounded-b-2xl shadow-2xl transition-all duration-300";
      case "desktop":
      default:
        return "w-full transition-all duration-300";
    }
  };

  return (
    <div className="min-h-screen bg-[#06070a] text-slate-100 flex flex-col antialiased">
      {/* Top Floating Control Bar */}
      <header className="sticky top-0 z-50 h-14 bg-[#0d1017]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 flex items-center justify-between shadow-lg">
        {/* Left: Brand & Product Info */}
        <div className="flex items-center space-x-3 min-w-0">
          <Link
            href={`/catalog/${product.slug}`}
            className="flex items-center space-x-2 text-slate-400 hover:text-white transition group shrink-0"
            title="Назад до товару"
          >
            <span className="text-sm font-mono group-hover:-translate-x-0.5 transition-transform">←</span>
            <span className="text-xs font-mono hidden sm:inline">Каталог</span>
          </Link>

          <div className="h-4 w-px bg-white/10 hidden sm:block shrink-0" />

          <div className="flex items-center space-x-2 min-w-0">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neon-blue/10 text-neon-blue border border-neon-blue/20 shrink-0">
              LIVE DEMO
            </span>
            <span className="text-xs font-bold text-white truncate max-w-[140px] sm:max-w-[240px]">
              {product.title}
            </span>
          </div>
        </div>

        {/* Center: Device Viewport Switcher */}
        <div className="hidden md:flex items-center bg-black/40 border border-white/10 rounded-lg p-0.5 text-xs">
          <button
            onClick={() => setDevice("desktop")}
            className={`px-3 py-1 rounded font-mono text-[11px] transition flex items-center space-x-1 ${
              device === "desktop" ? "bg-white/15 text-white font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            <span>🖥️ Desktop</span>
          </button>
          <button
            onClick={() => setDevice("tablet")}
            className={`px-3 py-1 rounded font-mono text-[11px] transition flex items-center space-x-1 ${
              device === "tablet" ? "bg-white/15 text-white font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            <span>📱 Tablet (768px)</span>
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={`px-3 py-1 rounded font-mono text-[11px] transition flex items-center space-x-1 ${
              device === "mobile" ? "bg-white/15 text-white font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            <span>📲 Mobile (390px)</span>
          </button>
        </div>

        {/* Right: Direct Checkout CTA */}
        <div className="flex items-center space-x-3 shrink-0">
          <Link
            href={`/order/${product.slug}`}
            className="px-4 py-1.5 bg-gradient-to-r from-neon-blue to-neon-purple hover:opacity-95 text-black font-bold text-xs rounded-lg transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center space-x-1.5"
          >
            <span>Купити сорс-код</span>
            <span className="font-mono bg-black/20 text-black px-1.5 py-0.2 rounded font-black">${product.price}</span>
            <span>→</span>
          </Link>
        </div>
      </header>

      {/* Main Demo Workspace */}
      <main className="flex-1 flex justify-center bg-[#050608] overflow-y-auto">
        <div className={`${getDeviceStyles()} bg-[#0b0c10] min-h-screen flex flex-col`}>
          {renderDemoContent()}
        </div>
      </main>
    </div>
  );
}
