"use client";

import React, { useState } from "react";
import {
  Ticket,
  QrCode,
  CalendarBlank,
  MapPin,
  Clock,
  Sparkle,
  CheckCircle,
  WarningCircle,
  Scan,
  ShieldCheck,
  ArrowsClockwise,
  User,
  Star,
  Check,
} from "@phosphor-icons/react";

interface EventItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  time: string;
  location: string;
  coverImage: string;
  badge: string;
  tiers: {
    id: "fan" | "vip" | "backstage";
    name: string;
    price: number;
    description: string;
    perks: string[];
    available: number;
  }[];
}

const EVENTS: EventItem[] = [
  {
    id: "ev-1",
    title: "SynthWave Odyssey 2026",
    subtitle: "CyberSound & Hologram Live Show",
    date: "18 Квітня, 2026",
    time: "19:30 - 23:30",
    location: "Main Cyber Arena, Kyiv",
    coverImage: "⚡",
    badge: "SOLD OUT FAST",
    tiers: [
      {
        id: "fan",
        name: "Fan Zone",
        price: 35,
        description: "Доступ до головного танцполу біля сцени",
        perks: ["Вхід без черги (Fast-line)", "Браслет фестивалю", "Гардероб"],
        available: 42,
      },
      {
        id: "vip",
        name: "VIP Lounge Pass",
        price: 85,
        description: "Преміум балкон з панорамним видом та welcome-drink",
        perks: ["Окремий VIP вхід", "Welcome коктейль у барі", "Окремий лаунж-гардероб", "Подарунковий мерч"],
        available: 9,
      },
      {
        id: "backstage",
        name: "Backstage + Meet & Greet",
        price: 150,
        description: "Ексклюзивний доступ за лаштунки та фото з артистами",
        perks: ["Повний доступ усюди", "Сесія Meet & Greet", "Автограф-сесія", "VIP Open Bar"],
        available: 3,
      },
    ],
  },
  {
    id: "ev-2",
    title: "Neo Tokyo Rave & Visuals",
    subtitle: "Electronic Beats & 3D Mapping",
    date: "25 Квітня, 2026",
    time: "22:00 - 05:00",
    location: "Industrial Hangar #4",
    coverImage: "🌌",
    badge: "POPULAR",
    tiers: [
      {
        id: "fan",
        name: "General Admission",
        price: 25,
        description: "Стандартний прохід на всю ніч",
        perks: ["Вхід до 00:00", "Доступ до всіх танцполів"],
        available: 88,
      },
      {
        id: "vip",
        name: "VIP Mezzanine",
        price: 60,
        description: "Окрема зона зі столами та швидким баром",
        perks: ["Окремий поверх", "Власний бар без черг", "М'які дивани"],
        available: 14,
      },
      {
        id: "backstage",
        name: "Artist Lounge Pass",
        price: 110,
        description: "Прохід у зону DJ та артистів",
        perks: ["DJ Booth доступ", "Преміум бар", "Мерч набір"],
        available: 5,
      },
    ],
  },
];

