"use client";

import React, { useState } from "react";

export function AgencyDemo() {
  const [budget, setBudget] = useState("$30k – $60k");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="flex-1 p-6 max-w-5xl mx-auto space-y-12 antialiased font-sans text-slate-100">
      {/* Agency Header */}
      <div className="space-y-4 pt-4">
        <div className="inline-block px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-mono">
          DIGITAL ARCHITECTURE PRACTICE
        </div>
        <h1 className="text-3xl sm:text-5xl font-light tracking-tight max-w-3xl leading-tight">
          Engineering high-yield dominance for{" "}
          <span className="font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            category leaders.
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
          Full-stack web engineering, Next.js 15, headless Sanity Studio, and bespoke corporate identity systems.
        </p>
      </div>

      {/* Disciplines */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { num: "01", title: "Brand Architecture", desc: "Positioning, typography, and design tokens." },
          { num: "02", title: "Web Engineering", desc: "Next.js 15 with 100/100 Lighthouse speed scores." },
          { num: "03", title: "Conversion CRO", desc: "Data pipelines and high-velocity acquisition." },
        ].map((s, i) => (
          <div key={i} className="p-5 rounded-2xl bg-[#10121a] border border-slate-800 space-y-2">
            <div className="text-xs font-mono text-purple-400">{s.num} // CORE</div>
            <h3 className="text-base font-bold text-white">{s.title}</h3>
            <p className="text-xs text-slate-400">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Scope Estimator */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#10121a] border border-purple-500/30 space-y-6 max-w-2xl mx-auto shadow-2xl">
        <div>
          <h3 className="text-lg font-bold text-white">Interactive Pitch & Budget Estimator</h3>
          <p className="text-xs text-slate-400 mt-1">Select your parameter tier to test the interactive intake pipeline.</p>
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-400 mb-2">Budget Allocation:</label>
          <div className="grid grid-cols-3 gap-2">
            {["$15k – $30k", "$30k – $60k", "$60k – $120k+"].map((tier) => (
              <button
                key={tier}
                onClick={() => setBudget(tier)}
                className={`py-2 px-3 rounded-lg text-xs font-mono transition border ${
                  budget === tier
                    ? "bg-purple-600/20 border-purple-500 text-purple-300 font-bold"
                    : "bg-slate-900 border-slate-800 text-slate-400"
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        {submitted ? (
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-center text-xs text-purple-300 font-mono">
            ✓ Brief dispatched to partner inbox for review ({budget})
          </div>
        ) : (
          <button
            onClick={() => setSubmitted(true)}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg"
          >
            Calculate Initial Brief Scope ({budget}) →
          </button>
        )}
      </div>
    </div>
  );
}
