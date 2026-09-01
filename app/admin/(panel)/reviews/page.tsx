import { getAllReviews, getAllProducts } from "@/lib/store";
import ReviewsBoard from "@/components/admin/ReviewsBoard";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const [reviews, products] = await Promise.all([
    getAllReviews(),
    getAllProducts(),
  ]);

  const titleBySlug = Object.fromEntries(
    products.map((p) => [p.slug, p.title]),
  );
  const pending = reviews.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[10px] md:text-xs font-mono text-neon-blue tracking-widest uppercase mb-1">
          {"// REVIEWS"}
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
          Відгуки{" "}
          {pending > 0 && (
            <span className="text-yellow-400 text-lg">
              ({pending} чекає модерації)
            </span>
          )}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Відгуки за посиланням з листа публікуються одразу — покупку вже
          підтверджено видачею. З відкритої форми на сайті — тільки після вашої
          перевірки.
        </p>
      </div>

      <ReviewsBoard reviews={reviews} titleBySlug={titleBySlug} />
    </div>
  );
}
