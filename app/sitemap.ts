import type { MetadataRoute } from "next";
import { getPublicProducts } from "@/lib/storefront/queries";
import { getSiteUrl } from "@/lib/storefront/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  let products: Awaited<ReturnType<typeof getPublicProducts>> = [];

  try {
    products = await getPublicProducts();
  } catch (error) {
    console.error("[sitemap]", error);
  }

  const staticPages = [
    { path: "/", changeFrequency: "weekly" as const, priority: 1 },
    { path: "/catalogo", changeFrequency: "weekly" as const, priority: 0.8 },
    { path: "/combos", changeFrequency: "weekly" as const, priority: 0.8 },
    { path: "/nosotros", changeFrequency: "monthly" as const, priority: 0.6 },
    { path: "/contacto", changeFrequency: "monthly" as const, priority: 0.6 },
    { path: "/cotizar", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/armar-mesa", changeFrequency: "monthly" as const, priority: 0.5 },
  ];

  const staticRoutes: MetadataRoute.Sitemap = staticPages.map((route) => ({
    url: route.path === "/" ? siteUrl : `${siteUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${siteUrl}/catalogo/${product.slug}`,
    lastModified: product.updated_at,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes];
}
