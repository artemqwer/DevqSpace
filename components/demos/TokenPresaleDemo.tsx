"use client";

import React, { useState } from "react";
import type { Product } from "@/lib/products";
import { Coins, ShieldCheck, Wallet, Clock, CheckCircle, Sparkle } from "@phosphor-icons/react";

export function TokenPresaleDemo({ product }: { product?: Product }) {
  const [payCurrency, setPayCurrency] = useState<"ETH" | "USDT">("ETH");
  const [payAmount, setPayAmount] = useState("1.5");
  const [connected, setConnected] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [whitelistAddress, setWhitelistAddress] = useState("");
  const [whitelistStatus, setWhitelistStatus] = useState<"idle" | "eligible" | "none">("idle");

  const tokenRate = payCurrency === "ETH" ? 25000 : 8.5;
  const tokensToReceive = (parseFloat(payAmount || "0") * tokenRate).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });

  const checkWhitelist = () => {
    if (!whitelistAddress.trim()) return;
    if (whitelistAddress.startsWith("0x") || whitelistAddress.length > 8) {
      setWhitelistStatus("eligible");
    } else {
      setWhitelistStatus("none");
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 max-w-5xl mx-auto space-y-8 text-slate-100 font-sans antialiased">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
            <Coins className="h-4 w-4" />
            <span>Audited ERC-20 Presale &amp; Vesting Protocol</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Token Presale Launchpad &amp; Vesting
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Hardhat audited smart contract suite with Wagmi/Viem Web3 frontend connection.
          </p>
        </div>

        <button
          onClick={() => setConnected(!connected)}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 border ${
            connected
              ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
              : "bg-purple-600 hover:bg-purple-500 text-white border-transparent shadow-lg"
          }`}
        >
          <Wallet className="h-4 w-4" />
          <span>{connected ? "0x71C...4F9a (Connected)" : "Connect Web3 Wallet"}</span>
        </button>
      </div>

      {/* Main Grid: Presale Card + Vesting Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Presale Card (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-[#0d1017] border border-purple-500/30 space-y-6 shadow-[0_0_40px_-15px_rgba(185,140,255,0.15)]">
          <div className="flex justify-between items-center text-xs font-mono pb-3 border-b border-white/10">
            <span className="flex items-center gap-1.5 text-purple-400 font-bold">
              <Clock className="h-4 w-4" />
              <span>ROUND 02 CLOSES IN:</span>
            </span>
            <span className="text-white font-bold bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
              03d : 14h : 22m : 45s
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Total Presale Allocation:</span>
              <span className="text-white font-bold">$1,560,000 / $2,000,000 (78%)</span>
            </div>
            <div className="w-full h-3 rounded-full bg-black/50 border border-white/10 overflow-hidden p-0.5">
              <div className="w-[78%] h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-400 transition-all duration-500" />
            </div>
          </div>

          {/* Deposit Form */}
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs font-mono text-slate-400">
              <span>You Pay:</span>
              <div className="flex gap-1.5 bg-black/40 p-1 rounded-lg border border-white/10">
                {(["ETH", "USDT"] as const).map((curr) => (
                  <button
                    key={curr}
                    onClick={() => setPayCurrency(curr)}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition ${
                      payCurrency === curr
                        ? "bg-purple-500 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex bg-black/40 border border-white/10 rounded-2xl p-2 items-center">
              <input
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="flex-1 bg-transparent px-3 py-1.5 text-lg font-mono font-bold text-white focus:outline-none"
              />
              <span className="px-3 py-1 bg-white/10 rounded-xl text-xs font-mono font-bold text-purple-300">
                {payCurrency}
              </span>
            </div>

            {/* Calculated Tokens */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 font-mono text-xs flex justify-between items-center">
              <span className="text-slate-400">Tokens to Claim:</span>
              <span className="text-base font-bold text-purple-400">
                {tokensToReceive} $DEVQ
              </span>
            </div>

            {/* Action CTA */}
            <button
              onClick={() => {
                if (!connected) setConnected(true);
                else setClaimed(true);
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg"
            >
              {!connected
                ? "Connect Wallet to Participate"
                : claimed
                ? "✓ Tokens Claimed & Added to Vesting Contract"
                : `Deposit ${payAmount} ${payCurrency} Now →`}
            </button>
          </div>
        </div>

        {/* Right Info: Whitelist & Vesting (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Whitelist Check Widget */}
          <div className="p-5 rounded-3xl bg-[#0d1017] border border-white/10 space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Whitelist Verification</span>
            </h3>
            <p className="text-xs text-slate-400">
              Enter EVM address to check allocation tier:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={whitelistAddress}
                onChange={(e) => setWhitelistAddress(e.target.value)}
                placeholder="0x..."
                className="flex-1 rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-400"
              />
              <button
                onClick={checkWhitelist}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl font-mono transition"
              >
                Check
              </button>
            </div>
            {whitelistStatus === "eligible" && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
                <CheckCircle weight="fill" className="h-4 w-4" />
                <span>Tier 1 Whitelisted (Max 5 ETH Allocation)</span>
              </div>
            )}
          </div>

          {/* Vesting Schedule Details */}
          <div className="p-5 rounded-3xl bg-[#0d1017] border border-white/10 space-y-3 text-xs font-mono">
            <div className="font-bold text-white uppercase pb-2 border-b border-white/10">
              Vesting Release Schedule
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">TGE Unlock:</span>
              <span className="text-purple-400 font-bold">20% Instant</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Cliff Period:</span>
              <span className="text-white">30 Days</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Linear Vesting:</span>
              <span className="text-white">6 Months Monthly</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Smart Contract:</span>
              <span className="text-slate-500">Audited by CertiK</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
