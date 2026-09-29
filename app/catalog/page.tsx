import type { Metadata } from "next";
import { Navbar } from "@/components/site/Navbar";
import { MobileNav } from "@/components/site/MobileNav";
import { Footer } from "@/components/site/Footer";
import CatalogShell from "@/components/catalog/CatalogShell";
import { getPublicProducts } from "@/lib/store";
import { CATEGORIES, localizeProduct, type CategoryId } from "@/lib/products";
import { getLocale, getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("catalog")]);
  return {
    title: locale === "en" ? "Product Catalog | DevqSpace" : "Каталог продуктів | DevqSpace",
    description: t("sub", { count: 12 }),
  };
}

const VALID_CATS = new Set(CATEGORIES.map((c) => c.id));

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const [raw, sp, locale] = await Promise.all([
    getPublicProducts(),
    searchParams,
    getLocale(),
  ]);
  const products = raw.map((p) => localizeProduct(p, locale));
  const initialFilter =
    sp.cat && VALID_CATS.has(sp.cat as CategoryId)
      ? (sp.cat as CategoryId)
      : "all";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <CatalogShell products={products} initialFilter={initialFilter} />
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
