"use client";

import React, { useState } from "react";

export function CryptoLandingDemo() {
  const [wallet, setWallet] = useState("");
  const [ethAmount, setEthAmount] = useState("2.0");

  const connect = () => {
    setWallet("0x71C...4F9a");
  };

  return (
    <div className="flex-1 p-6 max-w-4xl mx-auto space-y-12 antialiased font-sans text-slate-100">
      {/* Web3 Hero */}
      <div className="text-center space-y-4 pt-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/30 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-ping"></span>
          <span>PRESALE STAGE 02 IS LIVE</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
          Autonomous Liquidity Protocol for{" "}
          <span className="bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
            Multi-Chain DeFi
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          Capture programmatic MEV yield and sub-second cross-chain swaps between Ethereum and Solana.
        </p>
      </div>

      {/* Presale Interactive Widget */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0d0f17] border border-fuchsia-500/30 shadow-2xl max-w-lg mx-auto space-y-6">
        <div className="flex justify-between items-center text-xs font-mono pb-3 border-b border-slate-800">
          <span className="text-fuchsia-400 font-bold">ROUND 02 ENDS:</span>
          <span className="text-white font-black">04d : 16h : 38m</span>
        </div>

        <div>
          <div className="flex justify-between text-xs font-mono text-slate-400 mb-2">
            <span>Funding Target (78%)</span>
            <span className="text-white font-bold">$3.9M / $5.0M</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden">
            <div className="w-[78%] h-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 rounded-full"></div>
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
            <span className="px-3 py-2 bg-slate-800 text-xs font-bold rounded-lg flex items-center">ETH</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono flex justify-between">
            <span className="text-slate-400">Tokens Received:</span>
            <span className="text-fuchsia-400 font-bold">{(parseFloat(ethAmount || "0") * 850).toFixed(0)} AETH</span>
          </div>
        </div>

        <button
          onClick={connect}
          className="w-full py-3 bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg"
        >
          {wallet ? `Allocation Ready (${wallet})` : "Connect Web3 Wallet"}
        </button>
      </div>

      {/* Tokenomics Bar */}
      <div className="space-y-3 pt-6 border-t border-slate-800">
        <h4 className="text-xs font-mono uppercase text-fuchsia-400">Tokenomics Distribution</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-slate-500">Presale & DEX</div>
            <div className="text-white font-bold text-sm mt-0.5">40%</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-slate-500">Staking Yield</div>
            <div className="text-white font-bold text-sm mt-0.5">25%</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-slate-500">Ecosystem</div>
            <div className="text-white font-bold text-sm mt-0.5">15%</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-slate-500">Treasury & Team</div>
            <div className="text-white font-bold text-sm mt-0.5">20%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
