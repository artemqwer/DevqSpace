import type { Metadata } from "next";
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
import { Navbar } from "@/components/site/Navbar";
import { MobileNav } from "@/components/site/MobileNav";
import { CATEGORIES, type CategoryId } from "@/lib/products";
import { getAllProducts } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Категорії",
  description:
    "Готові цифрові продукти за напрямами: Telegram-боти, Web/SaaS, мобільні, автоматизація, Web3, шаблони.",
};

const iconByCategory: Record<CategoryId, ComponentType<IconProps>> = {
  "telegram-bots": TelegramLogo,
  web: Browsers,
  mobile: DeviceMobile,
  automation: Robot,
  web3: Cube,
  templates: Stack,
};

export default async function CategoriesPage() {
  const products = await getAllProducts();
  const countById = (id: CategoryId) =>
    products.filter((p) => p.category === id).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="grid-bg grid-fade pointer-events-none fixed inset-0 z-0" aria-hidden />
      <Navbar />
      <main className="relative mx-auto max-w-6xl px-4 pb-28 pt-24 md:px-8 md:pb-24 md:pt-32">
        <div className="mb-8 flex flex-col gap-4 md:mb-12">
          <span className="mono-label text-neon-blue">{"// категорії"}</span>
          <h1 className="text-balance font-display text-3xl font-bold leading-[1.05] tracking-tight text-foreground md:text-6xl">
            Обирайте <span className="text-gradient">напрям</span>
          </h1>
          <p className="max-w-2xl text-pretty leading-relaxed text-muted-foreground md:text-lg">
            {products.length} готових рішень у шести напрямах — від Telegram-ботів
            до Web3. Кожен продукт перевірено й задокументовано.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat) => {
            const Icon = iconByCategory[cat.id] ?? Stack;
            const count = countById(cat.id);
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
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-lg font-bold text-foreground">
                      {cat.label}
                    </h2>
                    <span className="mono-label rounded-full border border-border bg-surface-2 px-2 py-0.5 text-muted-foreground">
                      {count}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {cat.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
