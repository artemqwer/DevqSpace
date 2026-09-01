import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { after } from "next/server";
import Link from "next/link";
import {
  SealCheck,
  Star,
  Package,
  Truck,
  ShieldCheck,
  ArrowsClockwise,
  Code,
  ShoppingCartSimple,
  Play,
  Certificate,
  GitBranch,
  TelegramLogo,
  Check,
} from "@phosphor-icons/react/dist/ssr";
import { Navbar } from "@/components/site/Navbar";
import { MobileNav } from "@/components/site/MobileNav";
import { Footer } from "@/components/site/Footer";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductCover } from "@/components/site/ProductCover";
import { CATEGORIES, localizeProduct } from "@/lib/products";
import {
  getProductBySlug,
  getPublicProducts,
  trackProductView,
} from "@/lib/store";
import { getLocale, getTranslations } from "next-intl/server";
import { SupportTgLink } from "@/components/site/SupportTgLink";
import { Reviews } from "@/components/site/Reviews";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Продукт не знайдено" };
  return {
    title: `${product.title}`,
    description: product.tagline,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const raw = await getProductBySlug(slug);
  if (!raw) notFound();

  after(() => trackProductView(raw.slug));

  const locale = await getLocale();
  const t = await getTranslations("product");
  const tc = await getTranslations("cat");
  const product = localizeProduct(raw, locale);
  const category = CATEGORIES.find((c) => c.id === product.category);
  const all = await getPublicProducts();
  const related = all
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 3)
    .map((p) => localizeProduct(p, locale));

  return (
    <div className="min-h-screen bg-background">
      <div className="grid-bg grid-fade pointer-events-none fixed inset-0 z-0" aria-hidden />
      <Navbar />

      <main className="relative mx-auto max-w-7xl px-4 pb-40 pt-24 md:px-8 md:pb-24 md:pt-32">
        {/* Breadcrumbs */}
        <nav className="mono-label mb-5 flex items-center gap-2 overflow-x-auto text-muted-foreground">
          <Link href="/" className="shrink-0 transition-colors hover:text-foreground">
            home
          </Link>
          <span className="shrink-0">/</span>
          <Link href="/catalog" className="shrink-0 transition-colors hover:text-foreground">
            catalog
          </Link>
          <span className="shrink-0">/</span>
          <span className="truncate text-foreground/70">{product.slug}</span>
        </nav>

        <div className="grid grid-cols-1 gap-6 md:gap-10 lg:grid-cols-[1.2fr_1fr]">
          {/* Left — visual + description */}
          <div>
            <ProductCover
              product={product}
              size="hero"
              className="aspect-[4/3] rounded-2xl border border-border md:aspect-[16/10]"
            />

            {/* Badges */}
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-neon-blue/40 bg-background/70 px-2.5 py-1 text-[0.7rem] font-semibold text-neon-blue backdrop-blur">
                {product.badge}
              </span>
              {category && (
                <Link
                  href="/catalog"
                  className="flex items-center gap-1 rounded-full border border-border bg-surface-2 px-2.5 py-1 text-[0.7rem] text-muted-foreground transition-colors hover:text-foreground"
                >
                  <i className={`ph ${category.icon}`} />
                  {tc(`${category.id}.label`)}
                </Link>
              )}
              <span className="flex items-center gap-1 rounded-full border border-neon-green/30 bg-neon-green/10 px-2.5 py-1 text-[0.7rem] font-semibold text-neon-green">
                <SealCheck weight="fill" className="h-3.5 w-3.5" />
                {t("verified")}
              </span>
            </div>

            {/* Mobile title */}
            <div className="mt-5 lg:hidden">
              <h1 className="mb-1.5 font-display text-2xl font-bold leading-tight text-foreground">
                {product.title}
              </h1>
              <p className="text-sm text-muted-foreground">{product.tagline}</p>
              <div className="mono-label mt-3 flex items-center gap-4">
                {product.ratingCount > 0 && (
                  <span className="flex items-center gap-1 text-neon-blue">
                    <Star weight="fill" className="h-3.5 w-3.5" /> {product.rating}{" "}
                    <span className="text-muted-foreground">({product.ratingCount})</span>
                  </span>
                )}
                {product.sold > 0 && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Package className="h-3.5 w-3.5" /> {product.sold}+ {t("sold")}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <Section title={t("descTitle")}>
              <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                {product.description}
              </p>
            </Section>

            {/* Features */}
            <Section title={t("featuresTitle")} hasContent={product.features.length > 0}>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:gap-3">
                {product.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-foreground/90">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border border-neon-blue/30 bg-neon-blue/10 md:h-6 md:w-6">
                      <Check weight="bold" className="h-3 w-3 text-neon-blue" />
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </Section>

            {/* Stack */}
            <Section title={t("stackTitle")} hasContent={product.stack.length > 0}>
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                {product.stack.map((s) => (
                  <span
                    key={s}
                    className="mono-label rounded-md border border-border bg-surface-2 px-2.5 py-1.5 text-muted-foreground"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </Section>

            {/* What's included */}
            <Section title={t("includedTitle")} hasContent={product.whatsIncluded.length > 0}>
              <ul className="space-y-2">
                {product.whatsIncluded.map((w) => (
                  <li key={w} className="flex items-center gap-3 text-sm text-foreground/90">
                    <Package weight="fill" className="h-4 w-4 shrink-0 text-neon-blue" />
                    {w}
                  </li>
                ))}
              </ul>
            </Section>

            <Reviews productSlug={product.slug} />
          </div>

          {/* Right — desktop sticky purchase panel */}
          <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
            <div className="grad-border rounded-2xl border border-border bg-surface/50 p-6 backdrop-blur">
              <h1 className="mb-2 font-display text-2xl font-bold leading-tight text-foreground md:text-3xl">
                {product.title}
              </h1>
              <p className="mb-5 text-sm text-muted-foreground">{product.tagline}</p>

              <div className="mono-label mb-5 flex items-center gap-4">
                {product.ratingCount > 0 && (
                  <span className="flex items-center gap-1 text-neon-blue">
                    <Star weight="fill" className="h-3.5 w-3.5" /> {product.rating}{" "}
                    <span className="text-muted-foreground">({product.ratingCount})</span>
                  </span>
                )}
                {product.sold > 0 && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Package className="h-3.5 w-3.5" /> {product.sold}+ {t("sold")}
                  </span>
                )}
              </div>

              <div className="mb-6 flex items-baseline gap-3">
                <div className="font-display text-4xl font-bold text-foreground md:text-5xl">
                  ${product.price}
                </div>
                <div className="mono-label text-muted-foreground">{t("once")}</div>
              </div>

              <Link
                href={`/order/${product.slug}`}
                className="glow-strong mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple px-6 py-4 font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                <ShoppingCartSimple weight="bold" className="h-5 w-5" />
                {t("order")}
              </Link>

              {product.demoUrl && (
                <a
                  href={product.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-neon-green/40 bg-neon-green/10 px-6 py-3 font-semibold text-neon-green transition-colors hover:bg-neon-green/15"
                >
                  <Play weight="fill" className="h-5 w-5" />
                  {t("demo")}
                </a>
              )}

              <SupportTgLink
                label={t("askTg")}
                className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface-2/40 px-6 py-3 font-medium text-foreground transition-colors hover:border-neon-blue/50"
              >
                <TelegramLogo weight="fill" className="h-5 w-5" />
              </SupportTgLink>

              <div className="space-y-3 border-t border-border pt-5 text-sm">
                <InfoRow icon={<Truck />} label={t("delivery")} value={product.delivery} />
                <InfoRow
                  icon={<ShieldCheck />}
                  label={t("warranty")}
                  value={product.warranty}
                  accent
                />
                <InfoRow icon={<ArrowsClockwise />} label={t("updates")} value={t("updatesV")} />
                <InfoRow icon={<Code />} label={t("source")} value={t("sourceV")} />
                {product.license && (
                  <InfoRow
                    icon={<Certificate />}
                    label={t("license")}
                    value={product.license}
                  />
                )}
                {product.repoUrl && (
                  <InfoRow
                    icon={<GitBranch />}
                    label={t("source")}
                    value={t("repoIncluded")}
                  />
                )}
              </div>
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-xl border border-neon-green/20 bg-neon-green/5 p-4">
              <ShieldCheck weight="fill" className="h-6 w-6 shrink-0 text-neon-green" />
              <div className="text-xs leading-relaxed text-muted-foreground">
                <strong className="text-foreground">{t("safeTitle")}</strong> {t("safeText")}
              </div>
            </div>
          </aside>

          {/* Mobile details list */}
          <aside className="lg:hidden">
            <div className="mt-6 space-y-2.5 rounded-xl border border-border bg-surface/50 p-4 text-sm backdrop-blur">
              <InfoRow icon={<Truck />} label={t("delivery")} value={product.delivery} />
              <InfoRow
                icon={<ShieldCheck />}
                label={t("warranty")}
                value={product.warranty}
                accent
              />
              <InfoRow icon={<ArrowsClockwise />} label={t("updates")} value={t("updatesV")} />
              <InfoRow icon={<Code />} label={t("source")} value={t("sourceV")} />
            </div>
          </aside>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-12 md:mt-24">
            <h2 className="mb-4 font-display text-lg font-bold text-foreground md:mb-5 md:text-2xl">
              {t("related")}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Mobile sticky CTA bar */}
      <div
        className="fixed inset-x-0 bottom-16 z-40 px-3 pb-2 lg:hidden"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)" }}
      >
        <div className="glass flex items-center gap-2 rounded-2xl border border-border p-2 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]">
          <div className="flex-1 pl-2">
            <div className="mono-label text-muted-foreground">{t("price")}</div>
            <div className="font-display text-xl font-bold leading-none text-foreground">
              ${product.price}
            </div>
          </div>
          <Link
            href={`/order/${product.slug}`}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            <ShoppingCartSimple weight="bold" className="h-4 w-4" />
            {t("order")}
          </Link>
        </div>
      </div>

      <Footer />
      <MobileNav />
    </div>
  );
}

// hasContent — щоб порожній «Стек» не давав заголовок над пусткою:
// у товарів, доданих через адмінку, масив часто порожній.
function Section({
  title,
  children,
  hasContent = true,
}: {
  title: string;
  children: React.ReactNode;
  hasContent?: boolean;
}) {
  if (!hasContent) return null;
  return (
    <div className="mt-6 md:mt-10">
      <h2 className="mb-3 font-display text-base font-bold text-foreground md:mb-4 md:text-xl">
        {title}
      </h2>
      {children}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="mono-label flex items-center gap-2 text-muted-foreground [&>svg]:h-4 [&>svg]:w-4">
        {icon} {label}
      </span>
      <span className={`text-sm font-medium ${accent ? "text-neon-green" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  );
}
