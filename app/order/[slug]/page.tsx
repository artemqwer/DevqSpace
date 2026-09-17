import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/site/Navbar";
import { MobileNav } from "@/components/site/MobileNav";
import { Footer } from "@/components/site/Footer";
import OrderForm from "@/components/order/OrderForm";
import { getProductBySlug, getPaymentToggles } from "@/lib/store";
import { localizeProduct } from "@/lib/products";
import { getLocale, getTranslations } from "next-intl/server";
import { tgGetBotUsername } from "@/lib/telegram";
import { nowPaymentsEnabled } from "@/lib/nowpayments";
import { wayForPayEnabled } from "@/lib/wayforpay";
import { lemonEnabled } from "@/lib/lemonsqueezy";
import { paddleEnabled, paddleClientConfig } from "@/lib/paddle";
import { jarEnabled, usdToUah } from "@/lib/monojar";
import { BackButton } from "@/components/site/BackButton";

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

  // Метод показуємо, лише якщо він і має ключі (env), і ввімкнений в адмінці.
  const toggles = await getPaymentToggles();
  const jarOn = jarEnabled() && toggles.jar;
  const wfpOn = wayForPayEnabled() && toggles.wfp;
  const cryptoOn = nowPaymentsEnabled() && toggles.crypto;
  const lemonOn = lemonEnabled() && toggles.lemon;
  const paddleOn = paddleEnabled() && toggles.paddle;
  const [amountUah, botUsername, locale] = await Promise.all([
    jarOn || wfpOn ? usdToUah(raw.price) : Promise.resolve(0),
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
        {/* Navigation & Breadcrumbs */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <BackButton fallbackHref={`/catalog/${product.slug}`} label={to("back")} />
          <nav className="mono-label flex items-center gap-2 overflow-x-auto text-muted-foreground">
            <Link href="/" className="shrink-0 transition-colors hover:text-foreground">
              home
            </Link>
            <span className="shrink-0">/</span>
            <Link href="/catalog" className="shrink-0 transition-colors hover:text-foreground">
              catalog
            </Link>
            <span className="shrink-0">/</span>
            <Link
              href={`/catalog/${product.slug}`}
              className="shrink-0 truncate transition-colors hover:text-foreground"
            >
              {product.slug}
            </Link>
            <span className="shrink-0">/</span>
            <span className="shrink-0 text-foreground/70">order</span>
          </nav>
        </div>

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
          paddleEnabled={paddleOn}
          paddleConfig={paddleOn ? paddleClientConfig() : null}
          lemonEnabled={lemonOn}
          wfpEnabled={wfpOn}
          wfpAmountUah={amountUah}
          cryptoEnabled={cryptoOn}
          jarEnabled={jarOn}
          jarAmountUah={amountUah}
          botUsername={botUsername}
        />
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
