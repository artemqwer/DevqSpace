import type { Metadata } from "next";
import { Navbar } from "@/components/site/Navbar";
import { MobileNav } from "@/components/site/MobileNav";
import CustomForm from "@/components/custom/CustomForm";

export const metadata: Metadata = {
  title: "Кастомна розробка | NEXUS",
  description:
    "Замовте кастомний Telegram-бот, веб-додаток або мобільний застосунок під вашу задачу.",
};

const BULLETS = [
  { icon: "ph-chats-circle", text: "Безкоштовний брифінг 30 хв" },
  { icon: "ph-money", text: "Фіксована вартість після ТЗ" },
  { icon: "ph-clock-countdown", text: "MVP за 2–4 тижні" },
  { icon: "ph-code", text: "Сорс-код і документація" },
  { icon: "ph-shield-check", text: "Гарантія саппорту 6–12 міс." },
];

export default function CustomPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="grid-bg grid-fade pointer-events-none fixed inset-0 z-0" aria-hidden />
      <Navbar />
      <main className="relative mx-auto max-w-6xl px-4 pb-28 pt-24 md:px-8 md:pb-24 md:pt-32">
        {/* Hero */}
        <div className="mb-10 flex flex-col gap-4 md:mb-14">
          <span className="mono-label text-neon-pink">{"// розробка під ключ"}</span>
          <h1 className="text-balance font-display text-3xl font-bold leading-[1.05] tracking-tight text-foreground md:text-6xl">
            Зробимо <span className="text-gradient">під ваш кейс</span>
          </h1>
          <p className="max-w-2xl text-pretty leading-relaxed text-muted-foreground md:text-lg">
            Telegram-боти, веб-додатки, мобільні застосунки, AI-рішення. Від
            ідеї до запуску за 2–4 тижні з гарантією та підтримкою.
          </p>
        </div>

        {/* Bullets */}
        <div className="mb-10 grid grid-cols-2 gap-2 md:mb-14 md:grid-cols-5 md:gap-3">
          {BULLETS.map((b) => (
            <div
              key={b.text}
              className="flex items-center gap-2 rounded-xl border border-border bg-surface-2/50 p-3 md:flex-col md:items-start md:gap-3 md:p-4"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-neon-blue/30 bg-neon-blue/10 md:h-10 md:w-10">
                <i className={`ph-bold ${b.icon} text-neon-blue`} />
              </span>
              <span className="text-xs font-medium text-foreground/90 md:text-sm">
                {b.text}
              </span>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="grad-border rounded-3xl border border-border bg-surface/30 p-5 backdrop-blur md:p-10">
          <CustomForm />
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
