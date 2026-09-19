import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/store";
import { PRODUCTS } from "@/lib/products";
import { CyberDashDemo } from "@/components/demos/CyberDashDemo";
import { SaasKitDemo } from "@/components/demos/SaasKitDemo";
import { CryptoLandingDemo } from "@/components/demos/CryptoLandingDemo";
import { EcommerceDemo } from "@/components/demos/EcommerceDemo";
import { PortfolioDemo } from "@/components/demos/PortfolioDemo";
import { AgencyDemo } from "@/components/demos/AgencyDemo";
import { CrmDemo } from "@/components/demos/CrmDemo";
import { LandingBuilderDemo } from "@/components/demos/LandingBuilderDemo";
import { BotConstructorDemo } from "@/components/demos/BotConstructorDemo";
import { EmailPackDemo } from "@/components/demos/EmailPackDemo";
import { SolanaSniperDemo } from "@/components/demos/SolanaSniperDemo";
import { TokenPresaleDemo } from "@/components/demos/TokenPresaleDemo";
import { DexSwapDemo } from "@/components/demos/DexSwapDemo";

interface DemoViewProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return PRODUCTS.map((p) => ({
    slug: p.slug,
  }));
}

export default async function DemoViewPage({ params }: DemoViewProps) {
  const { slug } = await params;
  const product =
    (await getProductBySlug(slug)) || PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  const renderContent = () => {
    switch (product.slug) {
      case "cyberdash-admin":
      case "dashboard-ui-kit":
        return <CyberDashDemo />;
      case "saas-landing-kit":
        return <SaasKitDemo />;
      case "crypto-landing":
        return <CryptoLandingDemo />;
      case "ecommerce-template":
        return <EcommerceDemo />;
      case "portfolio-pro":
        return <PortfolioDemo />;
      case "agency-template":
        return <AgencyDemo />;
      case "mini-crm-agency":
        return <CrmDemo product={product} />;
      case "landing-builder":
        return <LandingBuilderDemo product={product} />;
      case "bot-constructor":
        return <BotConstructorDemo product={product} />;
      case "email-pack":
        return <EmailPackDemo />;
      case "solana-sniper":
        return <SolanaSniperDemo product={product} />;
      case "token-presale":
        return <TokenPresaleDemo product={product} />;
      case "dex-swap-ui":
        return <DexSwapDemo product={product} />;
      default:
        return (
          <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center text-slate-300 bg-[#06070a]">
            <div className="text-4xl mb-3">⚡</div>
            <h2 className="text-xl font-bold text-white mb-2">{product.title}</h2>
            <p className="text-xs text-slate-400 max-w-md">{product.description}</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#06070a] text-slate-100 antialiased">
      {renderContent()}
    </div>
  );
}
