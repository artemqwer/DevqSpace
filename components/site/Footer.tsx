import Link from "next/link";
import { TelegramLogo, EnvelopeSimple, Phone } from "@phosphor-icons/react/dist/ssr";
import { getTranslations } from "next-intl/server";
import { Wordmark } from "./Wordmark";
import { getSettings, getSupportTgUrl } from "@/lib/settings";

// Футер серверний: йому потрібні налаштування (контакти, тумблер юридичних
// сторінок). Раніше іконки соцмереж вели на href="#", тобто в нікуди —
// тепер показуємо лише ті контакти, які реально заповнені.
export async function Footer() {
  const [t, tc, tl, settings, tgUrl] = await Promise.all([
    getTranslations("footer"),
    getTranslations("cat"),
    getTranslations("legal"),
    getSettings(),
    getSupportTgUrl(),
  ]);

  const contacts = [
    tgUrl && { icon: TelegramLogo, label: "Telegram", href: tgUrl },
    settings.supportEmail && {
      icon: EnvelopeSimple,
      label: settings.supportEmail,
      href: `mailto:${settings.supportEmail}`,
    },
    settings.supportPhone && {
      icon: Phone,
      label: settings.supportPhone,
      href: `tel:${settings.supportPhone.replace(/[^\d+]/g, "")}`,
    },
  ].filter(Boolean) as { icon: typeof TelegramLogo; label: string; href: string }[];

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
    // Юридичні документи з'являються лише коли адмін увімкнув їх публікацію:
    // посилання на недописану оферту гірше за її відсутність.
    settings.legalEnabled
      ? {
          title: tl("footerLegal"),
          links: [
            { label: tl("terms.title"), href: "/terms" },
            { label: tl("privacy.title"), href: "/privacy" },
            { label: tl("refund.title"), href: "/refund" },
          ],
        }
      : {
          title: t("colSupport"),
          links: [
            { label: t("linkCatalog"), href: "/catalog" },
            { label: t("linkOrder"), href: "/custom" },
            { label: t("linkContacts"), href: "/about" },
          ],
        },
  ];

  const entity = [settings.entityType, settings.entityName]
    .filter(Boolean)
    .join(" ");

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
            {contacts.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {contacts.map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-neon-blue/50 hover:text-neon-blue"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </a>
                ))}
              </div>
            )}
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
          <p className="mono-label text-muted-foreground">
            © 2026 DevqSpace · devq.space
            {entity && settings.legalEnabled ? ` · ${entity}` : ""}
          </p>
          <p className="mono-label text-muted-foreground">{t("note")}</p>
        </div>
      </div>
    </footer>
  );
}
