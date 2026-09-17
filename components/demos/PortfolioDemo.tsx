"use client";

import React, { useState } from "react";
import { Sparkle, ArrowUpRight, CheckCircle, EnvelopeSimple } from "@phosphor-icons/react";

interface Project {
  id: string;
  cat: "ui-ux" | "branding" | "creative-dev";
  title: string;
  client: string;
  year: string;
  role: string;
  stack: string[];
  metric: string;
  summary: string;
  challenge: string;
  solution: string;
}

const PROJECTS: Project[] = [
  {
    id: "p1",
    cat: "ui-ux",
    title: "Lumina Spatial OS",
    client: "Lumina XR Labs",
    year: "2025",
    role: "Lead Systems Architect & UI Designer",
    stack: ["Next.js 15", "WebXR", "Three.js", "Tailwind CSS"],
    metric: "+340% interaction speed | $14M Series A",
    summary: "Next-gen spatial computing interface designed for gesture-driven AR glasses and spatial computing hardware.",
    challenge: "Traditional 2D interfaces create cognitive friction and eye strain when mapped to stereoscopic 3D environments.",
    solution: "Engineered a dynamic depth hierarchy with micro-haptic visual feedback and adaptive ambient contrast, reducing fatigue by 62%."
  },
  {
    id: "p2",
    cat: "branding",
    title: "Aura Sound Monolith",
    client: "Aura Acoustic Engineering",
    year: "2025",
    role: "Brand Identity & Audio-Visual Systems",
    stack: ["Generative Typography", "WebGL Canvas", "GLSL Shaders"],
    metric: "Featured on Brand New & TDC 2025",
    summary: "Brutal minimal typography and generative acoustic identities for an ultra-high-end studio headphone brand.",
    challenge: "Needed a design language that bridged classical audiophile precision with bleeding-edge generative art.",
    solution: "Developed custom reactive sound glyphs that modulate letterforms based on incoming microphone frequencies in real-time."
  },
  {
    id: "p3",
    cat: "creative-dev",
    title: "Chronos Vault",
    client: "Chronos Financial Protocol",
    year: "2025",
    role: "Creative Technologist & Frontend Dev",
    stack: ["Next.js", "Ethers.js", "Framer Motion", "Tailwind"],
    metric: "+$480M TVL tracked | 99.98% uptime",
    summary: "Zero-knowledge institutional crypto wealth management portal with biometric authentication cues.",
    challenge: "Complex cryptographic key operations often feel intimidating and opaque to institutional family offices.",
    solution: "Streamlined the transaction life-cycle into a single interactive 3D timeline with sub-second WebSocket updates."
  },
  {
    id: "p4",
    cat: "ui-ux",
    title: "Synthetix Neural Core",
    client: "Synthetix Labs",
    year: "2024",
    role: "Principal Product Designer",
    stack: ["React Flow", "TypeScript", "Tailwind", "Radix UI"],
    metric: "ProductHunt #1 Product of the Day | 4.9/5",
    summary: "Visual canvas for multi-agent LLM orchestration with collaborative multi-user live cursors.",
    challenge: "Handling complex directed acyclic graphs (DAGs) with 500+ interconnected agent nodes without browser lag.",
    solution: "Designed viewport-culling virtualization rendering combined with minimalist cyberpunk node cards."
  },
  {
    id: "p5",
    cat: "branding",
    title: "Komorebi Architecture",
    client: "Komorebi Atelier Kyoto",
    year: "2024",
    role: "Creative Direction & Web Engineering",
    stack: ["Sanity CMS", "Next.js 14", "Lenis Scroll"],
    metric: "Design Week Kyoto Winner | 0.6s FCP",
    summary: "Digital architectural archive exploring traditional Japanese timber joinery and sustainable concrete.",
    challenge: "Translating tactile physical materials (charred cedar, washi paper) into an ultra-fast digital web medium.",
    solution: "Employed high-fidelity texture mapping with responsive progressive WebP assets and silk-smooth inertia scrolling."
  },
  {
    id: "p6",
    cat: "creative-dev",
    title: "Nordic Silence Monograph",
    client: "Kinfolk Magazine",
    year: "2024",
    role: "Digital Exhibition Designer",
    stack: ["Canvas 2D", "Sound API", "GSAP"],
    metric: "3,000 Monograph copies sold out in 48h",
    summary: "Interactive digital companion to the medium-format photographic exhibition in the Lofoten archipelago.",
    challenge: "Creating an immersive sensory experience that respects the quiet, reflective tone of remote Arctic landscapes.",
    solution: "Coupled binaural hydrophone field recordings with adaptive monochromatic photography transitions."
  }
];

