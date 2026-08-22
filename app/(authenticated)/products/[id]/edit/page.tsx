import { notFound } from "next/navigation";
import { BundleAvailabilityTab } from "@/components/products/bundle-availability-tab";
import { BundleDetailsTab } from "@/components/products/bundle-details-tab";
import { ProductCatalogTab } from "@/components/products/product-catalog-tab";
import { ProductDetailsTab } from "@/components/products/product-details-tab";
import { ProductEditHeader } from "@/components/products/product-edit-header";
import {
  parseProductEditTab,
  ProductEditTabs,
} from "@/components/products/product-edit-tabs";
import { ProductInventoryTab } from "@/components/products/product-inventory-tab";
import { getManualMovementTypes, getMovementsByProduct } from "@/lib/inventory/queries";
import { getProductImages } from "@/lib/products/image-queries";
import { PRODUCT_EDIT_TAB, PRODUCT_PRICE_TYPE, PRODUCT_TYPE } from "@/lib/products/constants";
import {
  getBundleAvailability,
  getBundleComponents,
  getProductById,
  getProductCategories,
  getProductCosts,
  getProductPrices,
  getProductStock,
} from "@/lib/products/queries";

export const dynamic = "force-dynamic";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function EditProductPage({
  params,
  searchParams,
}: EditProductPageProps) {
  const { id } = await params;
  const { tab: tabParam } = await searchParams;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const isBundle = product.product_types.code === PRODUCT_TYPE.BUNDLE;
  const activeTab = parseProductEditTab(tabParam, isBundle);

  const [categories, prices, images] = await Promise.all([
    getProductCategories(),
    getProductPrices(id),
    getProductImages(id),
  ]);

  const rentalPrice = prices.find(
    (price) => price.product_price_types.code === PRODUCT_PRICE_TYPE.RENTAL,
  );
  const salePrice = prices.find(
    (price) => price.product_price_types.code === PRODUCT_PRICE_TYPE.SALE,
  );

  const detailsValues = {
    name: product.name,
    description: product.description ?? "",
    category_id: product.category_id,
    rental_available: product.rental_available,
    sale_available: product.sale_available,
    rental_price: rentalPrice ? Number(rentalPrice.amount) : undefined,
    sale_price: salePrice ? Number(salePrice.amount) : undefined,
    replacement_cost: undefined as number | undefined,
  };

  if (isBundle) {
    const [components, availability] = await Promise.all([
      getBundleComponents(id),
      getBundleAvailability(id),
    ]);

    const componentProducts = components
      .map((component) => component.products)
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

    return (
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-10">
        <ProductEditHeader product={product} />
        <ProductEditTabs productId={id} activeTab={activeTab} isBundle />
        <div className="pt-2">
          {activeTab === PRODUCT_EDIT_TAB.GENERAL ? (
            <BundleDetailsTab
              bundleId={id}
              categories={categories}
              componentProducts={componentProducts}
              initialValues={{
                ...detailsValues,
                components: components.map((component) => ({
                  component_product_id: component.component_product_id,
                  quantity: Number(component.quantity),
                })),
              }}
            />
          ) : null}
          {activeTab === PRODUCT_EDIT_TAB.CATALOG ? (
            <ProductCatalogTab
              productId={id}
              slug={product.slug}
              isPublic={product.is_public}
              images={images}
            />
          ) : null}
          {activeTab === PRODUCT_EDIT_TAB.AVAILABILITY ? (
            <BundleAvailabilityTab availability={availability} />
          ) : null}
        </div>
      </main>
    );
  }

  const [costs, stock, movementTypes, movements] = await Promise.all([
    getProductCosts(id),
    getProductStock(id),
    getManualMovementTypes(),
    getMovementsByProduct(id),
  ]);

  const replacementCost = costs[0];
  detailsValues.replacement_cost = replacementCost
    ? Number(replacementCost.cost)
    : undefined;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-10">
      <ProductEditHeader product={product} />
      <ProductEditTabs productId={id} activeTab={activeTab} isBundle={false} />
      <div className="pt-2">
        {activeTab === PRODUCT_EDIT_TAB.GENERAL ? (
          <ProductDetailsTab
            productId={id}
            categories={categories}
            initialValues={detailsValues}
          />
        ) : null}
        {activeTab === PRODUCT_EDIT_TAB.CATALOG ? (
          <ProductCatalogTab
            productId={id}
            slug={product.slug}
            isPublic={product.is_public}
            images={images}
          />
        ) : null}
        {activeTab === PRODUCT_EDIT_TAB.INVENTORY ? (
          <ProductInventoryTab
            productId={id}
            stock={stock}
            minimumStock={
              product.minimum_stock ? Number(product.minimum_stock) : null
            }
            movementTypes={movementTypes}
            movements={movements}
          />
        ) : null}
      </div>
    </main>
  );
}
