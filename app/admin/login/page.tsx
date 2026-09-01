"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) {
        setError(data.error || "Помилка входу");
        setLoading(false);
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Помилка мережі");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="glow-orb bg-neon-blue w-96 h-96 top-0 left-0 -translate-x-1/3 -translate-y-1/3 animate-pulse-slow" />
        <div className="glow-orb bg-neon-purple w-96 h-96 bottom-0 right-0 translate-x-1/3 translate-y-1/3 animate-pulse-slow" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <i className="ph-fill ph-code text-neon-blue text-3xl" />
          <span className="font-display font-bold text-2xl tracking-tighter text-white">
            DevqSpace<span className="text-neon-blue">.</span>
          </span>
          <span className="text-xs font-mono text-gray-500 self-end mb-1">
            admin
          </span>
        </div>

        <form
          onSubmit={submit}
          className="glass border border-white/10 rounded-2xl p-6 space-y-4"
        >
          <div className="text-[10px] font-mono text-neon-blue tracking-widest uppercase">
            {"// SECURE_LOGIN"}
          </div>
          <h1 className="text-xl font-display font-bold text-white">
            Вхід в адмінку
          </h1>

          <div className="relative">
            <i className="ph ph-lock-key absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              className="w-full pl-10 pr-4 py-3 bg-surface2 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-blue/50 transition-colors font-mono text-sm"
            />
          </div>

          {error && (
            <div className="text-sm text-neon-pink font-mono flex items-center gap-2">
              <i className="ph-fill ph-warning-circle" /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-neon-blue text-black font-display font-bold rounded-lg px-6 py-3 active:scale-[0.98] transition-transform disabled:opacity-60"
          >
            {loading ? (
              <i className="ph-bold ph-circle-notch animate-spin" />
            ) : (
              <i className="ph-bold ph-sign-in" />
            )}
            Увійти
          </button>
        </form>

        <p className="text-center text-[10px] font-mono text-gray-600 mt-4">
          Доступ лише для адміністратора
        </p>
      </div>
    </main>
  );
}
