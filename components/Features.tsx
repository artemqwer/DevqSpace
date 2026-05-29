const FEATURES = [
  {
    icon: "ph-file-zip",
    color: "text-neon-blue",
    border: "hover:border-neon-blue/30",
    accentBg: "bg-neon-blue",
    title: "Миттєва доставка",
    text: "Після оплати ви одразу отримуєте архів з вихідним кодом та інвайт на приватний репозиторій.",
  },
  {
    icon: "ph-headset",
    color: "text-neon-purple",
    border: "hover:border-neon-purple/30",
    accentBg: "bg-neon-purple",
    title: "Саппорт від команди",
    text: "Допомагаємо з налаштуванням, відповідаємо в Telegram і фіксимо баги до 24 годин — від 3 місяців до 1 року.",
  },
  {
    icon: "ph-arrows-clockwise",
    color: "text-neon-green",
    border: "hover:border-neon-green/30",
    accentBg: "bg-neon-green",
    title: "Безкоштовні апдейти",
    text: "Усі мінорні оновлення, бібліотеки та виправлення помилок — у вартості продукту назавжди.",
  },
];

export default function Features() {
  return (
    <section className="py-12 md:py-20 bg-black relative border-y border-white/5">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-6 md:mb-12">
          <div className="text-[10px] md:text-xs font-mono text-neon-blue tracking-widest uppercase mb-2">
            // Що ви отримаєте
          </div>
          <h2 className="text-2xl md:text-4xl font-display font-bold text-white">
            Не просто код
          </h2>
        </div>

        {/* Mobile: stack with left accent bar */}
        <div className="md:hidden space-y-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="relative glass p-5 pl-6 border border-white/5 rounded-xl overflow-hidden"
            >
              <span
                className={`absolute left-0 top-0 bottom-0 w-1 ${f.accentBg} opacity-80`}
              />
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-surface2 border border-white/10 flex items-center justify-center">
                  <i className={`ph ${f.icon} text-2xl ${f.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-display font-bold text-white mb-1">
                    {f.title}
                  </h3>
                  <p className="text-xs text-gray-500 font-mono leading-relaxed">
                    {f.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid grid-cols-3 gap-8">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={`glass p-8 border border-white/5 rounded-xl text-left transition-colors ${f.border}`}
            >
              <i className={`ph ${f.icon} text-4xl ${f.color} mb-4`} />
              <h3 className="text-xl font-display font-bold text-white mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-gray-500 font-mono">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
