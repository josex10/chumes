import Link from "next/link";
import { Suspense } from "react";
import { PRODUCT_LIST_PAGE_SIZE, PRODUCT_TYPE } from "@/lib/products/constants";
import { searchProducts } from "@/lib/products/queries";
import { ProductsPagination } from "@/components/products/products-pagination";
import { ProductsToolbar } from "@/components/products/products-toolbar";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type ProductsPageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

function formatStock(stock: number | null) {
  if (stock === null) {
    return "—";
  }

  return Number.isInteger(stock) ? String(stock) : stock.toFixed(2);
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { q = "", page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const result = await searchProducts({
    query: q,
    page,
    pageSize: PRODUCT_LIST_PAGE_SIZE,
  });
  const totalPages = Math.max(1, Math.ceil(result.total / PRODUCT_LIST_PAGE_SIZE));

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Products</h1>
          <p className="mt-2 text-muted-foreground">
            Manage the product catalog, bundles, and stock balances.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/products/new/bundle"
            className={cn(buttonVariants({ variant: "add" }))}
          >
            New bundle
          </Link>
          <Link href="/products/new" className={cn(buttonVariants({ variant: "add" }))}>
            New product
          </Link>
        </div>
      </div>

      <Suspense fallback={<div className="h-8 max-w-md rounded-md bg-muted" />}>
        <ProductsToolbar initialQuery={q} />
      </Suspense>

      {result.products.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-muted-foreground">
            {q.trim()
              ? `No se encontraron productos para "${q.trim()}".`
              : "No products yet."}
          </p>
          {!q.trim() && (
            <Link
              href="/products/new"
              className={cn(
                buttonVariants({ variant: "add" }),
                "mt-4 inline-flex",
              )}
            >
              Add your first product
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Public</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.product_number}</TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.product_categories.name}</TableCell>
                    <TableCell>
                      {product.product_types.code === PRODUCT_TYPE.BUNDLE
                        ? "Bundle"
                        : "Simple"}
                    </TableCell>
                    <TableCell>{formatStock(product.stock)}</TableCell>
                    <TableCell>
                      {product.is_active ? "Active" : "Inactive"}
                    </TableCell>
                    <TableCell>
                      {product.is_public ? "Published" : "Hidden"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/products/${product.id}/edit`}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "sm" }),
                        )}
                      >
                        Edit
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <ProductsPagination page={page} totalPages={totalPages} query={q} />
        </>
      )}
    </main>
  );
}
