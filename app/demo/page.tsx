import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/site/Navbar";
import { MobileNav } from "@/components/site/MobileNav";
import { Footer } from "@/components/site/Footer";
import { Play, ShoppingCartSimple, Monitor, DeviceTablet, DeviceMobile, Sparkle, ArrowRight } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Live Demos — Інтерактивні демо-стенди продуктів",
  description:
    "Протестуйте інтерфейси веб-додатків, SaaS, адмін-панелей та шаблонів DevqSpace наживо в браузері перед покупкою.",
};

type DemoItem = {
  slug: string;
  title: string;
  tagline: string;
  category: string;
  accent: "blue" | "green" | "purple" | "pink";
  price: number;
  stack: string[];
  features: string[];
};

const DEMOS: DemoItem[] = [
  {
    slug: "cyberdash-admin",
    title: "CyberDash Admin Panel",
    tagline: "Кіберпанк дашборд моніторингу нод, серверної телеметрії та аналітики",
    category: "Web / SaaS",
    accent: "blue",
    price: 49,
    stack: ["Next.js 15", "Tailwind CSS", "Recharts", "Lucide"],
    features: ["Моніторинг нод 24/7", "Живі графіки навантаження", "Кіберпанк неоновий UI", "Адаптивні таблиці"],
  },
  {
    slug: "saas-landing-kit",
    title: "SaaS Multi-Archetype Kit",
    tagline: "5 конверсійних SaaS-архетипів: AI, DevTools, FinTech, Marketing, Workspace",
    category: "Шаблони / UI",
    accent: "purple",
    price: 39,
    stack: ["Next.js 15", "Tailwind CSS", "Framer Motion"],
    features: ["5 готових архетипів", "Калькулятор тарифів", "FAQ акордеон", "Готові форми захоплення"],
  },
  {
    slug: "crypto-landing",
    title: "Crypto Presale & Staking",
    tagline: "Темний Web3-лендинг із таймером раундів, токеномікою та модалкою гаманців",
    category: "Web3 / Смарт-контракти",
    accent: "blue",
    price: 45,
    stack: ["Next.js", "Web3.js", "Tailwind CSS", "Lucide"],
    features: ["Таймер пресейлу", "Калькулятор прибутку стейкінгу", "Інтерактивна токеноміка", "Підключення гаманців"],
  },
  {
    slug: "ecommerce-template",
    title: "E-Commerce NextStore",
    tagline: "Сучасна вітрина товарів з інтерактивним кошиком та Stripe Checkout",
    category: "Шаблони / UI",
    accent: "green",
    price: 49,
    stack: ["Next.js 15", "Stripe API", "Prisma SQLite", "Tailwind"],
    features: ["Кошик із локальним станом", "Фільтрація за категоріями", "Stripe Checkout", "Адаптивна верстка"],
  },
  {
    slug: "portfolio-pro",
    title: "Portfolio Pro Studio",
    tagline: "Мінімалістичне портфоліо для дизайнерів, розробників та креативних агенцій",
    category: "Шаблони / UI",
    accent: "pink",
    price: 29,
    stack: ["Next.js 15", "Sanity CMS", "Tailwind CSS"],
    features: ["Фільтрація робіт", "Модалки детальних кейсів", "Sanity Studio CMS", "Контактна форма"],
  },
  {
    slug: "agency-template",
    title: "Creative Agency Showcase",
    tagline: "Агенційне портфоліо з інтерактивним калькулятором бюджету проєкту",
    category: "Шаблони / UI",
    accent: "purple",
    price: 45,
    stack: ["Next.js 15", "Tailwind CSS", "Framer Motion"],
    features: ["Калькулятор вартості розробки", "Вітрина кейсів", "Відгуки клієнтів", "Швидкий бриф"],
  },
  {
    slug: "mini-crm-agency",
    title: "Mini CRM Agency",
    tagline: "Компактна CRM-система для малого бізнесу з канбан-дошкою та аналітикою",
    category: "Web / SaaS",
    accent: "blue",
    price: 49,
    stack: ["React 19", "TypeScript", "Tailwind CSS", "Kanban"],
    features: ["Канбан-дошка лідів", "Статуси угод", "Метрики виручки", "Пошук по контактах"],
  },
  {
    slug: "landing-builder",
    title: "Landing Page Builder",
    tagline: "Візуальний блоковий конструктор лендінгів з миттєвим прев'ю та кодом",
    category: "Web / SaaS",
    accent: "purple",
    price: 49,
    stack: ["Next.js 15", "Tailwind CSS", "Block Engine"],
    features: ["Блоки Hero, Features, Pricing", "Зміна кольорової гами", "Живий попередній перегляд", "Експорт HTML/Tailwind"],
  },
  {
    slug: "bot-constructor",
    title: "Bot Flow Constructor",
    tagline: "Візуальний граф налаштування сценаріїв Telegram-ботів без програмування",
    category: "Web / SaaS",
    accent: "blue",
    price: 59,
    stack: ["React Flow", "TypeScript", "Tailwind CSS"],
    features: ["Візуальний граф вузлів", "Налаштування тригерів і кнопок", "Інтерактивний тестовий чат", "Експорт структури"],
  },
  {
    slug: "email-pack",
    title: "Responsive Email Pack",
    tagline: "12 сучасних адаптивних транзакційних та маркетингових email-шаблонів",
    category: "Шаблони / UI",
    accent: "green",
    price: 25,
    stack: ["HTML5", "MJML", "Inline CSS", "Tailwind"],
    features: ["12 унікальних шаблонів", "Темна та світла теми", "Тестовано у 30+ клієнтах", "Легка кастомізація"],
  },
  {
    slug: "solana-sniper",
    title: "Solana Sniper Terminal",
    tagline: "Інтерфейс високошвидкісного моніторингу ліквідності Raydium та Pump.fun",
    category: "Web3 / Смарт-контракти",
    accent: "green",
    price: 120,
    stack: ["TypeScript", "Solana Web3", "Jito Bundles", "WebSocket"],
    features: ["Журнал транзакцій наживо", "Детектор нових пулів", "Аналіз ліквідності", "Моніторинг комісій Jito"],
  },
  {
    slug: "token-presale",
    title: "ERC-20 Token + Presale",
    tagline: "Платформа запуску токенів, пресейлу з вестингом та вайтлістом",
    category: "Web3 / Смарт-контракти",
    accent: "purple",
    price: 149,
    stack: ["Solidity", "Next.js", "Hardhat", "Wagmi"],
    features: ["Форма депозиту ETH/USDT", "Прогрес-бар раундів", "Вестинг та клейм токенів", "Перевірка вайтліста"],
  },
  {
    slug: "dex-swap-ui",
    title: "DEX Swap Interface",
    tagline: "Готовий термінал обміну токенів на базі Uniswap SDK",
    category: "Web3 / Смарт-контракти",
    accent: "blue",
    price: 89,
    stack: ["Next.js", "Uniswap SDK", "Wagmi", "Viem"],
    features: ["Своп токенів у 1 клік", "Розрахунок slippage & fee", "Підключення гаманців", "Графік курсу валют"],
  },
];

