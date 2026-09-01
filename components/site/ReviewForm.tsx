"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Star } from "@phosphor-icons/react";

const INPUT =
  "w-full rounded-lg border border-border bg-surface-2 px-4 py-3 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-neon-blue/50 focus:outline-none";

export function ReviewForm({
  productSlug,
  token,
}: {
  productSlug: string;
  token?: string;
}) {
  const t = useTranslations("reviews");
  const router = useRouter();
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<null | boolean>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSlug, token, authorName, rating, text, company }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string; verified?: boolean };
      if (!data.ok) {
        setError(data.error ?? "Не вдалося надіслати");
        return;
      }
      setDone(Boolean(data.verified));
      router.refresh();
    } catch {
      setError("Немає зв'язку. Спробуйте ще раз.");
    } finally {
      setSending(false);
    }
  };

  if (done !== null) {
    return (
      <div className="rounded-2xl border border-neon-green/30 bg-neon-green/5 p-5 text-sm text-neon-green">
        {done ? t("sentPublished") : t("sentPending")}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-border bg-surface/40 p-5">
      <p className="text-xs text-muted-foreground">{t("formHint")}</p>

      <div className="flex items-center gap-3">
        <span className="mono-label text-muted-foreground">{t("yourRating")}</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n}`}
              className="transition-transform hover:scale-110"
            >
              <Star
                weight={n <= rating ? "fill" : "regular"}
                className={`h-6 w-6 ${n <= rating ? "text-neon-blue" : "text-muted-foreground"}`}
              />
            </button>
          ))}
        </div>
      </div>

      <input
        value={authorName}
        onChange={(e) => setAuthorName(e.target.value)}
        placeholder={t("yourName")}
        required
        className={INPUT}
      />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("yourText")}
        rows={4}
        required
        className={`${INPUT} resize-y`}
      />

      {/* honeypot — люди його не бачать */}
      <input
        type="text"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
      />

      {error && <p className="text-xs text-neon-pink">{error}</p>}

      <button
        type="submit"
        disabled={sending}
        className="rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-50"
      >
        {t("send")}
      </button>
    </form>
  );
}
