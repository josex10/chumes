import type { Metadata } from "next";
import { CartProvider } from "@/components/storefront/cart-provider";
import { StorefrontFooter } from "@/components/storefront/storefront-footer";
import { StorefrontHeader } from "@/components/storefront/storefront-header";
import { StorefrontJsonLd } from "@/components/storefront/storefront-json-ld";
import { WhatsAppFloatingButton } from "@/components/storefront/whatsapp-button";
import { STOREFRONT_SEO } from "@/lib/storefront/site";

export const metadata: Metadata = {
  title: {
    default: STOREFRONT_SEO.title,
    template: "%s | Chumes",
  },
  description: STOREFRONT_SEO.description,
};

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CartProvider>
      <div className="storefront flex min-h-full flex-col bg-ivory text-charcoal">
        <StorefrontJsonLd />
        <StorefrontHeader />
        <div className="flex-1">{children}</div>
        <StorefrontFooter />
        <WhatsAppFloatingButton />
      </div>
    </CartProvider>
  );
}
