import { PACKING_CATEGORY_ORDER } from "@/lib/logistics/constants";
import { PRODUCT_TYPE } from "@/lib/products/constants";

export type PackingListLine = {
  productId: string;
  name: string;
  categoryCode: string;
  categoryName: string;
  quantity: number;
  stock: number;
  short: boolean;
};

export type QuoteLineForPacking = {
  quantity: number;
  description: string | null;
  product: {
    id: string;
    name: string;
    typeCode: string;
    categoryCode: string;
    categoryName: string;
  };
};

export type BundleComponentForPacking = {
  bundleProductId: string;
  componentProductId: string;
  componentName: string;
  componentCategoryCode: string;
  componentCategoryName: string;
  quantity: number;
};

type AccumulatorLine = {
  productId: string;
  name: string;
  categoryCode: string;
  categoryName: string;
  quantity: number;
};

function categoryRank(code: string): number {
  const index = PACKING_CATEGORY_ORDER.indexOf(
    code as (typeof PACKING_CATEGORY_ORDER)[number],
  );
  return index === -1 ? PACKING_CATEGORY_ORDER.length : index;
}

export function formatPackingQuantity(quantity: number): string {
  if (Number.isInteger(quantity)) return String(quantity);
  return quantity
    .toFixed(2)
    .replace(/\.?0+$/, "")
    .replace(/\.$/, "");
}

export function buildPackingList(
  lines: QuoteLineForPacking[],
  bundles: BundleComponentForPacking[],
  stockByProductId: Map<string, number>,
): PackingListLine[] {
  const componentsByBundle = new Map<string, BundleComponentForPacking[]>();
  for (const component of bundles) {
    const current = componentsByBundle.get(component.bundleProductId) ?? [];
    current.push(component);
    componentsByBundle.set(component.bundleProductId, current);
  }

  const aggregated = new Map<string, AccumulatorLine>();

  function addLine(line: AccumulatorLine) {
    const existing = aggregated.get(line.productId);
    if (existing) {
      existing.quantity += line.quantity;
      return;
    }
    aggregated.set(line.productId, { ...line });
  }

  for (const line of lines) {
    const bundleComponents = componentsByBundle.get(line.product.id) ?? [];
    const isBundle = line.product.typeCode === PRODUCT_TYPE.BUNDLE;

    if (isBundle && bundleComponents.length > 0) {
      for (const component of bundleComponents) {
        addLine({
          productId: component.componentProductId,
          name: component.componentName,
          categoryCode: component.componentCategoryCode,
          categoryName: component.componentCategoryName,
          quantity: line.quantity * component.quantity,
        });
      }
      continue;
    }

    addLine({
      productId: line.product.id,
      name: line.description?.trim() || line.product.name,
      categoryCode: line.product.categoryCode,
      categoryName: line.product.categoryName,
      quantity: line.quantity,
    });
  }

  return [...aggregated.values()]
    .sort((a, b) => {
      const rankDiff = categoryRank(a.categoryCode) - categoryRank(b.categoryCode);
      if (rankDiff !== 0) return rankDiff;
      return a.name.localeCompare(b.name, "es");
    })
    .map((line) => {
      const stock = stockByProductId.get(line.productId) ?? 0;
      return {
        ...line,
        stock,
        short: stock < line.quantity,
      };
    });
}

export function packingListHasShortage(lines: PackingListLine[]): boolean {
  return lines.some((line) => line.short);
}

export function groupPackingListByCategory(
  lines: PackingListLine[],
): Array<{ categoryName: string; lines: PackingListLine[] }> {
  const groups: Array<{ categoryName: string; lines: PackingListLine[] }> = [];

  for (const line of lines) {
    const last = groups.at(-1);
    if (last && last.categoryName === line.categoryName) {
      last.lines.push(line);
      continue;
    }
    groups.push({ categoryName: line.categoryName, lines: [line] });
  }

  return groups;
}
