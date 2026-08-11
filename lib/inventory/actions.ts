"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  PRODUCT_TRACKING_TYPE,
  PRODUCT_TYPE,
} from "@/lib/products/constants";
import { signedMovementQuantity } from "@/lib/inventory/constants";
import {
  movementFormSchema,
  type MovementFormValues,
} from "@/lib/inventory/schema";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

export async function recordMovement(
  productId: string,
  values: MovementFormValues,
): Promise<ActionResult> {
  const parsed = movementFormSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid form data",
    };
  }

  const supabase = createAdminSupabaseClient();

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, product_type_id, tracking_type_id")
    .eq("id", productId)
    .maybeSingle();

  if (productError || !product) {
    console.error("[recordMovement] product", productError?.message);
    return { success: false, error: "Product not found." };
  }

  const [{ data: productType }, { data: trackingType }] = await Promise.all([
    supabase
      .from("product_types")
      .select("code")
      .eq("id", product.product_type_id)
      .single(),
    supabase
      .from("product_tracking_types")
      .select("code")
      .eq("id", product.tracking_type_id)
      .single(),
  ]);

  if (
    productType?.code !== PRODUCT_TYPE.SIMPLE ||
    trackingType?.code !== PRODUCT_TRACKING_TYPE.QUANTITY
  ) {
    return {
      success: false,
      error: "Only simple quantity-tracked products accept inventory movements.",
    };
  }

  const { data: movementType, error: movementTypeError } = await supabase
    .from("inventory_movement_types")
    .select("id, code")
    .eq("code", parsed.data.movement_type_code)
    .single();

  if (movementTypeError || !movementType) {
    console.error("[recordMovement] movement type", movementTypeError?.message);
    return { success: false, error: "Movement type not found." };
  }

  const { userId } = await auth();
  const signedQuantity = signedMovementQuantity(
    movementType.code,
    parsed.data.quantity,
    parsed.data.adjustment_direction,
  );

  const { error } = await supabase.from("inventory_movements").insert({
    product_id: productId,
    movement_type_id: movementType.id,
    quantity: signedQuantity,
    notes: parsed.data.notes?.trim() || null,
    created_by: userId,
  });

  if (error) {
    console.error("[recordMovement]", error.message);
    return { success: false, error: "Could not record inventory movement." };
  }

  revalidatePath("/products");
  revalidatePath(`/products/${productId}/edit`);
  return { success: true };
}
