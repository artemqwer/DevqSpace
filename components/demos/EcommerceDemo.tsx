"use client";

import React, { useState, useEffect } from "react";

interface Product {
  id: string;
  name: string;
  tagline: string;
  category: "hardware" | "audio" | "minimal" | "accessories";
  categoryLabel: string;
  price: number;
  badge?: string;
  rating: number;
  inStock: boolean;
  specs: string[];
}

interface CartItem extends Product {
  quantity: number;
}

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Aether Pro Mechanical Keyboard",
    tagline:
      "CNC milled brass weight, hot-swappable tactile switches, Bluetooth 5.4.",
    category: "hardware",
    categoryLabel: "Hardware",
    price: 189,
    badge: "BESTSELLER",
    rating: 4.9,
    inStock: true,
    specs: ["CNC 6063 Aluminum", "Gasket Mount", "3,000mAh Battery", "QMK / VIA"],
  },
  {
    id: "p2",
    name: "Kinetics Planar Studio Headphones",
    tagline:
      "Open-back 50mm planar magnetic drivers with beryllium foil acoustics.",
    category: "audio",
    categoryLabel: "Audio & Studio",
    price: 349,
    badge: "AUDIOPHILE",
    rating: 5.0,
    inStock: true,
    specs: ["Planar Magnetic", "5Hz - 48kHz", "Memory Foam Pads", "32 Ohm"],
  },
  {
    id: "p3",
    name: "Monolith Titanium Desk Tray",
    tagline: "Ultra-matte bead-blasted grade-5 titanium EDC organizer tray.",
    category: "minimal",
    categoryLabel: "Minimal Tech",
    price: 79,
    badge: "NEW",
    rating: 4.8,
    inStock: true,
    specs: ["Grade 5 Titanium", "Anti-scratch micro-felt", "Weighted 420g base"],
  },
  {
    id: "p4",
    name: "VoltFlow 140W GaN Charging Station",
    tagline:
      "Quad USB-C PD 3.1 fast charger with dynamic power distribution OLED.",
    category: "hardware",
    categoryLabel: "Hardware",
    price: 119,
    rating: 4.7,
    inStock: true,
    specs: [
      "GaN V Fast Chip",
      "140W Single Port",
      "Realtime OLED Display",
      "Travel Plugs",
    ],
  },
  {
    id: "p5",
    name: "ZeroPoint Cable Loom & Docks",
    tagline:
      "Modular magnetic silicone cable organizers with weighted steel puck.",
    category: "accessories",
    categoryLabel: "Accessories",
    price: 45,
    rating: 4.6,
    inStock: true,
    specs: ["Neodymium Magnets", "Liquid Silicone", "Universal 3-6mm wire fit"],
  },
  {
    id: "p6",
    name: "Pulse DAC / Amp Interface",
    tagline:
      "Balanced 4.4mm + 6.35mm desktop headphone amplifier with ESS Sabre DAC.",
    category: "audio",
    categoryLabel: "Audio & Studio",
    price: 260,
    badge: "LIMITED",
    rating: 4.9,
    inStock: true,
    specs: ["Dual ES9038Q2M", "DSD512 / 32bit 768kHz", "Balanced XLR Out"],
  },
];

