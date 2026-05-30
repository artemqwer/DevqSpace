import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Про нас | NEXUS",
  description:
    "NEXUS — студія цифрових продуктів. Розробляємо та продаємо готові Telegram-боти, веб-додатки та мобільні застосунки.",
};

const STATS = [
  { value: "40+", label: "Продуктів", accent: "text-neon-blue" },
  { value: "320", label: "Клієнтів", accent: "text-neon-purple" },
  { value: "5 р.", label: "Досвіду", accent: "text-neon-green" },
  { value: "24h", label: "Реакція", accent: "text-neon-pink" },
];

const VALUES = [
  {
    icon: "ph-rocket-launch",
    title: "Швидкий старт",
    text: "Готові продукти — за добу, кастом — MVP за 2–4 тижні. Без затягувань.",
  },
  {
    icon: "ph-shield-check",
    title: "Гарантія і саппорт",
    text: "Від 3 місяців до року підтримки, безкоштовні мінорні апдейти.",
  },
  {
    icon: "ph-code",
    title: "Чистий код",
    text: "Повний вихідний код, документація та інструкція по деплою у кожному продукті.",
  },
  {
    icon: "ph-handshake",
    title: "Чесні умови",
    text: "Фіксована вартість після ТЗ. Жодних прихованих платежів.",
  },
];

const STACK = [
  "Python",
  "Aiogram",
  "Next.js",
  "React",
  "React Native",
  "TypeScript",
  "Node.js",
  "PostgreSQL",
  "Supabase",
  "OpenAI",
  "Solidity",
  "Tailwind",
];

export default function AboutPage() {
  return (
    <>
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="glow-orb bg-neon-blue w-96 h-96 top-0 left-0 -translate-x-1/3 -translate-y-1/4 animate-pulse-slow" />
        <div className="glow-orb bg-neon-purple w-96 h-96 bottom-0 right-0 translate-x-1/3 animate-pulse-slow" />
      </div>
      <Navbar />
      <main className="pt-20 md:pt-32 pb-28 md:pb-24 px-4 md:px-8 max-w-5xl mx-auto">
        {/* Hero */}
        <div className="mb-10 md:mb-16">
          <div className="text-[10px] md:text-xs font-mono text-neon-blue tracking-widest uppercase mb-2">
            // ABOUT
          </div>
          <h1 className="text-3xl md:text-6xl font-display font-bold text-white tracking-tight leading-[1.05] mb-4">
            Студія цифрових <span className="text-gradient">продуктів</span>
          </h1>
          <p className="text-sm md:text-lg text-gray-400 font-light max-w-2xl leading-relaxed">
            NEXUS — невелика команда розробників, яка створює готові рішення для
            бізнесу і бере кастомні проєкти під ключ. Ми робимо те, що
            запускається і приносить результат, а не лежить у шухляді.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10 md:mb-16">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-white/10 bg-surface/50 p-4 md:p-5 text-center"
            >
              <div
                className={`text-2xl md:text-4xl font-display font-bold ${s.accent} leading-none`}
              >
                {s.value}
              </div>
              <div className="text-[10px] md:text-xs font-mono text-gray-500 mt-2 uppercase tracking-wider">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Values */}
        <h2 className="text-xl md:text-2xl font-display font-bold text-white mb-5">
          Наші принципи
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-10 md:mb-16">
          {VALUES.map((v) => (
            <div
              key={v.title}
              className="rounded-2xl border border-white/10 bg-surface/50 p-5 flex gap-4"
            >
              <span className="shrink-0 w-11 h-11 rounded-xl bg-neon-blue/10 border border-neon-blue/30 flex items-center justify-center">
                <i className={`ph-bold ${v.icon} text-neon-blue text-xl`} />
              </span>
              <div>
                <h3 className="font-display font-bold text-white mb-1">
                  {v.title}
                </h3>
                <p className="text-sm text-gray-400 font-light leading-relaxed">
                  {v.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Stack */}
        <h2 className="text-xl md:text-2xl font-display font-bold text-white mb-5">
          Технології
        </h2>
        <div className="flex flex-wrap gap-2 mb-10 md:mb-16">
          {STACK.map((s) => (
            <span
              key={s}
              className="text-xs md:text-sm font-mono px-3 py-1.5 bg-surface2 border border-white/10 rounded-lg text-gray-300"
            >
              {s}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-surface via-surface2 to-surface p-6 md:p-10 text-center relative overflow-hidden">
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-neon-purple/15 blur-3xl" />
          <div className="relative">
            <h2 className="text-xl md:text-3xl font-display font-bold text-white mb-3">
              Готові почати?
            </h2>
            <p className="text-sm text-gray-400 font-light mb-6 max-w-lg mx-auto">
              Напишіть нам у Telegram — відповімо протягом 2 годин у робочий час.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://t.me/"
                className="inline-flex items-center justify-center gap-2 bg-neon-blue text-black font-display font-bold px-6 py-3 rounded-xl active:scale-[0.98] transition-transform"
              >
                <i className="ph-fill ph-telegram-logo" /> Написати в Telegram
              </a>
              <Link
                href="/cases"
                className="inline-flex items-center justify-center gap-2 bg-surface2 border border-white/10 text-white font-display font-medium px-6 py-3 rounded-xl hover:border-neon-blue/50 transition-colors"
              >
                <i className="ph-bold ph-folder-open" /> Наші кейси
              </Link>
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
