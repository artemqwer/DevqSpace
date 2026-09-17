"use client";

import React, { useState } from "react";
import {
  Lightning,
  ChartBar,
  HardDrives,
  Receipt,
  ShieldCheck,
  Key,
  ArrowsClockwise,
  Check,
  Copy,
  Plus,
} from "@phosphor-icons/react";

export function CyberDashDemo() {
  const [activeTab, setActiveTab] = useState("overview");
  const [filterPeriod, setFilterPeriod] = useState("7d");
  const [copiedKey, setCopiedKey] = useState(false);
  const [nodes, setNodes] = useState([
    { name: "Node EU-Frankfurt-01", status: "ONLINE", cpu: "28%", mem: "64%", ping: "12ms" },
    { name: "Node US-East-Virginia", status: "ONLINE", cpu: "42%", mem: "78%", ping: "68ms" },
    { name: "Node AP-Tokyo-Core", status: "ONLINE", cpu: "19%", mem: "51%", ping: "142ms" },
    { name: "Node Edge-Cloudflare-Anycast", status: "SYNCED", cpu: "11%", mem: "34%", ping: "4ms" },
  ]);
  const [pingTesting, setPingTesting] = useState(false);
  const [txSearch, setTxSearch] = useState("");
  const [bannedIps, setBannedIps] = useState(["198.51.100.42", "203.0.113.19"]);
  const [newIp, setNewIp] = useState("");

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

  const handlePingTest = () => {
    setPingTesting(true);
    setTimeout(() => {
      setNodes((prev) =>
        prev.map((n) => ({
          ...n,
          ping: `${Math.floor(Math.random() * 20 + 8)}ms`,
          cpu: `${Math.floor(Math.random() * 30 + 15)}%`,
        }))
      );
      setPingTesting(false);
    }, 600);
  };

  const handleCopyKey = () => {
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleAddBanIp = () => {
    if (!newIp.trim()) return;
    setBannedIps([...bannedIps, newIp.trim()]);
    setNewIp("");
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-full bg-[#0a0c10] text-slate-100 font-sans antialiased">
      {/* Sidebar (Desktop) / Horizontal Nav (Mobile) */}
      <aside className="w-full md:w-60 border-b md:border-b-0 md:border-r border-slate-800/80 bg-[#0d1017]/95 p-3 sm:p-4 flex flex-col justify-between shrink-0">
        <div>
          {/* Header Brand */}
          <div className="flex items-center space-x-3 mb-4 md:mb-6 px-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-fuchsia-500 flex items-center justify-center font-bold text-black text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              CD
            </div>
            <div>
              <div className="font-bold tracking-wider text-white text-sm">CYBERDASH</div>
              <div className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">
                v2.4 Telemetry
              </div>
            </div>
          </div>

          {/* Navigation Items (Scrollable on mobile) */}
          <div className="flex md:flex-col overflow-x-auto gap-1.5 pb-2 md:pb-0 scrollbar-none">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition whitespace-nowrap shrink-0 ${
                  activeTab === item.id
                    ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Operator Status Badge */}
        <div className="hidden md:flex mt-6 p-3 rounded-xl bg-[#090b10] border border-slate-800/60 items-center space-x-3">
          <div className="w-7 h-7 rounded-full bg-slate-800 border border-cyan-500/30 flex items-center justify-center text-xs font-bold text-cyan-300">
            AD
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-semibold truncate">Root Operator</div>
            <div className="text-[10px] text-emerald-400 font-mono">Cluster Active</div>
          </div>
        </div>
      </aside>

      {/* Main Tab Area */}
      <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto">
        {/* Top Telemetry Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-slate-900/60 border border-cyan-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-cyan-400">
              Active Screen // {activeTab.toUpperCase()}
            </div>
            <h1 className="text-lg sm:text-xl font-black text-white mt-0.5">
              System Health: 99.98% Nominal
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 max-w-lg">
              All 28 edge nodes and distributed Redis instances are operating normally.
            </p>
          </div>
          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-medium text-slate-400 font-mono">
            {["24h", "7d", "30d"].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPeriod(p)}
                className={`px-2.5 py-1 rounded-md transition ${
                  filterPeriod === p ? "bg-cyan-500 text-black font-bold" : ""
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-xl bg-[#11141c] border border-slate-800">
                <div className="text-xs text-slate-400 flex justify-between">
                  <span>Gross Volume</span>
                  <span className="text-emerald-400 font-bold font-mono">+24.8%</span>
                </div>
                <div className="text-lg sm:text-xl font-black text-white mt-1 font-mono">
                  $184,920.00
                </div>
                <div className="text-[10px] text-slate-500 mt-1">vs. $148k prev week</div>
              </div>

              <div className="p-4 rounded-xl bg-[#11141c] border border-slate-800">
                <div className="text-xs text-slate-400 flex justify-between">
                  <span>API Calls</span>
                  <span className="text-purple-400 font-bold font-mono">+12.1%</span>
                </div>
                <div className="text-lg sm:text-xl font-black text-white mt-1 font-mono">
                  4,821,390
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Avg 14.6ms response</div>
              </div>

              <div className="p-4 rounded-xl bg-[#11141c] border border-slate-800">
                <div className="text-xs text-slate-400 flex justify-between">
                  <span>Nodes Online</span>
                  <span className="text-emerald-400 font-bold font-mono">100% OK</span>
                </div>
                <div className="text-lg sm:text-xl font-black text-white mt-1 font-mono">
                  32 / 32
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Global failover on</div>
              </div>

              <div className="p-4 rounded-xl bg-[#11141c] border border-slate-800">
                <div className="text-xs text-slate-400 flex justify-between">
                  <span>Threats Blocked</span>
                  <span className="text-rose-400 font-bold font-mono">0 Breaches</span>
                </div>
                <div className="text-lg sm:text-xl font-black text-white mt-1 font-mono">
                  14,912
                </div>
                <div className="text-[10px] text-slate-500 mt-1">WAF Cloudflare layer</div>
              </div>
            </div>

            {/* Charts & Nodes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Traffic Chart with fixed heights */}
              <div className="lg:col-span-2 p-4 rounded-2xl bg-[#11141c] border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Network Traffic Load
                  </span>
                  <span className="text-xs font-mono text-cyan-400">Peak 840 MB/s</span>
                </div>
                <div className="h-40 flex items-end justify-between gap-3 pt-4 border-b border-slate-800 pb-2">
                  {[65, 80, 45, 95, 100, 70, 85].map((h, i) => (
                    <div key={i} className="flex-1 h-full flex flex-col justify-end items-center gap-1.5">
                      <div
                        style={{ height: `${h}%` }}
                        className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-md transition-all duration-500 hover:brightness-125"
                      />
                      <span className="text-[10px] font-mono text-slate-500">D{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cluster Nodes List */}
              <div className="p-4 rounded-2xl bg-[#11141c] border border-slate-800 space-y-2.5">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Global Clusters
                  </span>
                  <button
                    onClick={handlePingTest}
                    className="text-[10px] text-cyan-400 font-mono hover:underline"
                  >
                    {pingTesting ? "Testing..." : "Ping All ↻"}
                  </button>
                </div>
                {nodes.map((n, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] font-mono flex justify-between items-center"
                  >
                    <div className="truncate mr-2">
                      <div className="text-white font-semibold truncate">{n.name}</div>
                      <div className="text-[10px] text-slate-500">CPU: {n.cpu}</div>
                    </div>
                    <span className="text-emerald-400 font-bold shrink-0">{n.ping}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Transactions Table */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#11141c] border border-slate-800 overflow-x-auto">
              <div className="text-xs font-bold uppercase text-white mb-3">
                Recent Verified Transactions
              </div>
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
                    <tr key={evt.id} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 text-cyan-400">{evt.id}</td>
                      <td className="py-2.5 text-slate-300">{evt.target}</td>
                      <td className="py-2.5 text-white">{evt.amount}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[9px] border ${evt.badge}`}>
                          {evt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: TELEMETRY */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-[#11141c] border border-slate-800 space-y-2">
                <div className="text-xs font-mono text-cyan-400 uppercase">Compute CPU Load</div>
                <div className="text-2xl font-black text-white font-mono">24.6% Avg</div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div className="w-[24.6%] h-full bg-cyan-400" />
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-[#11141c] border border-slate-800 space-y-2">
                <div className="text-xs font-mono text-purple-400 uppercase">Memory Allocation</div>
                <div className="text-2xl font-black text-white font-mono">61.2% (19.4 GB)</div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div className="w-[61.2%] h-full bg-purple-400" />
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-[#11141c] border border-slate-800 space-y-2">
                <div className="text-xs font-mono text-emerald-400 uppercase">P99 Latency</div>
                <div className="text-2xl font-black text-white font-mono">14.2 ms</div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div className="w-[14%] h-full bg-emerald-400" />
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#11141c] border border-slate-800 space-y-3 font-mono text-xs">
              <div className="font-bold text-white uppercase">Regional Edge Distribution</div>
              <div className="space-y-2">
                {[
                  { region: "Europe (Frankfurt & London)", share: "48%", reqs: "2.3M req/day" },
                  { region: "North America (Virginia & Oregon)", share: "34%", reqs: "1.6M req/day" },
                  { region: "Asia Pacific (Tokyo & Singapore)", share: "18%", reqs: "860k req/day" },
                ].map((r, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-300">{r.region}</span>
                    <span className="text-cyan-400 font-bold">{r.share} ({r.reqs})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CLUSTER NODES */}
        {activeTab === "nodes" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono uppercase text-slate-400 font-bold">
                Distributed Node Registry ({nodes.length} Instances)
              </span>
              <button
                onClick={handlePingTest}
                className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-bold transition"
              >
                {pingTesting ? "Running Diagnostics..." : "Refresh Status"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nodes.map((node, i) => (
                <div key={i} className="p-5 rounded-2xl bg-[#11141c] border border-slate-800 space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">{node.name}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                      {node.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] pt-2 border-t border-slate-800/80">
                    <div>
                      <div className="text-slate-500">CPU LOAD</div>
                      <div className="text-cyan-300 font-bold">{node.cpu}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">MEM USAGE</div>
                      <div className="text-purple-300 font-bold">{node.mem}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">NETWORK PING</div>
                      <div className="text-emerald-400 font-bold">{node.ping}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: TRANSACTIONS */}
        {activeTab === "transactions" && (
          <div className="space-y-4 font-mono text-xs">
            <div className="flex flex-col sm:flex-row justify-between gap-3">
              <input
                type="text"
                value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
                placeholder="Пошук за TX ID або адресою..."
                className="px-3.5 py-2 rounded-xl bg-[#11141c] border border-slate-800 text-white focus:outline-none focus:border-cyan-400 text-xs flex-1 max-w-md"
              />
              <span className="text-slate-400 self-center text-[11px]">
                Showing {recentEvents.length} transactions
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#11141c] border border-slate-800 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px]">
                    <th className="pb-2.5">TX ID</th>
                    <th className="pb-2.5">Initiator</th>
                    <th className="pb-2.5">Target Destination</th>
                    <th className="pb-2.5">Volume</th>
                    <th className="pb-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentEvents
                    .filter((t) =>
                      txSearch ? t.id.toLowerCase().includes(txSearch.toLowerCase()) || t.target.toLowerCase().includes(txSearch.toLowerCase()) : true
                    )
                    .map((evt) => (
                      <tr key={evt.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 text-cyan-400">{evt.id}</td>
                        <td className="py-3 text-slate-300">{evt.user}</td>
                        <td className="py-3 text-slate-400">{evt.target}</td>
                        <td className="py-3 text-white font-bold">{evt.amount}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] border ${evt.badge}`}>
                            {evt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: SECURITY & FIREWALL */}
        {activeTab === "security" && (
          <div className="space-y-6 font-mono text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#11141c] border border-emerald-500/30 space-y-1">
                <div className="text-slate-400 text-[11px]">DDoS MITIGATION</div>
                <div className="text-emerald-400 font-bold text-lg">Under Attack Mode: Ready</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#11141c] border border-cyan-500/30 space-y-1">
                <div className="text-slate-400 text-[11px]">WAF RULESET</div>
                <div className="text-cyan-400 font-bold text-lg">OWASP Core v3.3 Active</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#11141c] border border-purple-500/30 space-y-1">
                <div className="text-slate-400 text-[11px]">RATE LIMITING</div>
                <div className="text-purple-400 font-bold text-lg">1,000 req / 60s per IP</div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#11141c] border border-slate-800 space-y-4">
              <div className="font-bold text-white uppercase">Blacklisted IP Filter ({bannedIps.length})</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  placeholder="Введіть IP адресу для блокування (e.g. 192.0.2.1)..."
                  className="flex-1 rounded-xl bg-black/40 border border-slate-800 px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
                <button
                  onClick={handleAddBanIp}
                  className="px-4 py-2 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-xl font-bold hover:bg-rose-500 hover:text-white transition"
                >
                  Ban IP
                </button>
              </div>

              <div className="space-y-1.5">
                {bannedIps.map((ip, i) => (
                  <div key={i} className="flex justify-between items-center p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="text-rose-300">{ip}</span>
                    <button
                      onClick={() => setBannedIps(bannedIps.filter((item) => item !== ip))}
                      className="text-[10px] text-slate-500 hover:text-white"
                    >
                      Unban
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: API KEYS & WEBHOOKS */}
        {activeTab === "api" && (
          <div className="space-y-6 font-mono text-xs">
            <div className="p-5 rounded-2xl bg-[#11141c] border border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold text-white uppercase">Active Production API Key</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Use in `x-admin-key` header to authenticate</div>
                </div>
                <button
                  onClick={handleCopyKey}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold transition"
                >
                  {copiedKey ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedKey ? "Copied!" : "Copy Key"}</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-black/50 border border-slate-800 text-cyan-300 font-mono tracking-wider break-all">
                dq_live_sec_8921e3f89012489a_prod_access_v2
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#11141c] border border-slate-800 space-y-3">
              <div className="font-bold text-white uppercase">Registered Webhook Endpoints</div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="text-white font-bold">https://api.mybrand.com/webhooks/devq</div>
                  <div className="text-[10px] text-slate-500">Events: order.created, order.paid, node.failover</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px]">
                  HTTP 200 OK
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
