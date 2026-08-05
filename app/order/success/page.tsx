import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/site/Navbar";
import { MobileNav } from "@/components/site/MobileNav";
import { getOrder } from "@/lib/store";
import { tgGetBotUsername } from "@/lib/telegram";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Заявку прийнято",
};

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string; o?: string }>;
}) {
  const sp = await searchParams;
  const order = sp.o ? await getOrder(sp.o) : null;
  const showTgConnect =
    order?.contactMethod === "telegram" && !order.tgChatId;
  const botUsername = showTgConnect ? await tgGetBotUsername() : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="orb left-1/2 top-1/3 h-[28rem] w-[28rem] -translate-x-1/2 bg-neon-green opacity-20" aria-hidden />
      </div>
      <Navbar />
      <main className="relative mx-auto max-w-3xl px-4 pb-28 pt-24 text-center md:px-8 md:pb-24 md:pt-32">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full border border-neon-green/30 bg-neon-green/10 md:mb-8 md:h-24 md:w-24">
          <i className="ph-fill ph-check text-4xl text-neon-green md:text-5xl" />
        </div>

        <span className="mono-label text-neon-green">{"// заявку отримано"}</span>
        <h1 className="mb-4 mt-2 font-display text-3xl font-bold text-foreground md:text-5xl">
          Заявку <span className="text-gradient">прийнято</span>
        </h1>
        <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-muted-foreground md:mb-10 md:text-lg">
          Ми отримали ваше замовлення. Зв’яжемося з вами у Telegram протягом 2
          годин у робочий час (10:00 – 22:00 за Києвом).
        </p>

        {showTgConnect && botUsername && sp.o && (
          <div className="mb-8 rounded-2xl border border-neon-blue/30 bg-neon-blue/5 p-5 text-left md:p-6">
            <div className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
              <i className="ph-fill ph-telegram-logo text-neon-blue" />
              Отримати файл у Telegram
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Щоб ми надіслали архів прямо в Telegram після оплати — підключіть
              бота (натисніть «Start»). Це прив’яже ваше замовлення.
            </p>
            <a
              href={`https://t.me/${botUsername}?start=ord_${sp.o}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              <i className="ph-fill ph-telegram-logo" /> Підключити Telegram
            </a>
          </div>
        )}

        <div className="mb-8 rounded-2xl border border-border bg-surface/50 p-5 text-left backdrop-blur md:mb-10 md:p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-sm font-bold text-foreground">
            <i className="ph-fill ph-clipboard-text text-neon-blue" />
            Що далі?
          </h2>
          <ol className="space-y-3">
            <Step n="01" title="Уточнюємо деталі" text="Якщо потрібно — задамо кілька питань про вашу задачу." />
            <Step n="02" title="Виставляємо рахунок" text="Отримаєте інвойс з реквізитами (картка / крипта)." />
            <Step n="03" title="Миттєва доставка" text="Після оплати — архів коду та інвайт на репозиторій." />
            <Step n="04" title="Саппорт і апдейти" text="Допомагаємо з налаштуванням, фіксимо баги, додаємо фічі." />
          </ol>
        </div>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/catalog"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-2/40 px-6 py-3 font-medium text-foreground transition-colors hover:border-neon-blue/50"
          >
            <i className="ph-bold ph-arrow-left" /> До каталогу
          </Link>
          <a
            href="https://t.me/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple px-6 py-3 font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            <i className="ph-fill ph-telegram-logo" /> Написати в Telegram
          </a>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <li className="flex gap-3">
      <span className="mono-label grid h-8 w-8 shrink-0 place-items-center rounded-md border border-neon-blue/30 bg-neon-blue/10 font-bold text-neon-blue">
        {n}
      </span>
      <div>
        <div className="font-display text-sm font-bold text-foreground">{title}</div>
        <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{text}</div>
      </div>
    </li>
  );
}
