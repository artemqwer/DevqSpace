"use client";

import React, { useState } from "react";
import {
  CalendarBlank,
  Clock,
  Scissors,
  Check,
  Star,
  User,
  CaretRight,
  Sparkle,
} from "@phosphor-icons/react";

interface Master {
  id: string;
  name: string;
  role: string;
  rating: number;
  reviewsCount: number;
  avatar: string;
}

interface Service {
  id: string;
  name: string;
  duration: string;
  price: number;
  category: string;
}

const MASTERS: Master[] = [
  {
    id: "m1",
    name: "Олена Коваль",
    role: "Топ-стиліст / Колорист",
    rating: 4.98,
    reviewsCount: 142,
    avatar: "👩‍🦰",
  },
  {
    id: "m2",
    name: "Дмитро Резнік",
    role: "Head Barber / Борода",
    rating: 4.95,
    reviewsCount: 189,
    avatar: "🧔",
  },
  {
    id: "m3",
    name: "Катерина Смирна",
    role: "Nail-майстер / Естетика",
    rating: 4.92,
    reviewsCount: 96,
    avatar: "💅",
  },
];

const SERVICES: Service[] = [
  { id: "s1", name: "Авторська чоловіча стрижка", duration: "45 хв", price: 25, category: "hair" },
  { id: "s2", name: "Моделювання бороди & Hot Towel", duration: "30 хв", price: 18, category: "hair" },
  { id: "s3", name: "Стрижка + догляд Olaplex", duration: "60 хв", price: 40, category: "hair" },
  { id: "s4", name: "Комплексний манікюр & покриття", duration: "75 хв", price: 32, category: "nails" },
  { id: "s5", name: "Спа-догляд для волосся", duration: "40 хв", price: 28, category: "spa" },
];

const TIME_SLOTS = ["10:00", "11:30", "13:00", "14:30", "16:00", "17:30", "19:00"];

export function TmaBeautyBookingDemo() {
  const [selectedMaster, setSelectedMaster] = useState<string>("m1");
  const [selectedServices, setSelectedServices] = useState<string[]>(["s1"]);
  const [selectedDate, setSelectedDate] = useState<string>("Сьогодні, 6 Жовтня");
  const [selectedTime, setSelectedTime] = useState<string>("14:30");
  const [isBooked, setIsBooked] = useState(false);

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((s) => s !== id) : prev) : [...prev, id]
    );
  };

  const currentMaster = MASTERS.find((m) => m.id === selectedMaster) || MASTERS[0];
  const totalPrice = selectedServices.reduce((sum, sId) => {
    const s = SERVICES.find((item) => item.id === sId);
    return sum + (s ? s.price : 0);
  }, 0);

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#0f0e13] text-slate-100 flex flex-col font-sans select-none pb-24 shadow-2xl relative">
      {/* Header Bar */}
      <div className="bg-[#171520] px-4 py-3 border-b border-pink-500/20 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-sm border border-pink-500/30">
            ✨
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>LUMIÈRE Beauty & Barber</span>
              <span className="text-[10px] bg-pink-500/20 text-pink-300 px-1.5 py-0.2 rounded font-mono">
                TMA
              </span>
            </div>
            <div className="text-[10px] text-slate-400">Онлайн-запис 24/7</div>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono text-pink-300 bg-pink-500/10 border border-pink-500/30">
          Студія в центрі
        </span>
      </div>

      <div className="p-3.5 space-y-4 flex-1">
        {/* Step 1: Select Master */}
        <div>
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-pink-400" />
            <span>1. Оберіть майстра</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {MASTERS.map((m) => {
              const isSelected = selectedMaster === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMaster(m.id)}
                  className={`p-2.5 rounded-2xl flex flex-col items-center text-center transition border ${
                    isSelected
                      ? "bg-pink-500/15 border-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.2)]"
                      : "bg-[#181622] border-white/5 text-slate-400 hover:border-white/20"
                  }`}
                >
                  <div className="w-11 h-11 rounded-full bg-black/40 flex items-center justify-center text-2xl mb-1.5 border border-white/10">
                    {m.avatar}
                  </div>
                  <div className="text-xs font-bold text-white truncate w-full">{m.name}</div>
                  <div className="text-[10px] text-pink-300 flex items-center gap-0.5 mt-0.5">
                    <Star className="w-2.5 h-2.5 text-pink-400" weight="fill" />
                    <span>{m.rating}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Select Services */}
        <div>
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Scissors className="w-3.5 h-3.5 text-pink-400" />
            <span>2. Оберіть послуги</span>
          </div>
          <div className="space-y-1.5">
            {SERVICES.map((s) => {
              const isSelected = selectedServices.includes(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => toggleService(s.id)}
                  className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition ${
                    isSelected
                      ? "bg-pink-500/10 border-pink-500/50 text-white"
                      : "bg-[#181622] border-white/5 text-slate-300 hover:border-white/10"
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-bold truncate">{s.name}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{s.duration}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-xs font-mono font-bold text-pink-400">${s.price}</span>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                        isSelected
                          ? "bg-pink-500 border-pink-500 text-black font-bold"
                          : "border-white/20 bg-black/20"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" weight="bold" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Date & Time Picker */}
        <div>
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1">
            <CalendarBlank className="w-3.5 h-3.5 text-pink-400" />
            <span>3. Оберіть день та час</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 mb-2.5">
            {["Сьогодні, 6 Жов", "Завтра, 7 Жов", "Ср, 8 Жов"].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDate(d)}
                className={`py-1.5 px-2 rounded-xl text-xs font-medium border transition ${
                  selectedDate.startsWith(d.slice(0, 7))
                    ? "bg-white text-black font-bold border-white"
                    : "bg-[#181622] border-white/5 text-slate-400 hover:text-white"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {TIME_SLOTS.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTime(t)}
                className={`py-2 rounded-xl text-xs font-mono font-bold border transition ${
                  selectedTime === t
                    ? "bg-pink-500 text-black border-pink-500 shadow-md"
                    : "bg-[#181622] border-white/5 text-slate-300 hover:border-white/20"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Telegram MainButton Footer */}
      {!isBooked && (
        <div className="fixed bottom-3 left-0 right-0 max-w-md mx-auto px-3 z-40">
          <div className="bg-[#1c1929]/95 backdrop-blur-md p-3 rounded-2xl border border-pink-500/30 shadow-2xl space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300 px-1">
              <span>{currentMaster.name} • {selectedTime}</span>
              <span className="font-mono text-white font-bold">${totalPrice}</span>
            </div>
            <button
              onClick={() => setIsBooked(true)}
              className="w-full py-3 bg-pink-500 hover:bg-pink-400 text-black font-extrabold rounded-xl transition flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(236,72,153,0.3)] text-sm"
            >
              <Sparkle className="w-4 h-4" weight="fill" />
              <span>Підтвердити запис на {selectedTime}</span>
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isBooked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1a1726] border border-pink-500/40 rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/40 mx-auto flex items-center justify-center text-2xl">
              ✂️
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Ви успішно записані!</h3>
              <p className="text-xs text-slate-300 mt-1">
                Нагадування надійде у Telegram за 2 години до візиту.
              </p>
            </div>
            <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-left text-xs space-y-1.5 font-mono text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Майстер:</span>
                <span className="text-white">{currentMaster.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Час:</span>
                <span className="text-pink-400">{selectedDate}, {selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Вартість:</span>
                <span className="text-white font-bold">${totalPrice}</span>
              </div>
            </div>
            <button
              onClick={() => setIsBooked(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
            >
              Повернутись
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
