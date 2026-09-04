import Link from "next/link";
import { CategoriesManager } from "@/components/products/categories-manager";
import { listProductCategories } from "@/lib/products/queries";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProductCategoriesPage() {
  const categories = await listProductCategories();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Categorías</h1>
          <p className="mt-2 text-muted-foreground">
            Organice el catálogo de productos por categoría.
          </p>
        </div>
        <Link
          href="/products"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Volver a productos
        </Link>
      </div>

      <CategoriesManager categories={categories} />
    </main>
  );
}
