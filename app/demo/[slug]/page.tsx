import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/store";
import { PRODUCTS } from "@/lib/products";
import { DemoFrame } from "@/components/demos/DemoFrame";

interface DemoPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return PRODUCTS.map((p) => ({
    slug: p.slug,
  }));
}

export default async function DemoPage({ params }: DemoPageProps) {
  const { slug } = await params;
  const product = (await getProductBySlug(slug)) || PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  return <DemoFrame product={product} />;
}
