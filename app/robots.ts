import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/storefront/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/events",
        "/customers",
        "/products",
        "/quotes",
        "/logistica",
        "/seguimientos",
        "/reportes",
        "/intranet",
        "/sign-in",
        "/sign-up",
        "/account-setup",
        "/pending-approval",
        "/access-denied",
        "/auth",
        "/debug",
        "/api/",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
