import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  DEFAULT_SETUP_OPTIONS,
  type LinkedSetupOption,
  type SetupFinish,
  type SetupOption,
  type SetupSlot,
} from "@/lib/storefront/table-builder";
import { getPublicProducts } from "@/lib/storefront/queries";

type SetupOptionRow = {
  slot: SetupSlot;
  variant_key: string;
  label: string;
  preview_color: string;
  finish: SetupFinish;
  suggested_slug: string | null;
  product_id: string | null;
  sort_order: number;
  is_active: boolean;
};

function toSetupOption(row: SetupOptionRow): SetupOption {
  return {
    slot: row.slot,
    variantKey: row.variant_key,
    label: row.label,
    previewColor: row.preview_color,
    finish: row.finish,
    suggestedSlug: row.suggested_slug,
    productId: row.product_id,
    sortOrder: row.sort_order,
  };
}

async function loadSetupOptionRows(): Promise<SetupOption[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("product_setup_options")
    .select(
      "slot, variant_key, label, preview_color, finish, suggested_slug, product_id, sort_order, is_active",
    )
    .eq("is_active", true)
    .order("sort_order");

  if (error || !data) {
    if (error) {
      console.error("[getTableBuilderCatalog]", error.message);
    }
    return DEFAULT_SETUP_OPTIONS;
  }

  return (data as SetupOptionRow[]).map(toSetupOption);
}

export async function getTableBuilderCatalog(): Promise<LinkedSetupOption[]> {
  const [optionRows, products] = await Promise.all([
    loadSetupOptionRows(),
    getPublicProducts(),
  ]);

  const byId = new Map(products.map((product) => [product.id, product]));
  const bySlug = new Map(products.map((product) => [product.slug, product]));

  return optionRows.map((option) => {
    const product =
      (option.productId ? byId.get(option.productId) : undefined) ??
      (option.suggestedSlug ? bySlug.get(option.suggestedSlug) : undefined) ??
      null;

    return {
      ...option,
      product,
    };
  });
}
