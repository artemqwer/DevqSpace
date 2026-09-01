import Link from "next/link";
import {
  TelegramLogo,
  Browsers,
  DeviceMobile,
  Robot,
  Cube,
  Stack,
  ArrowUpRight,
} from "@phosphor-icons/react/dist/ssr";
import type { IconProps } from "@phosphor-icons/react";
import type { ComponentType } from "react";
import { useTranslations } from "next-intl";
import { CATEGORIES, type CategoryId } from "@/lib/products";

// Реальні категорії → декоративна React-іконка
const iconByCategory: Record<CategoryId, ComponentType<IconProps>> = {
  "telegram-bots": TelegramLogo,
  web: Browsers,
  mobile: DeviceMobile,
  automation: Robot,
  web3: Cube,
  templates: Stack,
};

// Порожні напрями не показуємо: клік по такій картці веде в порожній
// каталог і читається як «сайт занедбали».
export function Categories({ available }: { available: CategoryId[] }) {
  const t = useTranslations("categories");
  const tc = useTranslations("cat");
  const shown = CATEGORIES.filter((c) => available.includes(c.id));
  return (
    <section id="categories" className="relative py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-col gap-3">
          <span className="mono-label text-neon-blue">{t("eyebrow")}</span>
          <h2 className="text-balance font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {t("title")}
          </h2>
          <p className="max-w-xl text-pretty leading-relaxed text-muted-foreground">
            {t("subtitle", { count: shown.length })}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((cat) => {
            const Icon = iconByCategory[cat.id] ?? Stack;
            return (
              <Link
                key={cat.id}
                href={`/catalog?cat=${cat.id}`}
                className="grad-border group relative flex flex-col gap-4 rounded-2xl border border-border bg-surface/40 p-6 transition-colors hover:bg-surface-2/60"
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-xl border border-border bg-surface-2 text-neon-blue transition-colors group-hover:text-neon-purple">
                    <Icon weight="duotone" className="h-6 w-6" />
                  </span>
                  <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">
                    {tc(`${cat.id}.label`)}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {tc(`${cat.id}.desc`)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
