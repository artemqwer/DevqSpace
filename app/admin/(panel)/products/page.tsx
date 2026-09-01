import Link from "next/link";
import { getAllProducts } from "@/lib/store";
import ProductsList from "@/components/admin/ProductsList";
import ReseedButton from "@/components/admin/ReseedButton";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getAllProducts();
  const sorted = [...products].sort((a, b) =>
    a.category === b.category
      ? a.title.localeCompare(b.title)
      : a.category.localeCompare(b.category),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-[10px] md:text-xs font-mono text-neon-blue tracking-widest uppercase mb-1">
            {"// PRODUCTS"}
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
            Товари{" "}
            <span className="text-gray-500 text-lg">({products.length})</span>
          </h1>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <ReseedButton />
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 bg-neon-blue text-black text-xs md:text-sm font-display font-bold px-4 py-2.5 rounded-lg active:scale-[0.98] transition-transform"
          >
            <i className="ph-bold ph-plus" /> Додати
          </Link>
        </div>
      </div>

      <ProductsList products={sorted} />
    </div>
  );
}
