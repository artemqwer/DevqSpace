"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react";

export function BackButton({
  fallbackHref = "/catalog",
  label = "Назад",
  className = "",
}: {
  fallbackHref?: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined") {
      const sameOrigin =
        document.referrer &&
        new URL(document.referrer, window.location.href).origin ===
          window.location.origin;
      if (sameOrigin && window.history.length > 1) {
        router.back();
        return;
      }
    }
    router.push(fallbackHref);
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`group inline-flex items-center gap-2 rounded-xl border border-border bg-surface-2/70 px-3.5 py-2 text-xs font-mono text-muted-foreground backdrop-blur-md transition-all hover:border-neon-blue/50 hover:bg-surface-2 hover:text-foreground active:scale-[0.97] ${className}`}
      aria-label={label}
    >
      <ArrowLeft className="h-4 w-4 text-neon-blue transition-transform group-hover:-translate-x-0.5" />
      <span>{label}</span>
    </button>
  );
}
