"use client";

import Link from "next/link";
import { House, Storefront, SquaresFour, Wrench } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

const items = [
  { key: "home", href: "/", icon: House },
  { key: "catalog", href: "/catalog", icon: Storefront },
  { key: "categories", href: "/categories", icon: SquaresFour },
  { key: "custom", href: "/custom", icon: Wrench },
] as const;

export function MobileNav() {
  const t = useTranslations("mobile");
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/90 backdrop-blur-xl md:hidden"
      aria-label="Menu"
    >
      <ul className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {items.map(({ key, href, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Icon className="h-5 w-5" />
              <span className="text-[0.65rem] font-medium">{t(key)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
