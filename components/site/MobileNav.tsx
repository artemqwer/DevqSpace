"use client";

import Link from "next/link";
import { House, Storefront, SquaresFour, Wrench } from "@phosphor-icons/react";

const items = [
  { label: "Головна", href: "/", icon: House },
  { label: "Каталог", href: "/catalog", icon: Storefront },
  { label: "Категорії", href: "/categories", icon: SquaresFour },
  { label: "Кастом", href: "/custom", icon: Wrench },
];

export function MobileNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/90 backdrop-blur-xl md:hidden"
      aria-label="Мобільна навігація"
    >
      <ul className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {items.map(({ label, href, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Icon className="h-5 w-5" />
              <span className="text-[0.65rem] font-medium">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
