import Link from "next/link";
import { Star, SealCheck } from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";
import { type Product } from "@/lib/products";
import { ProductCover } from "./ProductCover";

export function ProductCard({ product }: { product: Product }) {
  const t = useTranslations("top");
  const tc = useTranslations("cat");
  return (
    <article className="grad-border group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface/40 transition-colors hover:bg-surface-2/50">
      <Link
        href={`/catalog/${product.slug}`}
        className="relative block h-40 overflow-hidden"
      >
        <ProductCover
          product={product}
          className="h-full w-full transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 z-10 rounded-full border border-white/15 bg-black/55 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-white backdrop-blur-md">
            {product.badge}
          </span>
        )}
        {product.demoUrl && (
          <span className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full border border-neon-green/40 bg-black/60 px-2 py-1 text-[0.62rem] font-semibold text-neon-green backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-neon-green shadow-[0_0_6px_rgba(0,255,136,0.9)] animate-pulse" />
            Live
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2">
          <span className="mono-label text-muted-foreground">
            {tc(`${product.category}.label`)}
          </span>
          <SealCheck weight="fill" className="h-3.5 w-3.5 text-neon-green" />
        </div>

        <h3 className="mt-2 font-display text-base font-bold leading-snug text-foreground">
          <Link href={`/catalog/${product.slug}`} className="transition-colors hover:text-neon-blue">
            {product.title}
          </Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {product.tagline}
        </p>

        {/* Нуль означає «показувати нічого»: рейтингу без відгуків не існує,
            а «0 продано» на новому магазині відлякує сильніше, ніж мовчання.
            Замість цифр — чесне «Новинка». */}
        <div className="mt-3 flex items-center gap-3 text-xs">
          {product.ratingCount > 0 && (
            <span className="inline-flex items-center gap-1 text-foreground">
              <Star weight="fill" className="h-3.5 w-3.5 text-neon-blue" />{" "}
              {product.rating}
            </span>
          )}
          {product.sold > 0 ? (
            <span className="text-muted-foreground">
              {product.sold}+ {t("sold")}
            </span>
          ) : (
            product.ratingCount === 0 && (
              <span className="text-muted-foreground">{t("fresh")}</span>
            )
          )}
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border pt-4">
          <div className="font-display text-lg font-bold text-foreground">
            ${product.price}
          </div>
          <div className="ml-auto flex items-center gap-2">
            {product.demoUrl && (
              <Link
                href={product.demoUrl}
                className="rounded-lg border border-neon-green/40 bg-neon-green/10 px-3 py-2 text-xs font-semibold text-neon-green transition-colors hover:bg-neon-green/20"
              >
                Demo
              </Link>
            )}
            <Link
              href={`/order/${product.slug}`}
              className="rounded-lg border border-border-strong bg-surface-2 px-3.5 py-2 text-xs font-semibold text-foreground transition-colors group-hover:border-neon-blue/50 group-hover:text-neon-blue"
            >
              {t("buy")}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
