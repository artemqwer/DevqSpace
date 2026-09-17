"use client";

import React, { useState } from "react";

export function CyberDashDemo() {
  const [activeTab, setActiveTab] = useState("overview");
  const [filterPeriod, setFilterPeriod] = useState("7d");

  const navItems = [
    { id: "overview", label: "Overview", icon: "⚡" },
    { id: "analytics", label: "Telemetry & Traffic", icon: "📊" },
    { id: "nodes", label: "Cluster Nodes", icon: "🛰️" },
    { id: "transactions", label: "Transactions", icon: "💳" },
    { id: "security", label: "Security & Firewall", icon: "🛡️" },
    { id: "api", label: "API Keys & Webhooks", icon: "🔑" },
  ];

  const recentEvents = [
    { id: "TX-8921", user: "alex.cyber@node.io", target: "SOL / USDT Pair Liquidity", amount: "+$4,850.00", status: "Verified", time: "2 min ago", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
    { id: "TX-8920", user: "kento.sec@proton.me", target: "Cluster Scaled (+4 instances)", amount: "System Auto", status: "Completed", time: "14 min ago", badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30" },
    { id: "TX-8919", user: "dev_zero@arc.net", target: "API Token Revocation [KEY_PROD_4]", amount: "—", status: "Audit", time: "38 min ago", badge: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
    { id: "TX-8918", user: "elena@vortex.ai", target: "Enterprise Tier Subscription", amount: "+$1,299.00", status: "Verified", time: "1 hr ago", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
  ];

  const clusterNodes = [
    { name: "Node EU-Frankfurt-01", status: "ONLINE", cpu: "28%", mem: "64%", ping: "12ms" },
    { name: "Node US-East-Virginia", status: "ONLINE", cpu: "42%", mem: "78%", ping: "68ms" },
    { name: "Node AP-Tokyo-Core", status: "ONLINE", cpu: "19%", mem: "51%", ping: "142ms" },
    { name: "Node Edge-Cloudflare-Anycast", status: "SYNCED", cpu: "11%", mem: "34%", ping: "4ms" },
  ];

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-full bg-[#0a0c10] text-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-60 border-b md:border-b-0 md:border-r border-slate-800/80 bg-[#0d1017]/95 p-4 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center space-x-3 mb-6 px-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-fuchsia-500 flex items-center justify-center font-bold text-black text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              CD
            </div>
            <div>
              <div className="font-bold tracking-wider text-white text-sm">CYBERDASH</div>
              <div className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">v2.4 Telemetry</div>
            </div>
          </div>

          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition ${
                  activeTab === item.id
                    ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 p-3 rounded-lg bg-[#090b10] border border-slate-800/60 flex items-center space-x-3">
          <div className="w-7 h-7 rounded-full bg-slate-800 border border-cyan-500/30 flex items-center justify-center text-xs font-bold text-cyan-300">
            AD
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-semibold truncate">Root Operator</div>
            <div className="text-[10px] text-emerald-400 font-mono">Cluster Active</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto">
        {/* Banner */}
        <div className="p-5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-slate-900/60 border border-cyan-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-cyan-400">Telemetry Status</div>
            <h1 className="text-xl font-black text-white mt-0.5">System Health: 99.98% Nominal</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-lg">All 28 edge nodes and distributed Redis instances are operational.</p>
          </div>
          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-medium text-slate-400">
            {["24h", "7d", "30d"].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPeriod(p)}
                className={`px-2.5 py-1 rounded-md transition ${filterPeriod === p ? "bg-cyan-500 text-black font-semibold" : ""}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#11141c] border border-slate-800">
            <div className="text-xs text-slate-400 flex justify-between">
              <span>Gross Volume</span>
              <span className="text-emerald-400 font-bold font-mono">+24.8%</span>
            </div>
            <div className="text-xl font-black text-white mt-1 font-mono">$184,920.00</div>
            <div className="text-[10px] text-slate-500 mt-1">vs. $148,150 prev week</div>
          </div>

          <div className="p-4 rounded-xl bg-[#11141c] border border-slate-800">
            <div className="text-xs text-slate-400 flex justify-between">
              <span>API Invocations</span>
              <span className="text-purple-400 font-bold font-mono">+12.1%</span>
            </div>
            <div className="text-xl font-black text-white mt-1 font-mono">4,821,390</div>
            <div className="text-[10px] text-slate-500 mt-1">Avg 14.6ms response</div>
          </div>

          <div className="p-4 rounded-xl bg-[#11141c] border border-slate-800">
            <div className="text-xs text-slate-400 flex justify-between">
              <span>Nodes Online</span>
              <span className="text-emerald-400 font-bold font-mono">100% OK</span>
            </div>
            <div className="text-xl font-black text-white mt-1 font-mono">32 / 32</div>
            <div className="text-[10px] text-slate-500 mt-1">Global failover active</div>
          </div>

          <div className="p-4 rounded-xl bg-[#11141c] border border-slate-800">
            <div className="text-xs text-slate-400 flex justify-between">
              <span>Threats Blocked</span>
              <span className="text-rose-400 font-bold font-mono">0 Breaches</span>
            </div>
            <div className="text-xl font-black text-white mt-1 font-mono">14,912</div>
            <div className="text-[10px] text-slate-500 mt-1">WAF Cloudflare layer</div>
          </div>
        </div>

        {/* Charts & Nodes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-4 rounded-xl bg-[#11141c] border border-slate-800">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-white">Network Traffic</span>
              <span className="text-xs font-mono text-cyan-400">Peak 840 MB/s</span>
            </div>
            <div className="h-36 flex items-end justify-between gap-2 pt-4 border-b border-slate-800 pb-2">
              {[65, 80, 45, 95, 100, 70, 85].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div style={{ height: `${h}%` }} className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-sm"></div>
                  <span className="text-[9px] font-mono text-slate-500">D{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#11141c] border border-slate-800 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-white block mb-2">Global Clusters</span>
            {clusterNodes.slice(0, 3).map((n, i) => (
              <div key={i} className="p-2 rounded bg-slate-900/60 border border-slate-800 text-[11px] font-mono flex justify-between items-center">
                <span className="truncate mr-2">{n.name}</span>
                <span className="text-emerald-400 shrink-0">{n.ping}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="p-4 rounded-xl bg-[#11141c] border border-slate-800 overflow-x-auto">
          <div className="text-xs font-bold uppercase text-white mb-3">Recent Transactions</div>
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px]">
                <th className="pb-2">TX ID</th>
                <th className="pb-2">Source</th>
                <th className="pb-2">Volume</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {recentEvents.map((evt) => (
                <tr key={evt.id}>
                  <td className="py-2.5 text-cyan-400">{evt.id}</td>
                  <td className="py-2.5 text-slate-300">{evt.target}</td>
                  <td className="py-2.5 text-white">{evt.amount}</td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[9px] border ${evt.badge}`}>{evt.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
