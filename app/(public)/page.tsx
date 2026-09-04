import { HomeCategories } from "@/components/storefront/home/home-categories";
import { HomeCombos } from "@/components/storefront/home/home-combos";
import { HomeCorporate } from "@/components/storefront/home/home-corporate";
import { HomeFinalCta } from "@/components/storefront/home/home-final-cta";
import { HomeHero } from "@/components/storefront/home/home-hero";
import { HomeInspiration } from "@/components/storefront/home/home-inspiration";
import { HomeLinens } from "@/components/storefront/home/home-linens";
import { HomeOccasions } from "@/components/storefront/home/home-occasions";
import { HomeProcess } from "@/components/storefront/home/home-process";
import { HomeTiffany } from "@/components/storefront/home/home-tiffany";
import { HomeTrust } from "@/components/storefront/home/home-trust";
import { PRODUCT_CATEGORY, PRODUCT_TYPE } from "@/lib/products/constants";
import { TIFFANY_SLUGS } from "@/lib/storefront/home-content";
import { getPublicProducts } from "@/lib/storefront/queries";

export default async function PublicHomePage() {
  const products = await getPublicProducts();

  const combos = products.filter(
    (product) => product.product_types.code === PRODUCT_TYPE.BUNDLE,
  );
  const linens = products.filter(
    (product) => product.product_categories.code === PRODUCT_CATEGORY.TABLE_LINENS,
  );
  const tiffanySlugs = new Set<string>(TIFFANY_SLUGS);
  const tiffany =
    products.find((product) => tiffanySlugs.has(product.slug)) ??
    products.find((product) => product.name.toLowerCase().includes("tiffany")) ??
    null;

  const linenHref = "/catalogo?categoria=manteleria";

  return (
    <>
      <HomeHero />
      <HomeTrust />
      <HomeCategories />
      <HomeCombos combos={combos} />
      <HomeTiffany product={tiffany} />
      <HomeLinens products={linens} categoryHref={linenHref} />
      <HomeOccasions />
      <HomeCorporate />
      <HomeProcess />
      <HomeInspiration />
      <HomeFinalCta />
    </>
  );
}
