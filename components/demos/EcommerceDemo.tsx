"use client";

import React, { useState } from "react";

export function EcommerceDemo() {
  const [cartCount, setCartCount] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);
  const [promo, setPromo] = useState("DEVQ10");
  const [discount, setDiscount] = useState(10);

  const products = [
    { id: "p1", name: "Aether Pro Mechanical Keyboard", price: 189, badge: "BESTSELLER", desc: "CNC milled brass weight, hot-swappable switches." },
    { id: "p2", name: "Kinetics Planar Studio Headphones", price: 349, badge: "AUDIOPHILE", desc: "Open-back 50mm planar magnetic drivers." },
    { id: "p3", name: "VoltFlow 140W GaN Station", price: 119, badge: "NEW", desc: "Quad USB-C PD 3.1 fast charger with OLED." },
  ];

  const subtotal = 189;
  const total = subtotal - (subtotal * discount) / 100;

  return (
    <div className="flex-1 p-6 max-w-5xl mx-auto space-y-8 antialiased font-sans text-slate-100 relative">
      {/* Store Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">DevqStore Workstation Essentials</h2>
          <p className="text-xs text-slate-400">Minimalist tactile hardware for developers and creators</p>
        </div>
        <button
          onClick={() => setCartOpen(!cartOpen)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-lg flex items-center space-x-2 shadow-lg"
        >
          <span>🛒 Cart</span>
          <span className="w-5 h-5 rounded-full bg-black text-emerald-400 text-[11px] flex items-center justify-center font-bold">
            {cartCount}
          </span>
        </button>
      </div>

      {/* Product Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {products.map((p) => (
          <div key={p.id} className="p-5 rounded-xl bg-[#111520] border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex justify-between text-xs font-mono mb-2">
                <span className="text-emerald-400 font-semibold">{p.badge}</span>
                <span className="text-slate-500">In Stock</span>
              </div>
              <h3 className="text-base font-bold text-white">{p.name}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{p.desc}</p>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-slate-800">
              <span className="font-mono text-lg font-black text-white">${p.price}</span>
              <button
                onClick={() => {
                  setCartCount(cartCount + 1);
                  setCartOpen(true);
                }}
                className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-black font-bold text-xs rounded-lg transition"
              >
                + Add
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/30 max-w-md ml-auto shadow-2xl space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <span className="font-bold text-sm text-white">Slide-Out Cart Drawer</span>
            <button onClick={() => setCartOpen(false)} className="text-xs text-slate-400 hover:text-white">✕ Close</button>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs flex justify-between items-center">
            <div>
              <div className="font-bold text-slate-200">Aether Pro Mechanical Keyboard</div>
              <div className="text-slate-500 font-mono mt-0.5">$189.00 × 1</div>
            </div>
            <span className="text-emerald-400 font-bold">$189</span>
          </div>
          <div className="space-y-1 text-xs font-mono text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="text-white">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-emerald-400">
              <span>Promo ({promo} -{discount}%):</span>
              <span>-${((subtotal * discount) / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white font-bold pt-2 border-t border-slate-800 text-sm">
              <span>Total Checkout:</span>
              <span className="text-emerald-400">${total.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={() => alert("Connecting to Stripe Checkout Session...")}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition"
          >
            Stripe 1-Click Checkout (${total.toFixed(2)}) →
          </button>
        </div>
      )}
    </div>
  );
}
