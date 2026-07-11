"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReseedButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const reseed = async () => {
    if (
      !confirm(
        "Скинути каталог до стандартного набору? Усі поточні товари (в т.ч. додані вручну) будуть замінені.",
      )
    )
      return;
    setBusy(true);
    const res = await fetch("/api/admin/products/reseed", { method: "POST" });
    const data = (await res.json()) as { ok: boolean; count?: number };
    setBusy(false);
    if (data.ok) {
      alert(`Каталог оновлено: ${data.count} товарів`);
      router.refresh();
    } else {
      alert("Не вдалося оновити каталог");
    }
  };

  return (
    <button
      onClick={reseed}
      disabled={busy}
      className="shrink-0 flex items-center gap-2 bg-surface2 border border-white/10 text-gray-400 hover:text-white text-xs font-mono px-3 py-2.5 rounded-lg transition-colors disabled:opacity-50"
      title="Скинути каталог до стандартного набору"
    >
      {busy ? (
        <i className="ph-bold ph-circle-notch animate-spin" />
      ) : (
        <i className="ph-bold ph-arrows-clockwise" />
      )}
      Пересіяти
    </button>
  );
}
