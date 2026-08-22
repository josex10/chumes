import type { PublicProduct } from "@/lib/supabase/types";

export const SETUP_SLOT = {
  TABLE: "table",
  CHAIR: "chair",
  LINEN: "linen",
  OVERLAY: "overlay",
  COVER: "cover",
} as const;

export type SetupSlot = (typeof SETUP_SLOT)[keyof typeof SETUP_SLOT];
export type SetupFinish = "matte" | "satin";
export type TableShape = "round" | "rect";
export type ChairStyle = "folding" | "tiffany";

export type SetupOption = {
  slot: SetupSlot;
  variantKey: string;
  label: string;
  previewColor: string;
  finish: SetupFinish;
  suggestedSlug: string | null;
  productId: string | null;
  sortOrder: number;
};

export type LinkedSetupOption = SetupOption & {
  product: PublicProduct | null;
};

export type TableBuilderSelection = {
  table: TableShape;
  chair: ChairStyle;
  chairCount: number;
  linen: string;
  overlay: string | "none";
  cover: string | "none";
};

export const DEFAULT_SETUP_OPTIONS: SetupOption[] = [
  {
    slot: "table",
    variantKey: "round",
    label: "Circular",
    previewColor: "#c4a574",
    finish: "matte",
    suggestedSlug: "mesa-circular",
    productId: null,
    sortOrder: 1,
  },
  {
    slot: "table",
    variantKey: "rect",
    label: "Rectangular",
    previewColor: "#c4a574",
    finish: "matte",
    suggestedSlug: "mesa-rectangular",
    productId: null,
    sortOrder: 2,
  },
  {
    slot: "chair",
    variantKey: "folding",
    label: "Plegable",
    previewColor: "#8a8f98",
    finish: "matte",
    suggestedSlug: "silla-plegable",
    productId: null,
    sortOrder: 1,
  },
  {
    slot: "chair",
    variantKey: "tiffany",
    label: "Tiffany",
    previewColor: "#d4af37",
    finish: "satin",
    suggestedSlug: "silla-tiffany",
    productId: null,
    sortOrder: 2,
  },
  {
    slot: "linen",
    variantKey: "white",
    label: "Blanco",
    previewColor: "#f4f1ea",
    finish: "matte",
    suggestedSlug: "mantel-blanco",
    productId: null,
    sortOrder: 1,
  },
  {
    slot: "linen",
    variantKey: "ivory",
    label: "Ivory",
    previewColor: "#f3e6c8",
    finish: "matte",
    suggestedSlug: "mantel-ivory",
    productId: null,
    sortOrder: 2,
  },
  {
    slot: "linen",
    variantKey: "beige",
    label: "Beige",
    previewColor: "#d9c3a3",
    finish: "matte",
    suggestedSlug: "mantel-beige",
    productId: null,
    sortOrder: 3,
  },
  {
    slot: "linen",
    variantKey: "black",
    label: "Negro",
    previewColor: "#1f1f1f",
    finish: "matte",
    suggestedSlug: "mantel-negro",
    productId: null,
    sortOrder: 4,
  },
  {
    slot: "overlay",
    variantKey: "white",
    label: "Blanco",
    previewColor: "#ffffff",
    finish: "satin",
    suggestedSlug: "sobre-mantel-blanco",
    productId: null,
    sortOrder: 1,
  },
  {
    slot: "overlay",
    variantKey: "ivory",
    label: "Ivory",
    previewColor: "#efe1b8",
    finish: "satin",
    suggestedSlug: "sobre-mantel-ivory",
    productId: null,
    sortOrder: 2,
  },
  {
    slot: "overlay",
    variantKey: "gold",
    label: "Dorado",
    previewColor: "#c9a227",
    finish: "satin",
    suggestedSlug: "sobre-mantel-dorado",
    productId: null,
    sortOrder: 3,
  },
  {
    slot: "overlay",
    variantKey: "burgundy",
    label: "Vino",
    previewColor: "#6b1d2a",
    finish: "satin",
    suggestedSlug: "sobre-mantel-vino",
    productId: null,
    sortOrder: 4,
  },
  {
    slot: "overlay",
    variantKey: "black",
    label: "Negro",
    previewColor: "#111111",
    finish: "satin",
    suggestedSlug: "sobre-mantel-negro",
    productId: null,
    sortOrder: 5,
  },
  {
    slot: "cover",
    variantKey: "white",
    label: "Forro blanco",
    previewColor: "#f7f4ee",
    finish: "matte",
    suggestedSlug: "forro-blanco",
    productId: null,
    sortOrder: 1,
  },
  {
    slot: "cover",
    variantKey: "black",
    label: "Forro negro",
    previewColor: "#1a1a1a",
    finish: "matte",
    suggestedSlug: "forro-negro",
    productId: null,
    sortOrder: 2,
  },
  {
    slot: "cover",
    variantKey: "white-lycra",
    label: "Licra blanca",
    previewColor: "#f7f4ee",
    finish: "satin",
    suggestedSlug: "forro-licra-blanco",
    productId: null,
    sortOrder: 3,
  },
  {
    slot: "cover",
    variantKey: "black-lycra",
    label: "Licra negra",
    previewColor: "#1a1a1a",
    finish: "satin",
    suggestedSlug: "forro-licra-negro",
    productId: null,
    sortOrder: 4,
  },
];

export const DEFAULT_TABLE_BUILDER_SELECTION: TableBuilderSelection = {
  table: "round",
  chair: "tiffany",
  chairCount: 8,
  linen: "ivory",
  overlay: "none",
  cover: "none",
};

export function optionsForSlot(
  options: LinkedSetupOption[],
  slot: SetupSlot,
): LinkedSetupOption[] {
  return options
    .filter((option) => option.slot === slot)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function findOption(
  options: LinkedSetupOption[],
  slot: SetupSlot,
  variantKey: string,
): LinkedSetupOption | undefined {
  return options.find(
    (option) => option.slot === slot && option.variantKey === variantKey,
  );
}

export function chairCountRange(shape: TableShape) {
  return shape === "round"
    ? { min: 6, max: 12, defaultCount: 8 }
    : { min: 4, max: 10, defaultCount: 6 };
}

export function fabricProps(color: string, finish: SetupFinish) {
  if (finish === "satin") {
    return {
      color,
      roughness: 0.22,
      metalness: 0.12,
    };
  }

  return {
    color,
    roughness: 0.82,
    metalness: 0.02,
  };
}

export type QuoteLineDraft = {
  product: PublicProduct;
  quantity: number;
  unitPrice: number;
};

export function buildQuoteLines(
  selection: TableBuilderSelection,
  options: LinkedSetupOption[],
): QuoteLineDraft[] {
  const lines: QuoteLineDraft[] = [];

  function pushLine(option: LinkedSetupOption | undefined, quantity: number) {
    const product = option?.product;
    const unitPrice = product?.rental_price;
    if (!product || unitPrice == null) {
      return;
    }

    lines.push({ product, quantity, unitPrice });
  }

  pushLine(findOption(options, SETUP_SLOT.TABLE, selection.table), 1);
  pushLine(
    findOption(options, SETUP_SLOT.CHAIR, selection.chair),
    selection.chairCount,
  );
  pushLine(findOption(options, SETUP_SLOT.LINEN, selection.linen), 1);

  if (selection.overlay !== "none") {
    pushLine(findOption(options, SETUP_SLOT.OVERLAY, selection.overlay), 1);
  }

  if (selection.cover !== "none") {
    pushLine(
      findOption(options, SETUP_SLOT.COVER, selection.cover),
      selection.chairCount,
    );
  }

  return lines;
}
