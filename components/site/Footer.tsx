import Link from "next/link";
import { TelegramLogo, XLogo, GithubLogo, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";
import { Wordmark } from "./Wordmark";

const socials = [
  { icon: TelegramLogo, label: "Telegram", href: "#" },
  { icon: XLogo, label: "X", href: "#" },
  { icon: GithubLogo, label: "GitHub", href: "#" },
  { icon: EnvelopeSimple, label: "Email", href: "#" },
];

export function Footer() {
  const t = useTranslations("footer");
  const tc = useTranslations("cat");
  const columns = [
    {
      title: t("colProducts"),
      links: [
        { label: tc("telegram-bots.label"), href: "/catalog" },
        { label: tc("web.label"), href: "/catalog" },
        { label: tc("mobile.label"), href: "/catalog" },
        { label: tc("web3.label"), href: "/catalog" },
        { label: tc("templates.label"), href: "/catalog" },
      ],
    },
    {
      title: t("colStudio"),
      links: [
        { label: t("linkAbout"), href: "/about" },
        { label: t("linkCases"), href: "/cases" },
        { label: t("linkCustom"), href: "/custom" },
        { label: t("linkWarranty"), href: "/about" },
      ],
    },
    {
      title: t("colSupport"),
      links: [
        { label: t("linkCatalog"), href: "/catalog" },
        { label: t("linkOrder"), href: "/custom" },
        { label: t("linkContacts"), href: "/about" },
      ],
    },
  ];
  return (
    <footer id="footer" className="border-t border-border bg-surface/40 pb-24 pt-14 md:pb-14">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="DevqSpace" className="h-11 w-auto" />
              <Wordmark className="text-lg" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {t("tagline")}
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
          <p className="mono-label text-muted-foreground">© 2026 DevqSpace · devq.space</p>
          <p className="mono-label text-muted-foreground">{t("note")}</p>
        </div>
      </div>
    </footer>
  );
}
