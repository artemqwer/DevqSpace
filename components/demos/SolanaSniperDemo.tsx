"use client";

import React, { useState, useEffect } from "react";
import type { Product } from "@/lib/products";
import { Lightning, ShieldCheck, Play, Gear, Warning, Sparkle, Trophy } from "@phosphor-icons/react";

type PoolEvent = {
  id: string;
  token: string;
  pair: string;
  dex: "Raydium" | "Pump.fun" | "Jupiter";
  liquidity: string;
  initialSol: string;
  antiRugScore: number;
  time: string;
  status: "DETECTED" | "SNIPED" | "PASSED";
};

export function SolanaSniperDemo({ product }: { product?: Product }) {
  const [jitoTip, setJitoTip] = useState("0.015");
  const [slippage, setSlippage] = useState("15");
  const [autoBuySol, setAutoBuySol] = useState("0.5");
  const [isSniperActive, setIsSniperActive] = useState(true);
  const [snipedTokens, setSnipedTokens] = useState<{ name: string; pnl: string; sol: string }[]>([
    { name: "$SOLAURA", pnl: "+184.2%", sol: "+0.92 SOL" },
    { name: "$CYBERDOGE", pnl: "+45.0%", sol: "+0.225 SOL" },
  ]);

  const [poolFeed, setPoolFeed] = useState<PoolEvent[]>([
    {
      id: "p-101",
      token: "$NEURAL",
      pair: "NEURAL / SOL",
      dex: "Raydium",
      liquidity: "$48,500",
      initialSol: "240 SOL",
      antiRugScore: 98,
      time: "2s ago",
      status: "SNIPED",
    },
    {
      id: "p-102",
      token: "$VOIDBOT",
      pair: "VOIDBOT / SOL",
      dex: "Pump.fun",
      liquidity: "$12,800",
      initialSol: "85 SOL",
      antiRugScore: 95,
      time: "8s ago",
      status: "DETECTED",
    },
    {
      id: "p-103",
      token: "$PEPEAI",
      pair: "PEPEAI / SOL",
      dex: "Raydium",
      liquidity: "$3,400",
      initialSol: "15 SOL",
      antiRugScore: 42,
      time: "15s ago",
      status: "PASSED",
    },
  ]);

  // Simulate incoming live pool detection
  useEffect(() => {
    if (!isSniperActive) return;
    const interval = setInterval(() => {
      const names = ["$QUANTUM", "$SOLVORTEX", "$BLADE", "$HYDRA", "$PUMPX"];
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomDex = Math.random() > 0.4 ? "Raydium" : "Pump.fun";
      const randomScore = Math.floor(Math.random() * 30) + 70;

      const newPool: PoolEvent = {
        id: `p-${Date.now()}`,
        token: randomName,
        pair: `${randomName} / SOL`,
        dex: randomDex as any,
        liquidity: `$${(Math.random() * 50 + 10).toFixed(1)}k`,
        initialSol: `${(Math.random() * 150 + 40).toFixed(0)} SOL`,
        antiRugScore: randomScore,
        time: "just now",
        status: randomScore > 85 ? "SNIPED" : "DETECTED",
      };

      setPoolFeed((prev) => [newPool, ...prev.slice(0, 4)]);

      if (randomScore > 85) {
        setSnipedTokens((prev) => [
          {
            name: randomName,
            pnl: `+${(Math.random() * 120 + 30).toFixed(1)}%`,
            sol: `+${(Math.random() * 0.8 + 0.2).toFixed(3)} SOL`,
          },
          ...prev.slice(0, 3),
        ]);
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [isSniperActive]);

  return (
    <div className="flex-1 p-4 sm:p-6 max-w-6xl mx-auto space-y-6 text-slate-100 font-sans antialiased">
      {/* Terminal Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 rounded-2xl bg-[#0c1018] border border-emerald-500/30 shadow-[0_0_30px_-10px_rgba(0,255,102,0.15)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
            <Lightning weight="fill" className="h-4 w-4" />
            <span>High-Frequency Solana MEV Engine · TypeScript / Jito</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
            Solana Sniper Bot Terminal
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Sub-millisecond liquidity detection, anti-rug heuristics &amp; Jito block bundle priority.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block font-mono text-xs">
            <div className="text-slate-400 text-[10px]">RPC LATENCY</div>
            <div className="text-emerald-400 font-bold">11.4 ms (Tokyo Geyser)</div>
          </div>
          <button
            onClick={() => setIsSniperActive(!isSniperActive)}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition flex items-center gap-2 shadow-lg ${
              isSniperActive
                ? "bg-emerald-500 text-black shadow-emerald-500/20"
                : "bg-rose-500/20 border border-rose-500 text-rose-300"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isSniperActive ? "bg-black animate-ping" : "bg-rose-400"
              }`}
            />
            <span>{isSniperActive ? "ENGINE ONLINE" : "ENGINE PAUSED"}</span>
          </button>
        </div>
      </div>

      {/* Sniper Config Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3.5 rounded-xl bg-[#0e121a] border border-white/10 space-y-1">
          <div className="text-slate-400 text-[11px]">AUTO-BUY PER SNIPE</div>
          <div className="flex items-center justify-between text-white font-bold">
            <input
              type="text"
              value={autoBuySol}
              onChange={(e) => setAutoBuySol(e.target.value)}
              className="w-16 bg-transparent border-b border-emerald-500 focus:outline-none"
            />
            <span className="text-emerald-400">SOL</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0e121a] border border-white/10 space-y-1">
          <div className="text-slate-400 text-[11px]">JITO MEV BUNDLE TIP</div>
          <div className="flex items-center justify-between text-white font-bold">
            <input
              type="text"
              value={jitoTip}
              onChange={(e) => setJitoTip(e.target.value)}
              className="w-16 bg-transparent border-b border-cyan-500 focus:outline-none"
            />
            <span className="text-cyan-400">SOL</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0e121a] border border-white/10 space-y-1">
          <div className="text-slate-400 text-[11px]">SLIPPAGE TOLERANCE</div>
          <div className="flex items-center justify-between text-white font-bold">
            <input
              type="text"
              value={slippage}
              onChange={(e) => setSlippage(e.target.value)}
              className="w-16 bg-transparent border-b border-purple-500 focus:outline-none"
            />
            <span className="text-purple-400">%</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0e121a] border border-white/10 space-y-1">
          <div className="text-slate-400 text-[11px]">ANTI-RUG FILTER</div>
          <div className="text-emerald-400 font-bold flex items-center gap-1.5">
            <ShieldCheck weight="fill" className="h-4 w-4" />
            <span>Mint &amp; Freeze Revoked</span>
          </div>
        </div>
      </div>

      {/* Main Realtime Stream Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Pool Stream */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0d1017] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Realtime Liquidity Feed (Raydium &amp; Pump.fun)</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Auto-refresh active</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-slate-500 text-[10px] uppercase">
                  <th className="pb-2.5">Token / Pair</th>
                  <th className="pb-2.5">DEX</th>
                  <th className="pb-2.5">Liquidity</th>
                  <th className="pb-2.5">Anti-Rug</th>
                  <th className="pb-2.5">Snipe Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {poolFeed.map((pool) => (
                  <tr key={pool.id} className="hover:bg-white/[0.02]">
                    <td className="py-3">
                      <div className="font-bold text-white">{pool.token}</div>
                      <div className="text-[10px] text-slate-500">{pool.pair}</div>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-slate-300">
                        {pool.dex}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="text-white">{pool.liquidity}</div>
                      <div className="text-[10px] text-emerald-400">{pool.initialSol}</div>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] border ${
                          pool.antiRugScore >= 80
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        }`}
                      >
                        {pool.antiRugScore} / 100
                      </span>
                    </td>
                    <td className="py-3">
                      {pool.status === "SNIPED" ? (
                        <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/40">
                          ✓ SNIPED ({autoBuySol} SOL)
                        </span>
                      ) : pool.status === "DETECTED" ? (
                        <button
                          onClick={() => {
                            setPoolFeed(
                              poolFeed.map((p) =>
                                p.id === pool.id ? { ...p, status: "SNIPED" } : p
                              )
                            );
                            setSnipedTokens((prev) => [
                              { name: pool.token, pnl: "+58.0%", sol: `+${autoBuySol} SOL` },
                              ...prev,
                            ]);
                          }}
                          className="px-2.5 py-1 rounded-md bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-[10px] transition"
                        >
                          Manual Snipe
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500">FILTERED (RISK)</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Profit & PnL Ledger */}
        <div className="p-5 rounded-2xl bg-[#0d1017] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-amber-400" />
              <span>Realized Session PnL</span>
            </span>
            <span className="text-emerald-400 font-mono font-bold text-xs">+1.845 SOL</span>
          </div>

          <div className="space-y-2">
            {snipedTokens.map((tk, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-xs flex justify-between items-center"
              >
                <div>
                  <div className="font-bold text-white">{tk.name}</div>
                  <div className="text-[10px] text-slate-500">Fast Exit Triggered</div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-bold">{tk.pnl}</div>
                  <div className="text-[10px] text-slate-400">{tk.sol}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-white/10 text-[11px] text-slate-400 space-y-1 font-mono">
            <div>• Jito MEV Tip Protection: Active</div>
            <div>• Target Slippage Cap: {slippage}%</div>
            <div>• Auto-Sell Trigger: +50% TP / -15% SL</div>
          </div>
        </div>
      </div>
    </div>
  );
}
