import { notFound } from "next/navigation";
import { BundleForm } from "@/components/products/bundle-form";
import { InventoryPanel } from "@/components/products/inventory-panel";
import { ProductForm } from "@/components/products/product-form";
import { ProductImagesPanel } from "@/components/products/product-images-panel";
import { getManualMovementTypes, getMovementsByProduct } from "@/lib/inventory/queries";
import { getProductImages } from "@/lib/products/image-queries";
import { PRODUCT_PRICE_TYPE, PRODUCT_TYPE } from "@/lib/products/constants";
import {
  getBundleAvailability,
  getBundleComponents,
  getProductById,
  getProductCategories,
  getProductCosts,
  getProductPrices,
  getProductStock,
} from "@/lib/products/queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const isBundle = product.product_types.code === PRODUCT_TYPE.BUNDLE;

  if (isBundle) {
    const [categories, components, prices, availability, images] =
      await Promise.all([
        getProductCategories(),
        getBundleComponents(id),
        getProductPrices(id),
        getBundleAvailability(id),
        getProductImages(id),
      ]);

    const rentalPrice = prices.find(
      (price) => price.product_price_types.code === PRODUCT_PRICE_TYPE.RENTAL,
    );
    const salePrice = prices.find(
      (price) => price.product_price_types.code === PRODUCT_PRICE_TYPE.SALE,
    );

    return (
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
        <BundleForm
          bundleId={id}
          categories={categories}
          componentProducts={components
            .map((component) => component.products)
            .filter((product): product is NonNullable<typeof product> =>
              Boolean(product),
            )}
          initialValues={{
            name: product.name,
            description: product.description ?? "",
            category_id: product.category_id,
            rental_available: product.rental_available,
            sale_available: product.sale_available,
            rental_price: rentalPrice ? Number(rentalPrice.amount) : undefined,
            sale_price: salePrice ? Number(salePrice.amount) : undefined,
            is_active: product.is_active,
            is_public: product.is_public,
            slug: product.slug,
            components: components.map((component) => ({
              component_product_id: component.component_product_id,
              quantity: Number(component.quantity),
            })),
          }}
        />

        <ProductImagesPanel productId={id} images={images} />

        <Card className="mx-auto w-full max-w-3xl">
          <CardHeader>
            <CardTitle>Derived availability</CardTitle>
            <CardDescription>
              Bundle stock is calculated from component products.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{availability}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Complete bundles currently available
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  const [
    categories,
    prices,
    costs,
    stock,
    movementTypes,
    movements,
    images,
  ] = await Promise.all([
    getProductCategories(),
    getProductPrices(id),
    getProductCosts(id),
    getProductStock(id),
    getManualMovementTypes(),
    getMovementsByProduct(id),
    getProductImages(id),
  ]);

  const rentalPrice = prices.find(
    (price) => price.product_price_types.code === PRODUCT_PRICE_TYPE.RENTAL,
  );
  const salePrice = prices.find(
    (price) => price.product_price_types.code === PRODUCT_PRICE_TYPE.SALE,
  );
  const replacementCost = costs[0];

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
      <ProductForm
        productId={id}
        categories={categories}
        initialValues={{
          name: product.name,
          description: product.description ?? "",
          category_id: product.category_id,
          rental_available: product.rental_available,
          sale_available: product.sale_available,
          minimum_stock: product.minimum_stock
            ? Number(product.minimum_stock)
            : undefined,
          rental_price: rentalPrice ? Number(rentalPrice.amount) : undefined,
          sale_price: salePrice ? Number(salePrice.amount) : undefined,
          replacement_cost: replacementCost
            ? Number(replacementCost.cost)
            : undefined,
          is_active: product.is_active,
          is_public: product.is_public,
          slug: product.slug,
        }}
      />

      <ProductImagesPanel productId={id} images={images} />

      <InventoryPanel
        productId={id}
        stock={stock}
        minimumStock={
          product.minimum_stock ? Number(product.minimum_stock) : null
        }
        movementTypes={movementTypes}
        movements={movements}
      />
    </main>
  );
}
