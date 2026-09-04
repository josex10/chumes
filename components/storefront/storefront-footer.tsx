import Link from "next/link";
import { StorefrontLogo } from "@/components/storefront/storefront-logo";
import { WhatsAppButton } from "@/components/storefront/whatsapp-button";
import {
  CHUMES_STOREFRONT,
  getWhatsAppHref,
  hasWhatsAppNumber,
} from "@/lib/storefront/company";
import {
  STOREFRONT_CATEGORY_LINKS,
  STOREFRONT_FOOTER_LINKS,
} from "@/lib/storefront/nav";

export function StorefrontFooter() {
  const whatsappHref = getWhatsAppHref();

  return (
    <footer className="border-t border-arena/80 bg-ivory">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-16 md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr] md:px-6">
        <div className="max-w-sm">
          <StorefrontLogo compact />
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            {CHUMES_STOREFRONT.tagline} Equipo listo, a tiempo y con
            presentación para que vos te ocupés de disfrutar el evento.
          </p>
        </div>

        <div>
          <p className="font-heading text-sm tracking-[0.18em] text-brand uppercase">
            Chumes
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {STOREFRONT_FOOTER_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-muted-foreground transition hover:text-brand"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-heading text-sm tracking-[0.18em] text-brand uppercase">
            Categorías
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {STOREFRONT_CATEGORY_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-muted-foreground transition hover:text-brand"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-heading text-sm tracking-[0.18em] text-brand uppercase">
            Contacto
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            {CHUMES_STOREFRONT.coverage}
          </p>
          {CHUMES_STOREFRONT.phone ? (
            <p className="mt-2 text-sm text-charcoal">{CHUMES_STOREFRONT.phone}</p>
          ) : null}
          <div className="mt-5">
            <WhatsAppButton className="w-full sm:w-auto" />
          </div>
          <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
            {CHUMES_STOREFRONT.instagram ? (
              <li>
                <a
                  href={CHUMES_STOREFRONT.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-brand"
                >
                  Instagram
                </a>
              </li>
            ) : null}
            {CHUMES_STOREFRONT.facebook ? (
              <li>
                <a
                  href={CHUMES_STOREFRONT.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-brand"
                >
                  Facebook
                </a>
              </li>
            ) : null}
            <li>
              <a
                href={whatsappHref}
                target={hasWhatsAppNumber() ? "_blank" : undefined}
                rel={hasWhatsAppNumber() ? "noreferrer" : undefined}
                className="hover:text-brand"
              >
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-arena/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-5 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6">
          <p>
            © {new Date().getFullYear()} {CHUMES_STOREFRONT.wordmark}.{" "}
            {CHUMES_STOREFRONT.logoTagline}.
          </p>
          <Link href="/intranet" className="hover:text-brand">
            Intranet
          </Link>
        </div>
      </div>
    </footer>
  );
}
