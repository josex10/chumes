import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { MANUAL_INVENTORY_MOVEMENT_TYPES } from "@/lib/inventory/constants";
import type { InventoryMovementWithRelations } from "@/lib/supabase/types";

export async function getManualMovementTypes() {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("inventory_movement_types")
    .select("*")
    .in("code", [...MANUAL_INVENTORY_MOVEMENT_TYPES])
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("[getManualMovementTypes]", error.message);
    return [];
  }

  return data ?? [];
}

export async function getMovementsByProduct(
  productId: string,
): Promise<InventoryMovementWithRelations[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("inventory_movements")
    .select("*, inventory_movement_types(*)")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getMovementsByProduct]", error.message);
    return [];
  }

  return (data ?? []) as InventoryMovementWithRelations[];
}
