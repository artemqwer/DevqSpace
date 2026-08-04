import Link from "next/link";
import { Lightning, TelegramLogo, XLogo, GithubLogo, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";

const columns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Продукти",
    links: [
      { label: "Telegram-боти", href: "/catalog" },
      { label: "Web / SaaS", href: "/catalog" },
      { label: "Мобільні", href: "/catalog" },
      { label: "Web3", href: "/catalog" },
      { label: "Шаблони", href: "/catalog" },
    ],
  },
  {
    title: "Студія",
    links: [
      { label: "Про нас", href: "/about" },
      { label: "Кейси", href: "/cases" },
      { label: "Розробка під ключ", href: "/custom" },
      { label: "Гарантія", href: "/#about" },
    ],
  },
  {
    title: "Підтримка",
    links: [
      { label: "Каталог", href: "/catalog" },
      { label: "Замовити", href: "/custom" },
      { label: "Контакти", href: "/about" },
    ],
  },
];

const socials = [
  { icon: TelegramLogo, label: "Telegram", href: "#" },
  { icon: XLogo, label: "X", href: "#" },
  { icon: GithubLogo, label: "GitHub", href: "#" },
  { icon: EnvelopeSimple, label: "Email", href: "#" },
];

export function Footer() {
  return (
    <footer id="footer" className="border-t border-border bg-surface/40 pb-24 pt-14 md:pb-14">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple">
                <Lightning weight="fill" className="h-4 w-4 text-primary-foreground" />
              </span>
              <span className="font-display text-lg font-bold tracking-tight text-foreground">NEXUS</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Цифрова студія: готові продукти та розробка під ключ з повним
              сорс-кодом і гарантією.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {socials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-neon-blue/50 hover:text-neon-blue"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="mono-label text-muted-foreground">{col.title}</h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="mono-label text-muted-foreground">© 2026 nexus studio</p>
          <p className="mono-label text-muted-foreground">зроблено з увагою до деталей</p>
        </div>
      </div>
    </footer>
  );
}
