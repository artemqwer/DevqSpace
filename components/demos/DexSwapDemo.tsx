"use client";

import React, { useState } from "react";
import type { Product } from "@/lib/products";
import { ArrowsDownUp, GearSix, Wallet, CheckCircle, Warning, Sparkle } from "@phosphor-icons/react";

export function DexSwapDemo({ product }: { product?: Product }) {
  const [sellToken, setSellToken] = useState<"SOL" | "USDC">("SOL");
  const [buyToken, setBuyToken] = useState<"RAY" | "BONK">("RAY");
  const [sellAmount, setSellAmount] = useState("2.5");
  const [slippage, setSlippage] = useState("0.5");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapSuccess, setSwapSuccess] = useState(false);

  // Rate: 1 SOL = 84.5 RAY, 1 USDC = 0.54 RAY
  const rate = sellToken === "SOL" ? (buyToken === "RAY" ? 84.5 : 5420000) : (buyToken === "RAY" ? 0.54 : 34800);
  const buyAmount = (parseFloat(sellAmount || "0") * rate).toLocaleString("en-US", {
    maximumFractionDigits: buyToken === "BONK" ? 0 : 2,
  });

  const handleSwap = () => {
    setIsSwapping(true);
    setTimeout(() => {
      setIsSwapping(false);
      setSwapSuccess(true);
      setTimeout(() => setSwapSuccess(false), 4000);
    }, 1200);
  };

  return (
    <div className="flex-1 p-4 sm:p-6 max-w-4xl mx-auto space-y-8 text-slate-100 font-sans antialiased">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-white/10">
        <div>
          <span className="text-xs font-mono uppercase text-cyan-400 font-bold">
            Uniswap &amp; Jupiter Compatible DEX Interface
          </span>
          <h1 className="text-2xl font-bold text-white mt-0.5">DEX Swap Terminal</h1>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold">
          ⚡ 0.04% Min Slippage
        </div>
      </div>

      {/* Main Swap Card */}
      <div className="max-w-md mx-auto p-5 sm:p-6 rounded-3xl bg-[#0e121a] border border-cyan-500/30 space-y-4 shadow-2xl relative">
        {/* Card Top Strip */}
        <div className="flex justify-between items-center pb-2">
          <span className="font-bold text-sm text-white">Instant Swap</span>
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <GearSix className="h-4 w-4" />
          </button>
        </div>

        {/* Slippage Settings Drawer */}
        {isSettingsOpen && (
          <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 space-y-2 text-xs font-mono">
            <div className="text-slate-400">Slippage Tolerance:</div>
            <div className="flex gap-2">
              {["0.1", "0.5", "1.0"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSlippage(s)}
                  className={`px-3 py-1 rounded-lg transition ${
                    slippage === s
                      ? "bg-cyan-500 text-black font-bold"
                      : "bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  {s}%
                </button>
              ))}
            </div>
          </div>
        )}

        {/* You Sell Input */}
        <div className="p-4 rounded-2xl bg-[#090b10] border border-white/10 space-y-2">
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>You Pay:</span>
            <span>Balance: 14.82 {sellToken}</span>
          </div>
          <div className="flex justify-between items-center">
            <input
              type="number"
              value={sellAmount}
              onChange={(e) => setSellAmount(e.target.value)}
              className="bg-transparent text-2xl font-bold font-mono text-white focus:outline-none w-1/2"
            />
            <div className="flex gap-1 bg-black/60 p-1 rounded-xl border border-white/10 font-mono text-xs">
              {(["SOL", "USDC"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setSellToken(t)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    sellToken === t ? "bg-cyan-500 text-black" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reverse Icon */}
        <div className="flex justify-center -my-2 relative z-10">
          <button
            onClick={() => {
              setSellToken(sellToken === "SOL" ? "USDC" : "SOL");
            }}
            className="w-8 h-8 rounded-full bg-[#131824] border border-white/20 text-cyan-400 flex items-center justify-center hover:scale-110 transition shadow-lg"
          >
            <ArrowsDownUp className="h-4 w-4" />
          </button>
        </div>

        {/* You Receive Input */}
        <div className="p-4 rounded-2xl bg-[#090b10] border border-white/10 space-y-2">
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>You Receive (Est.):</span>
            <span>Rate: 1 {sellToken} ≈ {rate} {buyToken}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold font-mono text-cyan-400 truncate w-1/2">
              {buyAmount}
            </div>
            <div className="flex gap-1 bg-black/60 p-1 rounded-xl border border-white/10 font-mono text-xs">
              {(["RAY", "BONK"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setBuyToken(t)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    buyToken === t ? "bg-cyan-500 text-black" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Trade Details Strip */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5 text-[11px] font-mono text-slate-400">
          <div className="flex justify-between">
            <span>Network Routing:</span>
            <span className="text-slate-200">Direct DEX Liquidity Pool</span>
          </div>
          <div className="flex justify-between">
            <span>Price Impact:</span>
            <span className="text-emerald-400 font-bold">&lt; 0.04%</span>
          </div>
          <div className="flex justify-between">
            <span>Est. Gas Fee:</span>
            <span className="text-slate-200">~0.00005 SOL ($0.007)</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleSwap}
          disabled={isSwapping}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-black font-bold text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSwapping ? (
            <span>Broadcasting to Solana RPC...</span>
          ) : swapSuccess ? (
            <span className="text-black flex items-center gap-1.5">
              <CheckCircle weight="fill" className="h-4 w-4" />
              Swap Confirmed (Tx: 0x3f...b892)
            </span>
          ) : (
            <span>Execute Token Swap →</span>
          )}
        </button>
      </div>
    </div>
  );
}
