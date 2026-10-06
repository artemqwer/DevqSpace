"use client";

import React, { useState } from "react";
import {
  Armchair,
  Users,
  Clock,
  CalendarBlank,
  Sparkle,
  CheckCircle,
  CurrencyDollar,
  Wine,
  MusicNotes,
  X,
  Info,
} from "@phosphor-icons/react";

interface TableItem {
  id: string;
  name: string;
  zone: "stage" | "vip" | "bar" | "terrace";
  zoneTitle: string;
  capacity: number;
  minDeposit: number;
  status: "available" | "reserved" | "selected";
  x: number; // percentage
  y: number; // percentage
  shape: "round" | "rect";
}

const TABLES_DATA: TableItem[] = [
  // Stage Front Tables
  {
    id: "T1",
    name: "Стіл 1",
    zone: "stage",
    zoneTitle: "Main Stage Front",
    capacity: 4,
    minDeposit: 80,
    status: "available",
    x: 26,
    y: 35,
    shape: "round",
  },
  {
    id: "T2",
    name: "Стіл 2",
    zone: "stage",
    zoneTitle: "Main Stage Front",
    capacity: 4,
    minDeposit: 80,
    status: "reserved",
    x: 48,
    y: 35,
    shape: "round",
  },
  {
    id: "T3",
    name: "Стіл 3",
    zone: "stage",
    zoneTitle: "Main Stage Front",
    capacity: 4,
    minDeposit: 80,
    status: "available",
    x: 70,
    y: 35,
    shape: "round",
  },

  // VIP Sofas
  {
    id: "VIP1",
    name: "VIP Диван 1",
    zone: "vip",
    zoneTitle: "Royal VIP Lounge",
    capacity: 8,
    minDeposit: 200,
    status: "available",
    x: 22,
    y: 60,
    shape: "rect",
  },
  {
    id: "VIP2",
    name: "VIP Диван 2",
    zone: "vip",
    zoneTitle: "Royal VIP Lounge",
    capacity: 6,
    minDeposit: 150,
    status: "reserved",
    x: 74,
    y: 60,
    shape: "rect",
  },

  // Bar Counter High Tables
  {
    id: "B1",
    name: "High Bar 1",
    zone: "bar",
    zoneTitle: "Cocktail Bar Zone",
    capacity: 2,
    minDeposit: 40,
    status: "available",
    x: 20,
    y: 84,
    shape: "round",
  },
  {
    id: "B2",
    name: "High Bar 2",
    zone: "bar",
    zoneTitle: "Cocktail Bar Zone",
    capacity: 2,
    minDeposit: 40,
    status: "available",
    x: 48,
    y: 84,
    shape: "round",
  },
  {
    id: "B3",
    name: "High Bar 3",
    zone: "bar",
    zoneTitle: "Cocktail Bar Zone",
    capacity: 2,
    minDeposit: 40,
    status: "reserved",
    x: 76,
    y: 84,
    shape: "round",
  },
];

const TIME_SLOTS = ["19:00", "20:30", "22:00", "23:30", "01:00"];
const DATES = ["Сьогодні, 20:00", "Пт, 10 Квітня", "Сб, 11 Квітня"];

