import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import OrderForm from "@/components/order/OrderForm";
import { getProductBySlug } from "@/lib/store";
import { cryptoPayEnabled } from "@/lib/cryptopay";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return {
    title: product ? `Замовлення · ${product.title} | NEXUS` : "Замовлення",
  };
}

export default async function OrderPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <>
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="glow-orb bg-neon-blue w-96 h-96 top-0 left-0 -translate-x-1/2 -translate-y-1/2 animate-pulse-slow" />
      </div>
      <Navbar />
      <main className="pt-20 md:pt-32 pb-28 md:pb-24 px-4 md:px-8 max-w-6xl mx-auto">
        <nav className="flex items-center gap-2 text-xs font-mono text-gray-500 mb-6">
          <Link href="/" className="hover:text-white transition-colors">
            home
          </Link>
          <span>/</span>
          <Link href="/catalog" className="hover:text-white transition-colors">
            catalog
          </Link>
          <span>/</span>
          <Link
            href={`/catalog/${product.slug}`}
            className="hover:text-white transition-colors truncate"
          >
            {product.slug}
          </Link>
          <span>/</span>
          <span className="text-gray-300">order</span>
        </nav>

        <div className="mb-6 md:mb-10">
          <div className="text-[10px] md:text-xs font-mono text-neon-blue tracking-widest uppercase mb-2">
            // ORDER
          </div>
          <h1 className="text-2xl md:text-5xl font-display font-bold text-white">
            Залиште <span className="text-gradient">заявку</span>
          </h1>
          <p className="text-xs md:text-base text-gray-400 font-light mt-2">
            Зв'яжемося протягом 2 годин, виставимо рахунок, відправимо товар
            одразу після оплати.
          </p>
        </div>

        <OrderForm product={product} cryptoEnabled={cryptoPayEnabled()} />
      </main>
      <BottomNav />
    </>
  );
}
