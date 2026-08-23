import type { Metadata } from "next";
import { Navbar } from "@/components/site/Navbar";
import { MobileNav } from "@/components/site/MobileNav";
import CatalogShell from "@/components/catalog/CatalogShell";
import { getAllProducts } from "@/lib/store";
import { CATEGORIES, localizeProduct, type CategoryId } from "@/lib/products";
import { getLocale } from "next-intl/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Каталог продуктів",
  description:
    "Готові Telegram-боти, веб-додатки та мобільні застосунки. Купуй з миттєвою доставкою і саппортом.",
};

const VALID_CATS = new Set(CATEGORIES.map((c) => c.id));

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const [raw, sp, locale] = await Promise.all([
    getAllProducts(),
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
      <MobileNav />
    </div>
  );
}
