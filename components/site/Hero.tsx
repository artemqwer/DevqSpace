import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";

const services = ["s1", "s2", "s3", "s4"] as const;

const marquee = [
  "Next.js", "Telegram API", "Solidity", "Python", "OpenAI", "PostgreSQL",
  "Stripe", "React", "Node.js", "Web3.js", "Docker", "TON",
];

export function Hero() {
  const t = useTranslations("hero");
  return (
    <section id="top" className="relative flex min-h-screen flex-col overflow-hidden pt-20 md:pt-24">
      {/* backdrop layers */}
      <div className="grid-bg grid-fade absolute inset-0" aria-hidden />
      <div className="orb left-[-8%] top-[18%] h-80 w-80 bg-neon-purple" aria-hidden />
      <div className="orb right-[-4%] top-[-6%] h-96 w-96 bg-neon-blue" aria-hidden />

      {/* decorative wireframe mesh, bottom-right */}
      <svg
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-[55%] w-[85%] opacity-30 sm:h-[70%] sm:w-[70%] sm:opacity-50"
        viewBox="0 0 600 400"
        fill="none"
        preserveAspectRatio="xMaxYMax slice"
      >
        <defs>
          <linearGradient id="mesh" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-neon-blue)" stopOpacity="0" />
            <stop offset="60%" stopColor="var(--color-neon-purple)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--color-neon-pink)" stopOpacity="0.7" />
          </linearGradient>
        </defs>
        {Array.from({ length: 13 }).map((_, r) => (
          <path
            key={`h${r}`}
            d={`M0 ${120 + r * 22} Q 200 ${70 + r * 22} 400 ${140 + r * 18} T 600 ${110 + r * 20}`}
            stroke="url(#mesh)"
            strokeWidth="1"
          />
        ))}
        {Array.from({ length: 20 }).map((_, c) => (
          <path
            key={`v${c}`}
            d={`M${c * 32} 400 L${120 + c * 24} 100`}
            stroke="url(#mesh)"
            strokeWidth="0.75"
          />
        ))}
      </svg>

      {/* right-edge blueprint schematic column */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-6 top-28 hidden w-24 flex-col gap-3 lg:flex xl:right-10 xl:w-28"
      >
        {["1010 0111", "00FF · A2", "PORT 443", "SHA-256", "v2.4.1"].map((t, i) => (
          <div
            key={i}
            className="rounded-md border border-border-strong/60 bg-surface-2/30 px-2 py-3 text-center backdrop-blur-sm"
          >
            <div className="mx-auto mb-2 h-8 w-full rounded-sm border border-neon-blue/20 bg-[repeating-linear-gradient(90deg,transparent,transparent_3px,rgba(0,240,255,0.15)_3px,rgba(0,240,255,0.15)_4px)]" />
            <span className="mono-label text-[10px] text-muted-foreground">{t}</span>
          </div>
        ))}
      </div>

      {/* main content */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 md:px-6">
        {/* status row */}
        <div className="reveal flex items-center justify-between pt-3 md:pt-6">
          <span className="mono-label inline-flex items-center gap-2 text-muted-foreground">
            <span className="pulse-dot h-2 w-2 rounded-full bg-neon-green" />
            <span className="text-neon-green">SYS.ONLINE</span> {t("status")}
          </span>
          <span className="mono-label hidden text-muted-foreground sm:inline">
            {t("stat")}
          </span>
        </div>

        {/* giant headline */}
        <div className="flex flex-1 flex-col justify-start py-5 sm:justify-center sm:py-14">
          <span
            className="reveal mono-label mb-6 flex items-center gap-3 text-muted-foreground"
            style={{ animationDelay: "0.05s" }}
          >
            <span className="h-px w-10 bg-neon-blue" />
            {t("eyebrow")}
          </span>

          <h1 className="font-display font-bold uppercase leading-[0.95] tracking-tight text-foreground sm:leading-[0.9] lg:leading-[0.86]">
            <span className="reveal block text-[12.5vw] sm:text-[11vw] lg:text-[9rem]" style={{ animationDelay: "0.1s" }}>
              {t("line1")}
            </span>
            <span className="reveal block text-outline text-[12.5vw] sm:text-[11vw] lg:text-[9rem]" style={{ animationDelay: "0.18s" }}>
              {t("line2")}
            </span>
            <span className="reveal block text-gradient text-glow text-[12.5vw] sm:text-[11vw] lg:text-[9rem]" style={{ animationDelay: "0.26s" }}>
              {t("line3")}
            </span>
          </h1>

          <p
            className="reveal mt-8 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground md:text-lg"
            style={{ animationDelay: "0.34s" }}
          >
            {t("subtitle")}
          </p>

          {/* CTAs */}
          <div
            className="reveal mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ animationDelay: "0.42s" }}
          >
            <Link
              href="/catalog"
              className="glow-strong group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple px-8 py-4 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              {t("ctaCatalog")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/custom"
              className="group inline-flex items-center justify-center gap-2 rounded-full border border-border-strong bg-surface-2/40 px-8 py-4 text-sm font-semibold text-foreground backdrop-blur transition-colors hover:border-neon-purple/60"
            >
              {t("ctaCustom")}
              <ArrowUpRight className="h-4 w-4 text-neon-purple transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          {/* service index */}
          <div
            className="reveal mt-12 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-3 border-t border-border pt-6 sm:grid-cols-4"
            style={{ animationDelay: "0.5s" }}
          >
            {services.map((key, i) => (
              <Link key={key} href="/catalog" className="group flex items-start gap-2 text-left">
                <span className="mono-label text-neon-blue">{`0${i + 1}`}</span>
                <span className="text-sm text-muted-foreground transition-colors group-hover:text-foreground">
                  {t(key)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* bottom tech marquee */}
      <div className="marquee-mask relative z-10 border-t border-border bg-surface/40 py-4 backdrop-blur-sm">
        <div className="marquee-track gap-3">
          {[...marquee, ...marquee].map((m, i) => (
            <span
              key={i}
              className="mono-label whitespace-nowrap rounded-full border border-border px-4 py-1.5 text-muted-foreground"
            >
              {m}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
