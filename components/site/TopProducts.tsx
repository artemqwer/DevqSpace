import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";
import type { Product } from "@/lib/products";
import { ProductCard } from "./ProductCard";

export function TopProducts({ products }: { products: Product[] }) {
  const t = useTranslations("top");
  return (
    <section id="catalog" className="relative py-16 md:py-24">
      <div className="orb right-[-6%] top-[30%] h-72 w-72 bg-neon-purple opacity-20" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-3">
            <span className="mono-label text-neon-blue">{t("eyebrow")}</span>
            <h2 className="text-balance font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {t("title")}
            </h2>
          </div>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-neon-blue transition-opacity hover:opacity-80"
          >
            {t("all")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