export function PortfolioDemo() {
  const [filter, setFilter] = useState<string>("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);
  const [inquiryBudget, setInquiryBudget] = useState("$25,000 – $50,000");

  const filtered = filter === "all" ? PROJECTS : PROJECTS.filter((p) => p.cat === filter);

  return (
    <div className="flex-1 p-4 sm:p-8 max-w-6xl mx-auto space-y-12 antialiased font-sans text-slate-100">
      {/* Top Banner: Status & Awards */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-white/10 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 font-bold uppercase tracking-wider">
            Available for Select Commissions Q3/Q4
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-400">
          <span className="hidden sm:inline">Awwwards Site of the Day ×3</span>
          <span className="hidden sm:inline">•</span>
          <span>FWA of the Day</span>
          <span>•</span>
          <span className="text-purple-400">TDC 2025</span>
        </div>
      </div>

      {/* Hero Presentation */}
      <div className="space-y-4 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-300">
          <Sparkle className="h-3.5 w-3.5" />
          <span>ALEX CHEN // INDEPENDENT DESIGN PRACTICE & ARCHITECTURE</span>
        </div>
        <h1 className="text-3xl sm:text-6xl font-light tracking-tight text-white leading-tight">
          Radical systems, <br />
          <span className="font-semibold bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            tactile interfaces & digital craft.
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
          Partnering with ambitious founders and tier-one design practices to ship flagship Web3 protocols, spatial OS components, and bespoke brand platforms.
        </p>

        <div className="pt-2 flex flex-wrap gap-3">
          <button
            onClick={() => setInquiryOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-2"
          >
            <EnvelopeSimple className="h-4 w-4" />
            <span>Book Discovery Call</span>
          </button>
          <a
            href="#projects-grid"
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-xs transition flex items-center gap-2"
          >
            <span>Explore Works ({PROJECTS.length})</span>
            <span className="text-slate-400">↓</span>
          </a>
        </div>
      </div>

      {/* Filter Tabs */}
      <div id="projects-grid" className="space-y-6 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            {[
              { id: "all", label: `All Works (${PROJECTS.length})` },
              { id: "ui-ux", label: "UI/UX & Spatial (2)" },
              { id: "branding", label: "Brand Identity (2)" },
              { id: "creative-dev", label: "Creative Dev (2)" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filter === f.id
                    ? "bg-emerald-500 text-black font-bold shadow-md"
                    : "bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="text-xs font-mono text-slate-500 hidden sm:block">
            CLICK CARD TO EXPAND CASE STUDY
          </div>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedProject(item)}
              className="group p-6 rounded-2xl bg-[#0e121a] border border-white/10 hover:border-emerald-500/60 hover:bg-[#121622] transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-6 relative overflow-hidden shadow-xl"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider text-[10px]">
                    {item.cat}
                  </span>
                  <span className="text-slate-500">{item.year}</span>
                </div>

                <div>
                  <div className="text-xs text-slate-400 font-mono mb-1">{item.client}</div>
                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition flex items-center justify-between">
                    <span>{item.title}</span>
                    <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-emerald-400" />
                  </h3>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {item.summary}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-white/5">
                <div className="flex flex-wrap gap-1.5">
                  {item.stack.slice(0, 3).map((st, i) => (
                    <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/5">
                      {st}
                    </span>
                  ))}
                </div>

                <div className="text-[11px] font-mono text-emerald-400 font-semibold truncate">
                  ⚡ {item.metric}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Case Study Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#0e121a] border border-white/20 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
                  {selectedProject.client} — {selectedProject.year}
                </div>
                <h2 className="text-2xl font-bold text-white mt-1">{selectedProject.title}</h2>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-mono text-xs transition"
              >
                ✕ ESC
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-xs font-mono text-slate-500 uppercase">Role / Responsibility</div>
                <div className="text-sm text-slate-200 font-semibold mt-0.5">{selectedProject.role}</div>
              </div>

              <div>
                <div className="text-xs font-mono text-slate-500 uppercase mb-1.5">Technology Stack</div>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.stack.map((st, i) => (
                    <span key={i} className="text-xs font-mono px-2.5 py-1 rounded bg-white/5 border border-white/10 text-emerald-300">
                      {st}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="text-xs font-mono text-emerald-400 uppercase font-bold flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4" />
                  <span>Verified Impact & Measurable Metrics</span>
                </div>
                <div className="text-sm font-mono text-white">{selectedProject.metric}</div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-mono text-slate-400 uppercase">The Challenge</h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                  {selectedProject.challenge}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-mono text-slate-400 uppercase">The Architectural Solution</h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-emerald-950/20 p-3 rounded-lg border border-emerald-500/20">
                  {selectedProject.solution}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => {
                  setSelectedProject(null);
                  setInquiryOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition"
              >
                Inquire Similar Solution →
              </button>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-xs font-mono text-slate-400 hover:text-white"
              >
                Close Case Study
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Inquiry Modal */}
      {inquiryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0e121a] border border-emerald-500/40 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Direct Studio Commission</h3>
                <p className="text-xs text-slate-400">Direct booking with lead creative technologist.</p>
              </div>
              <button
                onClick={() => {
                  setInquiryOpen(false);
                  setInquirySent(false);
                }}
                className="text-slate-400 hover:text-white font-mono text-xs"
              >
                ✕ Close
              </button>
            </div>

            {inquirySent ? (
              <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-center space-y-3">
                <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Inquiry Dispatched Successfully!</h4>
                <p className="text-xs text-slate-300">
                  We have received your parameters ({inquiryBudget}). Our studio partner will contact your team within 24 hours.
                </p>
                <button
                  onClick={() => {
                    setInquiryOpen(false);
                    setInquirySent(false);
                  }}
                  className="mt-2 px-4 py-1.5 rounded-lg bg-emerald-500 text-black font-bold text-xs"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5">Project Scope / Tier</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["$10k – $25k", "$25k – $50k", "$50k+"].map((tier) => (
                      <button
                        key={tier}
                        onClick={() => setInquiryBudget(tier)}
                        className={`py-2 px-2 rounded-lg text-xs font-mono transition border text-center ${
                          inquiryBudget === tier
                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5">Contact Email</label>
                  <input
                    type="email"
                    defaultValue="founder@hypertech.io"
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5">Initial Project Goals</label>
                  <textarea
                    rows={3}
                    defaultValue="We need a flagship Web3 DeFi interface with real-time liquidity visualization and 3D token lockup mechanics."
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono resize-none"
                  />
                </div>

                <button
                  onClick={() => setInquirySent(true)}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider transition shadow-lg"
                >
                  Dispatch Studio Request ({inquiryBudget}) →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
