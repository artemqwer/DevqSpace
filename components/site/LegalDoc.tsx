import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { MobileNav } from "@/components/site/MobileNav";
import { getSettings, SETTINGS_DEFAULTS } from "@/lib/settings";

export type LegalDocId = "terms" | "privacy" | "refund";

// Незаповнений реквізит показуємо заглушкою, а не порожнім місцем: так одразу
// видно, що документ ще шаблон, і його не можна публікувати як є.
const PLACEHOLDER: Record<string, string> = {
  entityName: "[НАЗВА ФОП / ТОВ]",
  edrpou: "[ЄДРПОУ]",
  address: "[АДРЕСА]",
  supportEmail: "[EMAIL ПІДТРИМКИ]",
  supportPhone: "[ТЕЛЕФОН]",
};

// Розділів у документі різна кількість — беремо, доки вони є.
const MAX_SECTIONS = 12;

export async function LegalDoc({ doc }: { doc: LegalDocId }) {
  const settings = await getSettings();

  // Тумблер вимкнено — сторінки не існує. Саме 404, а не порожня сторінка:
  // недописана оферта в індексі гірша за її відсутність.
  if (!settings.legalEnabled) notFound();

  const t = await getTranslations(`legal.${doc}`);

  const values = {
    entityType: settings.entityType || SETTINGS_DEFAULTS.entityType,
    entityName: settings.entityName || PLACEHOLDER.entityName,
    edrpou: settings.edrpou || PLACEHOLDER.edrpou,
    address: settings.address || PLACEHOLDER.address,
    supportEmail: settings.supportEmail || PLACEHOLDER.supportEmail,
    supportPhone: settings.supportPhone || PLACEHOLDER.supportPhone,
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
