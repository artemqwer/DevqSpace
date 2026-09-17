"use client";

import React, { useState } from "react";
import {
  ShoppingCartSimple,
  Trash,
  Plus,
  Minus,
  CheckCircle,
  Tag,
  ShieldCheck,
  Truck,
  ArrowCounterClockwise,
} from "@phosphor-icons/react";

type ProductItem = {
  id: string;
  name: string;
  category: "keyboards" | "audio" | "power";
  price: number;
  badge: string;
  desc: string;
};

export function EcommerceDemo() {
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [cart, setCart] = useState<{ id: string; qty: number }[]>([
    { id: "p1", qty: 1 },
  ]);
  const [cartOpen, setCartOpen] = useState(false);
  const [promoInput, setPromoInput] = useState("DEVQ20");
  const [discountPercent, setDiscountPercent] = useState(20);
  const [promoMessage, setPromoMessage] = useState("✓ Промокод DEVQ20 активовано (-20%)");
  const [checkoutModal, setCheckoutModal] = useState(false);

  const catalog: ProductItem[] = [
    {
      id: "p1",
      name: "Aether Pro Mechanical Keyboard",
      category: "keyboards",
      price: 189,
      badge: "BESTSELLER",
      desc: "CNC milled brass weight, hot-swappable tactile switches, QMK/VIA.",
    },
    {
      id: "p2",
      name: "Kinetics Planar Studio Headphones",
      category: "audio",
      price: 349,
      badge: "AUDIOPHILE",
      desc: "Open-back 50mm planar magnetic drivers with oxygen-free copper cable.",
    },
    {
      id: "p3",
      name: "VoltFlow 140W GaN Station",
      category: "power",
      price: 119,
      badge: "NEW",
      desc: "Quad USB-C PD 3.1 fast charger with real-time OLED power metering.",
    },
    {
      id: "p4",
      name: "CyberDesk Ergo Wool Mat",
      category: "keyboards",
      price: 49,
      badge: "ECO",
      desc: "Merino felt anti-slip oversized desktop protector (900x400mm).",
    },
  ];

  const filtered = selectedCat === "all" ? catalog : catalog.filter((p) => p.category === selectedCat);

  const cartTotalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const subtotal = cart.reduce((sum, item) => {
    const prod = catalog.find((p) => p.id === item.id);
    return sum + (prod ? prod.price * item.qty : 0);
  }, 0);

  const discountAmount = (subtotal * discountPercent) / 100;
  const finalTotal = subtotal - discountAmount;

  const addToCart = (id: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === id);
      if (existing) {
        return prev.map((item) => (item.id === id ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...prev, { id, qty: 1 }];
    });
    setCartOpen(true);
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const next = item.qty + delta;
            return next > 0 ? { ...item, qty: next } : null;
          }
          return item;
        })
        .filter((item): item is { id: string; qty: number } => item !== null)
    );
  };

  const applyPromo = () => {
    if (promoInput.trim().toUpperCase() === "DEVQ20") {
      setDiscountPercent(20);
      setPromoMessage("✓ Промокод DEVQ20 активовано (-20%)");
    } else if (promoInput.trim().toUpperCase() === "SAVE10") {
      setDiscountPercent(10);
      setPromoMessage("✓ Промокод SAVE10 активовано (-10%)");
    } else {
      setDiscountPercent(0);
      setPromoMessage("✕ Недійсний промокод");
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 max-w-5xl mx-auto space-y-10 antialiased font-sans text-slate-100 relative">
      {/* Store Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="text-xs font-mono uppercase text-emerald-400 font-bold">
            E-Commerce Storefront Template
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-0.5">
            DevqStore Workstation Essentials
          </h2>
          <p className="text-xs text-slate-400">Minimalist tactile hardware for developers and creators</p>
        </div>

        <button
          onClick={() => setCartOpen(!cartOpen)}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl flex items-center space-x-2 shadow-lg transition"
        >
          <ShoppingCartSimple weight="bold" className="h-4 w-4" />
          <span>Кошик покупок</span>
          <span className="w-5 h-5 rounded-full bg-black text-emerald-400 text-[11px] flex items-center justify-center font-bold">
            {cartTotalItems}
          </span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-2 text-xs font-mono">
        {[
          { id: "all", label: "Усі товари" },
          { id: "keyboards", label: "Клавіатури & Килимки" },
          { id: "audio", label: "Аудіо системи" },
          { id: "power", label: "Живлення GaN" },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCat(cat.id)}
            className={`px-3 py-1.5 rounded-xl transition ${
              selectedCat === cat.id
                ? "bg-emerald-500 text-black font-bold"
                : "bg-white/5 border border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="p-5 rounded-2xl bg-[#111520] border border-white/10 hover:border-emerald-500/40 transition flex flex-col justify-between space-y-4 shadow-md"
          >
            <div>
              <div className="flex justify-between text-xs font-mono mb-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                  {p.badge}
                </span>
                <span className="text-slate-500 text-[10px]">В наявності</span>
              </div>
              <h3 className="text-sm font-bold text-white leading-snug">{p.name}</h3>
              <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                {p.desc}
              </p>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-white/10">
              <span className="font-mono text-base font-black text-white">${p.price}</span>
              <button
                onClick={() => addToCart(p.id)}
                className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-black font-bold text-xs rounded-xl transition"
              >
                + Додати
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Drawer Modal */}
      {cartOpen && (
        <div className="p-6 rounded-3xl bg-[#0f1420] border border-emerald-500/30 max-w-md ml-auto shadow-2xl space-y-5">
          <div className="flex justify-between items-center pb-2 border-b border-white/10">
            <span className="font-bold text-sm text-white">Кошик замовлення ({cartTotalItems})</span>
            <button
              onClick={() => setCartOpen(false)}
              className="text-xs text-slate-400 hover:text-white font-mono"
            >
              ✕ Закрити
            </button>
          </div>

          {/* Cart Item List */}
          {cart.length === 0 ? (
            <div className="text-xs text-slate-400 text-center py-6">Ваш кошик порожній</div>
          ) : (
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {cart.map((item) => {
                const prod = catalog.find((p) => p.id === item.id);
                if (!prod) return null;
                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs flex justify-between items-center"
                  >
                    <div>
                      <div className="font-bold text-white">{prod.name}</div>
                      <div className="text-slate-500 font-mono mt-0.5">
                        ${prod.price} × {item.qty} = ${prod.price * item.qty}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="font-mono text-xs text-white">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Promo Code Input */}
          <div className="space-y-1.5 pt-2 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="Промокод..."
                className="flex-1 rounded-xl bg-black/40 border border-white/10 px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
              />
              <button
                onClick={applyPromo}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold transition"
              >
                Застосувати
              </button>
            </div>
            {promoMessage && (
              <div
                className={`text-[11px] font-mono ${
                  discountPercent > 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {promoMessage}
              </div>
            )}
          </div>

          {/* Subtotal Calculation */}
          <div className="space-y-1.5 text-xs font-mono text-slate-400 pt-2 border-t border-white/10">
            <div className="flex justify-between">
              <span>Сума:</span>
              <span className="text-white">${subtotal.toFixed(2)}</span>
            </div>
            {discountPercent > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Знижка (-{discountPercent}%):</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-white font-bold pt-2 border-t border-white/10 text-sm">
              <span>До сплати:</span>
              <span className="text-emerald-400">${finalTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => {
              setCartOpen(false);
              setCheckoutModal(true);
            }}
            disabled={cart.length === 0}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition shadow-lg disabled:opacity-50"
          >
            Stripe 1-Click Checkout (${finalTotal.toFixed(2)}) →
          </button>
        </div>
      )}

      {/* Checkout Success Modal */}
      {checkoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="p-6 rounded-3xl bg-[#0e121a] border border-emerald-500/40 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle weight="fill" className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-white">Оплату успішно підтверджено!</h3>
            <p className="text-xs text-slate-400">
              Замовлення #STR-8921 на суму ${finalTotal.toFixed(2)} створено у Stripe sandbox. Товар передано на відправку.
            </p>
            <button
              onClick={() => setCheckoutModal(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition"
            >
              Зрозуміло
            </button>
          </div>
        </div>
      )}

      {/* Trust Badges Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.02]">
          <Truck className="h-5 w-5 text-emerald-400" />
          <span>Швидка доставка по Україні (1-2 дні)</span>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.02]">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          <span>Офіційна гарантія 12 місяців</span>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.02]">
          <ArrowCounterClockwise className="h-5 w-5 text-emerald-400" />
          <span>14 днів на повернення коштів</span>
        </div>
      </div>
    </div>
  );
}
