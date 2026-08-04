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
import { getAllProducts } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const all = await getAllProducts();
  const top = [...all].sort((a, b) => b.sold - a.sold).slice(0, 8);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
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