export function TmaTicketsEventsDemo() {
  const [selectedEventId, setSelectedEventId] = useState<string>("ev-1");
  const [selectedTierId, setSelectedTierId] = useState<"fan" | "vip" | "backstage">("vip");
  const [attendeeName, setAttendeeName] = useState<string>("Олександр Мельник");
  const [isPurchased, setIsPurchased] = useState<boolean>(false);
  const [ticketHash, setTicketHash] = useState<string>("CS-2026-VIP-9824X");
  const [scanResult, setScanResult] = useState<"idle" | "valid" | "duplicate" | "invalid">("idle");
  const [activeTab, setActiveTab] = useState<"event" | "ticket" | "scanner">("event");
  const [scannedTickets, setScannedTickets] = useState<string[]>([]);

  const currentEvent = EVENTS.find((e) => e.id === selectedEventId) || EVENTS[0];
  const currentTier = currentEvent.tiers.find((t) => t.id === selectedTierId) || currentEvent.tiers[0];

  const handleBuyTicket = () => {
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const hash = `CS-2026-${selectedTierId.toUpperCase()}-${randomHex}`;
    setTicketHash(hash);
    setIsPurchased(true);
    setActiveTab("ticket");
  };

  const handleSimulateScan = (hashToTest: string) => {
    if (scannedTickets.includes(hashToTest)) {
      setScanResult("duplicate");
    } else if (hashToTest.startsWith("CS-2026-")) {
      setScanResult("valid");
      setScannedTickets((prev) => [...prev, hashToTest]);
    } else {
      setScanResult("invalid");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#0d0c14] text-slate-100 flex flex-col font-sans select-none pb-20 shadow-2xl relative border-x border-purple-900/30">
      {/* Top Telegram Header Bar */}
      <div className="bg-[#141221] px-4 py-3 border-b border-purple-500/20 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold text-sm border border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
            🎫
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>CyberSound Tickets</span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono border border-purple-500/30">
                TMA PASS
              </span>
            </div>
            <div className="text-[10px] text-slate-400">Офіційний квитковий шлюз</div>
          </div>
        </div>

        {/* Tab switchers in header */}
        <div className="flex bg-[#1b172d] p-1 rounded-lg border border-purple-500/20 text-[11px]">
          <button
            onClick={() => setActiveTab("event")}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeTab === "event" ? "bg-purple-600 text-white font-medium" : "text-slate-400 hover:text-white"
            }`}
          >
            Події
          </button>
          <button
            onClick={() => {
              if (isPurchased) setActiveTab("ticket");
            }}
            disabled={!isPurchased}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeTab === "ticket"
                ? "bg-purple-600 text-white font-medium"
                : isPurchased
                ? "text-slate-400 hover:text-white"
                : "text-slate-600 cursor-not-allowed"
            }`}
          >
            Квиток
          </button>
          <button
            onClick={() => setActiveTab("scanner")}
            className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
              activeTab === "scanner"
                ? "bg-purple-600 text-white font-medium shadow-[0_0_8px_rgba(168,85,247,0.4)]"
                : "text-purple-400 hover:text-purple-300"
            }`}
          >
            <Scan size={12} weight="bold" />
            <span>Gate</span>
          </button>
        </div>
      </div>

      {/* Main Body Switcher */}
      {activeTab === "event" && (
        <div className="p-4 space-y-4 flex-1 animate-fadeIn">
          {/* Event Picker Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {EVENTS.map((ev) => (
              <button
                key={ev.id}
                onClick={() => {
                  setSelectedEventId(ev.id);
                  setSelectedTierId("fan");
                }}
                className={`flex-1 min-w-[170px] p-2.5 rounded-xl border text-left transition-all ${
                  selectedEventId === ev.id
                    ? "bg-purple-950/40 border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                    : "bg-[#161324] border-purple-900/30 text-slate-400 hover:border-purple-800/50"
                }`}
              >
                <div className="flex items-center justify-between text-base mb-1">
                  <span>{ev.coverImage}</span>
                  <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                    {ev.badge}
                  </span>
                </div>
                <div className="text-xs font-bold text-white truncate">{ev.title}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                  <CalendarBlank size={11} className="text-purple-400" />
                  <span>{ev.date.split(",")[0]}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Featured Event Card */}
          <div className="relative rounded-2xl overflow-hidden border border-purple-500/30 bg-gradient-to-br from-purple-900/30 via-[#19152b] to-[#120f20] p-4 shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider">
                  Головний лайнап сезону
                </span>
                <h1 className="text-lg font-bold text-white mt-0.5 leading-snug">{currentEvent.title}</h1>
                <p className="text-xs text-purple-300/80">{currentEvent.subtitle}</p>
              </div>
              <div className="text-3xl p-2 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                {currentEvent.coverImage}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-purple-500/20 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-300">
                <CalendarBlank size={14} className="text-purple-400 flex-shrink-0" />
                <span>{currentEvent.date}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Clock size={14} className="text-purple-400 flex-shrink-0" />
                <span>{currentEvent.time}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300 col-span-2">
                <MapPin size={14} className="text-purple-400 flex-shrink-0" />
                <span>{currentEvent.location}</span>
              </div>
            </div>
          </div>

          {/* Ticket Tier Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Ticket size={14} className="text-purple-400" />
                Оберіть сектор квитка
              </span>
              <span className="text-[10px] text-purple-400 font-medium">Миттєва генерація QR</span>
            </div>

            <div className="space-y-2.5">
              {currentEvent.tiers.map((tier) => {
                const isSelected = selectedTierId === tier.id;
                return (
                  <div
                    key={tier.id}
                    onClick={() => setSelectedTierId(tier.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-purple-950/40 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                        : "bg-[#161324] border-purple-900/30 hover:border-purple-700/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? "border-purple-400 bg-purple-600" : "border-slate-600"
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="text-xs font-bold text-white">{tier.name}</span>
                        {tier.id === "vip" && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30 font-semibold">
                            VIP
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-purple-300">${tier.price}</span>
                        <span className="text-[10px] text-slate-500 block">/ квиток</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">{tier.description}</p>

                    <div className="flex flex-wrap gap-1.5">
                      {tier.perks.map((perk, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-purple-900/30 text-purple-200/90 px-2 py-0.5 rounded-md border border-purple-500/20 flex items-center gap-1"
                        >
                          <Check size={10} className="text-purple-400" />
                          {perk}
                        </span>
                      ))}
                    </div>

                    <div className="mt-2 text-[10px] text-purple-400/80 flex items-center justify-between pt-1.5 border-t border-purple-900/30">
                      <span>Залишилось: {tier.available} шт.</span>
                      <span className="text-slate-400">Гарантія оригінальності</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Attendee Details */}
          <div className="bg-[#161324] p-3 rounded-xl border border-purple-900/30 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <User size={13} className="text-purple-400" />
                Власник квитка
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Telegram ID verified</span>
            </div>
            <input
              type="text"
              value={attendeeName}
              onChange={(e) => setAttendeeName(e.target.value)}
              placeholder="Ім'я та Прізвище гостя"
              className="w-full bg-[#0d0c14] border border-purple-900/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Action button */}
          <button
            onClick={handleBuyTicket}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white shadow-[0_4px_25px_rgba(147,51,234,0.45)] hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <Ticket size={18} weight="bold" />
            <span>Оплатити ${currentTier.price} & Отримати QR-квиток</span>
          </button>
        </div>
      )}

      {/* Ticket Screen (Generated QR pass) */}
      {activeTab === "ticket" && (
        <div className="p-4 space-y-4 flex-1 animate-fadeIn">
          <div className="bg-gradient-to-b from-purple-950/40 via-[#161325] to-[#120f20] border border-purple-500/40 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
            {/* Holographic light effect */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse" />

            <div className="flex justify-between items-start border-b border-purple-500/20 pb-3">
              <div>
                <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                  OFFICIAL PASS
                </span>
                <h2 className="text-base font-bold text-white mt-1.5">{currentEvent.title}</h2>
                <div className="text-[11px] text-purple-300 flex items-center gap-1 mt-0.5">
                  <CalendarBlank size={12} />
                  <span>{currentEvent.date} • {currentEvent.time}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-purple-400 uppercase bg-purple-950 px-2 py-1 rounded border border-purple-500/30">
                  {currentTier.name}
                </span>
                <div className="text-xs font-extrabold text-white mt-1">${currentTier.price} PAID</div>
              </div>
            </div>

            {/* Simulated QR Code Canvas */}
            <div className="my-5 flex flex-col items-center justify-center">
              <div className="p-4 bg-white rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.35)] border-4 border-purple-600/40 flex flex-col items-center">
                {/* SVG QR Code Pattern */}
                <svg className="w-44 h-44" viewBox="0 0 120 120" fill="none">
                  {/* Outer Frame Corners */}
                  <rect x="10" y="10" width="30" height="30" rx="4" fill="#0d0c14" />
                  <rect x="15" y="15" width="20" height="20" rx="2" fill="#ffffff" />
                  <rect x="20" y="20" width="10" height="10" fill="#7e22ce" />

                  <rect x="80" y="10" width="30" height="30" rx="4" fill="#0d0c14" />
                  <rect x="85" y="15" width="20" height="20" rx="2" fill="#ffffff" />
                  <rect x="90" y="20" width="10" height="10" fill="#7e22ce" />

                  <rect x="10" y="80" width="30" height="30" rx="4" fill="#0d0c14" />
                  <rect x="15" y="85" width="20" height="20" rx="2" fill="#ffffff" />
                  <rect x="20" y="90" width="10" height="10" fill="#7e22ce" />

                  {/* QR Matrix Dots */}
                  <rect x="45" y="15" width="6" height="6" fill="#0d0c14" />
                  <rect x="55" y="15" width="6" height="6" fill="#0d0c14" />
                  <rect x="65" y="15" width="6" height="6" fill="#0d0c14" />

                  <rect x="45" y="25" width="6" height="6" fill="#7e22ce" />
                  <rect x="65" y="25" width="6" height="6" fill="#0d0c14" />

                  <rect x="45" y="35" width="6" height="6" fill="#0d0c14" />
                  <rect x="55" y="35" width="6" height="6" fill="#7e22ce" />

                  <rect x="15" y="45" width="6" height="6" fill="#0d0c14" />
                  <rect x="25" y="45" width="6" height="6" fill="#0d0c14" />
                  <rect x="35" y="45" width="6" height="6" fill="#7e22ce" />
                  <rect x="50" y="45" width="20" height="20" rx="3" fill="#9333ea" />
                  <rect x="75" y="45" width="6" height="6" fill="#0d0c14" />
                  <rect x="85" y="45" width="6" height="6" fill="#0d0c14" />
                  <rect x="95" y="45" width="6" height="6" fill="#7e22ce" />

                  <rect x="15" y="55" width="6" height="6" fill="#7e22ce" />
                  <rect x="35" y="55" width="6" height="6" fill="#0d0c14" />
                  <rect x="85" y="55" width="6" height="6" fill="#7e22ce" />

                  <rect x="15" y="65" width="6" height="6" fill="#0d0c14" />
                  <rect x="25" y="65" width="6" height="6" fill="#7e22ce" />
                  <rect x="75" y="65" width="6" height="6" fill="#0d0c14" />
                  <rect x="95" y="65" width="6" height="6" fill="#0d0c14" />

                  <rect x="45" y="75" width="6" height="6" fill="#0d0c14" />
                  <rect x="55" y="75" width="6" height="6" fill="#7e22ce" />
                  <rect x="65" y="75" width="6" height="6" fill="#0d0c14" />

                  <rect x="45" y="85" width="6" height="6" fill="#7e22ce" />
                  <rect x="65" y="85" width="6" height="6" fill="#0d0c14" />
                  <rect x="85" y="85" width="6" height="6" fill="#7e22ce" />
                  <rect x="95" y="85" width="6" height="6" fill="#0d0c14" />

                  <rect x="45" y="95" width="6" height="6" fill="#0d0c14" />
                  <rect x="55" y="95" width="6" height="6" fill="#0d0c14" />
                  <rect x="75" y="95" width="6" height="6" fill="#7e22ce" />
                  <rect x="85" y="95" width="6" height="6" fill="#0d0c14" />
                </svg>

                <div className="mt-2 text-[10px] font-mono text-slate-800 font-bold tracking-wider">
                  {ticketHash}
                </div>
              </div>

              <div className="mt-3 text-center">
                <span className="text-[11px] text-purple-300 font-medium flex items-center justify-center gap-1">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  Захищено динамічним криптографічним хешем
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Покажіть цей екран контролеру на вході до локації
                </span>
              </div>
            </div>

            {/* Ticket details footer */}
            <div className="bg-[#0e0c17] rounded-xl p-3 border border-purple-900/40 text-[11px] space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Гість:</span>
                <span className="text-white font-medium">{attendeeName || "Олександр Мельник"}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Локація:</span>
                <span className="text-white font-medium">{currentEvent.location}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Статус:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle size={12} weight="fill" /> Дійсний для проходу
                </span>
              </div>
            </div>
          </div>

          {/* Quick actions for testing scanner */}
          <div className="bg-[#161324] p-3 rounded-xl border border-purple-900/30 flex items-center justify-between">
            <div className="text-[11px] text-slate-300">
              <span className="font-bold text-white block">Симуляція входу</span>
              Перевірити валідацію в режимі Gatekeeper
            </div>
            <button
              onClick={() => {
                setActiveTab("scanner");
              }}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-bold text-xs flex items-center gap-1 transition-colors"
            >
              <Scan size={14} />
              <span>Тест сканера</span>
            </button>
          </div>
        </div>
      )}

      {/* Gate Scanner Mode (Security / Bouncer screen) */}
      {activeTab === "scanner" && (
        <div className="p-4 space-y-4 flex-1 animate-fadeIn">
          <div className="bg-[#141222] border border-purple-500/40 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-600/30 text-purple-400 flex items-center justify-center font-bold text-xs border border-purple-500/40">
                  <Scan size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Режим Gate Control (Контролер)</h3>
                  <p className="text-[10px] text-slate-400">Перевірка квитків на вході</p>
                </div>
              </div>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono border border-emerald-500/30">
                ONLINE SCANNER
              </span>
            </div>

            {/* Viewfinder simulation */}
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video flex flex-col items-center justify-center border border-purple-900/60 p-4">
              {/* Scan box corners */}
              <div className="w-36 h-36 border-2 border-purple-400 rounded-lg relative flex items-center justify-center bg-purple-950/20">
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-purple-300" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-purple-300" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-purple-300" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-purple-300" />

                {/* Animated scan line */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-purple-300 to-transparent absolute top-1/2 -translate-y-1/2 animate-bounce" />

                <QrCode size={48} className="text-purple-400/50" />
              </div>
              <span className="text-[10px] text-slate-400 mt-2 font-mono">Наведіть камеру на QR-код гостя</span>
            </div>

            {/* Test buttons to simulate scans */}
            <div className="mt-4 space-y-2">
              <span className="text-[11px] font-bold text-slate-300 block">Симулювати зчитування коду:</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => handleSimulateScan(ticketHash)}
                  className="py-2 px-2.5 bg-purple-900/40 hover:bg-purple-900/70 border border-purple-500/30 rounded-lg text-purple-200 font-medium text-left truncate transition-colors"
                >
                  🟢 Справжній квиток
                  <span className="block text-[9px] text-slate-400 truncate">{ticketHash}</span>
                </button>
                <button
                  onClick={() => handleSimulateScan("CS-FAKE-999-INVALID")}
                  className="py-2 px-2.5 bg-red-950/30 hover:bg-red-900/50 border border-red-500/30 rounded-lg text-red-200 font-medium text-left truncate transition-colors"
                >
                  🔴 Підроблений QR
                  <span className="block text-[9px] text-slate-400 truncate">CS-FAKE-999...</span>
                </button>
              </div>
            </div>

            {/* Verification Result Display */}
            {scanResult !== "idle" && (
              <div
                className={`mt-4 p-3.5 rounded-xl border animate-fadeIn ${
                  scanResult === "valid"
                    ? "bg-emerald-950/40 border-emerald-500 text-emerald-200"
                    : scanResult === "duplicate"
                    ? "bg-amber-950/40 border-amber-500 text-amber-200"
                    : "bg-red-950/40 border-red-500 text-red-200"
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  {scanResult === "valid" && (
                    <>
                      <CheckCircle size={18} weight="fill" className="text-emerald-400" />
                      <span>ПРОХІД ДОЗВОЛЕНО (ACCESS GRANTED)</span>
                    </>
                  )}
                  {scanResult === "duplicate" && (
                    <>
                      <WarningCircle size={18} weight="fill" className="text-amber-400" />
                      <span>УВАГА: КВИТОК ВЖЕ ВИКОРИСТАНО!</span>
                    </>
                  )}
                  {scanResult === "invalid" && (
                    <>
                      <WarningCircle size={18} weight="fill" className="text-red-400" />
                      <span>НЕВАЛІДНИЙ КВИТОК (ACCESS DENIED)</span>
                    </>
                  )}
                </div>

                <div className="text-[10px] mt-1.5 opacity-90 space-y-0.5">
                  {scanResult === "valid" && (
                    <div>
                      <div>Сектор: <strong className="text-white">{currentTier.name}</strong></div>
                      <div>Гість: <strong className="text-white">{attendeeName}</strong></div>
                      <div>Час валідації: щойно</div>
                    </div>
                  )}
                  {scanResult === "duplicate" && (
                    <div>
                      Цей QR-код вже був успішно відсканований на цьому гейті. Повторний прохід заблоковано системою.
                    </div>
                  )}
                  {scanResult === "invalid" && (
                    <div>
                      Криптографічний підпис не співпадає з базою CyberSound Arena. Можлива підробка або помилковий скріншот.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Scanned Counter */}
            <div className="mt-4 pt-3 border-t border-purple-900/40 flex items-center justify-between text-[11px] text-slate-400">
              <span>Пройшло через турнікет:</span>
              <span className="font-mono font-bold text-purple-300">
                {scannedTickets.length} / 120 гостей
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
