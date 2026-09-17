"use client";

import React, { useState } from "react";

export function PortfolioDemo() {
  const [filter, setFilter] = useState("all");
  const [modalItem, setModalItem] = useState<any>(null);

  const projects = [
    { id: "p1", cat: "ui-ux", title: "Lumina Spatial OS", client: "Lumina XR Labs", year: "2025", metric: "+340% spatial interaction speed", summary: "Next-gen spatial computing interface designed for gesture-driven AR glasses." },
    { id: "p2", cat: "branding", title: "Vortex Monolith Identity", client: "Vortex Sound", year: "2025", metric: "Featured on Brand New & TDC", summary: "Brutal minimal typography and generative acoustic identities for electronic audio." },
    { id: "p3", cat: "photo", title: "Nordic Silence Series", client: "Kinfolk Magazine", year: "2024", metric: "3,000 monographs sold out", summary: "Medium format architectural and landscape editorial captured in Lofoten." },
  ];

  const filtered = filter === "all" ? projects : projects.filter((p) => p.cat === filter);

  return (
    <div className="flex-1 p-6 max-w-5xl mx-auto space-y-10 antialiased font-sans text-slate-100">
      {/* Bio Header */}
      <div className="space-y-3 pt-4">
        <span className="text-xs font-mono uppercase text-emerald-400 tracking-widest">Selected Works & Art Direction</span>
        <h1 className="text-3xl sm:text-5xl font-light tracking-tight text-white">
          Crafting radical identities & digital systems.
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
          Independent design practice working across UI/UX, brand typography, and spatial environments with Sanity CMS.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 text-xs font-mono">
        {[
          { id: "all", label: "All Works" },
          { id: "ui-ux", label: "UI/UX & Systems" },
          { id: "branding", label: "Brand Identity" },
          { id: "photo", label: "Photography" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === f.id ? "bg-emerald-500 text-black font-bold" : "bg-slate-900 border border-slate-800 text-slate-400"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => setModalItem(item)}
            className="p-5 rounded-2xl bg-[#11141c] border border-slate-800 hover:border-emerald-500/50 transition cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-500 mb-2">
                <span className="text-emerald-400 uppercase">{item.cat}</span>
                <span>{item.year}</span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition">{item.title}</h3>
              <p className="text-xs text-slate-400 mt-2 line-clamp-2">{item.summary}</p>
            </div>
            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-mono text-[11px]">{item.metric}</span>
              <span className="text-emerald-400 font-bold">Case Study ↗</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalItem && (
        <div className="p-6 rounded-2xl bg-[#13161c] border border-slate-700 max-w-lg mx-auto space-y-4 shadow-2xl">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-emerald-400 uppercase">{modalItem.client} — {modalItem.year}</span>
            <button onClick={() => setModalItem(null)} className="text-slate-400 hover:text-white font-mono text-xs">✕ Close</button>
          </div>
          <h3 className="text-xl font-bold text-white">{modalItem.title}</h3>
          <p className="text-xs text-slate-300 leading-relaxed">{modalItem.summary}</p>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400">
            Impact: {modalItem.metric}
          </div>
        </div>
      )}
    </div>
  );
}
