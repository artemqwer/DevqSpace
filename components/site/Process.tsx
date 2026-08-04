import Link from "next/link";
import { ArrowRight, PaperPlaneTilt } from "@phosphor-icons/react/dist/ssr";

const processSteps = [
  { step: "01", title: "Заявка", description: "Ви залишаєте заявку з описом задачі та бажаним результатом." },
  { step: "02", title: "Обговорення", description: "Уточнюємо вимоги, пропонуємо рішення та фіксуємо обсяг робіт." },
  { step: "03", title: "Рахунок", description: "Погоджуємо бюджет і терміни, виставляємо прозорий рахунок." },
  { step: "04", title: "Розробка", description: "Розробляємо продукт з проміжними демо та звітами про прогрес." },
  { step: "05", title: "Доставка коду", description: "Передаємо повний сорс-код, документацію та гарантію на рік." },
];

export function Process() {
  return (
    <section id="order" className="relative overflow-hidden border-y border-border bg-surface/40 py-16 md:py-24">
      <div className="orb left-[-8%] bottom-[-10%] h-80 w-80 bg-neon-blue opacity-20" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col gap-4">
            <span className="mono-label text-neon-purple">{"// розробка під ключ"}</span>
            <h2 className="text-balance font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Замовляйте індивідуальний продукт
            </h2>
            <p className="max-w-md text-pretty leading-relaxed text-muted-foreground">
              Прозорий процес від заявки до передачі коду. Фіксований бюджет,
              чіткі етапи, повний сорс-код і гарантія на рік.
            </p>
            <Link
              href="/custom"
              className="mt-2 inline-flex w-fit items-center gap-2 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <PaperPlaneTilt weight="fill" className="h-4 w-4" /> Залишити заявку
            </Link>
          </div>

          <ol className="relative flex flex-col gap-3">
            {processSteps.map((step, i) => (
              <li
                key={step.step}
                className="grad-border group flex items-start gap-4 rounded-xl border border-border bg-background/40 p-4 transition-colors hover:bg-surface-2/50"
              >
                <span className="mono-label mt-0.5 shrink-0 rounded-md border border-border bg-surface-2 px-2 py-1 text-neon-blue">
                  {step.step}
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
                {i < processSteps.length - 1 && (
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
