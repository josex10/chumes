"use client";

import Link from "next/link";
import {
  Layers,
  Package,
  Pencil,
  ShoppingBag,
  Timer,
} from "lucide-react";
import { ProductRowStatusToggles } from "@/components/products/product-row-status-toggles";
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
            <TableHead>Número</TableHead>
            <TableHead>Nombre</TableHead>
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
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {product.product_number}
                </TableCell>
                <TableCell className="min-w-[180px] font-medium">
                  {product.name}
                </TableCell>
                <TableCell>{product.product_categories.name}</TableCell>
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
