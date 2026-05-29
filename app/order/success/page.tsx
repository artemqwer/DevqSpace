import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Заявку прийнято | NEXUS",
};

export default function OrderSuccessPage() {
  return (
    <>
      <div className="glow-orb bg-neon-green w-[28rem] h-[28rem] top-1/3 left-1/2 -translate-x-1/2 animate-pulse-slow opacity-30" />
      <Navbar />
      <main className="pt-20 md:pt-32 pb-28 md:pb-24 px-4 md:px-8 max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-neon-green/10 border border-neon-green/30 mb-6 md:mb-8">
          <i className="ph-fill ph-check text-neon-green text-4xl md:text-5xl" />
        </div>

        <div className="text-[10px] md:text-xs font-mono text-neon-green tracking-widest uppercase mb-2">
          // ORDER_RECEIVED
        </div>
        <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
          Заявку <span className="text-gradient">прийнято</span>
        </h1>
        <p className="text-base md:text-lg text-gray-400 font-light mb-8 md:mb-10 max-w-xl mx-auto">
          Ми отримали ваше замовлення. Зв'яжемося з вами у Telegram протягом 2
          годин у робочий час (10:00 – 22:00 за Києвом).
        </p>

        <div className="rounded-2xl border border-white/10 bg-surface/50 backdrop-blur p-5 md:p-6 mb-8 md:mb-10 text-left">
          <h2 className="text-sm font-display font-bold text-white mb-4 flex items-center gap-2">
            <i className="ph-fill ph-clipboard-text text-neon-blue" />
            Що далі?
          </h2>
          <ol className="space-y-3">
            <Step
              n="01"
              title="Уточнюємо деталі"
              text="Якщо потрібно — задамо кілька питань про вашу задачу."
            />
            <Step
              n="02"
              title="Виставляємо рахунок"
              text="Отримаєте інвойс з реквізитами (картка / крипта)."
            />
            <Step
              n="03"
              title="Миттєва доставка"
              text="Після оплати — архів коду та інвайт на репозиторій."
            />
            <Step
              n="04"
              title="Саппорт і апдейти"
              text="Допомагаємо з налаштуванням, фіксимо баги, додаємо фічі."
            />
          </ol>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/catalog"
            className="inline-flex items-center justify-center gap-2 bg-surface2 border border-white/10 text-white font-display font-medium px-6 py-3 rounded-xl hover:border-neon-blue/50 transition-colors"
          >
            <i className="ph-bold ph-arrow-left" /> До каталогу
          </Link>
          <a
            href="https://t.me/"
            className="inline-flex items-center justify-center gap-2 bg-neon-blue text-black font-display font-bold px-6 py-3 rounded-xl shadow-[0_10px_30px_-10px_rgba(0,240,255,0.5)] active:scale-[0.98] transition-transform"
          >
            <i className="ph-fill ph-telegram-logo" /> Написати в Telegram
          </a>
        </div>
      </main>
      <BottomNav />
    </>
  );
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <li className="flex gap-3">
      <span className="shrink-0 w-8 h-8 rounded-md bg-neon-blue/10 border border-neon-blue/30 flex items-center justify-center text-[11px] font-mono text-neon-blue font-bold">
        {n}
      </span>
      <div>
        <div className="text-sm font-display font-bold text-white">{title}</div>
        <div className="text-xs text-gray-400 font-light mt-0.5">{text}</div>
      </div>
    </li>
  );
}
