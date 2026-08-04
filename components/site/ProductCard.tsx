import Link from "next/link";
import { Star, SealCheck } from "@phosphor-icons/react/dist/ssr";
import { CATEGORIES, type Product } from "@/lib/products";
import { ProductCover } from "./ProductCover";

function categoryLabel(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="grad-border group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface/40 transition-colors hover:bg-surface-2/50">
      <Link
        href={`/catalog/${product.slug}`}
        className="relative block h-40 overflow-hidden"
      >
        <ProductCover
          product={product}
          className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 z-10 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[0.7rem] font-semibold text-white backdrop-blur">
            {product.badge}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2">
          <span className="mono-label text-muted-foreground">
            {categoryLabel(product.category)}
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

        <div className="mt-3 flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1 text-foreground">
            <Star weight="fill" className="h-3.5 w-3.5 text-neon-blue" /> {product.rating}
          </span>
          <span className="text-muted-foreground">{product.sold} продано</span>
        </div>

        <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
          <div className="font-display text-lg font-bold text-foreground">
            ${product.price}
          </div>
          <Link
            href={`/order/${product.slug}`}
            className="rounded-lg border border-border-strong bg-surface-2 px-3.5 py-2 text-xs font-semibold text-foreground transition-colors group-hover:border-neon-blue/50 group-hover:text-neon-blue"
          >
            Купити
          </Link>
        </div>
      </div>
    </article>
  );
}
