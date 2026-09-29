import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { MobileNav } from "@/components/site/MobileNav";
import { getSettings, SETTINGS_DEFAULTS } from "@/lib/settings";

export type LegalDocId = "terms" | "privacy" | "refund";

const MAX_SECTIONS = 12;

export async function LegalDoc({ doc }: { doc: LegalDocId }) {
  const [settings, locale] = await Promise.all([getSettings(), getLocale()]);

  // Тумблер вимкнено — сторінки не існує. Саме 404, а не порожня сторінка:
  // недописана оферта в індексі гірша за її відсутність.
  if (!settings.legalEnabled) notFound();

  const isEn = locale === "en";
  const placeholders = isEn
    ? {
        entityName: "[LEGAL ENTITY NAME]",
        edrpou: "[REGISTRATION ID]",
        address: "[LEGAL ADDRESS]",
        supportEmail: "[SUPPORT EMAIL]",
        supportPhone: "[PHONE NUMBER]",
      }
    : {
        entityName: "[НАЗВА ФОП / ТОВ]",
        edrpou: "[ЄДРПОУ]",
        address: "[АДРЕСА]",
        supportEmail: "[EMAIL ПІДТРИМКИ]",
        supportPhone: "[ТЕЛЕФОН]",
      };

  const t = await getTranslations(`legal.${doc}`);

  const values = {
    entityType: settings.entityType || SETTINGS_DEFAULTS.entityType,
    entityName: settings.entityName || placeholders.entityName,
    edrpou: settings.edrpou || placeholders.edrpou,
    address: settings.address || placeholders.address,
    supportEmail: settings.supportEmail || placeholders.supportEmail,
    supportPhone: settings.supportPhone || placeholders.supportPhone,
    workHours: settings.workHours || SETTINGS_DEFAULTS.workHours,
  };

  const sections = [];
  for (let i = 1; i <= MAX_SECTIONS; i++) {
    if (!t.has(`h${i}`)) break;
    sections.push({
      heading: t(`h${i}`, values),
      body: t.has(`b${i}`) ? t(`b${i}`, values) : "",
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-24 md:px-6 md:pt-32">
        <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {t("intro", values)}
        </p>

        <div className="mt-10 space-y-8">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="font-display text-lg font-bold text-foreground md:text-xl">
                {s.heading}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </section>
          ))}
        </div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
