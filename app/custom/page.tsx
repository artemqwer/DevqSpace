import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import CustomForm from "@/components/custom/CustomForm";

export const metadata: Metadata = {
  title: "Кастомна розробка | NEXUS",
  description:
    "Замовте кастомний Telegram-бот, веб-додаток або мобільний застосунок під вашу задачу.",
};

const BULLETS = [
  { icon: "ph-chats-circle", text: "Безкоштовний брифінг 30 хв" },
  { icon: "ph-money", text: "Фіксована вартість після ТЗ" },
  { icon: "ph-clock-countdown", text: "MVP за 2–4 тижні" },
  { icon: "ph-code", text: "Сорс-код і документація" },
  { icon: "ph-shield-check", text: "Гарантія саппорту 6–12 міс." },
];

export default function CustomPage() {
  return (
    <>
      <div className="glow-orb bg-neon-blue w-96 h-96 top-0 left-0 -translate-x-1/2 -translate-y-1/2 animate-pulse-slow" />
      <div
        className="glow-orb bg-neon-purple w-[28rem] h-[28rem] top-1/2 right-0 translate-x-1/3 animate-pulse-slow"
        style={{ animationDelay: "2s" }}
      />
      <Navbar />
      <main className="pt-20 md:pt-32 pb-28 md:pb-24 px-4 md:px-8 max-w-6xl mx-auto">
        {/* Hero */}
        <div className="mb-10 md:mb-14">
          <div className="text-[10px] md:text-xs font-mono text-neon-pink tracking-widest uppercase mb-2">
            // CUSTOM_DEV
          </div>
          <h1 className="text-3xl md:text-6xl font-display font-bold text-white tracking-tight leading-[1.05] mb-4">
            Зробимо <span className="text-gradient">під ваш кейс</span>
          </h1>
          <p className="text-sm md:text-lg text-gray-400 font-light max-w-2xl">
            Telegram-боти, веб-додатки, мобільні застосунки, AI-рішення. Від
            ідеї до запуску за 2–4 тижні з гарантією та підтримкою.
          </p>
        </div>

        {/* Bullets */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3 mb-10 md:mb-14">
          {BULLETS.map((b) => (
            <div
              key={b.text}
              className="flex md:flex-col items-center md:items-start gap-2 md:gap-3 p-3 md:p-4 rounded-xl bg-surface2/50 border border-white/5"
            >
              <span className="shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-lg bg-neon-blue/10 border border-neon-blue/30 flex items-center justify-center">
                <i className={`ph-bold ${b.icon} text-neon-blue`} />
              </span>
              <span className="text-xs md:text-sm text-gray-300 font-medium">
                {b.text}
              </span>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-white/10 bg-surface/30 backdrop-blur p-5 md:p-10">
          <CustomForm />
        </div>
      </main>
      <BottomNav />
    </>
  );
}
