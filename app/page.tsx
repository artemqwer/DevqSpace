import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import Products from "@/components/Products";
import Features from "@/components/Features";
import CustomCTA from "@/components/CustomCTA";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";

export default function Home() {
  return (
    <>
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="glow-orb bg-neon-blue w-96 h-96 top-0 left-0 -translate-x-1/2 -translate-y-1/2 animate-pulse-slow" />
        <div
          className="glow-orb bg-neon-purple w-[30rem] h-[30rem] top-40 right-0 translate-x-1/3 animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <Navbar />
      <main>
        <Hero />
        <Categories />
        <Products />
        <Features />
        <CustomCTA />
      </main>
      <Footer />
      <BottomNav />
    </>
  );
}