export function EcommerceDemo() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  // New product form
  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdCategory, setNewProdCategory] = useState<
    "hardware" | "audio" | "minimal" | "accessories"
  >("hardware");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("checkout_success")) {
        setCheckoutSuccess(true);
      }
    }
  }, []);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const applyPromo = () => {
    if (promoCode.trim().toUpperCase() === "DEVQ10") {
      setDiscountPercent(10);
    } else {
      alert("Invalid promo code. Try 'DEVQ10' for 10% discount!");
    }
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    setTimeout(() => {
      setCheckoutSuccess(true);
      setCart([]);
      setCartOpen(false);
      setCheckoutLoading(false);
    }, 800);
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const total = subtotal - discountAmount;
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const filteredProducts = products.filter((p) => {
    const matchCat = activeCategory === "all" || p.category === activeCategory;
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;
    const newP: Product = {
      id: `p-${Date.now()}`,
      name: newProdName,
      tagline: "Custom catalog entry added via Admin overlay",
      category: newProdCategory,
      categoryLabel: newProdCategory.toUpperCase(),
      price: parseFloat(newProdPrice),
      badge: "CUSTOM",
      rating: 5.0,
      inStock: true,
      specs: ["High Performance", "Standard Warranty"],
    };
    setProducts([newP, ...products]);
    setNewProdName("");
    setNewProdPrice("");
    setAdminModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 font-sans antialiased selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top Banner */}
      <div className="bg-emerald-500 text-black px-4 py-1.5 text-xs font-semibold text-center flex items-center justify-center space-x-2">
        <span>
          ⚡ SUMMER TECH DROP — USE PROMO CODE <strong>DEVQ10</strong> FOR 10%
          OFF
        </span>
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-30 bg-[#0d111a]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 lg:px-16 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-400 flex items-center justify-center text-black font-black text-sm shadow-[0_0_15px_rgba(52,211,153,0.4)]">
            DQ
          </div>
          <span className="font-bold tracking-wider text-sm sm:text-base">
            DEVQ // STORE
          </span>
        </div>

        {/* Search Bar */}
        <div className="hidden sm:flex items-center w-64 lg:w-72 bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus-within:border-emerald-500">
          <span className="text-slate-500 mr-2">🔍</span>
          <input
            type="text"
            placeholder="Search equipment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent focus:outline-none placeholder-slate-500"
          />
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setAdminModalOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 text-xs text-slate-300 transition"
          >
            + Admin Add
          </button>

          {/* Cart Button */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative px-3.5 sm:px-4 py-1.5 sm:py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-lg transition-all flex items-center space-x-2 shadow-[0_0_15px_rgba(52,211,153,0.3)]"
          >
            <span>🛒 Cart</span>
            {cartCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-black text-emerald-400 font-bold text-[11px] flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Success Notification */}
      {checkoutSuccess && (
        <div className="max-w-4xl mx-auto mt-6 px-4">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
            <div>
              <strong>Order Confirmed!</strong> Thank you for your purchase. A
              receipt and tracking token have been dispatched.
            </div>
            <button
              onClick={() => setCheckoutSuccess(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <section className="px-4 sm:px-8 lg:px-16 pt-8 sm:pt-12 pb-6 sm:pb-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800/80 pb-6 sm:pb-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
              High-Performance Hardware
            </span>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mt-2">
              Tactile Workstation Essentials
            </h1>
            <p className="text-xs text-slate-400 mt-2 max-w-xl">
              Precision audio interfaces, CNC mechanical keyboards, and
              minimalist desktop telemetry built for creators and engineers.
            </p>
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              { id: "all", label: "All Items" },
              { id: "hardware", label: "Hardware" },
              { id: "audio", label: "Audio & Studio" },
              { id: "minimal", label: "Minimal EDC" },
              { id: "accessories", label: "Cables & Docks" },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  activeCategory === c.id
                    ? "bg-emerald-500 text-black font-semibold shadow-sm"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Product Catalog Grid */}
      <main className="px-4 sm:px-8 lg:px-16 py-6 sm:py-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="p-5 sm:p-6 rounded-2xl bg-[#111520] border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-3">
                  <span className="text-emerald-400 font-semibold">
                    {p.categoryLabel}
                  </span>
                  {p.badge && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-[10px] border border-emerald-500/20">
                      {p.badge}
                    </span>
                  )}
                </div>

                {/* Aesthetic Visual Box */}
                <div
                  onClick={() => setQuickViewProduct(p)}
                  className="w-full h-40 sm:h-44 rounded-xl bg-gradient-to-tr from-slate-900 via-slate-850 to-slate-800 border border-slate-700/40 flex items-center justify-center p-4 cursor-pointer relative overflow-hidden group-hover:border-emerald-500/30 transition"
                >
                  <div className="text-center">
                    <span className="font-mono text-xs text-slate-400 uppercase tracking-wider block">
                      {p.name}
                    </span>
                    <span className="text-[10px] text-emerald-400 mt-1 inline-block">
                      Click for Specs ↗
                    </span>
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white mt-4 group-hover:text-emerald-300 transition">
                  {p.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                  {p.tagline}
                </p>

                {/* Micro specs tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {p.specs.slice(0, 3).map((s, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 sm:pt-5 border-t border-slate-800/60 mt-5 sm:mt-6">
                <div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Price USD
                  </div>
                  <div className="text-lg sm:text-xl font-black text-white font-mono">
                    ${p.price}.00
                  </div>
                </div>

                <button
                  onClick={() => addToCart(p)}
                  className="px-3.5 sm:px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-lg transition-all shadow-[0_0_12px_rgba(52,211,153,0.3)]"
                >
                  Add to Cart +
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Cart Drawer Modal */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-[#0f131d] border-l border-slate-800 h-full p-6 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <h2 className="text-base font-bold text-white">
                    Your Cart ({cartCount})
                  </h2>
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-white text-lg font-mono"
                >
                  ✕
                </button>
              </div>

              {/* Items List */}
              <div className="mt-4 space-y-3.5 max-h-[50vh] overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    Your cart is currently empty.
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="overflow-hidden flex-1 mr-3">
                        <div className="text-xs font-bold text-slate-200 truncate">
                          {item.name}
                        </div>
                        <div className="text-xs font-mono text-emerald-400 mt-0.5">
                          ${item.price} × {item.quantity}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-xs font-mono"
                        >
                          -
                        </button>
                        <span className="text-xs font-mono font-semibold w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-xs font-mono"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="pt-4 border-t border-slate-800 space-y-3">
                {/* Promo Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Promo Code (DEVQ10)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 uppercase font-mono focus:outline-none"
                  />
                  <button
                    onClick={applyPromo}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg"
                  >
                    Apply
                  </button>
                </div>

                <div className="space-y-1.5 text-xs text-slate-400 font-mono">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="text-white">${subtotal.toFixed(2)}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Promo Discount ({discountPercent}%):</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-300 font-bold pt-2 border-t border-slate-800 text-sm">
                    <span>Total Amount:</span>
                    <span className="text-emerald-400">${total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)] disabled:opacity-50"
                >
                  {checkoutLoading
                    ? "Connecting Stripe..."
                    : `Checkout ($${total.toFixed(2)}) →`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111520] border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-2xl relative space-y-4">
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-mono"
            >
              ✕
            </button>
            <div className="text-xs font-mono text-emerald-400 uppercase">
              {quickViewProduct.categoryLabel}
            </div>
            <h3 className="text-xl font-bold">{quickViewProduct.name}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {quickViewProduct.tagline}
            </p>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs font-semibold text-slate-300 mb-2">
                Technical Specifications:
              </div>
              <ul className="space-y-1 text-xs text-slate-400 font-mono">
                {quickViewProduct.specs.map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="text-xl font-black text-white font-mono">
                ${quickViewProduct.price}.00
              </div>
              <button
                onClick={() => {
                  addToCart(quickViewProduct);
                  setQuickViewProduct(null);
                }}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-lg"
              >
                Add to Cart & Checkout →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Quick Add Modal */}
      {adminModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateProduct}
            className="bg-[#111520] border border-slate-700 rounded-2xl max-w-md w-full p-6 text-slate-100 space-y-4 shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setAdminModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-mono"
            >
              ✕
            </button>
            <h3 className="text-base font-bold">Admin: Add New Store Product</h3>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Product Title
              </label>
              <input
                type="text"
                required
                value={newProdName}
                onChange={(e) => setNewProdName(e.target.value)}
                placeholder="Titanium USB-C Hub"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Price ($ USD)
              </label>
              <input
                type="number"
                required
                value={newProdPrice}
                onChange={(e) => setNewProdPrice(e.target.value)}
                placeholder="89"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Category
              </label>
              <select
                value={newProdCategory}
                onChange={(e: any) => setNewProdCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
              >
                <option value="hardware">Hardware</option>
                <option value="audio">Audio & Studio</option>
                <option value="minimal">Minimal EDC</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition"
            >
              Publish Product to Store
            </button>
          </form>
        </div>
      )}

      {/* Footer */}
      <footer className="px-4 sm:px-8 lg:px-16 py-8 border-t border-slate-800/80 text-center text-xs text-slate-500 font-mono">
        <div>© 2026 DevqStore Template. Powered by Next.js 15, Prisma & Stripe.</div>
      </footer>
    </div>
  );
}
