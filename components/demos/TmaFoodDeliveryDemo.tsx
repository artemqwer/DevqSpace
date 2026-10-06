"use client";

import React, { useState } from "react";
import {
  ShoppingBag,
  Plus,
  Minus,
  Check,
  Motorcycle,
  Storefront,
  ArrowRight,
  Flame,
  Sparkle,
} from "@phosphor-icons/react";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "burgers" | "pizza" | "drinks" | "desserts";
  image: string;
  isPopular?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: "m1",
    name: "Truffle Smash Burger",
    description: "Дві котлети з яловичини, трюфельний соус, витриманий чеддер, карамелізована цибуля",
    price: 12.5,
    category: "burgers",
    image: "🍔",
    isPopular: true,
  },
  {
    id: "m2",
    name: "Smoked BBQ Bacon",
    description: "Хрусткий бекон, копчений сир, соус BBQ, цибулеві кільця фрі",
    price: 11.0,
    category: "burgers",
    image: "🥓",
  },
  {
    id: "m3",
    name: "Quattro Formaggi",
    description: "Моцарела, горгонзола, пармезан, рікота, білий вершковий соус",
    price: 14.0,
    category: "pizza",
    image: "🍕",
    isPopular: true,
  },
  {
    id: "m4",
    name: "Diablo Pepperoni",
    description: "Пікантна салямі пепероні, халапеньйо, моцарела, томатний соус сан-марцано",
    price: 13.5,
    category: "pizza",
    image: "🌶️",
  },
  {
    id: "m5",
    name: "Matcha Iced Latte",
    description: "Органічна японська матча, вівсяне молоко, ванільний сироп",
    price: 4.5,
    category: "drinks",
    image: "🍵",
  },
  {
    id: "m6",
    name: "Craft Lemonade Yuzu",
    description: "Натуральний сік юдзу, м'ята, газована артезіанська вода",
    price: 3.8,
    category: "drinks",
    image: "🍋",
  },
];

