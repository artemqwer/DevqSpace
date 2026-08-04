import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/site/Navbar";
import { MobileNav } from "@/components/site/MobileNav";

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
    <div className="min-h-screen bg-background">
      <div className="grid-bg grid-fade pointer-events-none fixed inset-0 z-0" aria-hidden />
      <Navbar />
      <main className="relative mx-auto max-w-6xl px-4 pb-28 pt-24 md:px-8 md:pb-24 md:pt-32">
        <div className="mb-8 flex flex-col gap-4 md:mb-12">
          <span className="mono-label text-neon-purple">{"// кейси"}</span>
          <h1 className="text-balance font-display text-3xl font-bold leading-[1.05] tracking-tight text-foreground md:text-6xl">
            Що ми вже <span className="text-gradient">зробили</span>
          </h1>
          <p className="max-w-2xl text-pretty leading-relaxed text-muted-foreground md:text-lg">
            Кілька прикладів проєктів. Назви клієнтів узагальнені — деталі
            обговорюємо приватно.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          {CASES.map((c) => (
            <div
              key={c.title}
              className="grad-border rounded-2xl border border-border bg-surface/50 p-5 transition-colors hover:bg-surface-2/50 md:p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className={`mono-label rounded border px-2 py-1 ${ACCENT[c.accent]}`}>
                  {c.tag}
                </span>
                <span className={`font-mono text-xs font-bold ${ACCENT[c.accent].split(" ")[0]}`}>
                  {c.result}
                </span>
              </div>
              <h2 className="mb-1 font-display text-lg font-bold text-foreground md:text-xl">
                {c.title}
              </h2>
              <p className="mono-label mb-3 text-muted-foreground">{c.client}</p>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                {c.description}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {c.stack.map((s) => (
                  <span
                    key={s}
                    className="mono-label rounded border border-border bg-surface-2 px-2 py-0.5 text-muted-foreground"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="glass grad-border relative mt-10 overflow-hidden rounded-3xl p-6 text-center md:mt-14 md:p-10">
          <div className="orb -top-24 left-1/2 h-72 w-72 -translate-x-1/2 bg-neon-blue opacity-20" aria-hidden />
          <div className="relative">
            <h2 className="mb-3 font-display text-xl font-bold text-foreground md:text-3xl">
              Хочете схожий результат?
            </h2>
            <p className="mx-auto mb-6 max-w-lg text-sm leading-relaxed text-muted-foreground">
              Оберіть готовий продукт у каталозі або замовте розробку під вашу
              задачу.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/catalog"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple px-6 py-3 font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                <i className="ph-bold ph-storefront" /> Каталог
              </Link>
              <Link
                href="/custom"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-2/40 px-6 py-3 font-medium text-foreground transition-colors hover:border-neon-blue/50"
              >
                <i className="ph-bold ph-paper-plane-tilt" /> Замовити кастом
              </Link>
            </div>
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
