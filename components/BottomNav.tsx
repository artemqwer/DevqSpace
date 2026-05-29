"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = {
  id: string;
  label: string;
  href: string;
  icon: string;
  iconActive: string;
  match: (path: string) => boolean;
};

const TABS: Tab[] = [
  {
    id: "home",
    label: "Home",
    href: "/",
    icon: "ph-house",
    iconActive: "ph-fill ph-house",
    match: (p) => p === "/",
  },
  {
    id: "catalog",
    label: "Каталог",
    href: "/catalog",
    icon: "ph-storefront",
    iconActive: "ph-fill ph-storefront",
    match: (p) => p.startsWith("/catalog"),
  },
  {
    id: "custom",
    label: "Кастом",
    href: "/custom",
    icon: "ph-wrench",
    iconActive: "ph-fill ph-wrench",
    match: (p) => p.startsWith("/custom"),
  },
  {
    id: "contact",
    label: "Контакт",
    href: "https://t.me/",
    icon: "ph-paper-plane-tilt",
    iconActive: "ph-fill ph-paper-plane-tilt",
    match: () => false,
  },
];

export default function BottomNav() {
  const pathname = usePathname() ?? "/";

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 glass border-t border-white/10"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)" }}
    >
      <div className="flex justify-around items-center pt-2 pb-1">
        {TABS.map((t) => {
          const isActive = t.match(pathname);
          const Wrapper = t.href.startsWith("http") ? "a" : Link;
          const wrapperProps = t.href.startsWith("http")
            ? { href: t.href, target: "_blank", rel: "noreferrer" }
            : { href: t.href };

          return (
            <Wrapper
              key={t.id}
              {...(wrapperProps as { href: string })}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 group relative"
            >
              <i
                className={`text-xl transition-colors ${
                  isActive
                    ? `${t.iconActive} text-neon-blue`
                    : `ph ${t.icon} text-gray-500 group-hover:text-gray-300`
                }`}
              />
              <span
                className={`text-[10px] font-mono uppercase tracking-wider transition-colors ${
                  isActive ? "text-neon-blue" : "text-gray-500"
                }`}
              >
                {t.label}
              </span>
              {isActive && (
                <span className="absolute -top-1 w-1 h-1 rounded-full bg-neon-blue shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
              )}
            </Wrapper>
          );
        })}
      </div>
    </nav>
  );
}
