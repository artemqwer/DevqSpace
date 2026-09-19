"use client";

import React, { useState } from "react";

type PresetId = "ai" | "devtools" | "fintech" | "marketing" | "workspace";

interface PresetData {
  badge: string;
  heroTitle: string;
  heroHighlight: string;
  tagline: string;
  ctaPrimary: string;
  demoTitle: string;
  demoCode: string;
  features: { title: string; desc: string; icon: string }[];
  stat1: string;
  stat2: string;
  stat3: string;
}

const presets: Record<PresetId, PresetData> = {
  ai: {
    badge: "AI Copilot v4.2 Release",
    heroTitle: "Build intelligent apps with",
    heroHighlight: "autonomous reasoning engines.",
    tagline:
      "Deploy multi-modal generative pipelines with deterministic latency, enterprise guardrails, and 1-line SDK integrations.",
    ctaPrimary: "Deploy AI Copilot Free",
    demoTitle: "Live Inference Pipeline",
    demoCode: `const agent = new CopilotAgent({\n  model: "claude-3-5-sonnet",\n  tools: [webSearch, sqlExecutor],\n  guardrails: { strictJson: true }\n});\nconst res = await agent.run("Synthesize Q3 ARR delta");`,
    features: [
      {
        icon: "⚡",
        title: "Sub-120ms Time-to-First-Token",
        desc: "Global edge inference across 300+ PoPs ensures instantaneous streaming.",
      },
      {
        icon: "🛡️",
        title: "Enterprise Zero-Data-Retention",
        desc: "Your proprietary weights and user prompts are never cached or used for training.",
      },
      {
        icon: "🧩",
        title: "Deterministic Tool Calling",
        desc: "Rigorous schema validation guarantees JSON outputs without hallucinated keys.",
      },
      {
        icon: "📈",
        title: "Token Optimization Gateway",
        desc: "Auto-compression reduces prompt context costs by up to 48% on high-volume routes.",
      },
    ],
    stat1: "99.99% Uptime",
    stat2: "140ms Latency",
    stat3: "2.4B Daily Tokens",
  },
  devtools: {
    badge: "Next-Gen Developer Platform",
    heroTitle: "Ship high-throughput APIs without",
    heroHighlight: "managing brittle server clusters.",
    tagline:
      "Serverless runtime with instant cold starts, native edge caching, and automated canary deployments in every git push.",
    ctaPrimary: "Start Free with GitHub",
    demoTitle: "Edge Worker CLI Deploy",
    demoCode: `$ devq deploy --region global\n✔ Bundled in 14ms (ESBuild)\n✔ Synced across 28 global regions\n✔ Live URL: https://api.prod.devq.io/v1/health\n✨ Deployed in 0.8s!`,
    features: [
      {
        icon: "🚀",
        title: "0ms Cold Starts",
        desc: "V8 isolate architecture spins up isolated sandboxes instantaneously.",
      },
      {
        icon: "🔄",
        title: "Git-Backed Canary Rollouts",
        desc: "Roll back regressions instantly with automated error budget monitors.",
      },
      {
        icon: "🔒",
        title: "Encrypted Environment Vault",
        desc: "Hardware-security-module backed secrets management with automatic rotation.",
      },
      {
        icon: "📊",
        title: "Distributed OpenTelemetry",
        desc: "Trace every individual database query and outbound fetch down to the microsecond.",
      },
    ],
    stat1: "< 5ms Cold Start",
    stat2: "450k+ Deployments",
    stat3: "100% Rust Core",
  },
  fintech: {
    badge: "Global Treasury & Payments",
    heroTitle: "Orchestrate multi-currency flows with",
    heroHighlight: "bank-grade ledger precision.",
    tagline:
      "Unify card issuing, crypto rails, SEPA/ACH settlements, and automated tax compliance under a single composable API.",
    ctaPrimary: "Create Sandbox Account",
    demoTitle: "Instant Ledger Settlement",
    demoCode: `POST /v1/transfers\n{\n  "amount": 245000,\n  "currency": "EUR",\n  "rail": "SEPA_INSTANT",\n  "idempotency_key": "tx_99a8b7c6"\n}\n// Response: 200 OK (Settled in 3.2s)`,
    features: [
      {
        icon: "💳",
        title: "Multi-Rail Routing",
        desc: "Automatically switch between Visa Direct, SEPA Instant, and USDC based on fees.",
      },
      {
        icon: "⚖️",
        title: "Double-Entry Ledger",
        desc: "Immutable cryptographic ledger guarantees zero reconciliation discrepancy.",
      },
      {
        icon: "🌍",
        title: "Global FX at Mid-Market",
        desc: "Real-time algorithmic conversion with sub-5 basis point spreads.",
      },
      {
        icon: "📑",
        title: "Automated VAT & 1099 Tax",
        desc: "Generate multi-jurisdiction compliance filings with 1 click.",
      },
    ],
    stat1: "$4.8B Processed",
    stat2: "140+ Currencies",
    stat3: "SOC2 Type II",
  },
  marketing: {
    badge: "Customer Attribution Engine",
    heroTitle: "Unlock radical growth insights from",
    heroHighlight: "omnichannel user touchpoints.",
    tagline:
      "Server-side tracking that bypasses ad-blockers, attributes multi-touch conversion paths, and predicts churn with ML.",
    ctaPrimary: "Analyze Your Funnel",
    demoTitle: "Multi-Touch Attribution",
    demoCode: `const journey = await Analytics.getAttribution(userId);\n// First Touch: Google Search (Organic)\n// Mid Touch: Twitter Thread #41\n// Converter: Email Sequence B\n// CAC: $14.20 | Estimated LTV: $480.00`,
    features: [
      {
        icon: "🎯",
        title: "Server-Side CAPI Gateway",
        desc: "100% accurate event capture immune to browser privacy shields.",
      },
      {
        icon: "🔮",
        title: "Predictive Churn Scoring",
        desc: "Identify drop-off risks 14 days before subscription renewal.",
      },
      {
        icon: "📊",
        title: "Executive Cohort Visuals",
        desc: "Slice retention curves by acquisition channel, country, and feature usage.",
      },
      {
        icon: "🔗",
        title: "1-Click CRM Sync",
        desc: "Two-way live syncing with HubSpot, Salesforce, and Customer.io.",
      },
    ],
    stat1: "99.8% Match Rate",
    stat2: "4.2x ROAS Boost",
    stat3: "25M Events/sec",
  },
  workspace: {
    badge: "Collaborative Knowledge OS",
    heroTitle: "Unite documents, roadmaps & tasks in",
    heroHighlight: "one unified synchronous workspace.",
    tagline:
      "Real-time canvas with live multiplayer cursors, offline-first syncing, and bi-directional AI knowledge search.",
    ctaPrimary: "Get Workspace Free",
    demoTitle: "CRDT Multiplayer Sync",
    demoCode: `// Document state synchronized via Yjs CRDT\nconst doc = new Y.Doc();\nconst text = doc.getText("content");\ntext.observe(event => renderDiff(event));\n// 42 peers active with 0 collision conflicts`,
    features: [
      {
        icon: "👥",
        title: "Multiplayer Real-time Cursors",
        desc: "Zero-latency typing and comment threads powered by WebSockets.",
      },
      {
        icon: "💾",
        title: "Offline-First Sync",
        desc: "Keep typing in airplane mode; changes auto-merge seamlessly upon reconnect.",
      },
      {
        icon: "🧠",
        title: "Semantic Workspace Search",
        desc: "Ask questions in natural language and find answers across all docs and chats.",
      },
      {
        icon: "🔐",
        title: "Granular Role ACLs",
        desc: "Protect confidential boards with SSO, SCIM, and domain-level sandboxing.",
      },
    ],
    stat1: "15ms CRDT Sync",
    stat2: "80,000 Teams",
    stat3: "Offline First",
  },
};

