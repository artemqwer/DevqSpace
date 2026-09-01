import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { Navbar } from "@/components/site/Navbar";
import { MobileNav } from "@/components/site/MobileNav";
import { Footer } from "@/components/site/Footer";
import CustomForm from "@/components/custom/CustomForm";

export const metadata: Metadata = {
  title: "Кастомна розробка",
  description:
    "Замовте кастомний Telegram-бот, веб-додаток або мобільний застосунок під вашу задачу.",
};

const BULLETS = [
  { icon: "ph-chats-circle", key: "b1" },
  { icon: "ph-money", key: "b2" },
  { icon: "ph-clock-countdown", key: "b3" },
  { icon: "ph-code", key: "b4" },
  { icon: "ph-shield-check", key: "b5" },
] as const;

export default function CustomPage() {
  const t = useTranslations("custom");
  return (
    <div className="min-h-screen bg-background">
      <div className="grid-bg grid-fade pointer-events-none fixed inset-0 z-0" aria-hidden />
      <Navbar />
      <main className="relative mx-auto max-w-6xl px-4 pb-28 pt-24 md:px-8 md:pb-24 md:pt-32">
        {/* Hero */}
        <div className="mb-10 flex flex-col gap-4 md:mb-14">
          <span className="mono-label text-neon-pink">{t("eyebrow")}</span>
          <h1 className="text-balance font-display text-3xl font-bold leading-[1.05] tracking-tight text-foreground md:text-6xl">
            {t("headA")} <span className="text-gradient">{t("headB")}</span>
          </h1>
          <p className="max-w-2xl text-pretty leading-relaxed text-muted-foreground md:text-lg">
            {t("sub")}
          </p>
        </div>

        {/* Bullets */}
        <div className="mb-10 grid grid-cols-2 gap-2 md:mb-14 md:grid-cols-5 md:gap-3">
          {BULLETS.map((b) => (
            <div
              key={b.key}
              className="flex items-center gap-2 rounded-xl border border-border bg-surface-2/50 p-3 md:flex-col md:items-start md:gap-3 md:p-4"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-neon-blue/30 bg-neon-blue/10 md:h-10 md:w-10">
                <i className={`ph-bold ${b.icon} text-neon-blue`} />
              </span>
              <span className="text-xs font-medium text-foreground/90 md:text-sm">
                {t(b.key)}
              </span>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="grad-border rounded-3xl border border-border bg-surface/30 p-5 backdrop-blur md:p-10">
          <CustomForm />
        </div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
