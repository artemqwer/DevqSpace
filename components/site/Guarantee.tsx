import { ShieldCheck, Lock, Headset, ArrowClockwise } from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";

const items = [
  { icon: ShieldCheck, n: "1" },
  { icon: Lock, n: "2" },
  { icon: Headset, n: "3" },
  { icon: ArrowClockwise, n: "4" },
] as const;

export function Guarantee() {
  const t = useTranslations("guarantee");
  return (
    <section id="about" className="border-y border-border bg-surface/40 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-col gap-3">
          <span className="mono-label text-neon-green">{t("eyebrow")}</span>
          <h2 className="text-balance font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {t("title")}
          </h2>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, n }) => (
            <div key={n} className="rounded-2xl border border-border bg-background/40 p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-neon-green/30 bg-neon-green/10 text-neon-green">
                <Icon weight="duotone" className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-base font-bold text-foreground">{t(`g${n}t`)}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t(`g${n}d`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
