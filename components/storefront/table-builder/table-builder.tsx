"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { OptionPanel } from "@/components/storefront/table-builder/option-panel";
import { useCart } from "@/components/storefront/cart-provider";
import { QUOTE_LINE_TYPE } from "@/lib/quotes/constants";
import {
  buildQuoteLines,
  DEFAULT_TABLE_BUILDER_SELECTION,
  type LinkedSetupOption,
  type TableBuilderSelection,
} from "@/lib/storefront/table-builder";

const TableScene = dynamic(
  () =>
    import("@/components/storefront/table-builder/table-scene").then(
      (mod) => mod.TableScene,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Cargando vista 3D...
      </div>
    ),
  },
);

type TableBuilderProps = {
  options: LinkedSetupOption[];
};

export function TableBuilder({ options }: TableBuilderProps) {
  const router = useRouter();
  const { addItems } = useCart();
  const [selection, setSelection] = useState<TableBuilderSelection>(
    DEFAULT_TABLE_BUILDER_SELECTION,
  );

  const quoteLines = useMemo(
    () => buildQuoteLines(selection, options),
    [selection, options],
  );

  function handleQuote() {
    if (quoteLines.length === 0) {
      return;
    }

    addItems(
      quoteLines.map((line) => ({
        productId: line.product.id,
        slug: line.product.slug,
        name: line.product.name,
        lineType: QUOTE_LINE_TYPE.RENTAL,
        unitPrice: line.unitPrice,
        rentalAvailable: line.product.rental_available,
        saleAvailable: line.product.sale_available,
        imageUrl: line.product.primary_image_url,
        quantity: line.quantity,
      })),
    );

    router.push("/cotizar");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-stretch">
      <div className="h-[420px] overflow-hidden rounded-3xl border border-border/70 bg-[#f3eee4] lg:h-[640px]">
        <TableScene selection={selection} options={options} />
      </div>
      <OptionPanel
        selection={selection}
        options={options}
        quoteLines={quoteLines}
        onChange={setSelection}
        onQuote={handleQuote}
      />
    </div>
  );
}
