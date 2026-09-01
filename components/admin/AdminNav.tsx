"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Дашборд", icon: "ph-chart-line-up", exact: true },
  { href: "/admin/orders", label: "Замовлення", icon: "ph-tray" },
  { href: "/admin/products", label: "Товари", icon: "ph-package" },
  { href: "/admin/content", label: "Тексти", icon: "ph-text-aa" },
];

export default function AdminNav({
  storageMode,
}: {
  storageMode: "redis" | "memory";
}) {
  const pathname = usePathname() ?? "";
  const router = useRouter();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-60 flex-col border-r border-white/10 bg-surface/60 backdrop-blur z-40">
        <Link href="/admin" className="flex items-center gap-2 px-5 h-16 border-b border-white/10">
          <i className="ph-fill ph-code text-neon-blue text-2xl" />
          <span className="font-display font-bold text-lg text-white">
            DevqSpace<span className="text-neon-blue">.</span>
          </span>
          <span className="text-[10px] font-mono text-gray-500 self-end mb-2">
            admin
          </span>
        </Link>

        <nav className="flex-1 p-3 space-y-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(l.href, l.exact)
                  ? "bg-neon-blue/10 text-neon-blue border border-neon-blue/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <i className={`ph ${l.icon} text-lg`} />
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-2">
          <div className="flex items-center gap-2 px-3 text-[10px] font-mono text-gray-500">
            <span
              className={`w-1.5 h-1.5 rounded-full ${storageMode === "redis" ? "bg-neon-green" : "bg-yellow-500"}`}
            />
            {storageMode === "redis" ? "Redis підключено" : "In-memory (dev)"}
          </div>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <i className="ph ph-arrow-square-out text-lg" />
            На сайт
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-neon-pink hover:bg-neon-pink/5 transition-colors"
          >
            <i className="ph ph-sign-out text-lg" />
            Вийти
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-40 glass border-b border-white/10 flex items-center justify-between px-4 h-14">
        <Link href="/admin" className="flex items-center gap-2">
          <i className="ph-fill ph-code text-neon-blue text-xl" />
          <span className="font-display font-bold text-white">
            DevqSpace<span className="text-neon-blue">.</span>
          </span>
          <span className="text-[9px] font-mono text-gray-500 self-end mb-1.5">
            admin
          </span>
        </Link>
        <button
          onClick={logout}
          className="text-gray-400 hover:text-neon-pink flex items-center gap-1 text-xs font-mono"
        >
          <i className="ph ph-sign-out text-lg" /> Вийти
        </button>
      </header>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-white/10"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 6px)" }}
      >
        <div className="flex justify-around items-center pt-2 pb-1">
          {LINKS.map((l) => {
            const active = isActive(l.href, l.exact);
            return (
              <Link
                key={l.href}
                href={l.href}
                className="flex flex-col items-center gap-0.5 px-4 py-1"
              >
                <i
                  className={`text-xl ${active ? "ph-fill text-neon-blue" : "ph text-gray-500"} ${l.icon}`}
                />
                <span
                  className={`text-[10px] font-mono ${active ? "text-neon-blue" : "text-gray-500"}`}
                >
                  {l.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