const ACCENT_CLASSES = {
  blue: {
    border: "border-neon-blue/40",
    bg: "bg-neon-blue/10",
    text: "text-neon-blue",
    glow: "shadow-[0_0_25px_rgba(0,240,255,0.15)]",
    badge: "border-neon-blue/40 text-neon-blue bg-neon-blue/5",
  },
  green: {
    border: "border-neon-green/40",
    bg: "bg-neon-green/10",
    text: "text-neon-green",
    glow: "shadow-[0_0_25px_rgba(0,255,102,0.15)]",
    badge: "border-neon-green/40 text-neon-green bg-neon-green/5",
  },
  purple: {
    border: "border-neon-purple/40",
    bg: "bg-neon-purple/10",
    text: "text-neon-purple",
    glow: "shadow-[0_0_25px_rgba(185,140,255,0.15)]",
    badge: "border-neon-purple/40 text-neon-purple bg-neon-purple/5",
  },
  pink: {
    border: "border-neon-pink/40",
    bg: "bg-neon-pink/10",
    text: "text-neon-pink",
    glow: "shadow-[0_0_25px_rgba(255,0,128,0.15)]",
    badge: "border-neon-pink/40 text-neon-pink bg-neon-pink/5",
  },
};

export default function DemosHubPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="grid-bg grid-fade pointer-events-none fixed inset-0 z-0" aria-hidden />
      <Navbar />

      <main className="relative mx-auto max-w-7xl px-4 pb-28 pt-24 md:px-8 md:pb-24 md:pt-32">
        {/* Header */}
        <div className="mb-10 md:mb-14 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-neon-green/40 bg-neon-green/10 px-3.5 py-1 text-xs font-mono font-bold text-neon-green backdrop-blur mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-green"></span>
            </span>
            LIVE DEMO HUB · {DEMOS.length} ІНТЕРАКТИВНИХ СТЕНДІВ
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl leading-[1.08]">
            Спробуйте продукти <span className="text-gradient">наживо</span> перед покупкою
          </h1>
          <p className="mt-4 text-sm text-muted-foreground md:text-base leading-relaxed">
            Всі Web/SaaS-додатки та шаблони мають інтерактивні стенди з перемиканням режимів перегляду: ПК, Планшет та Смартфон. Відкритий вихідний код, миттєве завантаження.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-muted-foreground">
            <span className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-neon-blue" /> Desktop (1280px)
            </span>
            <span className="flex items-center gap-2">
              <DeviceTablet className="h-4 w-4 text-neon-purple" /> Tablet (768px)
            </span>
            <span className="flex items-center gap-2">
              <DeviceMobile className="h-4 w-4 text-neon-green" /> Mobile (390px)
            </span>
          </div>
        </div>

        {/* Demo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEMOS.map((demo) => {
            const acc = ACCENT_CLASSES[demo.accent];
            return (
              <div
                key={demo.slug}
                className={`grad-border rounded-2xl border border-border bg-surface/50 p-5 md:p-6 backdrop-blur flex flex-col justify-between transition-all hover:bg-surface-2/60 hover:-translate-y-1 ${acc.glow}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`mono-label rounded-full border px-2.5 py-0.5 text-[0.7rem] font-bold ${acc.badge}`}>
                      {demo.category}
                    </span>
                    <span className="font-display text-lg font-bold text-white">
                      ${demo.price}
                    </span>
                  </div>

                  <h2 className="font-display text-xl font-bold text-white leading-snug">
                    {demo.title}
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                    {demo.tagline}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {demo.stack.map((tech) => (
                      <span
                        key={tech}
                        className="mono-label text-[10px] rounded border border-white/10 bg-surface-2/80 px-2 py-0.5 text-muted-foreground"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <ul className="mt-4 space-y-1.5 border-t border-border/50 pt-3">
                    {demo.features.slice(0, 3).map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-foreground/80">
                        <Sparkle weight="fill" className={`h-3 w-3 shrink-0 ${acc.text}`} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-border flex items-center gap-2.5">
                  <Link
                    href={`/demo/${demo.slug}`}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-neon-green text-black px-4 py-3 text-xs font-display font-bold hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,255,102,0.25)]"
                  >
                    <Play weight="fill" className="h-4 w-4" />
                    Запустити Демо
                  </Link>
                  <Link
                    href={`/order/${demo.slug}`}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-border-strong bg-surface-2 px-3.5 py-3 text-xs font-semibold text-foreground hover:border-neon-blue/50 hover:text-neon-blue transition-colors"
                    title="Придбати"
                  >
                    <ShoppingCartSimple weight="bold" className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA to catalog */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-border bg-surface/50 p-6 backdrop-blur">
            <div className="text-left">
              <h3 className="font-display text-lg font-bold text-white">
                Шукаєте Telegram-ботів або мобільні додатки?
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Telegram-боти оснащені інтерактивним емулятором прямо на сторінці товару.
              </p>
            </div>
            <Link
              href="/catalog"
              className="shrink-0 flex items-center gap-2 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-95 transition-opacity"
            >
              Весь каталог товарів
              <ArrowRight weight="bold" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
