"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { List, X, MagnifyingGlass, Lightning } from "@phosphor-icons/react";
import { Wordmark } from "./Wordmark";

const navLinks = [
  { label: "Каталог", href: "/catalog" },
  { label: "Категорії", href: "/categories" },
  { label: "Кейси", href: "/cases" },
  { label: "Про нас", href: "/about" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-b border-border bg-background/80 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6"
        aria-label="Головна навігація"
      >
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple">
            <Lightning weight="fill" className="h-4 w-4 text-primary-foreground" />
          </span>
          <Wordmark className="text-lg" />
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/catalog"
            className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
            aria-label="Пошук"
          >
            <MagnifyingGlass className="h-4 w-4" />
          </Link>
          <Link
            href="/custom"
            className="rounded-lg bg-gradient-to-r from-neon-blue to-neon-purple px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Замовити під ключ
          </Link>
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-lg border border-border text-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Закрити меню" : "Відкрити меню"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <List className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-border bg-background/95 backdrop-blur-xl md:hidden">
          <ul className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-3 text-sm text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="mt-2">
              <Link
                href="/custom"
                onClick={() => setOpen(false)}
                className="block rounded-lg bg-gradient-to-r from-neon-blue to-neon-purple px-3 py-3 text-center text-sm font-semibold text-primary-foreground"
              >
                Замовити під ключ
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
