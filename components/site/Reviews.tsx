import { getTranslations } from "next-intl/server";
import { Star, SealCheck } from "@phosphor-icons/react/dist/ssr";
import { getPublishedReviews } from "@/lib/store";
import { ReviewForm } from "./ReviewForm";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          weight={n <= rating ? "fill" : "regular"}
          className={`h-3.5 w-3.5 ${n <= rating ? "text-neon-blue" : "text-muted-foreground"}`}
        />
      ))}
    </span>
  );
}

export async function Reviews({ productSlug }: { productSlug: string }) {
  const [t, reviews] = await Promise.all([
    getTranslations("reviews"),
    getPublishedReviews(productSlug),
  ]);

  const fmt = (ts: number) =>
    new Date(ts).toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  return (
    <section className="mt-10 md:mt-16">
      <h2 className="mb-4 font-display text-base font-bold text-foreground md:text-xl">
        {t("title")}
        {reviews.length > 0 && (
          <span className="ml-2 text-muted-foreground">({reviews.length})</span>
        )}
      </h2>

      {reviews.length === 0 ? (
        <p className="mb-4 text-sm text-muted-foreground">{t("none")}</p>
      ) : (
        <div className="mb-6 space-y-3">
          {reviews.map((r) => (
            <article
              key={r.id}
              className="rounded-2xl border border-border bg-surface/40 p-4 md:p-5"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-sm font-semibold text-foreground">
                  {r.authorName}
                </span>
                <Stars rating={r.rating} />
                {r.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-neon-green/30 bg-neon-green/10 px-2 py-0.5 text-[10px] font-mono text-neon-green">
                    <SealCheck weight="fill" className="h-3 w-3" />
                    {t("verified")}
                  </span>
                )}
                <span className="ml-auto mono-label text-muted-foreground">
                  {fmt(r.createdAt)}
                </span>
              </div>

              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {r.text}
              </p>

              {r.reply && (
                <div className="mt-3 rounded-xl border-l-2 border-neon-blue/50 bg-surface-2/40 px-4 py-3">
                  <div className="mono-label text-neon-blue">
                    {t("sellerReply")}
                  </div>
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {r.reply.text}
                  </p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      <details className="group">
        <summary className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface-2/40 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-neon-blue/50">
          <Star weight="fill" className="h-4 w-4 text-neon-blue" />
          {t("leave")}
        </summary>
        <div className="mt-3">
          <ReviewForm productSlug={productSlug} />
        </div>
      </details>
    </section>
  );
}