export function TmaFoodDeliveryDemo() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [cart, setCart] = useState<Record<string, number>>({ m1: 1, m3: 1 });
  const [deliveryType, setDeliveryType] = useState<"courier" | "takeaway">("courier");
  const [address, setAddress] = useState("вул. Хрещатик, 24, кв. 18");
  const [orderSent, setOrderSent] = useState(false);

  const filteredItems =
    activeCategory === "all"
      ? MENU_ITEMS
      : MENU_ITEMS.filter((item) => item.category === activeCategory);

  const addToCart = (id: string) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const updated = { ...prev };
      if (updated[id] > 1) {
        updated[id] -= 1;
      } else {
        delete updated[id];
      }
      return updated;
    });
  };

  const totalItemsCount = Object.values(cart).reduce((sum, count) => sum + count, 0);
  const totalSubtotal = Object.entries(cart).reduce((sum, [id, count]) => {
    const item = MENU_ITEMS.find((m) => m.id === id);
    return sum + (item ? item.price * count : 0);
  }, 0);

  const deliveryFee = deliveryType === "courier" ? 2.5 : 0;
  const totalPrice = totalSubtotal + deliveryFee;

  const handleCheckout = () => {
    setOrderSent(true);
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#0d1117] text-slate-100 flex flex-col font-sans select-none pb-24 shadow-2xl relative">
      {/* Telegram WebApp Header Bar */}
      <div className="bg-[#161b22] px-4 py-3 border-b border-white/10 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-500/30">
            🍔
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Gourmet Street Food</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-mono">
                TMA
              </span>
            </div>
            <div className="text-[10px] text-slate-400">Час доставки ~ 25–35 хв</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Відчинено</span>
        </div>
      </div>

      {/* Delivery Mode Switcher */}
      <div className="p-3 bg-[#111620] border-b border-white/5">
        <div className="grid grid-cols-2 p-1 bg-black/40 rounded-xl border border-white/10 text-xs font-medium">
          <button
            onClick={() => setDeliveryType("courier")}
            className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg transition ${
              deliveryType === "courier"
                ? "bg-emerald-500 text-black font-bold shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Motorcycle className="w-4 h-4" />
            <span>Доставка ($2.50)</span>
          </button>
          <button
            onClick={() => setDeliveryType("takeaway")}
            className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg transition ${
              deliveryType === "takeaway"
                ? "bg-emerald-500 text-black font-bold shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Storefront className="w-4 h-4" />
            <span>Самовивіз (0₴)</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2 px-3 py-2.5 overflow-x-auto scrollbar-none border-b border-white/5">
        {[
          { id: "all", label: "Все меню" },
          { id: "burgers", label: "🍔 Бургери" },
          { id: "pizza", label: "🍕 Піца" },
          { id: "drinks", label: "🥤 Напої" },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              activeCategory === cat.id
                ? "bg-white text-black font-bold"
                : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Product List */}
      <div className="p-3 space-y-3 flex-1">
        {filteredItems.map((item) => {
          const qty = cart[item.id] || 0;
          return (
            <div
              key={item.id}
              className="p-3 rounded-2xl bg-[#161b26] border border-white/10 flex items-center justify-between gap-3 hover:border-emerald-500/40 transition group"
            >
              <div className="w-16 h-16 rounded-xl bg-black/40 flex items-center justify-center text-3xl shrink-0 border border-white/5 group-hover:scale-105 transition-transform">
                {item.image}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
                  {item.isPopular && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-medium flex items-center gap-0.5 shrink-0">
                      <Flame className="w-2.5 h-2.5" /> Хіт
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
                <div className="text-xs font-mono font-bold text-emerald-400 mt-1.5">
                  ${item.price.toFixed(2)}
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="shrink-0 flex items-center">
                {qty === 0 ? (
                  <button
                    onClick={() => addToCart(item.id)}
                    className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500 hover:text-black flex items-center justify-center transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="flex items-center space-x-1.5 bg-black/40 rounded-xl p-1 border border-white/10">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center text-xs font-bold font-mono text-white">
                      {qty}
                    </span>
                    <button
                      onClick={() => addToCart(item.id)}
                      className="w-6 h-6 rounded-lg bg-emerald-500 text-black flex items-center justify-center font-bold transition"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Bottom Cart / Checkout Button (Telegram MainButton style) */}
      {totalItemsCount > 0 && !orderSent && (
        <div className="fixed bottom-3 left-0 right-0 max-w-md mx-auto px-3 z-40">
          <div className="bg-[#1c2333]/95 backdrop-blur-md p-3 rounded-2xl border border-emerald-500/30 shadow-2xl space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300 px-1">
              <span>{deliveryType === "courier" ? `Доставка: ${address}` : "Самовивіз: Центр"}</span>
              <span className="font-mono text-white font-bold">Разом: ${totalPrice.toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl transition flex items-center justify-between px-4 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-4 h-4" weight="bold" />
                <span className="text-sm">Оформити замовлення ({totalItemsCount})</span>
              </div>
              <div className="flex items-center space-x-1 text-sm font-mono font-black">
                <span>${totalPrice.toFixed(2)}</span>
                <ArrowRight className="w-4 h-4" weight="bold" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {orderSent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#161b26] border border-emerald-500/40 rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center">
              <Check className="w-7 h-7" weight="bold" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Замовлення #284 прийнято!</h3>
              <p className="text-xs text-slate-300 mt-1">
                Чек на суму <span className="text-emerald-400 font-mono font-bold">${totalPrice.toFixed(2)}</span> успішно надіслано в Telegram кухні.
              </p>
            </div>
            <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-left text-xs space-y-1.5 font-mono text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Спосіб:</span>
                <span className="text-white">{deliveryType === "courier" ? "Кур'єр" : "Самовивіз"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Час очікування:</span>
                <span className="text-emerald-400">~25-30 хв</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Статус:</span>
                <span className="text-amber-400">Готується на кухні 🍳</span>
              </div>
            </div>
            <button
              onClick={() => {
                setOrderSent(false);
                setCart({});
              }}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
            >
              Спробувати ще раз
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
