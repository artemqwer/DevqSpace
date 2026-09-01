import { getTranslations } from "next-intl/server";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { MobileNav } from "@/components/site/MobileNav";
import { ReviewForm } from "@/components/site/ReviewForm";
import { getOrderByReviewToken, getProductBySlug } from "@/lib/store";

export const dynamic = "force-dynamic";

// Одноразове посилання з листа/Telegram після видачі товару. Відгук звідси
// публікується одразу — покупку вже підтверджено самим фактом видачі.
export default async function ReviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const t = await getTranslations("reviews");
  const order = await getOrderByReviewToken(token);
  const product = order?.productSlug
    ? await getProductBySlug(order.productSlug)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 pb-16 pt-24 md:px-6 md:pt-32">
        {!order || !product ? (
          <p className="rounded-2xl border border-neon-pink/30 bg-neon-pink/5 p-5 text-sm text-neon-pink">
            {t("tokenBad")}
          </p>
        ) : (
          <>
            <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
              {t("tokenTitle")}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{product.title}</p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {t("tokenSub")}
            </p>
            <div className="mt-6">
              <ReviewForm productSlug={product.slug} token={token} />
            </div>
          </>
        )}
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
