"use client";

import React, { useState } from "react";
import type { Product } from "@/lib/products";

export function CrmDemo({ product }: { product: Product }) {
  const [activeTab, setActiveTab] = useState("leads");

  const leads = [
    { name: "Apex FinTech", deal: "$14,000", stage: "Proposal Sent", contact: "@alex_apex", days: "2d ago" },
    { name: "Solana Staking DAO", deal: "$8,500", stage: "In Review", contact: "dao@sol.org", days: "4d ago" },
    { name: "CoffeeChain App", deal: "$4,200", stage: "Closed Won", contact: "+380 67 123 45", days: "1w ago" },
  ];

  return (
    <div className="flex-1 p-6 max-w-5xl mx-auto space-y-8 antialiased font-sans text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-mono uppercase text-neon-blue">{product.category} Solution</span>
          <h1 className="text-2xl font-bold text-white mt-1">{product.title}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{product.tagline}</p>
        </div>

        <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs font-mono">
          <button
            onClick={() => setActiveTab("leads")}
            className={`px-3 py-1 rounded transition ${activeTab === "leads" ? "bg-neon-blue text-black font-bold" : "text-slate-400"}`}
          >
            Leads Pipeline
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-3 py-1 rounded transition ${activeTab === "analytics" ? "bg-neon-blue text-black font-bold" : "text-slate-400"}`}
          >
            Analytics
          </button>
        </div>
      </div>

      {/* Kanban / Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {leads.map((l, i) => (
          <div key={i} className="p-5 rounded-xl bg-[#111520] border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                {l.stage}
              </span>
              <span className="text-slate-500">{l.days}</span>
            </div>
            <h3 className="text-base font-bold text-white">{l.name}</h3>
            <div className="flex justify-between items-center pt-3 border-t border-slate-800 text-xs font-mono">
              <span className="text-slate-400">{l.contact}</span>
              <span className="text-white font-bold text-sm">{l.deal}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Feature Bullet Strip */}
      <div className="p-6 rounded-2xl bg-[#0e121a] border border-white/10 space-y-3">
        <h4 className="text-xs font-mono uppercase text-slate-400">Included In This Package:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
          <div>• Full source code & Next.js 15 App Router</div>
          <div>• Prisma ORM with SQLite / PostgreSQL migrations</div>
          <div>• Telegram Webhook integration for instant notifications</div>
        </div>
      </div>
    </div>
  );
}
