import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1 text-xs font-mono text-gray-500 hover:text-white transition-colors"
      >
        <i className="ph-bold ph-arrow-left" /> до товарів
      </Link>
      <div>
        <div className="text-[10px] md:text-xs font-mono text-neon-blue tracking-widest uppercase mb-1">
          {"// NEW_PRODUCT"}
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
          Новий товар
        </h1>
      </div>
      <ProductForm mode="create" />
    </div>
  );
}
