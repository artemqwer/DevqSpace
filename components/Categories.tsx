import Link from "next/link";

type Category = {
  icon: string;
  number: string;
  title: string;
  description: string;
  count: string;
  href: string;
  accent: "blue" | "purple" | "pink" | "green";
};

const CATEGORIES: Category[] = [
  {
    icon: "ph-telegram-logo",
    number: "01",
    title: "Telegram Bots",
    description: "Магазини, саппорт, CRM, AI-асистенти.",
    count: "8 продуктів",
    href: "/catalog",
    accent: "blue",
  },
  {
    icon: "ph-browsers",
    number: "02",
    title: "Web / SaaS",
    description: "Next.js додатки, адмін-панелі, лендинги.",
    count: "5 продуктів",
    href: "/catalog",
    accent: "purple",
  },
  {
    icon: "ph-lightning",
    number: "03",
    title: "Скрипти та Web3",
    description: "Парсери, смарт-контракти, мобільні, шаблони.",
    count: "21 рішення",
    href: "/catalog",
    accent: "green",
  },
  {
    icon: "ph-wrench",
    number: "04",
    title: "Кастомна розробка",
    description: "Робимо під вашу задачу з нуля.",
    count: "Замовити",
    href: "/custom",
    accent: "pink",
  },
];

const ACCENT_BORDER: Record<Category["accent"], string> = {
  blue: "md:group-hover:border-neon-blue/50 border-neon-blue/40 md:border-white/10",
  purple: "md:group-hover:border-neon-purple/50 border-neon-purple/40 md:border-white/10",
  pink: "md:group-hover:border-neon-pink/50 border-neon-pink/40 md:border-white/10",
  green: "md:group-hover:border-neon-green/50 border-neon-green/40 md:border-white/10",
};

const ACCENT_ICON: Record<Category["accent"], string> = {
  blue: "text-neon-blue md:text-white md:group-hover:text-neon-blue",
  purple: "text-neon-purple md:text-white md:group-hover:text-neon-purple",
  pink: "text-neon-pink md:text-white md:group-hover:text-neon-pink",
  green: "text-neon-green md:text-white md:group-hover:text-neon-green",
};

const ACCENT_TEXT: Record<Category["accent"], string> = {
  blue: "text-neon-blue",
  purple: "text-neon-purple",
  pink: "text-neon-pink",
  green: "text-neon-green",
};

export default function Categories() {
  return (
    <section className="py-12 md:py-20 relative z-10 border-t border-white/5 bg-surface/50">
      <div className="max-w-7xl mx-auto md:px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-6 md:mb-12 gap-3 px-4 md:px-0">
          <div>
            <h2 className="text-2xl md:text-4xl font-display font-bold text-white mb-1 md:mb-2">
              Каталог
            </h2>
            <p className="text-gray-400 font-mono text-[11px] md:text-sm">
              Оберіть категорію
            </p>
          </div>
          <Link
            href="/catalog"
            className="text-neon-blue font-mono text-[11px] md:text-sm flex items-center hover:text-white transition-colors group shrink-0"
          >
            [ Всі ]
            <i className="ph-bold ph-caret-right ml-1 md:ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Mobile: 2x2 grid */}
        <div className="md:hidden grid grid-cols-2 gap-3 px-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.number}
              href={c.href}
              className={`relative rounded-2xl p-4 bg-surface border ${ACCENT_BORDER[c.accent]} overflow-hidden`}
            >
              <div
                className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl opacity-60"
                style={{
                  background: `radial-gradient(circle, currentColor 0%, transparent 70%)`,
                  color: "transparent",
                }}
              />
              <div className="flex justify-between items-start mb-6 relative">
                <div
                  className={`w-10 h-10 rounded-lg bg-surface2 flex items-center justify-center border ${ACCENT_BORDER[c.accent]}`}
                >
                  <i
                    className={`ph ${c.icon} text-xl ${ACCENT_ICON[c.accent]}`}
                  />
                </div>
                <span className="text-[10px] font-mono text-gray-500">
                  {c.number}
                </span>
              </div>
              <h3 className="text-sm font-display font-bold text-white mb-1 relative leading-tight">
                {c.title}
              </h3>
              <p className="text-[11px] text-gray-500 font-light mb-3 relative line-clamp-2">
                {c.description}
              </p>
              <div
                className={`text-[10px] font-mono ${ACCENT_TEXT[c.accent]} relative flex items-center gap-1`}
              >
                {c.count}
                <i className="ph-bold ph-arrow-right text-[10px]" />
              </div>
            </Link>
          ))}
        </div>

        {/* Desktop: grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.number}
              href={c.href}
              className="neon-card rounded-xl p-6 group"
            >
              <div className="flex justify-between items-start mb-12">
                <div
                  className={`w-12 h-12 rounded bg-surface2 flex items-center justify-center border border-white/10 transition-colors ${ACCENT_BORDER[c.accent]}`}
                >
                  <i
                    className={`ph ${c.icon} text-2xl transition-colors ${ACCENT_ICON[c.accent]}`}
                  />
                </div>
                <span className="text-xs font-mono text-gray-500">
                  {c.number}
                </span>
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-1">
                {c.title}
              </h3>
              <p className="text-sm text-gray-500 font-light mb-4">
                {c.description}
              </p>
              <div className={`text-xs font-mono ${ACCENT_TEXT[c.accent]}`}>
                {c.count} &rarr;
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
