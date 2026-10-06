"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type AnnouncementData = {
  enabled: boolean;
  text: string;
  mode: "static" | "marquee";
  bg: "neon-blue" | "gradient" | "neon-purple" | "neon-pink" | "surface";
  link?: string;
  linkText?: string;
};

export function HeaderAnnouncementBar() {
  const pathname = usePathname();
  const [closed, setClosed] = useState(false);
  const [data, setData] = useState<AnnouncementData | null>(null);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;

    fetch("/api/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => {
        if (res.ok && res.announcement?.enabled) {
          setData(res.announcement);
        } else {
          setData(null);
        }
      })
      .catch(() => {});
  }, [pathname]);

  // Не показувати банер в адмінці, якщо вимкнено або закрили вручну
  if (pathname?.startsWith("/admin") || !data?.enabled || closed) {
    return null;
  }

  const text = data.text;
  if (!text) return null;

  const bgClasses: Record<AnnouncementData["bg"], string> = {
    gradient:
      "bg-gradient-to-r from-neon-blue/20 via-neon-purple/20 to-neon-pink/20 border-b border-white/15 text-white shadow-[0_4px_20px_rgba(0,240,255,0.08)]",
    "neon-blue":
      "bg-neon-blue/15 border-b border-neon-blue/30 text-white shadow-[0_4px_20px_rgba(0,240,255,0.12)]",
    "neon-purple":
      "bg-neon-purple/15 border-b border-neon-purple/30 text-white shadow-[0_4px_20px_rgba(138,43,226,0.12)]",
    "neon-pink":
      "bg-neon-pink/15 border-b border-neon-pink/30 text-white shadow-[0_4px_20px_rgba(255,0,128,0.12)]",
    surface:
      "bg-surface2/90 border-b border-white/10 text-gray-200",
  };

  const isMarquee = data.mode === "marquee";
  const link = data.link;
  const linkText = data.linkText || "Детальніше →";

  return (
    <aside
      aria-label="Оголошення сайту"
      className={`relative z-[60] w-full text-xs font-mono py-2 px-3 backdrop-blur-md overflow-hidden transition-all ${
        bgClasses[data.bg || "gradient"]
      }`}
    >
      <div className="mx-auto flex items-center justify-between gap-4 max-w-7xl">
        {/* Content */}
        <div className="flex-1 min-w-0 overflow-hidden">
          {isMarquee ? (
            <div className="relative flex overflow-x-hidden">
              <div className="marquee-track hover:[animation-play-state:paused] whitespace-nowrap flex items-center gap-8 py-0.5">
                {[1, 2, 3, 4].map((i) => (
                  <span key={i} className="inline-flex items-center gap-3">
                    <span className="font-medium tracking-wide">{text}</span>
                    {link && (
                      <Link
                        href={link}
                        className="underline font-bold text-neon-blue hover:text-white transition-colors"
                      >
                        {linkText}
                      </Link>
                    )}
                    <span className="text-white/40">✦</span>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-center flex-wrap py-0.5">
              <span className="font-medium tracking-wide">{text}</span>
              {link && (
                <Link
                  href={link}
                  className="underline font-bold text-neon-blue hover:text-white transition-colors"
                >
                  {linkText}
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={() => setClosed(true)}
          className="shrink-0 w-5 h-5 rounded-md hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          title="Приховати оголошення"
          aria-label="Приховати оголошення"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
