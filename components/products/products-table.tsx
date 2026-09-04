"use client";

import Link from "next/link";
import {
  Layers,
  Package,
  Pencil,
  ShoppingBag,
  Timer,
} from "lucide-react";
import { ProductCategoryCell } from "@/components/products/product-category-cell";
import { ProductInlineTextCell } from "@/components/products/product-inline-text-cell";
import { ProductRowStatusToggles } from "@/components/products/product-row-status-toggles";
import {
  updateProductDescription,
  updateProductName,
} from "@/lib/products/actions";
import { PRODUCT_TYPE } from "@/lib/products/constants";
import type { ProductListItem } from "@/lib/products/queries";
import { formatCurrency } from "@/lib/quotes/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type ProductsTableProps = {
  products: ProductListItem[];
};

function formatStock(stock: number | null) {
  if (stock === null) {
    return "—";
  }

  return Number.isInteger(stock) ? String(stock) : stock.toFixed(2);
}

function PriceCell({
  enabled,
  price,
  icon: Icon,
}: {
  enabled: boolean;
  price: number | null;
  icon: React.ComponentType<{ className?: string }>;
}) {
  if (!enabled) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  if (price === null) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-400">
        <Icon className="size-3.5 shrink-0" />
        Sin precio
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium">
      <Icon className="size-3.5 shrink-0 text-muted-foreground" />
      {formatCurrency(price)}
    </span>
  );
}

export function ProductsTable({ products }: ProductsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Alquiler</TableHead>
            <TableHead>Venta</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const isBundle = product.product_types.code === PRODUCT_TYPE.BUNDLE;
            const TypeIcon = isBundle ? Layers : Package;

            return (
              <TableRow key={product.id}>
                <TableCell className="whitespace-nowrap font-mono text-sm text-muted-foreground">
                  {product.product_number}
                </TableCell>
                <TableCell className="min-w-[160px] font-medium">
                  <ProductInlineTextCell
                    value={product.name}
                    ariaLabel={`Editar nombre de ${product.name}`}
                    placeholder="Nombre del producto"
                    onSave={async (value) => {
                      const result = await updateProductName(product.id, value);
                      return result.success
                        ? { success: true }
                        : { success: false, error: result.error };
                    }}
                  />
                </TableCell>
                <TableCell className="min-w-[180px] max-w-[280px]">
                  <ProductInlineTextCell
                    value={product.description ?? ""}
                    ariaLabel={`Editar descripción de ${product.name}`}
                    emptyLabel="Sin descripción"
                    placeholder="Descripción del producto"
                    multiline
                    onSave={async (value) => {
                      const result = await updateProductDescription(
                        product.id,
                        value,
                      );
                      return result.success
                        ? { success: true }
                        : { success: false, error: result.error };
                    }}
                  />
                </TableCell>
                <TableCell>
                  <ProductCategoryCell
                    productId={product.id}
                    category={product.product_categories}
                  />
                </TableCell>
                <TableCell>
                  <span
                    className="inline-flex items-center gap-1.5 text-sm"
                    title={isBundle ? "Paquete" : "Simple"}
                  >
                    <TypeIcon className="size-3.5 text-muted-foreground" />
                    {isBundle ? "Paquete" : "Simple"}
                  </span>
                </TableCell>
                <TableCell>
                  <PriceCell
                    enabled={product.rental_available}
                    price={product.rental_price}
                    icon={Timer}
                  />
                </TableCell>
                <TableCell>
                  <PriceCell
                    enabled={product.sale_available}
                    price={product.sale_price}
                    icon={ShoppingBag}
                  />
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5 text-sm">
                    <Package className="size-3.5 text-muted-foreground" />
                    {formatStock(product.stock)}
                  </span>
                </TableCell>
                <TableCell>
                  <ProductRowStatusToggles
                    productId={product.id}
                    initialIsActive={product.is_active}
                    initialIsPublic={product.is_public}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <Link
                      href={`/products/${product.id}/edit`}
                      className={cn(
                        "inline-flex size-8 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground transition hover:bg-muted hover:text-foreground",
                      )}
                      aria-label="Editar producto"
                    >
                      <Pencil className="size-3.5" />
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
