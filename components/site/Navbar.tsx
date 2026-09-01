"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MagnifyingGlass, Globe, ArrowRight } from "@phosphor-icons/react";
import { useTranslations, useLocale } from "next-intl";
import { Wordmark } from "./Wordmark";

const navLinks = [
  { key: "catalog", href: "/catalog" },
  { key: "categories", href: "/categories" },
  { key: "cases", href: "/cases" },
  { key: "about", href: "/about" },
] as const;

function switchLocale(current: string) {
  const next = current === "en" ? "uk" : "en";
  document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; samesite=lax`;
  location.reload();
}

export function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname() ?? "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // lock body scroll + close on Escape while the mobile menu is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open
          ? "border-b border-border bg-background/80 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6"
        aria-label="Головна навігація"
      >
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="DevqSpace" className="h-12 w-auto" />
          <Wordmark className="text-lg" />
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {t(link.key)}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={() => switchLocale(locale)}
            className="grid h-9 min-w-9 place-items-center rounded-lg border border-border px-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
            aria-label="Switch language"
          >
            {locale === "en" ? "UK" : "EN"}
          </button>
          <Link
            href="/catalog"
            className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
            aria-label={t("search")}
          >
            <MagnifyingGlass className="h-4 w-4" />
          </Link>
          <Link
            href="/custom"
            className="rounded-lg bg-gradient-to-r from-neon-blue to-neon-purple px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {t("custom")}
          </Link>
        </div>

        {/* animated burger */}
        <button
          className={`relative grid h-10 w-10 place-items-center rounded-xl border transition-all duration-300 md:hidden ${
            open
              ? "border-neon-blue/40 text-neon-blue shadow-[0_0_22px_-6px_rgba(0,240,255,0.7)]"
              : "border-border text-foreground hover:border-border-strong"
          }`}
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Закрити меню" : "Відкрити меню"}
          aria-expanded={open}
        >
          <span className="relative block h-[14px] w-[20px]">
            <span
              className={`absolute left-0 h-[2px] w-full rounded-full bg-current transition-all duration-300 ${
                open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-current transition-all duration-300 ${
                open ? "w-0 opacity-0" : "w-full opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 h-[2px] w-full rounded-full bg-current transition-all duration-300 ${
                open ? "bottom-1/2 translate-y-1/2 -rotate-45" : "bottom-0"
              }`}
            />
          </span>
        </button>
      </nav>

      {/* mobile menu */}
      {open && (
        <>
          <button
            className="menu-overlay fixed inset-x-0 bottom-0 top-16 z-40 cursor-default bg-black/60 backdrop-blur-sm md:hidden"
            aria-label="Закрити меню"
            tabIndex={-1}
            onClick={() => setOpen(false)}
          />
          <div className="menu-panel absolute inset-x-0 top-full z-50 origin-top border-b border-border bg-background/95 backdrop-blur-xl md:hidden">
            <ul className="mx-auto flex max-w-7xl flex-col gap-1.5 px-4 py-5">
              {navLinks.map((link, i) => {
                const active = isActive(link.href);
                return (
                  <li
                    key={link.href}
                    className="menu-item"
                    style={{ animationDelay: `${0.05 + i * 0.05}s` }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`group relative flex items-center justify-between overflow-hidden rounded-xl border px-4 py-3.5 text-base font-medium transition-colors ${
                        active
                          ? "border-neon-blue/30 bg-surface-2 text-foreground"
                          : "border-transparent text-muted-foreground hover:border-border hover:bg-surface-2 hover:text-foreground"
                      }`}
                    >
                      {/* neon accent bar */}
                      <span
                        className={`absolute inset-y-2 left-0 w-[3px] rounded-full bg-gradient-to-b from-neon-blue to-neon-purple transition-all duration-300 ${
                          active ? "opacity-100" : "opacity-0 group-hover:opacity-70"
                        }`}
                      />
                      <span className="pl-2">{t(link.key)}</span>
                      <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                    </Link>
                  </li>
                );
              })}

              <li
                className="menu-item mt-1 flex items-center gap-1.5"
                style={{ animationDelay: `${0.05 + navLinks.length * 0.05}s` }}
              >
                <button
                  onClick={() => switchLocale(locale)}
                  className="flex flex-1 items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
                >
                  <Globe className="h-4 w-4" />
                  {locale === "en" ? "Українська" : "English"}
                </button>
                <Link
                  href="/catalog"
                  onClick={() => setOpen(false)}
                  aria-label={t("search")}
                  className="grid h-[46px] w-[46px] place-items-center rounded-xl border border-border text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
                >
                  <MagnifyingGlass className="h-4 w-4" />
                </Link>
              </li>

              <li
                className="menu-item mt-1"
                style={{ animationDelay: `${0.1 + navLinks.length * 0.05}s` }}
              >
                <Link
                  href="/custom"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple px-4 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_8px_30px_-12px_rgba(0,240,255,0.6)] transition-opacity hover:opacity-90"
                >
                  {t("custom")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </li>
            </ul>
          </div>
        </>
      )}
    </header>
  );
}
