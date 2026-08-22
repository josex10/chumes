export const PRODUCT_CATEGORY = {
  TABLE_LINENS: "TABLE_LINENS",
  CHAIR_COVERS: "CHAIR_COVERS",
  CHAIRS: "CHAIRS",
  TABLES: "TABLES",
  DECORATION: "DECORATION",
  ACCESSORIES: "ACCESSORIES",
  OTHER: "OTHER",
} as const;

export const PRODUCT_TRACKING_TYPE = {
  QUANTITY: "QUANTITY",
  ASSET: "ASSET",
} as const;

export const PRODUCT_TYPE = {
  SIMPLE: "SIMPLE",
  BUNDLE: "BUNDLE",
} as const;

export const PRODUCT_PRICE_TYPE = {
  RENTAL: "RENTAL",
  SALE: "SALE",
} as const;

export const PRODUCT_COMBOBOX_PAGE_SIZE = 10;
export const PRODUCT_LIST_PAGE_SIZE = 10;
export const PRODUCT_SEARCH_DEBOUNCE_MS = 300;

export const PRODUCT_EDIT_TAB = {
  GENERAL: "general",
  CATALOG: "catalog",
  INVENTORY: "inventory",
  AVAILABILITY: "availability",
} as const;

export type ProductEditTab =
  (typeof PRODUCT_EDIT_TAB)[keyof typeof PRODUCT_EDIT_TAB];

export const SIMPLE_PRODUCT_TABS = [
  { id: PRODUCT_EDIT_TAB.GENERAL, label: "Producto" },
  { id: PRODUCT_EDIT_TAB.CATALOG, label: "Catálogo web" },
  { id: PRODUCT_EDIT_TAB.INVENTORY, label: "Inventario" },
] as const;

export const BUNDLE_PRODUCT_TABS = [
  { id: PRODUCT_EDIT_TAB.GENERAL, label: "Producto" },
  { id: PRODUCT_EDIT_TAB.CATALOG, label: "Catálogo web" },
  { id: PRODUCT_EDIT_TAB.AVAILABILITY, label: "Disponibilidad" },
] as const;
