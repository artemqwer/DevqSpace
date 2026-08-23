import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/site/Navbar";
import { MobileNav } from "@/components/site/MobileNav";
import OrderForm from "@/components/order/OrderForm";
import { getProductBySlug } from "@/lib/store";
import { localizeProduct } from "@/lib/products";
import { getLocale, getTranslations } from "next-intl/server";
import { tgGetBotUsername } from "@/lib/telegram";
import { nowPaymentsEnabled } from "@/lib/nowpayments";
import { jarEnabled, usdToUah } from "@/lib/monojar";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return {
    title: product ? `Замовлення · ${product.title}` : "Замовлення",
  };
}

export default async function OrderPage({ params }: Props) {
  const { slug } = await params;
  const raw = await getProductBySlug(slug);
  if (!raw) notFound();

  const jarOn = jarEnabled();
  const [jarAmountUah, botUsername, locale] = await Promise.all([
    jarOn ? usdToUah(raw.price) : Promise.resolve(0),
    tgGetBotUsername(),
    getLocale(),
  ]);
  const product = localizeProduct(raw, locale);
  const to = await getTranslations("order");

  return (
    <div className="min-h-screen bg-background">
      <div className="grid-bg grid-fade pointer-events-none fixed inset-0 z-0" aria-hidden />
      <Navbar />
      <main className="relative mx-auto max-w-6xl px-4 pb-28 pt-24 md:px-8 md:pb-24 md:pt-32">
        <nav className="mono-label mb-6 flex items-center gap-2 text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">
            home
          </Link>
          <span>/</span>
          <Link href="/catalog" className="transition-colors hover:text-foreground">
            catalog
          </Link>
          <span>/</span>
          <Link
            href={`/catalog/${product.slug}`}
            className="truncate transition-colors hover:text-foreground"
          >
            {product.slug}
          </Link>
          <span>/</span>
          <span className="text-foreground/70">order</span>
        </nav>

        <div className="mb-6 flex flex-col gap-2 md:mb-10">
          <span className="mono-label text-neon-blue">{to("eyebrow")}</span>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-5xl">
            {to("headA")} <span className="text-gradient">{to("headB")}</span>
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            {to("sub")}
          </p>
        </div>

        <OrderForm
          product={product}
          cryptoEnabled={nowPaymentsEnabled()}
          jarEnabled={jarOn}
          jarAmountUah={jarAmountUah}
          botUsername={botUsername}
        />
      </main>
      <MobileNav />
    </div>
  );
}
