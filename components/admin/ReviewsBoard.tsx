"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Review, ReviewStatus } from "@/lib/store";

const STATUS_LABEL: Record<ReviewStatus, string> = {
  pending: "На модерації",
  published: "Опубліковано",
  hidden: "Приховано",
};

const STATUS_CLS: Record<ReviewStatus, string> = {
  pending: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  published: "border-neon-green/30 bg-neon-green/10 text-neon-green",
  hidden: "border-white/10 bg-surface2 text-gray-500",
};

export default function ReviewsBoard({
  reviews,
  titleBySlug,
}: {
  reviews: Review[];
  titleBySlug: Record<string, string>;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [filter, setFilter] = useState<ReviewStatus | "all">(
    reviews.some((r) => r.status === "pending") ? "pending" : "all",
  );
  const [replyFor, setReplyFor] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const patch = async (id: string, data: Record<string, unknown>) => {
    setBusy(id);
    await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
    setBusy(null);
    setReplyFor(null);
    setReplyText("");
    router.refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Видалити відгук назавжди?")) return;
    setBusy(id);
    await fetch(`/api/admin/reviews?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    setBusy(null);
    router.refresh();
  };

  const counts = {
    all: reviews.length,
    pending: reviews.filter((r) => r.status === "pending").length,
    published: reviews.filter((r) => r.status === "published").length,
    hidden: reviews.filter((r) => r.status === "hidden").length,
  };

  const shown =
    filter === "all" ? reviews : reviews.filter((r) => r.status === filter);

  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-surface/50 p-10 text-center font-mono text-sm text-gray-500">
        Відгуків ще немає. Вони з&apos;являться після перших видач товару.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {(["pending", "published", "hidden", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3 py-1.5 font-mono text-xs transition-all ${
              filter === f
                ? "border-neon-blue bg-neon-blue text-black"
                : "border-white/10 bg-surface2 text-gray-400 hover:text-white"
            }`}
          >
            {f === "all" ? "Усі" : STATUS_LABEL[f]}{" "}
            <span className={filter === f ? "text-black/60" : "text-gray-600"}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {shown.map((r) => (
        <div
          key={r.id}
          className="rounded-xl border border-white/10 bg-surface/50 p-4 space-y-3"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-white">{r.authorName}</span>
            <span className="font-mono text-xs text-neon-blue">
              {"★".repeat(r.rating)}
              <span className="text-gray-700">{"★".repeat(5 - r.rating)}</span>
            </span>
            {r.verified && (
              <span className="rounded border border-neon-green/30 bg-neon-green/10 px-2 py-0.5 font-mono text-[10px] text-neon-green">
                купівля підтверджена
              </span>
            )}
            <span
              className={`rounded border px-2 py-0.5 font-mono text-[10px] ${STATUS_CLS[r.status]}`}
            >
              {STATUS_LABEL[r.status]}
            </span>
            <span className="ml-auto font-mono text-[11px] text-gray-600">
              {titleBySlug[r.productSlug] ?? r.productSlug} ·{" "}
              {new Date(r.createdAt).toLocaleDateString("uk-UA")}
            </span>
          </div>

          <p className="whitespace-pre-line text-sm leading-relaxed text-gray-300">
            {r.text}
          </p>

          {r.reply && (
            <div className="rounded-lg border-l-2 border-neon-blue/50 bg-surface2/60 px-3 py-2">
              <div className="font-mono text-[10px] uppercase text-neon-blue">
                ваша відповідь
              </div>
              <p className="mt-1 whitespace-pre-line text-sm text-gray-300">
                {r.reply.text}
              </p>
            </div>
          )}

          {replyFor === r.id ? (
            <div className="space-y-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={3}
                placeholder="Відповідь продавця — її побачать усі"
                className="w-full rounded-lg border border-white/10 bg-surface2 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-neon-blue/50 focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => patch(r.id, { reply: replyText })}
                  disabled={busy === r.id}
                  className="rounded-lg bg-neon-blue px-3 py-1.5 font-display text-xs font-bold text-black disabled:opacity-40"
                >
                  Зберегти
                </button>
                <button
                  onClick={() => setReplyFor(null)}
                  className="rounded-lg border border-white/10 px-3 py-1.5 font-mono text-xs text-gray-400"
                >
                  Скасувати
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {r.status !== "published" && (
                <button
                  onClick={() => patch(r.id, { status: "published" })}
                  disabled={busy === r.id}
                  className="rounded-lg border border-neon-green/30 bg-neon-green/10 px-3 py-1.5 font-mono text-xs text-neon-green disabled:opacity-40"
                >
                  Опублікувати
                </button>
              )}
              {r.status !== "hidden" && (
                <button
                  onClick={() => patch(r.id, { status: "hidden" })}
                  disabled={busy === r.id}
                  className="rounded-lg border border-white/10 bg-surface2 px-3 py-1.5 font-mono text-xs text-gray-400 disabled:opacity-40"
                >
                  Приховати
                </button>
              )}
              <button
                onClick={() => {
                  setReplyFor(r.id);
                  setReplyText(r.reply?.text ?? "");
                }}
                className="rounded-lg border border-white/10 bg-surface2 px-3 py-1.5 font-mono text-xs text-gray-400"
              >
                {r.reply ? "Змінити відповідь" : "Відповісти"}
              </button>
              <button
                onClick={() => remove(r.id)}
                disabled={busy === r.id}
                className="ml-auto rounded-lg border border-white/10 px-3 py-1.5 font-mono text-xs text-gray-500 hover:border-neon-pink/30 hover:text-neon-pink disabled:opacity-40"
              >
                Видалити
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
