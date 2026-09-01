import type { Metadata } from "next";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Navbar } from "@/components/site/Navbar";
import { MobileNav } from "@/components/site/MobileNav";
import { AboutStats } from "@/components/site/AboutStats";

export const metadata: Metadata = {
  title: "Про нас",
  description:
    "DevqSpace — студія цифрових продуктів. Розробляємо та продаємо готові Telegram-боти, веб-додатки та мобільні застосунки.",
};

const VALUES = [
  { icon: "ph-rocket-launch", k: "v1" },
  { icon: "ph-shield-check", k: "v2" },
  { icon: "ph-code", k: "v3" },
  { icon: "ph-handshake", k: "v4" },
] as const;

const STACK = [
  "Python", "Aiogram", "Next.js", "React", "React Native", "TypeScript",
  "Node.js", "PostgreSQL", "Supabase", "OpenAI", "Solidity", "Tailwind",
];

export default function AboutPage() {
  const t = useTranslations("about");
  return (
    <div className="min-h-screen bg-background">
      <div className="grid-bg grid-fade pointer-events-none fixed inset-0 z-0" aria-hidden />
      <Navbar />
      <main className="relative mx-auto max-w-5xl px-4 pb-28 pt-24 md:px-8 md:pb-24 md:pt-32">
        <div className="mb-10 flex flex-col gap-4 md:mb-16">
          <span className="mono-label text-neon-blue">{t("eyebrow")}</span>
          <h1 className="text-balance font-display text-3xl font-bold leading-[1.05] tracking-tight text-foreground md:text-6xl">
            {t("headA")} <span className="text-gradient">{t("headB")}</span>
          </h1>
          <p className="max-w-2xl text-pretty leading-relaxed text-muted-foreground md:text-lg">
            {t("sub")}
          </p>
        </div>

        <AboutStats />

        <h2 className="mb-5 font-display text-xl font-bold text-foreground md:text-2xl">
          {t("valuesTitle")}
        </h2>
        <div className="mb-10 grid grid-cols-1 gap-3 md:mb-16 md:grid-cols-2 md:gap-4">
          {VALUES.map((v) => (
            <div
              key={v.k}
              className="grad-border flex gap-4 rounded-2xl border border-border bg-surface/50 p-5"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-neon-blue/30 bg-neon-blue/10">
                <i className={`ph-bold ${v.icon} text-xl text-neon-blue`} />
              </span>
              <div>
                <h3 className="mb-1 font-display font-bold text-foreground">{t(`${v.k}t`)}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{t(`${v.k}d`)}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="mb-5 font-display text-xl font-bold text-foreground md:text-2xl">
          {t("techTitle")}
        </h2>
        <div className="mb-10 flex flex-wrap gap-2 md:mb-16">
          {STACK.map((s) => (
            <span
              key={s}
              className="mono-label rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-foreground/80"
            >
              {s}
            </span>
          ))}
        </div>

        <div className="glass grad-border relative overflow-hidden rounded-3xl p-6 text-center md:p-10">
          <div className="orb bottom-[-30%] left-1/2 h-72 w-72 -translate-x-1/2 bg-neon-purple opacity-20" aria-hidden />
          <div className="relative">
            <h2 className="mb-3 font-display text-xl font-bold text-foreground md:text-3xl">
              {t("ctaTitle")}
            </h2>
            <p className="mx-auto mb-6 max-w-lg text-sm leading-relaxed text-muted-foreground">
              {t("ctaText")}
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href="https://t.me/"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple px-6 py-3 font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                <i className="ph-fill ph-telegram-logo" /> {t("ctaTg")}
              </a>
              <Link
                href="/cases"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-2/40 px-6 py-3 font-medium text-foreground transition-colors hover:border-neon-blue/50"
              >
                <i className="ph-bold ph-folder-open" /> {t("ctaCases")}
              </Link>
            </div>
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
