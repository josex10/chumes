"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { CartButton } from "@/components/storefront/cart-button";
import { StorefrontLogo } from "@/components/storefront/storefront-logo";
import { WhatsAppButton } from "@/components/storefront/whatsapp-button";
import { STOREFRONT_NAV } from "@/lib/storefront/nav";
import { cn } from "@/lib/utils";

export function StorefrontHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-[background-color,border-color,box-shadow] duration-300",
        scrolled || menuOpen
          ? "border-arena/80 bg-ivory/95 shadow-[0_10px_30px_-24px_rgba(26,26,26,0.45)] backdrop-blur-md"
          : "border-transparent bg-ivory/80 backdrop-blur-sm",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 transition-[padding] duration-300 md:px-6",
          scrolled ? "py-2.5" : "py-4",
        )}
      >
        <StorefrontLogo compact={scrolled} />

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 lg:flex">
          {STOREFRONT_NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm tracking-wide transition-colors",
                  active
                    ? "text-brand"
                    : "text-muted-foreground hover:text-brand",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <WhatsAppButton
            compact
            className="lg:hidden"
            label="Cotizar por WhatsApp"
          />
          <div className="hidden sm:block">
            <CartButton />
          </div>
          <Link
            href="/cotizar"
            className="hidden rounded-full bg-brand px-5 py-2 text-sm text-ivory transition hover:bg-brand-deep sm:inline-flex"
          >
            Cotizar ahora
          </Link>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-full border border-arena text-brand lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="storefront-mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            <span className="sr-only">
              {menuOpen ? "Cerrar menú" : "Abrir menú"}
            </span>
          </button>
        </div>
      </div>

      <div
        id="storefront-mobile-nav"
        hidden={!menuOpen}
        className="border-t border-arena/80 bg-ivory lg:hidden"
      >
        <nav className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-5 py-6">
          {STOREFRONT_NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-2xl px-4 py-3 text-lg",
                  active ? "bg-mist text-brand" : "text-charcoal",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="mt-4 flex flex-col gap-3">
            <Link
              href="/cotizar"
              className="inline-flex h-12 items-center justify-center rounded-full bg-brand text-sm text-ivory"
            >
              Cotizar ahora
            </Link>
            <CartButton className="h-12 w-full justify-center" />
            <WhatsAppButton className="h-12 w-full" />
          </div>
        </nav>
      </div>
    </header>
  );
}
