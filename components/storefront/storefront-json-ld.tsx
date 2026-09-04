import { CHUMES_STOREFRONT, hasWhatsAppNumber } from "@/lib/storefront/company";
import { STOREFRONT_LOGO } from "@/lib/storefront/media";
import { getSiteUrl, STOREFRONT_SEO } from "@/lib/storefront/site";

function toE164(phone: string): string | undefined {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("506") && digits.length >= 11) {
    return `+${digits}`;
  }
  if (digits.length >= 8) {
    return `+506${digits.slice(-8)}`;
  }
  return undefined;
}

export function StorefrontJsonLd() {
  const siteUrl = getSiteUrl();
  const sameAs = [CHUMES_STOREFRONT.instagram, CHUMES_STOREFRONT.facebook].filter(
    Boolean,
  );

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: CHUMES_STOREFRONT.wordmark,
    alternateName: CHUMES_STOREFRONT.name,
    description: STOREFRONT_SEO.description,
    url: siteUrl,
    image: `${siteUrl}${STOREFRONT_LOGO.src}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Gran Área Metropolitana",
      addressCountry: "CR",
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: CHUMES_STOREFRONT.coverage,
    },
  };

  if (hasWhatsAppNumber()) {
    data.telephone = toE164(CHUMES_STOREFRONT.phone);
  }

  if (sameAs.length > 0) {
    data.sameAs = sameAs;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
