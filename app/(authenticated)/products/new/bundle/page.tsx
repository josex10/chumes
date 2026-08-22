import { BundleForm } from "@/components/products/bundle-form";
import { getProductCategories } from "@/lib/products/queries";

export const dynamic = "force-dynamic";

export default async function NewBundlePage() {
  const categories = await getProductCategories();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10">
      <BundleForm categories={categories} />
    </main>
  );
}
