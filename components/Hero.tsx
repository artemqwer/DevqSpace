import Link from "next/link";

export default function Hero() {
  return (
    <section className="pt-24 pb-10 md:pt-40 md:pb-20 lg:pt-48 lg:pb-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          <div>
            <div className="inline-flex items-center border border-neon-blue/30 bg-neon-blue/10 rounded-full px-3 py-1 md:px-4 md:py-1.5 mb-4 md:mb-6">
              <span className="flex h-2 w-2 rounded-full bg-neon-blue mr-2 animate-pulse" />
              <span className="text-neon-blue text-[10px] md:text-xs font-bold tracking-widest uppercase">
                Система онлайн
              </span>
            </div>

            <h1 className="text-[2.5rem] leading-[1] md:text-6xl lg:text-7xl font-display font-bold text-white tracking-tight md:leading-[1.05] mb-4 md:mb-6">
              Код, що{" "}
              <span className="text-gradient block md:inline">
                генерує
                <br className="md:hidden" /> прибуток
              </span>
            </h1>

            <p className="text-sm md:text-lg text-gray-400 mb-6 md:mb-8 max-w-xl font-light leading-relaxed">
              Студія, яка розробляє та продає готові цифрові продукти для
              бізнесу. Telegram-боти, веб-додатки та скрипти автоматизації — з
              гарантією та підтримкою.
            </p>

            {/* Mobile-only CTA + stats */}
            <div className="md:hidden">
              <div className="flex gap-2">
                <Link
                  href="/catalog"
                  className="flex-1 flex items-center justify-between bg-gradient-to-r from-neon-blue to-neon-purple text-black font-display font-bold rounded-xl px-5 py-4 shadow-[0_10px_30px_-10px_rgba(0,240,255,0.5)] active:scale-[0.98] transition-transform"
                >
                  <span className="flex items-center gap-2">
                    <i className="ph-bold ph-storefront text-lg" />
                    Каталог
                  </span>
                  <i className="ph-bold ph-arrow-right text-lg" />
                </Link>
                <Link
                  href="/custom"
                  className="shrink-0 flex items-center justify-center w-14 rounded-xl bg-surface2 border border-white/10 text-white active:scale-95 transition-transform"
                  aria-label="Замовити під ключ"
                >
                  <i className="ph-bold ph-paper-plane-tilt text-lg" />
                </Link>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2">
                <StatPill value="40+" label="Продуктів" accent="text-neon-blue" />
                <StatPill value="320" label="Клієнтів" accent="text-neon-purple" />
                <StatPill value="5 р." label="Досвіду" accent="text-neon-green" />
              </div>

              <div className="mt-6 -mx-4 px-4 overflow-x-auto custom-scrollbar">
                <div className="flex gap-2 pb-2">
                  <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider self-center mr-1 shrink-0">
                    Тренд:
                  </span>
                  <Tag color="blue">#TelegramShop</Tag>
                  <Tag color="purple">#AI_Support</Tag>
                  <Tag color="green">#CRM</Tag>
                  <Tag color="pink">#Parsing</Tag>
                </div>
              </div>
            </div>

            {/* Desktop search */}
            <div className="hidden md:block relative max-w-xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="ph ph-terminal-window text-neon-blue text-xl" />
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-32 py-4 bg-surface2/80 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/50 transition-all font-mono text-sm"
                placeholder="Знайти бот, скрипт..."
              />
              <button className="absolute inset-y-1 right-1 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-md font-display font-bold text-sm transition-colors flex items-center gap-2">
                Пошук <i className="ph-bold ph-arrow-right" />
              </button>
            </div>

            <div className="hidden md:flex mt-6 flex-wrap gap-2">
              <span className="text-xs text-gray-500 font-mono uppercase tracking-wider self-center mr-2">
                Популярне:
              </span>
              <a
                href="#"
                className="text-xs font-mono px-3 py-1 bg-surface2 border border-white/5 rounded text-gray-400 hover:text-neon-blue hover:border-neon-blue/30 transition-all"
              >
                #TelegramShop
              </a>
              <a
                href="#"
                className="text-xs font-mono px-3 py-1 bg-surface2 border border-white/5 rounded text-gray-400 hover:text-neon-purple hover:border-neon-purple/30 transition-all"
              >
                #AI_Support
              </a>
              <a
                href="#"
                className="text-xs font-mono px-3 py-1 bg-surface2 border border-white/5 rounded text-gray-400 hover:text-neon-green hover:border-neon-green/30 transition-all"
              >
                #CRM
              </a>
            </div>
          </div>

          {/* Mobile preview card */}
          <div className="md:hidden relative">
            <div className="glass rounded-2xl p-5 border border-white/10 shadow-[0_0_50px_rgba(0,240,255,0.1)] relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-neon-blue/30 blur-3xl" />
              <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-neon-purple/30 blur-3xl" />

              <div className="relative flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-neon-blue to-neon-purple p-[1px]">
                  <div className="w-full h-full bg-surface2 rounded-full flex items-center justify-center">
                    <i className="ph-fill ph-robot text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-display font-bold text-white truncate">
                    AI Auto-Responder
                  </div>
                  <div className="text-[10px] font-mono text-gray-500">
                    Python 3.11 · Aiogram3
                  </div>
                </div>
                <span className="text-[10px] font-mono text-neon-blue border border-neon-blue/30 px-2 py-0.5 rounded bg-neon-blue/10 shrink-0">
                  v2.0.4
                </span>
              </div>

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-1 text-[11px] text-neon-green font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                  Верифіковано
                </div>
                <div className="text-xl font-display font-bold text-white flex items-center gap-1">
                  0.45 <i className="ph-fill ph-currency-eth text-gray-400 text-base" />
                </div>
              </div>
            </div>
          </div>

          {/* Desktop visual */}
          <div className="relative hidden lg:block h-[500px] animate-float">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-96 glass rounded-2xl p-6 border border-white/10 shadow-[0_0_50px_rgba(0,240,255,0.1)] z-20">
              <div className="flex justify-between items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-neon-blue to-neon-purple p-[1px]">
                  <div className="w-full h-full bg-surface2 rounded-full flex items-center justify-center">
                    <i className="ph-fill ph-robot text-white" />
                  </div>
                </div>
                <span className="text-xs font-mono text-neon-blue border border-neon-blue/30 px-2 py-1 rounded bg-neon-blue/10">
                  v2.0.4
                </span>
              </div>
              <div className="space-y-3 font-mono text-sm text-gray-300">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-500">Модуль:</span>{" "}
                  <span>AI Auto-Responder</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-500">Мова:</span>{" "}
                  <span className="text-yellow-400">Python 3.11</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-500">Статус:</span>{" "}
                  <span className="text-neon-green flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-green" />
                    Верифіковано
                  </span>
                </div>
              </div>
              <div className="mt-8">
                <div className="text-xs text-gray-500 mb-1">Ціна</div>
                <div className="text-3xl font-display font-bold text-white flex items-center gap-2">
                  0.45 <i className="ph-fill ph-currency-eth text-gray-400" />
                </div>
              </div>
              <button className="w-full mt-6 py-3 bg-white text-black font-bold font-display rounded hover:bg-gray-200 transition-colors">
                Купити сорс
              </button>
            </div>

            <div
              className="absolute top-10 left-0 w-32 h-32 glass rounded-xl border border-white/5 flex items-center justify-center flex-col z-10 animate-pulse-slow"
              style={{ animationDelay: "1s" }}
            >
              <i className="ph-fill ph-package text-4xl text-neon-purple mb-2" />
              <span className="text-[10px] text-gray-400 font-mono">
                40+ продуктів
              </span>
            </div>
            <div
              className="absolute bottom-10 right-0 w-44 h-24 glass rounded-xl border border-white/5 flex items-center justify-center gap-3 z-30"
              style={{ transform: "rotate(5deg)" }}
            >
              <div className="w-10 h-10 rounded-full bg-neon-green/10 border border-neon-green/30 flex items-center justify-center">
                <i className="ph-fill ph-shield-check text-neon-green text-xl" />
              </div>
              <div className="leading-tight">
                <div className="text-xs font-bold text-white">Гарантія</div>
                <div className="text-[10px] font-mono text-gray-400">
                  1 рік саппорту
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatPill({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent: string;
}) {
  return (
    <div className="bg-surface2/80 border border-white/5 rounded-lg px-2 py-3 text-center">
      <div className={`font-display font-bold text-lg leading-none ${accent}`}>
        {value}
      </div>
      <div className="text-[9px] font-mono text-gray-500 uppercase tracking-wider mt-1">
        {label}
      </div>
    </div>
  );
}

const TAG_COLOR = {
  blue: "hover:text-neon-blue hover:border-neon-blue/30",
  purple: "hover:text-neon-purple hover:border-neon-purple/30",
  green: "hover:text-neon-green hover:border-neon-green/30",
  pink: "hover:text-neon-pink hover:border-neon-pink/30",
} as const;

function Tag({
  children,
  color,
}: {
  children: React.ReactNode;
  color: keyof typeof TAG_COLOR;
}) {
  return (
    <a
      href="#"
      className={`shrink-0 text-[11px] font-mono px-3 py-1 bg-surface2 border border-white/5 rounded text-gray-400 transition-all ${TAG_COLOR[color]}`}
    >
      {children}
    </a>
  );
}
