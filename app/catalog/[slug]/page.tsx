import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import {
  PRODUCTS,
  CATEGORIES,
  getProduct,
  ACCENT_TEXT,
  ACCENT_BORDER,
  ACCENT_BG,
  ACCENT_BUTTON,
} from "@/lib/products";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Продукт не знайдено" };
  return {
    title: `${product.title} | NEXUS`,
    description: product.tagline,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const category = CATEGORIES.find((c) => c.id === product.category);
  const related = PRODUCTS.filter(
    (p) => p.category === product.category && p.slug !== product.slug,
  ).slice(0, 3);

  return (
    <>
      <div className="glow-orb bg-neon-blue w-96 h-96 top-0 left-0 -translate-x-1/2 -translate-y-1/2 animate-pulse-slow" />
      <Navbar />
      <main className="pt-24 md:pt-32 pb-20 md:pb-24 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-mono text-gray-500 mb-6">
          <Link href="/" className="hover:text-white transition-colors">
            home
          </Link>
          <span>/</span>
          <Link href="/catalog" className="hover:text-white transition-colors">
            catalog
          </Link>
          <span>/</span>
          <span className="text-gray-300 truncate">{product.slug}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 md:gap-10">
          {/* Left — visual + description */}
          <div>
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-surface aspect-[4/3] md:aspect-[16/10]">
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)`,
                }}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://placehold.co/1200x800/111827/${product.thumbColor}?text=${product.thumbText}`}
                alt={product.title}
                className="absolute inset-0 w-full h-full object-cover opacity-70 mix-blend-screen"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span
                  className={`bg-black/80 backdrop-blur text-[11px] font-mono px-2.5 py-1 rounded border ${ACCENT_TEXT[product.accent]} ${ACCENT_BORDER[product.accent]}`}
                >
                  {product.badge}
                </span>
                {category && (
                  <Link
                    href={`/catalog?cat=${category.id}`}
                    className="bg-black/80 backdrop-blur text-gray-300 hover:text-white text-[11px] font-mono px-2.5 py-1 rounded border border-white/10 transition-colors"
                  >
                    {category.label}
                  </Link>
                )}
              </div>
            </div>

            {/* Thumbnails (placeholders) */}
            <div className="grid grid-cols-4 gap-2 md:gap-3 mt-3 md:mt-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg overflow-hidden border border-white/10 bg-surface2 opacity-50 hover:opacity-100 transition-opacity"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://placehold.co/200x200/111827/${product.thumbColor}?text=${i}`}
                    alt={`preview ${i}`}
                    className="w-full h-full object-cover mix-blend-screen"
                  />
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="mt-8 md:mt-10">
              <h2 className="text-lg md:text-xl font-display font-bold text-white mb-3">
                Опис
              </h2>
              <p className="text-sm md:text-base text-gray-400 font-light leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Features */}
            <div className="mt-8 md:mt-10">
              <h2 className="text-lg md:text-xl font-display font-bold text-white mb-4">
                Що вміє
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-3 text-sm text-gray-300"
                  >
                    <span
                      className={`shrink-0 w-6 h-6 rounded-md ${ACCENT_BG[product.accent]} border ${ACCENT_BORDER[product.accent]} flex items-center justify-center mt-0.5`}
                    >
                      <i
                        className={`ph-bold ph-check ${ACCENT_TEXT[product.accent]} text-xs`}
                      />
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Stack */}
            <div className="mt-8 md:mt-10">
              <h2 className="text-lg md:text-xl font-display font-bold text-white mb-4">
                Стек
              </h2>
              <div className="flex flex-wrap gap-2">
                {product.stack.map((s) => (
                  <span
                    key={s}
                    className="text-xs font-mono px-3 py-1.5 bg-surface2 border border-white/10 rounded text-gray-300"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* What's included */}
            <div className="mt-8 md:mt-10">
              <h2 className="text-lg md:text-xl font-display font-bold text-white mb-4">
                Що ви отримаєте
              </h2>
              <ul className="space-y-2">
                {product.whatsIncluded.map((w) => (
                  <li
                    key={w}
                    className="flex items-center gap-3 text-sm text-gray-300"
                  >
                    <i className="ph-fill ph-package text-neon-blue" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right — sticky purchase panel */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-white/10 bg-surface/50 backdrop-blur p-5 md:p-6">
              <h1 className="text-2xl md:text-3xl font-display font-bold text-white leading-tight mb-2">
                {product.title}
              </h1>
              <p className="text-sm text-gray-400 mb-5">{product.tagline}</p>

              <div className="flex items-center gap-4 mb-5 text-xs font-mono">
                <span className="flex items-center gap-1 text-yellow-500">
                  <i className="ph-fill ph-star" />
                  {product.rating}{" "}
                  <span className="text-gray-600">({product.ratingCount})</span>
                </span>
                <span className="flex items-center gap-1 text-gray-400">
                  <i className="ph ph-package" /> {product.sold} продано
                </span>
              </div>

              <div className="flex items-baseline gap-3 mb-6">
                <div className="text-4xl md:text-5xl font-display font-bold text-white">
                  ${product.price}
                </div>
                <div className="text-xs font-mono text-gray-500">
                  одноразово
                </div>
              </div>

              <Link
                href={`/order/${product.slug}`}
                className={`w-full flex items-center justify-center gap-2 font-display font-bold rounded-xl px-6 py-4 active:scale-[0.98] transition-transform mb-3 ${ACCENT_BUTTON[product.accent]}`}
              >
                <i className="ph-bold ph-shopping-cart-simple" />
                Замовити
              </Link>

              <a
                href="https://t.me/"
                className="w-full flex items-center justify-center gap-2 bg-surface2 border border-white/10 text-white font-display font-medium rounded-xl px-6 py-3 hover:border-neon-blue/50 transition-colors mb-6"
              >
                <i className="ph-fill ph-telegram-logo" />
                Запитати в Telegram
              </a>

              <div className="space-y-3 pt-5 border-t border-white/5 text-sm">
                <InfoRow
                  icon="ph-truck"
                  label="Доставка"
                  value={product.delivery}
                />
                <InfoRow
                  icon="ph-shield-check"
                  label="Гарантія"
                  value={product.warranty}
                  accent={product.accent}
                />
                <InfoRow
                  icon="ph-arrows-clockwise"
                  label="Апдейти"
                  value="Безкоштовно"
                />
                <InfoRow
                  icon="ph-code"
                  label="Сорс-код"
                  value="Повний доступ"
                />
              </div>
            </div>

            {/* Trust */}
            <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-neon-green/5 border border-neon-green/20">
              <i className="ph-fill ph-shield-check text-neon-green text-2xl shrink-0" />
              <div className="text-xs text-gray-300 leading-relaxed">
                <strong className="text-white">Безпечно.</strong> Спочатку
                обговорюємо, виставляємо рахунок, потім оплата і миттєва
                доставка коду.
              </div>
            </div>
          </aside>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16 md:mt-24">
            <h2 className="text-xl md:text-2xl font-display font-bold text-white mb-5">
              Схожі продукти
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/catalog/${p.slug}`}
                  className="neon-card rounded-xl overflow-hidden flex bg-surface group"
                >
                  <div className="relative w-24 sm:w-32 shrink-0 bg-surface2 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://placehold.co/300x300/111827/${p.thumbColor}?text=${p.badge}`}
                      alt={p.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen"
                    />
                  </div>
                  <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                    <div>
                      <h3 className="text-sm font-display font-bold text-white leading-tight line-clamp-2 mb-1">
                        {p.title}
                      </h3>
                      <p className="text-[11px] text-gray-500 font-mono line-clamp-1">
                        {p.tagline}
                      </p>
                    </div>
                    <div
                      className={`text-sm font-display font-bold ${ACCENT_TEXT[p.accent]} mt-2`}
                    >
                      ${p.price}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}

function InfoRow({
  icon,
  label,
  value,
  accent,
}: {
  icon: string;
  label: string;
  value: string;
  accent?: "blue" | "purple" | "pink" | "green";
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-gray-500 font-mono text-xs">
        <i className={`ph ${icon}`} /> {label}
      </span>
      <span
        className={`font-medium ${accent ? ACCENT_TEXT[accent] : "text-white"}`}
      >
        {value}
      </span>
    </div>
  );
}
