import Link from "next/link";
import { Storefront, Wrench, ArrowRight } from "@phosphor-icons/react/dist/ssr";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <div className="orb left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 bg-neon-purple opacity-25" aria-hidden />
      <div className="relative mx-auto max-w-5xl px-4 md:px-6">
        <div className="glass grad-border rounded-3xl p-8 text-center md:p-14">
          <span className="mono-label text-neon-blue">{"// готові почати?"}</span>
          <h2 className="mx-auto mt-4 max-w-2xl text-balance font-display text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Оберіть готове або створіть своє
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Запустіть продукт сьогодні з готового рішення або замовте
            індивідуальну розробку під ваші задачі.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Storefront weight="fill" className="h-4 w-4" /> Купити готове
            </Link>
            <Link
              href="/custom"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border-strong bg-surface-2/40 px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-neon-blue/50"
            >
              <Wrench weight="fill" className="h-4 w-4" /> Замовити під ключ <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
