import Image from "next/image";
import Link from "next/link";
import { CartButton } from "@/components/storefront/cart-button";
import { CHUMES_STOREFRONT, getWhatsAppUrl } from "@/lib/storefront/company";

const navItems = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/cotizar", label: "Cotizar" },
  { href: "/contacto", label: "Contacto" },
];

export function StorefrontHeader() {
  const whatsappUrl = getWhatsAppUrl();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/chumes-logo.png"
            alt={CHUMES_STOREFRONT.name}
            width={40}
            height={40}
            className="rounded-full"
          />
          <div>
            <p className="text-sm font-semibold tracking-wide">Chumes</p>
            <p className="text-xs text-muted-foreground">Todo en Mantelería</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground transition hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-full border border-border px-4 py-2 text-sm transition hover:bg-muted sm:inline-flex"
            >
              WhatsApp
            </a>
          ) : null}
          <CartButton />
          <Link
            href="/intranet"
            className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            Intranet
          </Link>
        </div>
      </div>
    </header>
  );
}

export function StorefrontFooter() {
  return (
    <footer className="border-t border-border/70 bg-muted/30">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-medium">{CHUMES_STOREFRONT.name}</p>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            {CHUMES_STOREFRONT.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link href="/catalogo" className="hover:text-foreground">
            Catálogo
          </Link>
          <Link href="/cotizar" className="hover:text-foreground">
            Cotizar
          </Link>
          <Link href="/contacto" className="hover:text-foreground">
            Contacto
          </Link>
          <Link href="/intranet" className="hover:text-foreground">
            Intranet
          </Link>
        </div>
      </div>
    </footer>
  );
}
