import type { Metadata } from "next";
import { Navbar } from "@/components/site/Navbar";
import { MobileNav } from "@/components/site/MobileNav";
import CatalogShell from "@/components/catalog/CatalogShell";
import { getAllProducts } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Каталог продуктів | NEXUS",
  description:
    "Готові Telegram-боти, веб-додатки та мобільні застосунки. Купуй з миттєвою доставкою і саппортом.",
};

export default async function CatalogPage() {
  const products = await getAllProducts();
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <CatalogShell products={products} />
      </main>
      <MobileNav />
    </div>
  );
}
