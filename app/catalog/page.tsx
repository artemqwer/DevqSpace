import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import CatalogShell from "@/components/catalog/CatalogShell";

export const metadata: Metadata = {
  title: "Каталог продуктів | NEXUS",
  description:
    "Готові Telegram-боти, веб-додатки та мобільні застосунки. Купуй з миттєвою доставкою і саппортом.",
};

export default function CatalogPage() {
  return (
    <>
      <div className="glow-orb bg-neon-blue w-96 h-96 top-0 left-0 -translate-x-1/2 -translate-y-1/2 animate-pulse-slow" />
      <div
        className="glow-orb bg-neon-purple w-[28rem] h-[28rem] top-40 right-0 translate-x-1/3 animate-pulse-slow"
        style={{ animationDelay: "2s" }}
      />
      <Navbar />
      <main>
        <CatalogShell />
      </main>
      <BottomNav />
    </>
  );
}