export function SaasKitDemo() {
  const [activePreset, setActivePreset] = useState<PresetId>("ai");
  const [yearly, setYearly] = useState(true);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [themeDark, setThemeDark] = useState(true);

  const cur = presets[activePreset];

  const faqs = [
    {
      q: "Can I customize the color palette and typography?",
      a: "Yes, all design tokens are mapped in tailwind.config.js and CSS variables in globals.css. Swapping fonts or brand colors takes less than 2 minutes.",
    },
    {
      q: "How are the 5 landing page presets organized?",
      a: "Each preset is configured via clean TypeScript data schemas. You can use the unified dynamic router or copy individual page templates directly.",
    },
    {
      q: "Are Framer Motion animations performant on mobile?",
      a: "All components use hardware-accelerated CSS transforms and lightweight spring physics, achieving a 99/100 performance score on Google PageSpeed.",
    },
    {
      q: "Can I connect my Stripe or Lemon Squeezy billing?",
      a: "Yes, the pricing cards feature clean callback handlers and webhook models ready to connect to any payment checkout provider.",
    },
  ];

  return (
    <div
      className={`min-h-screen font-sans antialiased transition-colors duration-200 ${
        themeDark ? "bg-[#090b10] text-slate-100" : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* Top Notification Bar & Preset Switcher */}
      <div className="bg-gradient-to-r from-cyan-600 via-indigo-600 to-fuchsia-600 text-white px-4 py-2.5 text-xs text-center font-medium flex flex-wrap items-center justify-center gap-2 sm:gap-4">
        <span className="font-bold">✨ 5 Modular SaaS Presets:</span>
        <div className="flex flex-wrap items-center justify-center gap-1 bg-black/20 p-1 rounded-lg">
          {[
            { id: "ai", label: "AI Copilot" },
            { id: "devtools", label: "DevTools" },
            { id: "fintech", label: "FinTech" },
            { id: "marketing", label: "Analytics" },
            { id: "workspace", label: "Workspace" },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePreset(p.id as PresetId)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                activePreset === p.id
                  ? "bg-white text-black shadow-sm font-bold"
                  : "hover:bg-white/20 text-white"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Navbar */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-md border-b px-4 sm:px-8 lg:px-16 py-3.5 flex items-center justify-between transition-colors ${
          themeDark
            ? "bg-[#090b10]/90 border-slate-800"
            : "bg-white/90 border-slate-200 shadow-sm"
        }`}
      >
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center font-bold text-black text-sm shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            ⚡
          </div>
          <span className="font-bold tracking-tight text-sm sm:text-base">
            SAAS // KIT
          </span>
        </div>

        <nav className="hidden md:flex items-center space-x-6 text-xs font-medium text-slate-400">
          <a href="#features" className="hover:text-cyan-400 transition">
            Features
          </a>
          <a href="#demo" className="hover:text-cyan-400 transition">
            Interactive Demo
          </a>
          <a href="#pricing" className="hover:text-cyan-400 transition">
            Pricing
          </a>
          <a href="#faq" className="hover:text-cyan-400 transition">
            FAQ
          </a>
        </nav>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setThemeDark(!themeDark)}
            className={`p-1.5 sm:p-2 rounded-lg border text-xs transition ${
              themeDark
                ? "bg-slate-900 border-slate-800 text-amber-300"
                : "bg-slate-100 border-slate-300 text-slate-700"
            }`}
            title="Toggle theme"
          >
            {themeDark ? "☀️" : "🌙"}
          </button>
          <a
            href="#pricing"
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs rounded-lg transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]"
          >
            Get Started Free
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 sm:px-8 lg:px-16 pt-12 sm:pt-20 pb-12 sm:pb-16 max-w-7xl mx-auto text-center relative overflow-hidden">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono mb-6">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>{cur.badge}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.15]">
          {cur.heroTitle} <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
            {cur.heroHighlight}
          </span>
        </h1>

        <p className="mt-5 text-sm sm:text-base lg:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {cur.tagline}
        </p>

        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <a
            href="#pricing"
            className="w-full sm:w-auto px-7 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm rounded-xl transition-all shadow-[0_0_25px_rgba(6,182,212,0.4)]"
          >
            {cur.ctaPrimary} →
          </a>
          <a
            href="#demo"
            className={`w-full sm:w-auto px-7 py-3 rounded-xl border text-sm font-semibold transition ${
              themeDark
                ? "bg-slate-900/80 border-slate-800 text-slate-200 hover:bg-slate-800"
                : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
            }`}
          >
            View Live Sandbox
          </a>
        </div>

        {/* Live Metrics Strip */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto pt-8 border-t border-slate-800/60 font-mono text-center">
          <div className="p-3">
            <div className="text-xl sm:text-2xl font-black text-cyan-400">
              {cur.stat1}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 uppercase">
              Reliability Standard
            </div>
          </div>
          <div className="p-3">
            <div className="text-xl sm:text-2xl font-black text-indigo-400">
              {cur.stat2}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 uppercase">
              Operational Metric
            </div>
          </div>
          <div className="p-3">
            <div className="text-xl sm:text-2xl font-black text-fuchsia-400">
              {cur.stat3}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 uppercase">
              Global Scale
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Code Demo Section */}
      <section id="demo" className="px-4 sm:px-8 lg:px-16 py-12 sm:py-16 max-w-5xl mx-auto">
        <div
          className={`rounded-2xl border overflow-hidden shadow-2xl ${
            themeDark ? "bg-[#11141c] border-slate-800" : "bg-white border-slate-200"
          }`}
        >
          <div className="p-3.5 sm:p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/50">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
              <span className="ml-2 text-xs font-mono text-slate-400 truncate max-w-[180px] sm:max-w-none">
                {cur.demoTitle}
              </span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 shrink-0">
              Deterministic Output
            </span>
          </div>
          <div className="p-4 sm:p-6 font-mono text-xs overflow-x-auto text-cyan-300 bg-[#0d1017] leading-relaxed">
            <pre>{cur.demoCode}</pre>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="px-4 sm:px-8 lg:px-16 py-12 sm:py-16 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
            Core Architecture
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-2">
            Engineered for Frictionless Scale
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {cur.features.map((f, i) => (
            <div
              key={i}
              className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                themeDark
                  ? "bg-[#11141c] border-slate-800 hover:border-cyan-500/40"
                  : "bg-white border-slate-200 hover:border-cyan-500/40 shadow-sm"
              }`}
            >
              <div className="text-2xl sm:text-3xl mb-3">{f.icon}</div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-1.5">
                {f.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Calculator Section */}
      <section
        id="pricing"
        className="px-4 sm:px-8 lg:px-16 py-14 sm:py-20 max-w-7xl mx-auto border-t border-slate-800/60"
      >
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-mono uppercase text-cyan-400">
            Predictable Billing
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-2">
            Transparent Pricing For Every Stage
          </h2>

          {/* Toggle Monthly / Yearly */}
          <div className="mt-6 inline-flex items-center space-x-2 sm:space-x-3 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setYearly(false)}
              className={`px-3 sm:px-4 py-1.5 rounded-lg font-medium transition ${
                !yearly ? "bg-cyan-500 text-black font-semibold" : "text-slate-400"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-3 sm:px-4 py-1.5 rounded-lg font-medium transition flex items-center space-x-1.5 ${
                yearly ? "bg-cyan-500 text-black font-semibold" : "text-slate-400"
              }`}
            >
              <span>Yearly</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.5 rounded font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Starter */}
          <div
            className={`p-6 sm:p-8 rounded-2xl border flex flex-col justify-between ${
              themeDark
                ? "bg-[#11141c] border-slate-800"
                : "bg-white border-slate-200 shadow-sm"
            }`}
          >
            <div>
              <div className="text-xs font-mono uppercase text-slate-400">
                Starter Dev
              </div>
              <div className="text-3xl font-black mt-2 font-mono">
                {yearly ? "$19" : "$24"}{" "}
                <span className="text-xs font-normal text-slate-500">/mo</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Perfect for solo indie hackers and MVP prototypes.
              </p>
              <ul className="mt-6 space-y-3 text-xs text-slate-300">
                <li>✓ Up to 100,000 monthly API calls</li>
                <li>✓ 3 global edge regions</li>
                <li>✓ Community Discord support</li>
                <li>✓ Automated SSL certificates</li>
              </ul>
            </div>
            <button className="w-full mt-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition">
              Deploy Starter →
            </button>
          </div>

          {/* Pro Growth (Highlighted) */}
          <div className="p-6 sm:p-8 rounded-2xl border-2 border-cyan-500 bg-gradient-to-b from-[#141b2b] to-[#11141c] flex flex-col justify-between relative shadow-[0_0_40px_rgba(6,182,212,0.15)]">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-cyan-500 text-black font-bold text-[10px] rounded-full uppercase tracking-wider">
              Most Popular
            </span>
            <div>
              <div className="text-xs font-mono uppercase text-cyan-400">
                Scale Organization
              </div>
              <div className="text-3xl font-black mt-2 font-mono text-white">
                {yearly ? "$79" : "$99"}{" "}
                <span className="text-xs font-normal text-slate-400">/mo</span>
              </div>
              <p className="text-xs text-slate-300 mt-2">
                For scaling businesses that require guaranteed SLAs and priority
                routes.
              </p>
              <ul className="mt-6 space-y-3 text-xs text-slate-200">
                <li>✓ Unlimited edge deployments</li>
                <li>✓ 28 multi-region failover nodes</li>
                <li>✓ 99.99% uptime guarantee SLA</li>
                <li>✓ Granular team permissions & audit logs</li>
                <li>✓ Dedicated Slack channel engineer support</li>
              </ul>
            </div>
            <button className="w-full mt-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded-xl transition shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              Start 14-Day Free Trial →
            </button>
          </div>

          {/* Enterprise */}
          <div
            className={`p-6 sm:p-8 rounded-2xl border flex flex-col justify-between ${
              themeDark
                ? "bg-[#11141c] border-slate-800"
                : "bg-white border-slate-200 shadow-sm"
            }`}
          >
            <div>
              <div className="text-xs font-mono uppercase text-slate-400">
                Enterprise Custom
              </div>
              <div className="text-3xl font-black mt-2 font-mono">
                Custom{" "}
                <span className="text-xs font-normal text-slate-500">Tier</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Dedicated clusters, custom VPC peering, and custom compliance.
              </p>
              <ul className="mt-6 space-y-3 text-xs text-slate-300">
                <li>✓ Custom on-premise VPC peering</li>
                <li>✓ Custom SLA contracts (99.999%)</li>
                <li>✓ SOC2 Type II, HIPAA & GDPR packets</li>
                <li>✓ 24/7 dedicated telephone support</li>
              </ul>
            </div>
            <button className="w-full mt-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition">
              Contact Enterprise Sales →
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section
        id="faq"
        className="px-4 sm:px-8 lg:px-16 py-12 sm:py-16 max-w-4xl mx-auto border-t border-slate-800/60"
      >
        <div className="text-center mb-10">
          <span className="text-xs font-mono uppercase text-cyan-400">Answers</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-2">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3.5">
          {faqs.map((f, i) => {
            const open = activeFaq === i;
            return (
              <div
                key={i}
                onClick={() => setActiveFaq(open ? null : i)}
                className={`p-4 sm:p-5 rounded-xl border cursor-pointer transition ${
                  themeDark
                    ? "bg-[#11141c] border-slate-800"
                    : "bg-white border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>{f.q}</span>
                  <span className="text-cyan-400 font-mono text-base ml-2">
                    {open ? "−" : "+"}
                  </span>
                </div>
                {open && (
                  <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                    {f.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-8 lg:px-16 py-8 border-t border-slate-800/80 text-center text-xs text-slate-500 font-mono">
        <div>© 2026 SaaS Landing Kit. Built for Next.js 15 & Tailwind CSS.</div>
      </footer>
    </div>
  );
}
