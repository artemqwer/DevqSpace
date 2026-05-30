import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Кейси | NEXUS",
  description:
    "Реальні проєкти студії NEXUS — Telegram-боти, веб-додатки та мобільні застосунки для бізнесу.",
};

type Case = {
  title: string;
  client: string;
  tag: string;
  accent: "blue" | "purple" | "pink" | "green";
  result: string;
  description: string;
  stack: string[];
};

const CASES: Case[] = [
  {
    title: "Telegram-магазин для D2C-бренду",
    client: "Магазин цифрових товарів",
    tag: "BOT",
    accent: "blue",
    result: "+340 продажів за 3 міс.",
    description:
      "Повний цикл: каталог, крипто-оплата, авто-видача, адмін-панель. Замінив ручну обробку замовлень у директі.",
    stack: ["Python", "Aiogram3", "CryptoPay"],
  },
  {
    title: "CRM для діджитал-агенції",
    client: "Маркетинг-агенція, 12 осіб",
    tag: "SAAS",
    accent: "purple",
    result: "−60% часу на адмін",
    description:
      "Канбан лідів, інтеграція з Telegram, нагадування. Команда веде всі угоди в одному місці замість таблиць.",
    stack: ["Next.js", "Supabase", "TS"],
  },
  {
    title: "AI-консультант підтримки",
    client: "Онлайн-сервіс підписок",
    tag: "AI",
    accent: "green",
    result: "80% звернень — без оператора",
    description:
      "GPT-бот відповідає за базою знань, ескалює складні випадки. Зняв навантаження з саппорту вночі та у вихідні.",
    stack: ["OpenAI", "Aiogram3", "Postgres"],
  },
  {
    title: "Мобільний застосунок доставки",
    client: "Локальна мережа кафе",
    tag: "MOBILE",
    accent: "pink",
    result: "iOS + Android за 3 тижні",
    description:
      "React Native додаток: каталог, кошик, трекінг кур'єра, push. Запуск у двох сторах із власним брендингом.",
    stack: ["React Native", "Expo", "Firebase"],
  },
];

const ACCENT: Record<Case["accent"], string> = {
  blue: "text-neon-blue border-neon-blue/30 bg-neon-blue/10",
  purple: "text-neon-purple border-neon-purple/30 bg-neon-purple/10",
  pink: "text-neon-pink border-neon-pink/30 bg-neon-pink/10",
  green: "text-neon-green border-neon-green/30 bg-neon-green/10",
};

export default function CasesPage() {
  return (
    <>
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="glow-orb bg-neon-purple w-96 h-96 top-0 right-0 translate-x-1/3 -translate-y-1/4 animate-pulse-slow" />
      </div>
      <Navbar />
      <main className="pt-20 md:pt-32 pb-28 md:pb-24 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="mb-8 md:mb-12">
          <div className="text-[10px] md:text-xs font-mono text-neon-purple tracking-widest uppercase mb-2">
            // CASES
          </div>
          <h1 className="text-3xl md:text-6xl font-display font-bold text-white tracking-tight leading-[1.05] mb-4">
            Що ми вже <span className="text-gradient">зробили</span>
          </h1>
          <p className="text-sm md:text-lg text-gray-400 font-light max-w-2xl">
            Кілька прикладів проєктів. Назви клієнтів узагальнені — деталі
            обговорюємо приватно.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {CASES.map((c) => (
            <div
              key={c.title}
              className="rounded-2xl border border-white/10 bg-surface/50 p-5 md:p-6 hover:border-white/20 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`text-[10px] font-mono px-2 py-1 rounded border ${ACCENT[c.accent]}`}
                >
                  {c.tag}
                </span>
                <span
                  className={`text-xs font-mono font-bold ${ACCENT[c.accent].split(" ")[0]}`}
                >
                  {c.result}
                </span>
              </div>
              <h2 className="text-lg md:text-xl font-display font-bold text-white mb-1">
                {c.title}
              </h2>
              <p className="text-[11px] font-mono text-gray-500 mb-3">
                {c.client}
              </p>
              <p className="text-sm text-gray-400 font-light mb-4 leading-relaxed">
                {c.description}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {c.stack.map((s) => (
                  <span
                    key={s}
                    className="text-[10px] font-mono px-2 py-0.5 bg-surface2 border border-white/10 rounded text-gray-400"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 md:mt-14 rounded-2xl border border-white/10 bg-gradient-to-br from-surface via-surface2 to-surface p-6 md:p-10 text-center relative overflow-hidden">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-neon-blue/15 blur-3xl" />
          <div className="relative">
            <h2 className="text-xl md:text-3xl font-display font-bold text-white mb-3">
              Хочете схожий результат?
            </h2>
            <p className="text-sm text-gray-400 font-light mb-6 max-w-lg mx-auto">
              Оберіть готовий продукт у каталозі або замовте розробку під вашу
              задачу.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/catalog"
                className="inline-flex items-center justify-center gap-2 bg-neon-blue text-black font-display font-bold px-6 py-3 rounded-xl active:scale-[0.98] transition-transform"
              >
                <i className="ph-bold ph-storefront" /> Каталог
              </Link>
              <Link
                href="/custom"
                className="inline-flex items-center justify-center gap-2 bg-surface2 border border-white/10 text-white font-display font-medium px-6 py-3 rounded-xl hover:border-neon-blue/50 transition-colors"
              >
                <i className="ph-bold ph-paper-plane-tilt" /> Замовити кастом
              </Link>
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
