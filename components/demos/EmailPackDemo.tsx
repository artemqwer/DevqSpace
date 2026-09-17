"use client";

import React, { useState } from "react";

export function EmailPackDemo() {
  const [selectedTemplate, setSelectedTemplate] = useState("welcome");

  const templates = [
    { id: "welcome", name: "01. Welcome Onboarding", desc: "Clean dual-column responsive welcome email with action CTA." },
    { id: "receipt", name: "02. Order Receipt & Invoice", desc: "Transactional receipt with line items and VAT breakdown." },
    { id: "newsletter", name: "03. Weekly Tech Dispatch", desc: "Editorial newsletter with featured article slots and author signature." },
    { id: "reset", name: "04. Password Security Alert", desc: "Single-button time-limited security verification email." },
  ];

  return (
    <div className="flex-1 p-6 max-w-5xl mx-auto space-y-8 antialiased font-sans text-slate-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-mono uppercase text-neon-blue">Responsive HTML Templates</span>
          <h1 className="text-2xl font-bold text-white mt-1">20 Modern HTML Email Templates</h1>
          <p className="text-xs text-slate-400">Tested across Apple Mail, Gmail, Outlook, and mobile clients.</p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-mono">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTemplate(t.id)}
              className={`px-3 py-1.5 rounded-lg transition ${
                selectedTemplate === t.id ? "bg-neon-blue text-black font-bold" : "bg-slate-900 border border-slate-800 text-slate-400"
              }`}
            >
              {t.name.split(" ")[1]}
            </button>
          ))}
        </div>
      </div>

      {/* Simulated Email Client Canvas */}
      <div className="max-w-xl mx-auto rounded-2xl border border-slate-700 bg-white text-slate-900 overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center space-x-2 pb-4 border-b border-slate-200 text-xs text-slate-500 font-mono">
          <span className="font-bold text-slate-800">From:</span>
          <span>DevqSpace &lt;hello@devq.space&gt;</span>
        </div>

        <div className="space-y-4">
          <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-white font-bold text-sm">
            DQ
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {selectedTemplate === "welcome" && "Welcome to DevqSpace Ecosystem"}
            {selectedTemplate === "receipt" && "Your Order #8921 is Confirmed"}
            {selectedTemplate === "newsletter" && "Dispatch #42: The Future of Edge AI"}
            {selectedTemplate === "reset" && "Authorize Sign-in Attempt"}
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            This is a fully responsive, table-based production HTML email template included in the package. Compatible with dark mode and all major desktop and mobile mail clients.
          </p>
          <div className="pt-2">
            <button className="px-6 py-3 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow">
              Confirm Your Workspace Action →
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 text-[11px] text-slate-400 font-mono flex justify-between">
          <span>DevqSpace Digital Architecture</span>
          <span>Unsubscribe</span>
        </div>
      </div>
    </div>
  );
}
