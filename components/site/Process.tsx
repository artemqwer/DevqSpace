import Link from "next/link";
import { ArrowRight, PaperPlaneTilt } from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";

const steps = ["1", "2", "3", "4", "5"] as const;

export function Process() {
  const t = useTranslations("process");
  return (
    <section id="order" className="relative overflow-hidden border-y border-border bg-surface/40 py-16 md:py-24">
      <div className="orb left-[-8%] bottom-[-10%] h-80 w-80 bg-neon-blue opacity-20" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col gap-4">
            <span className="mono-label text-neon-purple">{t("eyebrow")}</span>
            <h2 className="text-balance font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {t("title")}
            </h2>
            <p className="max-w-md text-pretty leading-relaxed text-muted-foreground">
              {t("subtitle")}
            </p>
            <Link
              href="/custom"
              className="mt-2 inline-flex w-fit items-center gap-2 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <PaperPlaneTilt weight="fill" className="h-4 w-4" /> {t("cta")}
            </Link>
          </div>

          <ol className="relative flex flex-col gap-3">
            {steps.map((n, i) => (
              <li
                key={n}
                className="grad-border group flex items-start gap-4 rounded-xl border border-border bg-background/40 p-4 transition-colors hover:bg-surface-2/50"
              >
                <span className="mono-label mt-0.5 shrink-0 rounded-md border border-border bg-surface-2 px-2 py-1 text-neon-blue">
                  {`0${n}`}
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">{t(`s${n}t`)}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t(`s${n}d`)}</p>
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight className="ml-auto hidden h-4 w-4 shrink-0 self-center text-muted-foreground md:block" />
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
