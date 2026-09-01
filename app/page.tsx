import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { TrustBar } from "@/components/site/TrustBar";
import { Categories } from "@/components/site/Categories";
import { TopProducts } from "@/components/site/TopProducts";
import { Process } from "@/components/site/Process";
import { Cases } from "@/components/site/Cases";
import { Guarantee } from "@/components/site/Guarantee";
import { FinalCta } from "@/components/site/FinalCta";
import { Footer } from "@/components/site/Footer";
import { MobileNav } from "@/components/site/MobileNav";
import { getAllProducts, getSiteCounters } from "@/lib/store";
import { localizeProduct } from "@/lib/products";
import { getLocale } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const locale = await getLocale();
  const [all, counters] = await Promise.all([getAllProducts(), getSiteCounters()]);
  const top = [...all]
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 8)
    .map((p) => localizeProduct(p, locale));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero products={counters.products} clients={counters.clients} />
        <TrustBar />
        <Categories />
        <TopProducts products={top} />
        <Process />
        <Cases />
        <Guarantee />
        <FinalCta />
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