export function TmaTableBookingDemo() {
  const [selectedTableId, setSelectedTableId] = useState<string>("VIP1");
  const [selectedDate, setSelectedDate] = useState<string>("Сьогодні, 20:00");
  const [selectedTime, setSelectedTime] = useState<string>("20:30");
  const [guestsCount, setGuestsCount] = useState<number>(4);
  const [specialRequest, setSpecialRequest] = useState<string>("Святкування дня народження");
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);

  const selectedTable = TABLES_DATA.find((t) => t.id === selectedTableId) || TABLES_DATA[0];

  const handleTableClick = (t: TableItem) => {
    if (t.status === "reserved") return;
    setSelectedTableId(t.id);
  };

  const handleConfirmReservation = () => {
    setBookingSuccess(true);
    setShowCheckoutModal(false);
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#0b0811] text-slate-100 flex flex-col font-sans select-none pb-20 shadow-2xl relative border-x border-pink-900/30">
      {/* Top Header */}
      <div className="bg-[#140e1d] px-4 py-3 border-b border-pink-500/20 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-sm border border-pink-500/30 shadow-[0_0_12px_rgba(236,72,153,0.3)]">
            🍸
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Neon Oasis Lounge</span>
              <span className="text-[10px] bg-pink-500/20 text-pink-300 px-1.5 py-0.5 rounded font-mono border border-pink-500/30">
                TMA LOUNGE
              </span>
            </div>
            <div className="text-[10px] text-slate-400">Бронювання столиків & Депозити</div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-pink-400 font-bold bg-pink-950/60 px-2 py-0.5 rounded border border-pink-500/30">
            LIVE MAP
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Date & Time Selectors */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Дата візиту
            </span>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-[#160f22] border border-pink-900/40 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-pink-500 transition-colors"
            >
              {DATES.map((d) => (
                <option key={d} value={d} className="bg-[#140e1d]">
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Час посадки
            </span>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full bg-[#160f22] border border-pink-900/40 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-pink-500 transition-colors"
            >
              {TIME_SLOTS.map((t) => (
                <option key={t} value={t} className="bg-[#140e1d]">
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Interactive Floor Plan Map */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Armchair size={14} className="text-pink-400" />
              Схема залу (Оберіть стіл)
            </span>
            <span className="text-[10px] text-pink-400 font-mono">Клікніть на вільний</span>
          </div>

          <div className="relative w-full aspect-[4/3] bg-gradient-to-b from-[#130b1e] via-[#0f0918] to-[#160b24] rounded-2xl border border-pink-500/30 overflow-hidden p-3 shadow-inner">
            {/* Ambient Lighting & Stage area */}
            <div className="w-full flex justify-center mb-3">
              <div className="w-3/5 py-1.5 bg-gradient-to-r from-purple-600/30 via-pink-500/40 to-purple-600/30 border border-pink-500/40 rounded-lg text-center shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                <span className="text-[10px] font-bold tracking-widest text-pink-200 uppercase flex items-center justify-center gap-1">
                  <MusicNotes size={12} /> MAIN STAGE & DJ BOOTH
                </span>
              </div>
            </div>

            {/* Stage Light Cones */}
            <div className="absolute top-8 left-1/4 w-1/2 h-20 bg-gradient-to-b from-pink-500/10 via-purple-500/5 to-transparent pointer-events-none blur-sm" />

            {/* Interactive Tables Placed Absolute */}
            {TABLES_DATA.map((tbl) => {
              const isSelected = selectedTableId === tbl.id;
              const isReserved = tbl.status === "reserved";

              let bgStyle = "bg-[#251737] border-slate-600 text-slate-300 hover:border-pink-400";
              if (isReserved) {
                bgStyle = "bg-red-950/40 border-red-900/40 text-red-400/50 cursor-not-allowed opacity-60";
              } else if (isSelected) {
                bgStyle =
                  "bg-pink-600 border-white text-white shadow-[0_0_20px_rgba(236,72,153,0.8)] scale-110";
              }

              return (
                <button
                  key={tbl.id}
                  onClick={() => handleTableClick(tbl)}
                  disabled={isReserved}
                  style={{
                    left: `${tbl.x}%`,
                    top: `${tbl.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  className={`absolute transition-all duration-200 flex flex-col items-center justify-center border font-bold text-[10px] z-10 ${
                    tbl.shape === "round"
                      ? "w-11 h-11 rounded-full"
                      : "w-16 h-10 rounded-xl"
                  } ${bgStyle}`}
                >
                  <span className="leading-tight">{tbl.id}</span>
                  <span className="text-[8px] opacity-80">${tbl.minDeposit}</span>
                </button>
              );
            })}

            {/* Bottom Bar Indicator */}
            <div className="absolute bottom-2 left-6 right-6 py-1 bg-[#1a0f28]/80 border border-pink-900/40 rounded text-center">
              <span className="text-[9px] text-pink-300 font-semibold tracking-wider flex items-center justify-center gap-1">
                <Wine size={11} /> КОКТЕЙЛЬНИЙ БАР & ЛАУНЖ-ЗОНА
              </span>
            </div>
          </div>

          {/* Map Legend */}
          <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 pt-1">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-pink-600 border border-white" />
              <span className="text-white font-medium">Обрано</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#251737] border border-slate-500" />
              <span>Вільний</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-950 border border-red-800" />
              <span>Зайнято</span>
            </div>
          </div>
        </div>

        {/* Selected Table Card Details */}
        <div className="bg-gradient-to-br from-[#1b1028] via-[#150d20] to-[#110a1b] border border-pink-500/40 rounded-2xl p-4 shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono text-pink-400 uppercase tracking-wider bg-pink-950/60 px-2 py-0.5 rounded border border-pink-500/30">
                {selectedTable.zoneTitle}
              </span>
              <h3 className="text-base font-bold text-white mt-1.5">{selectedTable.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Місткість: до {selectedTable.capacity} персон • {selectedTime}
              </p>
            </div>
            <div className="text-right">
              <span className="text-lg font-extrabold text-pink-400">${selectedTable.minDeposit}</span>
              <span className="text-[10px] text-slate-400 block">депозит замовлення</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-pink-900/40 grid grid-cols-2 gap-2 text-[11px]">
            <div className="text-slate-300 flex items-center gap-1">
              <Users size={13} className="text-pink-400" />
              <span>Гостей:</span>
              <div className="flex items-center gap-1 ml-auto">
                <button
                  onClick={() => setGuestsCount((c) => Math.max(1, c - 1))}
                  className="w-5 h-5 bg-[#25153a] rounded flex items-center justify-center font-bold hover:bg-pink-600"
                >
                  -
                </button>
                <span className="w-4 text-center font-bold text-white">{guestsCount}</span>
                <button
                  onClick={() => setGuestsCount((c) => Math.min(selectedTable.capacity, c + 1))}
                  className="w-5 h-5 bg-[#25153a] rounded flex items-center justify-center font-bold hover:bg-pink-600"
                >
                  +
                </button>
              </div>
            </div>

            <div className="text-slate-300 flex items-center gap-1 justify-end">
              <CurrencyDollar size={14} className="text-pink-400" />
              <span>100% суми йде в рахунок</span>
            </div>
          </div>

          {/* Special request field */}
          <div className="mt-3">
            <input
              type="text"
              value={specialRequest}
              onChange={(e) => setSpecialRequest(e.target.value)}
              placeholder="Особливі побажання (кальян, торт, шампанське)..."
              className="w-full bg-[#0d0714] border border-pink-900/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 transition-colors"
            />
          </div>
        </div>

        {/* Success State or Action CTA */}
        {bookingSuccess ? (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 rounded-2xl text-emerald-200 animate-fadeIn space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs">
              <CheckCircle size={18} weight="fill" className="text-emerald-400" />
              <span>СТОЛИК УСПІШНО ЗАБРОНЬОВАНО!</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Ваш столик <strong className="text-white">{selectedTable.name}</strong> зафіксовано на {selectedDate} о {selectedTime}. Депозит ${selectedTable.minDeposit} зараховано на баланс замовлення. Хостес очікує вас!
            </p>
            <button
              onClick={() => setBookingSuccess(false)}
              className="mt-2 text-xs font-semibold text-pink-400 underline hover:text-pink-300"
            >
              Забронювати ще один стіл
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowCheckoutModal(true)}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-pink-600 via-rose-600 to-pink-700 text-white shadow-[0_4px_25px_rgba(236,72,153,0.45)] hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <Armchair size={18} weight="bold" />
            <span>Забронювати {selectedTable.name} (${selectedTable.minDeposit} депозит)</span>
          </button>
        )}
      </div>

      {/* Confirmation Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-[#160d22] border-t sm:border border-pink-500/30 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-pink-900/40 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🍸</span>
                <h4 className="text-sm font-bold text-white">Підтвердження депозиту</h4>
              </div>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="w-6 h-6 rounded-full bg-[#27153a] text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Заклад:</span>
                <span className="text-white font-semibold">Neon Oasis Lounge</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Столик & Зона:</span>
                <span className="text-white font-semibold">
                  {selectedTable.name} ({selectedTable.zoneTitle})
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Час & Гості:</span>
                <span className="text-white font-semibold">
                  {selectedDate}, {selectedTime} • {guestsCount} гостей
                </span>
              </div>
              {specialRequest && (
                <div className="flex justify-between text-slate-400">
                  <span>Побажання:</span>
                  <span className="text-pink-300 font-medium">{specialRequest}</span>
                </div>
              )}
              <div className="pt-2 border-t border-pink-900/40 flex justify-between text-sm font-bold">
                <span className="text-white">Сума депозиту до сплати:</span>
                <span className="text-pink-400">${selectedTable.minDeposit} USD</span>
              </div>
            </div>

            <div className="bg-[#0f0918] p-3 rounded-xl border border-pink-900/40 text-[10px] text-slate-400 flex items-start gap-2">
              <Info size={14} className="text-pink-400 flex-shrink-0 mt-0.5" />
              <span>
                Депозит списується з картки або Telegram Stars та повністю зараховується на ваш чек ресторану. Безкоштовне скасування за 2 години до броні.
              </span>
            </div>

            <button
              onClick={handleConfirmReservation}
              className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-[0_4px_20px_rgba(236,72,153,0.4)] hover:opacity-95 transition-all"
            >
              Підтвердити & Оплатити депозит
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
