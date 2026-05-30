import Link from "next/link";
import {
  PRODUCTS,
  ACCENT_TEXT,
  ACCENT_BORDER,
  type Product,
} from "@/lib/products";
import ProductThumb from "@/components/ProductThumb";

const HOME_PRODUCTS = PRODUCTS.slice(0, 4);

export default function Products() {
  return (
    <section className="py-12 md:py-24 relative">
      <div className="glow-orb bg-neon-pink w-96 h-96 top-1/2 left-1/4 -translate-y-1/2 mix-blend-screen hidden md:block" />

      <div className="max-w-7xl mx-auto md:px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-end mb-6 md:mb-12 gap-3 px-4 md:px-0">
          <div>
            <h2 className="text-2xl md:text-4xl font-display font-bold text-white mb-1 md:mb-2">
              Наші продукти
            </h2>
            <p className="text-gray-400 font-mono text-[11px] md:text-sm">
              Готові рішення з підтримкою
            </p>
          </div>

          <div className="md:flex space-x-1 bg-surface2 p-1 rounded border border-white/10 hidden">
            <button className="px-4 py-1.5 rounded bg-white/10 text-white text-xs font-mono">
              Усі
            </button>
            <button className="px-4 py-1.5 rounded text-gray-400 hover:text-white text-xs font-mono transition-colors">
              Bots
            </button>
            <button className="px-4 py-1.5 rounded text-gray-400 hover:text-white text-xs font-mono transition-colors">
              Web
            </button>
            <button className="px-4 py-1.5 rounded text-gray-400 hover:text-white text-xs font-mono transition-colors">
              Mobile
            </button>
          </div>

          <Link
            href="/catalog"
            className="md:hidden text-neon-blue font-mono text-[11px] flex items-center hover:text-white transition-colors group shrink-0"
          >
            [ Каталог ]
            <i className="ph-bold ph-caret-right ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Mobile: 2x2 grid */}
        <div className="md:hidden grid grid-cols-2 gap-3 px-4">
          {HOME_PRODUCTS.map((p) => (
            <MobileProductCard key={p.slug} product={p} />
          ))}
        </div>

        <div className="md:hidden mt-6 px-4">
          <Link
            href="/catalog"
            className="w-full flex items-center justify-center gap-2 bg-surface2 border border-white/10 text-white font-mono text-xs py-3 rounded-xl hover:border-neon-blue/50 transition-colors"
          >
            [ Весь_каталог ]
            <i className="ph-bold ph-arrow-right" />
          </Link>
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {HOME_PRODUCTS.map((p) => (
            <Link
              key={p.slug}
              href={`/catalog/${p.slug}`}
              className="neon-card rounded-xl overflow-hidden flex flex-col bg-surface group"
            >
              <div className="relative h-44 overflow-hidden border-b border-white/5">
                <ProductThumb
                  product={p}
                  className="absolute inset-0 group-hover:scale-105 transition-transform duration-500"
                  iconClassName="text-6xl"
                />

                <div className="absolute top-3 left-3 z-20">
                  <span
                    className={`bg-black/80 backdrop-blur text-[10px] font-mono px-2 py-1 rounded border ${ACCENT_TEXT[p.accent]} ${ACCENT_BORDER[p.accent]}`}
                  >
                    {p.badge}
                  </span>
                </div>
              </div>
              <div className="p-5 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-display font-bold text-white leading-tight line-clamp-2 mb-2">
                    {p.title}
                  </h3>
                  <p className="text-xs text-gray-500 font-mono line-clamp-2 mb-3">
                    {p.tagline}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {p.stack.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="text-[10px] font-mono px-2 py-0.5 bg-surface2 border border-white/10 rounded text-gray-400"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3 text-xs font-mono text-gray-400">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <i className="ph-fill ph-star" /> {p.rating}{" "}
                      <span className="text-gray-600">({p.ratingCount})</span>
                    </div>
                    <span className="flex items-center gap-1">
                      <i className="ph ph-package" /> {p.sold} продано
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-neon-green">
                      <i className="ph-fill ph-shield-check" />
                      <span className="truncate">{p.warranty}</span>
                    </div>
                    <div className="text-lg font-display font-bold shrink-0 ml-2 text-white">
                      ${p.price}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="hidden md:block mt-16 text-center">
          <Link
            href="/catalog"
            className="inline-flex px-8 py-3 bg-transparent border border-white/20 text-white font-mono text-sm hover:border-neon-blue hover:text-neon-blue transition-all group items-center justify-center gap-2"
          >
            [ Весь_каталог ]{" "}
            <i className="ph-bold ph-arrow-right group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function MobileProductCard({ product: p }: { product: Product }) {
  return (
    <Link
      href={`/catalog/${p.slug}`}
      className="rounded-2xl overflow-hidden bg-surface border border-white/10 flex flex-col"
    >
      <ProductThumb
        product={p}
        className="aspect-[4/3] border-b border-white/5"
        iconClassName="text-4xl"
      />
      <div className="p-3 flex-grow flex flex-col justify-between">
        <div>
          <span
            className={`inline-block text-[9px] font-mono px-1.5 py-0.5 rounded border bg-black/40 mb-1.5 ${ACCENT_TEXT[p.accent]} ${ACCENT_BORDER[p.accent]}`}
          >
            {p.badge}
          </span>
          <h3 className="text-sm font-display font-bold text-white leading-tight line-clamp-2 mb-1">
            {p.title}
          </h3>
        </div>
        <div className="flex items-center justify-between pt-2 mt-1 border-t border-white/5">
          <span className="flex items-center gap-1 text-[10px] font-mono text-yellow-500">
            <i className="ph-fill ph-star" /> {p.rating}
          </span>
          <span className="text-sm font-display font-bold text-white">
            ${p.price}
          </span>
        </div>
      </div>
    </Link>
  );
}
