const EXCHANGE_LINKS = [
  { label: "Каталог", href: "/catalog" },
  { label: "Telegram боти", href: "/catalog" },
  { label: "Web / SaaS", href: "/catalog" },
  { label: "Автоматизація", href: "/catalog" },
];

const DEV_LINKS = [
  { label: "Про студію", href: "/about" },
  { label: "Кейси", href: "/cases" },
  { label: "Замовити кастом", href: "/custom" },
  { label: "Контакти", href: "https://t.me/" },
];

export default function Footer() {
  return (
    <footer className="bg-surface pt-12 md:pt-16 pb-28 md:pb-8 border-t border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Brand */}
        <div className="mb-8 md:hidden">
          <div className="flex items-center mb-3 cursor-pointer group">
            <i className="ph-fill ph-code text-neon-blue text-2xl mr-2" />
            <span className="font-display font-bold text-xl tracking-tighter text-white">
              DevqSpace<span className="text-neon-blue">.</span>
            </span>
          </div>
          <p className="text-gray-500 text-xs font-mono leading-relaxed">
            Студія цифрових продуктів. Розробляємо готові рішення та беремо
            кастомні проєкти під ключ.
          </p>
        </div>

        {/* Mobile newsletter — bold CTA */}
        <div className="md:hidden mb-8">
          <div className="relative rounded-2xl bg-gradient-to-br from-neon-blue/10 via-surface2 to-neon-purple/10 border border-white/10 p-5 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-neon-blue/20 blur-3xl" />
            <div className="relative">
              <div className="text-[10px] font-mono text-neon-green tracking-widest uppercase mb-2">
                {"// SYSTEM_MSG"}
              </div>
              <h3 className="text-base font-display font-bold text-white mb-1">
                Будь у курсі релізів
              </h3>
              <p className="text-xs text-gray-400 font-mono mb-4">
                Нові продукти, кейси, ранній доступ.
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="root@email.com"
                  className="bg-black/40 border border-white/10 px-3 py-3 rounded-l-lg text-xs text-white font-mono w-full focus:outline-none focus:border-neon-green/50"
                />
                <button
                  type="button"
                  aria-label="Subscribe"
                  className="bg-neon-green text-black px-4 rounded-r-lg active:scale-95 transition-transform"
                >
                  <i className="ph-bold ph-arrow-right text-lg" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile accordion */}
        <div className="md:hidden space-y-2 mb-8">
          <FooterAccordion title="ПРОДУКТИ" accent="text-neon-blue">
            <ul className="space-y-2 text-sm text-gray-400 font-mono">
              {EXCHANGE_LINKS.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="hover:text-white transition-colors"
                  >
                    &gt; {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </FooterAccordion>
          <FooterAccordion title="СТУДІЯ" accent="text-neon-purple">
            <ul className="space-y-2 text-sm text-gray-400 font-mono">
              {DEV_LINKS.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="hover:text-white transition-colors"
                  >
                    &gt; {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </FooterAccordion>
        </div>

        {/* Mobile socials */}
        <div className="md:hidden flex justify-center gap-3 mb-6">
          <SocialBtn icon="ph-telegram-logo" />
          <SocialBtn icon="ph-x-logo" />
          <SocialBtn icon="ph-github-logo" />
          <SocialBtn icon="ph-discord-logo" />
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-12 mb-12 border-b border-white/5 pb-12">
          <div className="lg:col-span-1">
            <div className="flex items-center mb-4 cursor-pointer group">
              <i className="ph-fill ph-code text-neon-blue text-3xl mr-2" />
              <span className="font-display font-bold text-2xl tracking-tighter text-white">
                DevqSpace<span className="text-neon-blue">.</span>
              </span>
            </div>
            <p className="text-gray-500 text-xs font-mono mb-6 leading-relaxed">
              Студія цифрових продуктів. Розробляємо готові рішення та беремо
              кастомні проєкти під ключ.
            </p>
            <div className="flex space-x-3">
              <SocialBtn icon="ph-telegram-logo" />
              <SocialBtn icon="ph-x-logo" />
              <SocialBtn icon="ph-github-logo" />
            </div>
          </div>

          <div>
            <h4 className="font-mono font-bold mb-4 text-xs tracking-widest text-neon-blue">
              ПРОДУКТИ
            </h4>
            <ul className="space-y-2 text-sm text-gray-400 font-mono">
              {EXCHANGE_LINKS.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="hover:text-white transition-colors"
                  >
                    &gt; {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-mono font-bold mb-4 text-xs tracking-widest text-neon-purple">
              СТУДІЯ
            </h4>
            <ul className="space-y-2 text-sm text-gray-400 font-mono">
              {DEV_LINKS.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="hover:text-white transition-colors"
                  >
                    &gt; {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-mono font-bold mb-4 text-xs tracking-widest text-neon-green">
              SYSTEM_MSG
            </h4>
            <p className="text-xs text-gray-500 font-mono mb-3">
              Підпишіться щоб дізнаватися про нові продукти та знижки першими.
            </p>
            <div className="flex mt-2">
              <input
                type="email"
                placeholder="root@email.com"
                className="bg-surface2 border border-white/10 px-3 py-2 rounded-l text-xs text-white font-mono w-full focus:outline-none focus:border-neon-green/50"
              />
              <button
                type="button"
                aria-label="Subscribe"
                className="bg-white/10 border border-white/10 border-l-0 text-white px-3 py-2 rounded-r hover:bg-neon-green hover:text-black transition-colors"
              >
                <i className="ph-bold ph-terminal-window" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-[10px] md:text-xs font-mono text-gray-600 text-center md:text-left">
          <p>&copy; 2026 DevqSpace_PROTOCOL. ALL SYSTEMS NOMINAL.</p>
          <div className="flex space-x-4">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />{" "}
              SERVER_STATUS: ON
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialBtn({ icon }: { icon: string }) {
  return (
    <a
      href="#"
      aria-label={icon}
      className="w-10 h-10 md:w-8 md:h-8 rounded-lg md:rounded bg-surface2 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-neon-blue transition-all"
    >
      <i className={`ph-fill ${icon} text-base`} />
    </a>
  );
}

function FooterAccordion({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group bg-surface2/50 border border-white/5 rounded-xl overflow-hidden">
      <summary
        className={`flex items-center justify-between px-4 py-3 cursor-pointer list-none font-mono font-bold text-xs tracking-widest ${accent}`}
      >
        {title}
        <i className="ph-bold ph-plus text-base group-open:rotate-45 transition-transform text-gray-400" />
      </summary>
      <div className="px-4 pb-4 pt-1">{children}</div>
    </details>
  );
}
