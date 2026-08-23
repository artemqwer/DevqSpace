import { Quotes, TrendUp } from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";

const cases = [
  { k: "c1", gradient: "linear-gradient(135deg, #00f0ff33, #8a2be233)" },
  { k: "c2", gradient: "linear-gradient(135deg, #8a2be233, #ff007f26)" },
  { k: "c3", gradient: "linear-gradient(135deg, #00ff6626, #00f0ff33)" },
];
const testimonials = ["t1", "t2", "t3"] as const;

export function Cases() {
  const t = useTranslations("cases");
  const th = useTranslations("homeCases");
  return (
    <section id="cases" className="relative py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-col gap-3">
          <span className="mono-label text-neon-blue">{t("eyebrow")}</span>
          <h2 className="text-balance font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {t("title")}
          </h2>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {cases.map((c) => (
            <article
              key={c.k}
              className="grad-border group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface/40"
            >
              <div className="relative h-28" style={{ background: c.gradient }}>
                <span className="mono-label absolute left-4 top-4 rounded-md bg-background/60 px-2 py-1 text-foreground backdrop-blur">
                  {th(`${c.k}cat`)}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-base font-bold leading-snug text-foreground">{th(`${c.k}t`)}</h3>
                <p className="mono-label mt-1 text-muted-foreground">{th(`${c.k}c`)}</p>
                <div className="mt-auto flex items-center gap-2 pt-4 text-sm font-medium text-neon-green">
                  <TrendUp weight="bold" className="h-4 w-4" /> {th(`${c.k}r`)}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {testimonials.map((k) => (
            <figure key={k} className="rounded-2xl border border-border bg-surface-2/40 p-5">
              <Quotes weight="fill" className="h-6 w-6 text-neon-purple" />
              <blockquote className="mt-3 text-sm leading-relaxed text-foreground/90">{th(k)}</blockquote>
              <figcaption className="mt-4 border-t border-border pt-4">
                <div className="text-sm font-semibold text-foreground">{th(`${k}n`)}</div>
                <div className="mono-label text-muted-foreground">{th(`${k}r`)}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
