import { ShieldCheck, Lock, Headset, ArrowClockwise } from "@phosphor-icons/react/dist/ssr";

const items = [
  { icon: ShieldCheck, title: "Гарантія 1 рік", text: "Виправляємо помилки та підтримуємо продукт протягом року після передачі." },
  { icon: Lock, title: "Безпечна оплата", text: "Оплата картою чи криптовалютою. Прозорі рахунки без прихованих комісій." },
  { icon: Headset, title: "Підтримка", text: "Допомога з розгортанням і налаштуванням, консультації після запуску." },
  { icon: ArrowClockwise, title: "Оновлення", text: "Безкоштовні оновлення готових продуктів у межах поточної версії." },
];

export function Guarantee() {
  return (
    <section id="about" className="border-y border-border bg-surface/40 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-col gap-3">
          <span className="mono-label text-neon-green">{"// гарантія та безпека"}</span>
          <h2 className="text-balance font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Купувати безпечно
          </h2>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-border bg-background/40 p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-neon-green/30 bg-neon-green/10 text-neon-green">
                <Icon weight="duotone" className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-base font-bold text-foreground">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
