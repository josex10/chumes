import { ProductForm } from "@/components/products/product-form";
import { getProductCategories } from "@/lib/products/queries";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await getProductCategories();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10">
      <ProductForm categories={categories} />
    </main>
  );
}
