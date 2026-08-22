import Link from "next/link";
import { Suspense } from "react";
import { ProductsFilters } from "@/components/products/products-filters";
import { ProductsPagination } from "@/components/products/products-pagination";
import { ProductsTable } from "@/components/products/products-table";
import { PRODUCT_LIST_PAGE_SIZE } from "@/lib/products/constants";
import { getProductCategories, searchProducts } from "@/lib/products/queries";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type ProductsPageProps = {
  searchParams: Promise<{ q?: string; page?: string; category?: string }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { q = "", page: pageParam, category: categoryParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const categoryId = categoryParam ? Number(categoryParam) : undefined;
  const normalizedCategoryId =
    categoryId && !Number.isNaN(categoryId) ? categoryId : undefined;

  const [categories, result] = await Promise.all([
    getProductCategories(),
    searchProducts({
      query: q,
      categoryId: normalizedCategoryId,
      page,
      pageSize: PRODUCT_LIST_PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(result.total / PRODUCT_LIST_PAGE_SIZE));
  const hasFilters = Boolean(q.trim() || normalizedCategoryId);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Productos</h1>
          <p className="mt-2 text-muted-foreground">
            Administre el catálogo de productos, paquetes y saldos de inventario.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/products/new/bundle"
            className={cn(buttonVariants({ variant: "add" }))}
          >
            Nuevo paquete
          </Link>
          <Link href="/products/new" className={cn(buttonVariants({ variant: "add" }))}>
            Nuevo producto
          </Link>
        </div>
      </div>

      <Suspense fallback={<div className="h-36 rounded-xl bg-muted" />}>
        <ProductsFilters
          categories={categories}
          initialQuery={q}
          initialCategoryId={
            normalizedCategoryId ? String(normalizedCategoryId) : "all"
          }
        />
      </Suspense>

      {result.products.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-muted-foreground">
            {hasFilters
              ? "No se encontraron productos con los filtros seleccionados."
              : "Aún no hay productos."}
          </p>
          {!hasFilters ? (
            <Link
              href="/products/new"
              className={cn(
                buttonVariants({ variant: "add" }),
                "mt-4 inline-flex",
              )}
            >
              Agregar su primer producto
            </Link>
          ) : null}
        </div>
      ) : (
        <>
          <ProductsTable products={result.products} />

          <ProductsPagination
            page={page}
            totalPages={totalPages}
            query={q}
            categoryId={
              normalizedCategoryId ? String(normalizedCategoryId) : undefined
            }
          />
        </>
      )}
    </main>
  );
}
