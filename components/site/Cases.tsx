import { Quotes, TrendUp } from "@phosphor-icons/react/dist/ssr";

// TODO: замінити на реальні кейси й відгуки клієнтів.
const cases = [
  {
    title: "Telegram-екосистема для мережі кав’ярень",
    client: "CoffeeChain",
    category: "Telegram-боти",
    result: "+38% повторних замовлень за 3 місяці",
    gradient: "linear-gradient(135deg, #00f0ff33, #8a2be233)",
  },
  {
    title: "SaaS-платформа для управління складом",
    client: "WareFlow",
    category: "Web / SaaS",
    result: "Автоматизовано 70% рутинних операцій",
    gradient: "linear-gradient(135deg, #8a2be233, #ff007f26)",
  },
  {
    title: "Web3-платформа лояльності",
    client: "LoyalDAO",
    category: "Web3",
    result: "12 000+ активних власників токенів",
    gradient: "linear-gradient(135deg, #00ff6626, #00f0ff33)",
  },
];

const testimonials = [
  {
    name: "Олег Кравченко",
    role: "Засновник, CoffeeChain",
    text: "Команда DevqSpace зробила бота під ключ швидше за дедлайн. Отримали повний код і зрозумілу документацію. Рекомендую.",
  },
  {
    name: "Марія Левченко",
    role: "Product Manager, WareFlow",
    text: "Купили готовий дашборд і замовили доопрацювання. Все прозоро: рахунок, етапи, результат. Дуже задоволені.",
  },
  {
    name: "Дмитро Іваненко",
    role: "CTO, LoyalDAO",
    text: "Смарт-контракти пройшли аудит без критичних зауважень. Професійний підхід і чесна комунікація.",
  },
];

export function Cases() {
  return (
    <section id="cases" className="relative py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-col gap-3">
          <span className="mono-label text-neon-blue">{"// кейси"}</span>
          <h2 className="text-balance font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Результати, яким довіряють
          </h2>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {cases.map((c) => (
            <article
              key={c.title}
              className="grad-border group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface/40"
            >
              <div className="relative h-28" style={{ background: c.gradient }}>
                <span className="mono-label absolute left-4 top-4 rounded-md bg-background/60 px-2 py-1 text-foreground backdrop-blur">
                  {c.category}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-base font-bold leading-snug text-foreground">{c.title}</h3>
                <p className="mono-label mt-1 text-muted-foreground">{c.client}</p>
                <div className="mt-auto flex items-center gap-2 pt-4 text-sm font-medium text-neon-green">
                  <TrendUp weight="bold" className="h-4 w-4" /> {c.result}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="rounded-2xl border border-border bg-surface-2/40 p-5">
              <Quotes weight="fill" className="h-6 w-6 text-neon-purple" />
              <blockquote className="mt-3 text-sm leading-relaxed text-foreground/90">{t.text}</blockquote>
              <figcaption className="mt-4 border-t border-border pt-4">
                <div className="text-sm font-semibold text-foreground">{t.name}</div>
                <div className="mono-label text-muted-foreground">{t.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
