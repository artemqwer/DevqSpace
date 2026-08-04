import Link from "next/link";
import { Star, SealCheck, Cube } from "@phosphor-icons/react/dist/ssr";
import { CATEGORIES, type Product, type Accent } from "@/lib/products";

const ACCENT_GRADIENT: Record<Accent, string> = {
  blue: "linear-gradient(135deg, #00f0ff33, #8a2be233)",
  purple: "linear-gradient(135deg, #8a2be233, #00f0ff26)",
  pink: "linear-gradient(135deg, #ff007f26, #8a2be233)",
  green: "linear-gradient(135deg, #00ff6626, #00f0ff33)",
};

function categoryLabel(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function ProductCard({ product }: { product: Product }) {
  const bg = product.image
    ? undefined
    : ACCENT_GRADIENT[product.accent] ?? ACCENT_GRADIENT.blue;

  return (
    <article className="grad-border group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface/40 transition-colors hover:bg-surface-2/50">
      <Link
        href={`/catalog/${product.slug}`}
        className="relative block h-36 overflow-hidden"
        style={{ background: bg }}
      >
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <Cube
              weight="duotone"
              className="h-12 w-12 text-foreground/70 transition-transform duration-500 group-hover:scale-110"
            />
          </div>
        )}
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full border border-neon-blue/40 bg-background/70 px-2.5 py-1 text-[0.7rem] font-semibold text-neon-blue backdrop-blur">
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
          <Link href={`/catalog/${product.slug}`} className="hover:text-neon-blue transition-colors">
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
