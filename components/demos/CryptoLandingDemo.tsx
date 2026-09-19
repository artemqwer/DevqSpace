"use client";

import React, { useState, useEffect } from "react";

export function CryptoLandingDemo() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [whitepaperOpen, setWhitepaperOpen] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState("");
  const [contributeAmount, setContributeAmount] = useState("1.5");

  // Presale Countdown
  const [timeLeft, setTimeLeft] = useState({
    days: 4,
    hours: 16,
    minutes: 42,
    seconds: 19,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0)
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0)
          return {
            ...prev,
            days: prev.days - 1,
            hours: 23,
            minutes: 59,
            seconds: 59,
          };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleConnect = (walletName: string) => {
    const mockAddr = walletName === "Phantom" ? "7Kx9...4Vqp" : "0x71C...4F9a";
    setConnectedAddress(mockAddr);
    setWalletConnected(true);
    setWalletModalOpen(false);
  };

  const handleDisconnect = () => {
    setWalletConnected(false);
    setConnectedAddress("");
  };

  const tokenomics = [
    {
      label: "Public Presale & DEX Liquidity",
      percent: 40,
      tokens: "400,000,000 AETH",
      color: "from-fuchsia-500 to-pink-500",
    },
    {
      label: "Community Staking & Yield Rewards",
      percent: 25,
      tokens: "250,000,000 AETH",
      color: "from-purple-500 to-indigo-500",
    },
    {
      label: "Ecosystem Grants & Development",
      percent: 15,
      tokens: "150,000,000 AETH",
      color: "from-cyan-500 to-blue-500",
    },
    {
      label: "Core Contributors (24m Linear Vest)",
      percent: 10,
      tokens: "100,000,000 AETH",
      color: "from-amber-500 to-orange-500",
    },
    {
      label: "Protocol DAO Treasury Reserve",
      percent: 10,
      tokens: "100,000,000 AETH",
      color: "from-emerald-500 to-teal-500",
    },
  ];

  const roadmap = [
    {
      phase: "Phase 01",
      title: "Architecture & Genesis",
      status: "COMPLETED",
      badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      items: [
        "Smart Contract Architecture & Testnet",
        "Dual Security Audit (CertiK & Hacken)",
        "Seed Round & Angel Allocations",
      ],
    },
    {
      phase: "Phase 02",
      title: "Public Presale & TGE",
      status: "CURRENT STAGE",
      badge: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30",
      items: [
        "Public Presale Smart Contract Launch",
        "Tier-1 CEX & DEX Listing Agreements",
        "Liquidity Pool Seeding (Uniswap v3 + Raydium)",
      ],
    },
    {
      phase: "Phase 03",
      title: "Cross-Chain Staking",
      status: "Q3 2026",
      badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
      items: [
        "Liquid Staking Protocol Mainnet Launch",
        "EVM & Solana Bidirectional Bridge",
        "Autonomous Liquidity Rebalancer Vaults",
      ],
    },
    {
      phase: "Phase 04",
      title: "DAO Governance",
      status: "Q4 2026",
      badge: "bg-slate-500/10 text-slate-400 border-slate-500/30",
      items: [
        "On-Chain Tokenholder Governance Vote",
        "Sub-second MEV Protection Layer",
        "Institutional Custody Integrations (Fireblocks)",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#06070a] text-slate-100 font-sans antialiased selection:bg-fuchsia-500/30 selection:text-fuchsia-200">
      {/* Top Protocol Ticker Bar */}
      <div className="bg-[#0b0d14] border-b border-slate-800/80 px-4 sm:px-6 py-2 text-xs font-mono flex items-center justify-between text-slate-400 overflow-x-auto">
        <div className="flex items-center space-x-4 sm:space-x-6 shrink-0">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-white font-bold">ETH/AETH:</span>
            <span className="text-emerald-400 font-semibold">$3.84 (+14.2%)</span>
          </span>
          <span>
            GAS: <strong className="text-slate-200">12 Gwei</strong>
          </span>
          <span className="hidden sm:inline">
            TOTAL LOCKED: <strong className="text-slate-200">$48,290,140</strong>
          </span>
        </div>
        <div className="flex items-center space-x-4 shrink-0 text-slate-500">
          <span>
            AUDIT: <strong>CERTIK (98/100)</strong>
          </span>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-[#06070a]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 lg:px-16 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-fuchsia-600 via-purple-600 to-cyan-500 flex items-center justify-center font-black text-white text-sm sm:text-base shadow-[0_0_20px_rgba(217,70,239,0.4)]">
            Æ
          </div>
          <div>
            <span className="font-extrabold tracking-wider text-sm sm:text-base text-white">
              AETHERIUM
            </span>
            <span className="text-[9px] sm:text-[10px] block font-mono text-fuchsia-400 tracking-widest uppercase">
              Protocol v2
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center space-x-6 text-xs font-medium uppercase tracking-wider text-slate-400 font-mono">
          <a href="#presale" className="hover:text-fuchsia-400 transition">
            Presale
          </a>
          <a href="#tokenomics" className="hover:text-fuchsia-400 transition">
            Tokenomics
          </a>
          <a href="#roadmap" className="hover:text-fuchsia-400 transition">
            Roadmap
          </a>
          <button
            onClick={() => setWhitepaperOpen(true)}
            className="hover:text-fuchsia-400 transition"
          >
            Whitepaper ↗
          </button>
        </nav>

        {/* Connect Wallet CTA */}
        <div>
          {walletConnected ? (
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1.5 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/30 text-xs font-mono text-fuchsia-300 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>{connectedAddress}</span>
              </div>
              <button
                onClick={handleDisconnect}
                className="text-xs text-slate-500 hover:text-slate-300 font-mono px-1"
                title="Disconnect"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setWalletModalOpen(true)}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-fuchsia-500 via-purple-600 to-cyan-500 hover:opacity-95 text-white font-bold text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(217,70,239,0.4)]"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 sm:px-8 lg:px-16 pt-12 sm:pt-20 pb-12 sm:pb-16 max-w-7xl mx-auto text-center relative overflow-hidden">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/30 text-xs font-mono mb-6">
          <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-ping"></span>
          <span>STAGE 02 PRESALE IS LIVE NOW</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight max-w-5xl mx-auto leading-[1.1] text-white">
          Autonomous Liquidity Layer For{" "}
          <span className="bg-gradient-to-r from-fuchsia-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Multi-Chain DeFi
          </span>
        </h1>

        <p className="mt-5 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Zero slippage cross-chain execution between Ethereum and Solana. Stake
          $AETH to capture automated MEV yield and protocol transaction fees.
        </p>

        {/* Live Presale Card */}
        <div
          id="presale"
          className="mt-10 sm:mt-12 max-w-xl mx-auto p-5 sm:p-8 rounded-3xl bg-[#0d0f17]/90 border border-fuchsia-500/30 backdrop-blur-xl shadow-[0_0_50px_rgba(217,70,239,0.15)] relative"
        >
          <div className="flex items-center justify-between text-xs font-mono pb-3 border-b border-slate-800">
            <span className="text-fuchsia-400 font-bold">ROUND 02 ENDS:</span>
            <div className="flex items-center space-x-1.5 sm:space-x-2 text-white font-black text-xs sm:text-sm">
              <span>{String(timeLeft.days).padStart(2, "0")}d :</span>
              <span>{String(timeLeft.hours).padStart(2, "0")}h :</span>
              <span>{String(timeLeft.minutes).padStart(2, "0")}m :</span>
              <span className="text-fuchsia-400">
                {String(timeLeft.seconds).padStart(2, "0")}s
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-5 text-left">
            <div className="flex justify-between text-xs font-mono text-slate-400 mb-2">
              <span>Progress (78.4% Filled)</span>
              <span className="text-white font-bold">$3.92M / $5.00M</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden p-0.5 border border-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 w-[78.4%]"></div>
            </div>
          </div>

          {/* Contribution Calculator */}
          <div className="mt-5 text-left space-y-3">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>You Pay (ETH):</span>
              <span>1 ETH = 850 AETH</span>
            </div>
            <div className="flex rounded-xl bg-slate-900 border border-slate-700/80 p-1">
              <input
                type="number"
                value={contributeAmount}
                onChange={(e) => setContributeAmount(e.target.value)}
                className="flex-1 bg-transparent px-3 py-2 text-sm font-mono text-white focus:outline-none"
              />
              <span className="px-3 py-2 bg-slate-800 text-xs font-bold font-mono rounded-lg flex items-center">
                ETH
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">You Receive:</span>
              <span className="text-fuchsia-400 font-bold text-sm">
                {(parseFloat(contributeAmount || "0") * 850).toFixed(0)} AETH
              </span>
            </div>
          </div>

          <button
            onClick={() =>
              walletConnected
                ? alert("Presale allocation confirmed in smart contract!")
                : setWalletModalOpen(true)
            }
            className="w-full mt-5 py-3.5 bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:opacity-95 text-white font-bold text-xs font-mono uppercase tracking-wider rounded-xl transition-all shadow-[0_0_25px_rgba(217,70,239,0.4)]"
          >
            {walletConnected
              ? "Confirm Allocation →"
              : "Connect Wallet to Join"}
          </button>
        </div>
      </section>

      {/* Tokenomics Section */}
      <section
        id="tokenomics"
        className="px-4 sm:px-8 lg:px-16 py-14 sm:py-20 max-w-7xl mx-auto border-t border-slate-800/60"
      >
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-fuchsia-400">
            Sustainable Metrics
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-2 text-white">
            1,000,000,000 Fixed Tokenomics
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            Strict supply cap, zero mint functions in audited byte-code, and
            automated burning mechanisms.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
          <div className="space-y-3.5">
            {tokenomics.map((t, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-[#0d0f17] border border-slate-800"
              >
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="font-semibold text-slate-200">
                    {t.label}
                  </span>
                  <span className="font-mono font-bold text-white">
                    {t.percent}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    style={{ width: `${t.percent}%` }}
                    className={`h-full rounded-full bg-gradient-to-r ${t.color}`}
                  ></div>
                </div>
                <div className="text-[11px] font-mono text-slate-500 mt-1.5">
                  {t.tokens}
                </div>
              </div>
            ))}
          </div>

          {/* Highlights Box */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-tr from-purple-950/40 to-slate-900/80 border border-fuchsia-500/20 space-y-4 sm:space-y-6">
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Smart Contract Security Guarantees
            </h3>
            <ul className="space-y-3 sm:space-y-4 text-xs text-slate-300">
              <li className="flex items-start space-x-3">
                <span className="text-emerald-400 text-base shrink-0">✓</span>
                <span>
                  <strong>Zero Mint Privileges:</strong> Max supply of 1B
                  tokens is minted once at genesis. No additional tokens can
                  ever be created.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-emerald-400 text-base shrink-0">✓</span>
                <span>
                  <strong>Multi-Sig Timelock:</strong> All treasury movements
                  require a 4-of-7 multisig with a 48-hour timelock delay.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-emerald-400 text-base shrink-0">✓</span>
                <span>
                  <strong>Liquidity Locked:</strong> 100% of DEX liquidity will
                  be locked on Uncx Network for 24 months post-listing.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section
        id="roadmap"
        className="px-4 sm:px-8 lg:px-16 py-14 sm:py-20 max-w-7xl mx-auto border-t border-slate-800/60"
      >
        <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-fuchsia-400">
            Execution Timeline
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-2 text-white">
            Project Roadmap
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {roadmap.map((r, i) => (
            <div
              key={i}
              className="p-5 sm:p-6 rounded-2xl bg-[#0d0f17] border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-3">
                  <span className="text-slate-500">{r.phase}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] border ${r.badge}`}
                  >
                    {r.status}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mb-3">
                  {r.title}
                </h4>
                <ul className="space-y-2 text-xs text-slate-400">
                  {r.items.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-fuchsia-400 shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Wallet Connect Modal */}
      {walletModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0d0f17] border border-slate-700 rounded-2xl max-w-sm w-full p-6 text-slate-100 shadow-2xl relative space-y-4">
            <button
              onClick={() => setWalletModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-mono"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold">Connect Web3 Wallet</h3>
            <p className="text-xs text-slate-400">
              Select your preferred wallet provider:
            </p>
            <div className="space-y-2 pt-2">
              {[
                { name: "MetaMask", icon: "🦊" },
                { name: "Phantom", icon: "👻" },
                { name: "Coinbase Wallet", icon: "🔵" },
                { name: "WalletConnect", icon: "🔗" },
              ].map((w) => (
                <button
                  key={w.name}
                  onClick={() => handleConnect(w.name)}
                  className="w-full flex items-center space-x-3 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-fuchsia-500/60 hover:bg-slate-850 transition text-xs font-semibold"
                >
                  <span className="text-lg">{w.icon}</span>
                  <span>{w.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Whitepaper Modal */}
      {whitepaperOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0d0f17] border border-slate-700 rounded-2xl max-w-xl w-full p-6 sm:p-8 text-slate-100 shadow-2xl relative space-y-4">
            <button
              onClick={() => setWhitepaperOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-mono"
            >
              ✕
            </button>
            <div className="text-xs font-mono text-fuchsia-400 uppercase">
              Executive Summary
            </div>
            <h3 className="text-xl sm:text-2xl font-black">
              Aetherium Protocol Whitepaper v2.4
            </h3>
            <div className="text-xs text-slate-300 leading-relaxed space-y-3 pt-2">
              <p>
                Abstract: Traditional automated market makers suffer from acute
                impermanent loss and fragmented cross-chain liquidity. Aetherium
                introduces an autonomous state machine that continuously
                arbitrates order books across Layer-1 blockchains using
                zero-knowledge state proofs.
              </p>
              <p>
                Mathematical Consensus: Slashing conditions and validator
                bonding parameters are enforced via game-theoretic stakers,
                ensuring 99.999% transaction finality within 400 milliseconds.
              </p>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setWhitepaperOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert("Downloading Aetherium_Whitepaper_v2.4.pdf");
                  setWhitepaperOpen(false);
                }}
                className="px-4 py-2 bg-fuchsia-500 hover:bg-fuchsia-400 text-white font-bold text-xs rounded-lg"
              >
                Download PDF (18 Pages) ↓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="px-4 sm:px-8 lg:px-16 py-8 border-t border-slate-800/80 text-center text-xs text-slate-500 font-mono">
        <div>
          © 2026 Aetherium Protocol Foundation. Next.js 15 & Tailwind Web3
          Template.
        </div>
      </footer>
    </div>
  );
}
