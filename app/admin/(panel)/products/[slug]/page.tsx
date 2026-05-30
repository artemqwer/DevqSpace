import Link from "next/link";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { getProductBySlug } from "@/lib/store";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function EditProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1 text-xs font-mono text-gray-500 hover:text-white transition-colors"
      >
        <i className="ph-bold ph-arrow-left" /> до товарів
      </Link>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] md:text-xs font-mono text-neon-blue tracking-widest uppercase mb-1">
            // EDIT
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
            {product.title}
          </h1>
        </div>
        <Link
          href={`/catalog/${product.slug}`}
          target="_blank"
          className="shrink-0 flex items-center gap-1.5 text-xs font-mono text-gray-400 hover:text-neon-blue transition-colors"
        >
          <i className="ph ph-arrow-square-out" /> на сайті
        </Link>
      </div>
      <ProductForm mode="edit" product={product} />
    </div>
  );
}
