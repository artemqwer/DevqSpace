const BULLETS = [
  { icon: "ph-chats-circle", text: "Безкоштовний брифінг 30 хв" },
  { icon: "ph-clock-countdown", text: "MVP за 2–4 тижні" },
  { icon: "ph-code", text: "Сорс-код і документація" },
];

import Link from "next/link";

export default function CustomCTA() {
  return (
    <section id="custom" className="py-12 md:py-24 relative overflow-hidden">
      <div className="glow-orb bg-neon-purple w-[28rem] h-[28rem] top-1/2 right-0 -translate-y-1/2 translate-x-1/3 hidden md:block" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-surface via-surface2 to-surface">
          {/* Grid bg */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,240,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(138,43,226,0.05) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-neon-blue/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-neon-purple/20 blur-3xl" />

          <div className="relative p-6 sm:p-10 md:p-14 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-center">
            <div>
              <div className="inline-flex items-center border border-neon-pink/30 bg-neon-pink/10 rounded-full px-3 py-1 mb-4">
                <span className="text-neon-pink text-[10px] md:text-xs font-bold tracking-widest uppercase">
                  {"// CUSTOM_DEV"}
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-tight leading-[1.05] mb-4">
                Не знайшли{" "}
                <span className="text-gradient">потрібного</span>?
              </h2>
              <p className="text-sm md:text-base text-gray-400 font-light mb-6 md:mb-8 max-w-md">
                Зробимо під вашу задачу з нуля. Telegram-бот, веб-додаток або
                автоматизацію — з ТЗ, дедлайнами і фіксованою вартістю.
              </p>

              <ul className="space-y-3 mb-6 md:mb-8">
                {BULLETS.map((b) => (
                  <li
                    key={b.text}
                    className="flex items-center gap-3 text-sm md:text-base text-gray-300"
                  >
                    <span className="shrink-0 w-8 h-8 rounded-lg bg-neon-blue/10 border border-neon-blue/30 flex items-center justify-center">
                      <i className={`ph-bold ${b.icon} text-neon-blue`} />
                    </span>
                    {b.text}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/custom"
                  className="flex items-center justify-center gap-2 bg-neon-blue text-black font-display font-bold px-6 py-3.5 rounded-xl shadow-[0_10px_30px_-10px_rgba(0,240,255,0.5)] active:scale-[0.98] transition-transform"
                >
                  <i className="ph-bold ph-paper-plane-tilt text-lg" />
                  Заповнити бриф
                </Link>
                <a
                  href="https://t.me/"
                  className="flex items-center justify-center gap-2 bg-surface2 border border-white/10 text-white font-display font-medium px-6 py-3.5 rounded-xl hover:border-neon-blue/50 transition-colors"
                >
                  <i className="ph-fill ph-telegram-logo text-lg" />
                  Telegram
                </a>
              </div>
            </div>

            {/* Quick brief form */}
            <div className="relative">
              <div className="glass rounded-2xl border border-white/10 p-5 sm:p-6 shadow-[0_20px_60px_-20px_rgba(0,240,255,0.2)]">
                <div className="text-[10px] font-mono text-neon-green tracking-widest uppercase mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                  Швидкий брифінг
                </div>

                <div className="space-y-3">
                  <BriefRow label="Тип" value="Telegram-бот" />
                  <BriefRow label="Бюджет" value="$500 – $5,000" />
                  <BriefRow label="Дедлайн" value="2–4 тижні" />
                </div>

                <div className="mt-5 pt-5 border-t border-white/5">
                  <label className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block mb-2">
                    Опишіть задачу
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Що потрібно зробити, які інтеграції, дедлайни..."
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 font-mono focus:outline-none focus:border-neon-blue/50 resize-none"
                  />
                </div>

                <Link
                  href="/custom"
                  className="mt-4 w-full bg-gradient-to-r from-neon-blue to-neon-purple text-black font-display font-bold py-3 rounded-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                >
                  <i className="ph-bold ph-paper-plane-tilt" />
                  Відкрити повний бриф
                </Link>

                <p className="mt-3 text-[10px] font-mono text-gray-500 text-center">
                  Відповімо протягом 2 годин у робочий час
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BriefRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center font-mono text-sm">
      <span className="text-gray-500">{label}:</span>
      <span className="text-white">{value}</span>
    </div>
  );
}
