import { getTranslations } from "next-intl/server";
import { getSiteCounters } from "@/lib/store";

// Плитки показників на «Про нас». Продукти й клієнти — живі числа з
// каталогу й оплачених замовлень, округлені вниз до 5 («30+»). Досвід
// і швидкість відповіді — просто текст, його адмін править у «Текстах».

export async function AboutStats() {
  const [t, counters] = await Promise.all([
    getTranslations("about"),
    getSiteCounters(),
  ]);

  const tiles = [
    { value: `${counters.products}+`, label: t("stat1"), accent: "text-neon-blue", show: counters.products > 0 },
    { value: `${counters.clients}+`, label: t("stat2"), accent: "text-neon-purple", show: counters.clients > 0 },
    { value: t("stat3v"), label: t("stat3"), accent: "text-neon-green", show: true },
    { value: t("stat4v"), label: t("stat4"), accent: "text-neon-pink", show: true },
  ].filter((tile) => tile.show);

  return (
    <div className="mb-10 grid grid-cols-2 gap-3 md:mb-16 md:grid-cols-4 md:gap-4">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className="rounded-2xl border border-border bg-surface/50 p-4 text-center md:p-5"
        >
          <div
            className={`font-display text-2xl font-bold leading-none md:text-4xl ${tile.accent}`}
          >
            {tile.value}
          </div>
          <div className="mono-label mt-2 text-muted-foreground">
            {tile.label}
          </div>
        </div>
      ))}
    </div>
  );
}
