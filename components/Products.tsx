import Link from "next/link";
import {
  PRODUCTS,
  ACCENT_TEXT,
  ACCENT_BORDER,
  type Product,
} from "@/lib/products";
import ProductThumb from "@/components/ProductThumb";

const HOME_PRODUCTS = PRODUCTS.slice(0, 4);
const FEATURED = HOME_PRODUCTS[0];

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

        {/* Mobile: featured + carousel */}
        <div className="md:hidden space-y-4">
          <Link
            href={`/catalog/${FEATURED.slug}`}
            className="block mx-4 relative rounded-2xl overflow-hidden bg-surface border border-white/10"
          >
            <div className="relative h-44 overflow-hidden">
              <ProductThumb
                product={FEATURED}
                className="absolute inset-0"
                iconClassName="text-7xl"
              />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface to-transparent" />

              <div className="absolute top-3 left-3 flex gap-2">
                <span
                  className={`bg-black/80 backdrop-blur text-[10px] font-mono px-2 py-1 rounded border ${ACCENT_TEXT[FEATURED.accent]} ${ACCENT_BORDER[FEATURED.accent]}`}
                >
                  {FEATURED.badge}
                </span>
                <span className="bg-neon-pink/10 text-neon-pink border border-neon-pink/30 text-[10px] font-mono px-2 py-1 rounded">
                  ТОП
                </span>
              </div>
            </div>

            <div className="p-4 -mt-6 relative">
              <h3 className="text-base font-display font-bold text-white leading-tight mb-2">
                {FEATURED.title}
              </h3>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {FEATURED.stack.slice(0, 3).map((s) => (
                  <span
                    key={s}
                    className="text-[10px] font-mono px-2 py-0.5 bg-surface2 border border-white/10 rounded text-gray-400"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-3 mb-3 text-[11px] font-mono text-gray-400">
                <span className="flex items-center gap-1 text-yellow-500">
                  <i className="ph-fill ph-star" /> {FEATURED.rating}
                </span>
                <span className="flex items-center gap-1">
                  <i className="ph ph-package" /> {FEATURED.sold} продано
                </span>
              </div>
              <div className="flex items-center gap-1.5 mb-4 text-[10px] font-mono text-neon-green">
                <i className="ph-fill ph-shield-check" />
                {FEATURED.warranty}
              </div>
              <div className="flex items-center gap-3">
                <span className="flex-1 bg-neon-blue text-black font-display font-bold py-2.5 rounded-lg text-center text-sm">
                  Деталі · ${FEATURED.price}
                </span>
                <span
                  aria-hidden
                  className="w-11 h-11 rounded-lg bg-surface2 border border-white/10 flex items-center justify-center text-white"
                >
                  <i className="ph-bold ph-arrow-up-right" />
                </span>
              </div>
            </div>
          </Link>

          <div className="-mx-4 px-4 overflow-x-auto snap-x snap-mandatory custom-scrollbar">
            <div className="flex gap-3 pb-3">
              {HOME_PRODUCTS.slice(1).map((p) => (
                <MobileProductCard key={p.slug} product={p} />
              ))}
            </div>
          </div>
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
      className="snap-start shrink-0 w-[72%] rounded-2xl overflow-hidden bg-surface border border-white/10 block"
    >
      <div className="relative h-32 overflow-hidden">
        <ProductThumb
          product={p}
          className="absolute inset-0"
          iconClassName="text-5xl"
        />
        <div className="absolute top-2 left-2">
          <span
            className={`bg-black/80 backdrop-blur text-[9px] font-mono px-1.5 py-0.5 rounded border ${ACCENT_TEXT[p.accent]} ${ACCENT_BORDER[p.accent]}`}
          >
            {p.badge}
          </span>
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-display font-bold text-white leading-tight line-clamp-2 mb-2 min-h-[2.6rem]">
          {p.title}
        </h3>
        <div className="flex flex-wrap gap-1 mb-2">
          {p.stack.slice(0, 2).map((s) => (
            <span
              key={s}
              className="text-[9px] font-mono px-1.5 py-0.5 bg-surface2 border border-white/10 rounded text-gray-500"
            >
              {s}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 mb-2">
          <span className="flex items-center gap-1 text-yellow-500">
            <i className="ph-fill ph-star" /> {p.rating}
          </span>
          <span className="flex items-center gap-1">
            <i className="ph ph-package" /> {p.sold}
          </span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <span className="text-[10px] font-mono text-neon-green flex items-center gap-1">
            <i className="ph-fill ph-shield-check" /> Гарантія
          </span>
          <span className="text-sm font-display font-bold text-white">
            ${p.price}
          </span>
        </div>
      </div>
    </Link>
  );
}
