"use client";

import React, { useState } from "react";
import { Wallet, Coins, Lightning, Trophy, CheckCircle, Sparkle } from "@phosphor-icons/react";

export function CryptoLandingDemo() {
  const [wallet, setWallet] = useState<string>("");
  const [ethAmount, setEthAmount] = useState("2.5");
  const [stakeDuration, setStakeDuration] = useState<number>(6); // months
  const [stakeAmount, setStakeAmount] = useState<number>(5000);

  const connectWallet = (provider: "Phantom" | "MetaMask") => {
    if (wallet) {
      setWallet("");
    } else {
      setWallet(provider === "Phantom" ? "7xKq...9PLa (Solana)" : "0x71C...4F9a (Ethereum)");
    }
  };

  // 1 ETH = 850 AETH
  const receivedTokens = (parseFloat(ethAmount || "0") * 850).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });

  // Staking calculation: Base APY 14% + 1.5% per month locked
  const apy = 14 + stakeDuration * 1.5;
  const estimatedRewards = ((stakeAmount * (apy / 100) * stakeDuration) / 12).toFixed(0);

  return (
    <div className="flex-1 p-4 sm:p-6 max-w-5xl mx-auto space-y-12 antialiased font-sans text-slate-100">
      {/* Top Floating Wallet Bar */}
      <div className="flex justify-between items-center pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-fuchsia-500 to-cyan-500 flex items-center justify-center font-bold text-black text-xs shadow-lg">
            ⚡
          </div>
          <span className="font-bold text-white tracking-wider text-sm">AETHER DEFI</span>
        </div>

        <div className="flex items-center gap-2">
          {wallet ? (
            <button
              onClick={() => setWallet("")}
              className="px-3.5 py-1.5 rounded-xl bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 text-xs font-mono font-bold hover:bg-rose-500/20 hover:border-rose-500 hover:text-rose-300 transition"
            >
              {wallet} (Disconnect)
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => connectWallet("Phantom")}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition shadow"
              >
                Phantom
              </button>
              <button
                onClick={() => connectWallet("MetaMask")}
                className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-mono text-xs font-bold transition shadow"
              >
                MetaMask
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Web3 Hero */}
      <div className="text-center space-y-4 pt-2">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/30 text-xs font-mono font-bold">
          <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-ping" />
          <span>PRESALE STAGE 02 IS LIVE · 78% FILLED</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white max-w-3xl mx-auto">
          Autonomous Liquidity Protocol for{" "}
          <span className="bg-gradient-to-r from-fuchsia-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            Multi-Chain Yield
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          Capture programmatic MEV yield and sub-second cross-chain swaps between Ethereum and Solana.
        </p>
      </div>

      {/* Presale Deposit Widget */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0d0f17] border border-fuchsia-500/30 shadow-2xl max-w-lg mx-auto space-y-6">
        <div className="flex justify-between items-center text-xs font-mono pb-3 border-b border-slate-800">
          <span className="text-fuchsia-400 font-bold">ROUND 02 ENDS:</span>
          <span className="text-white font-black bg-black/50 px-2 py-1 rounded-lg border border-white/10">
            04d : 16h : 38m
          </span>
        </div>

        <div>
          <div className="flex justify-between text-xs font-mono text-slate-400 mb-2">
            <span>Funding Target (78%)</span>
            <span className="text-white font-bold">$3.9M / $5.0M</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-900 border border-white/10 overflow-hidden p-0.5">
            <div className="w-[78%] h-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 rounded-full" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>Deposit Amount:</span>
            <span>Rate: 1 ETH = 850 AETH</span>
          </div>
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
            <input
              type="number"
              value={ethAmount}
              onChange={(e) => setEthAmount(e.target.value)}
              className="flex-1 bg-transparent px-3 py-2 text-sm font-mono text-white focus:outline-none"
            />
            <span className="px-3 py-2 bg-slate-800 text-xs font-bold rounded-lg flex items-center text-fuchsia-300">
              ETH
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono flex justify-between">
            <span className="text-slate-400">Tokens Received:</span>
            <span className="text-fuchsia-400 font-bold text-sm">{receivedTokens} AETH</span>
          </div>
        </div>

        <button
          onClick={() => {
            if (!wallet) connectWallet("Phantom");
            else alert("Deposit signed! Allocation recorded on-chain.");
          }}
          className="w-full py-3.5 bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg"
        >
          {wallet ? `Confirm Allocation (${receivedTokens} AETH)` : "Connect Web3 Wallet to Deposit"}
        </button>
      </div>

      {/* Interactive Staking APY Calculator */}
      <div className="p-6 rounded-3xl bg-[#0e121a] border border-white/10 max-w-2xl mx-auto space-y-5 font-mono">
        <div className="flex justify-between items-center pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-cyan-400" />
            <span className="font-bold text-xs text-white uppercase">Interactive Staking APY Calculator</span>
          </div>
          <span className="text-xs font-bold text-emerald-400">{apy.toFixed(1)}% APY</span>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <div className="flex justify-between text-slate-400 mb-1.5">
              <span>Lock Duration:</span>
              <span className="text-white font-bold">{stakeDuration} Months</span>
            </div>
            <input
              type="range"
              min="1"
              max="12"
              value={stakeDuration}
              onChange={(e) => setStakeDuration(parseInt(e.target.value))}
              className="w-full accent-fuchsia-500 cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex justify-between items-center">
            <div>
              <div className="text-slate-400 text-[11px]">PROJECTED RETURN ({stakeDuration} MO)</div>
              <div className="text-base font-bold text-emerald-400 mt-0.5">
                +{estimatedRewards} AETH (${(parseInt(estimatedRewards) * 3.4).toFixed(0)})
              </div>
            </div>
            <div className="text-right">
              <div className="text-slate-500 text-[10px]">BASE STAKE</div>
              <div className="text-white font-bold">{stakeAmount.toLocaleString()} AETH</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
