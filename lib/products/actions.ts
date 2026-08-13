"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  PRODUCT_PRICE_TYPE,
  PRODUCT_TRACKING_TYPE,
  PRODUCT_TYPE,
} from "@/lib/products/constants";
import { generateNextProductNumber } from "@/lib/products/product-number";
import { getQuotableProductById } from "@/lib/products/queries";
import {
  bundleFormSchema,
  productFormSchema,
  toBundlePayload,
  toProductPayload,
  type BundleFormValues,
  type ProductFormValues,
} from "@/lib/products/schema";

type ActionResult =
  | { success: true; productId?: string; product?: import("@/lib/supabase/types").QuotableProduct }
  | { success: false; error: string };

async function getLookupIds() {
  const supabase = createAdminSupabaseClient();

  const [trackingType, productType, priceTypes] = await Promise.all([
    supabase
      .from("product_tracking_types")
      .select("id")
      .eq("code", PRODUCT_TRACKING_TYPE.QUANTITY)
      .single(),
    supabase
      .from("product_types")
      .select("id, code")
      .in("code", [PRODUCT_TYPE.SIMPLE, PRODUCT_TYPE.BUNDLE]),
    supabase.from("product_price_types").select("id, code"),
  ]);

  if (trackingType.error || productType.error || priceTypes.error) {
    throw new Error("Could not load product lookup data.");
  }

  const simpleTypeId = productType.data?.find(
    (type) => type.code === PRODUCT_TYPE.SIMPLE,
  )?.id;
  const bundleTypeId = productType.data?.find(
    (type) => type.code === PRODUCT_TYPE.BUNDLE,
  )?.id;
  const rentalPriceTypeId = priceTypes.data?.find(
    (type) => type.code === PRODUCT_PRICE_TYPE.RENTAL,
  )?.id;
  const salePriceTypeId = priceTypes.data?.find(
    (type) => type.code === PRODUCT_PRICE_TYPE.SALE,
  )?.id;

  if (
    !trackingType.data?.id ||
    !simpleTypeId ||
    !bundleTypeId ||
    !rentalPriceTypeId ||
    !salePriceTypeId
  ) {
    throw new Error("Missing required product lookup records.");
  }

  return {
    quantityTrackingTypeId: trackingType.data.id,
    simpleTypeId,
    bundleTypeId,
    rentalPriceTypeId,
    salePriceTypeId,
  };
}

async function upsertCurrentPrices(
  productId: string,
  values: Pick<
    ProductFormValues,
    "rental_available" | "sale_available" | "rental_price" | "sale_price"
  >,
  priceTypeIds: { rentalPriceTypeId: number; salePriceTypeId: number },
  userId: string | null,
) {
  const supabase = createAdminSupabaseClient();
  const today = new Date().toISOString().slice(0, 10);

  async function replacePrice(
    priceTypeId: number,
    amount: number | undefined,
    enabled: boolean,
  ) {
    const { data: existingPrices, error: readError } = await supabase
      .from("product_prices")
      .select("id")
      .eq("product_id", productId)
      .eq("price_type_id", priceTypeId)
      .is("effective_to", null);

    if (readError) {
      throw readError;
    }

    if (!enabled) {
      if (existingPrices && existingPrices.length > 0) {
        const { error } = await supabase
          .from("product_prices")
          .update({ effective_to: today })
          .eq("product_id", productId)
          .eq("price_type_id", priceTypeId)
          .is("effective_to", null);

        if (error) {
          throw error;
        }
      }
      return;
    }

    if (amount === undefined) {
      return;
    }

    if (existingPrices && existingPrices.length > 0) {
      const { error } = await supabase
        .from("product_prices")
        .update({ effective_to: today })
        .eq("product_id", productId)
        .eq("price_type_id", priceTypeId)
        .is("effective_to", null);

      if (error) {
        throw error;
      }
    }

    const { error } = await supabase.from("product_prices").insert({
      product_id: productId,
      price_type_id: priceTypeId,
      amount,
      created_by: userId,
    });

    if (error) {
      throw error;
    }
  }

  await replacePrice(
    priceTypeIds.rentalPriceTypeId,
    values.rental_price,
    values.rental_available,
  );
  await replacePrice(
    priceTypeIds.salePriceTypeId,
    values.sale_price,
    values.sale_available,
  );
}

async function upsertReplacementCost(
  productId: string,
  replacementCost: number | undefined,
  userId: string | null,
) {
  const supabase = createAdminSupabaseClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: existingCosts, error: readError } = await supabase
    .from("product_costs")
    .select("id")
    .eq("product_id", productId)
    .is("effective_to", null);

  if (readError) {
    throw readError;
  }

  if (replacementCost === undefined) {
    return;
  }

  if (existingCosts && existingCosts.length > 0) {
    const { error } = await supabase
      .from("product_costs")
      .update({ effective_to: today })
      .eq("product_id", productId)
      .is("effective_to", null);

    if (error) {
      throw error;
    }
  }

  const { error } = await supabase.from("product_costs").insert({
    product_id: productId,
    cost: replacementCost,
    created_by: userId,
  });

  if (error) {
    throw error;
  }
}

async function replaceBundleItems(
  bundleProductId: string,
  components: BundleFormValues["components"],
  userId: string | null,
) {
  const supabase = createAdminSupabaseClient();

  const { error: deleteError } = await supabase
    .from("product_bundle_items")
    .delete()
    .eq("bundle_product_id", bundleProductId);

  if (deleteError) {
    throw deleteError;
  }

  if (components.length === 0) {
    return;
  }

  const { error: insertError } = await supabase.from("product_bundle_items").insert(
    components.map((component) => ({
      bundle_product_id: bundleProductId,
      component_product_id: component.component_product_id,
      quantity: component.quantity,
      created_by: userId,
    })),
  );

  if (insertError) {
    throw insertError;
  }
}

export async function createProduct(
  values: ProductFormValues,
): Promise<ActionResult> {
  const parsed = productFormSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid form data",
    };
  }

  try {
    const { userId } = await auth();
    const lookupIds = await getLookupIds();
    const supabase = createAdminSupabaseClient();
    const productNumber = await generateNextProductNumber();
    const payload = toProductPayload(parsed.data);

    const { data, error } = await supabase
      .from("products")
      .insert({
        ...payload,
        product_number: productNumber,
        tracking_type_id: lookupIds.quantityTrackingTypeId,
        product_type_id: lookupIds.simpleTypeId,
        created_by: userId,
        updated_by: userId,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("[createProduct]", error?.message);
      return { success: false, error: "Could not create product." };
    }

    await upsertCurrentPrices(data.id, parsed.data, lookupIds, userId);
    await upsertReplacementCost(
      data.id,
      parsed.data.replacement_cost,
      userId,
    );

    revalidatePath("/products");
    return { success: true, productId: data.id };
  } catch (error) {
    console.error("[createProduct]", error);
    return { success: false, error: "Could not create product." };
  }
}

export async function createProductAndFetch(
  values: ProductFormValues,
): Promise<ActionResult> {
  const result = await createProduct(values);
  if (!result.success || !result.productId) {
    return result;
  }

  const product = await getQuotableProductById(result.productId);
  if (!product) {
    return { success: false, error: "Product created but could not be loaded." };
  }

  return { success: true, productId: result.productId, product };
}

export async function updateProduct(
  id: string,
  values: ProductFormValues,
): Promise<ActionResult> {
  const parsed = productFormSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid form data",
    };
  }

  try {
    const { userId } = await auth();
    const lookupIds = await getLookupIds();
    const supabase = createAdminSupabaseClient();
    const payload = toProductPayload(parsed.data);

    const { error } = await supabase
      .from("products")
      .update({
        ...payload,
        updated_by: userId,
      })
      .eq("id", id);

    if (error) {
      console.error("[updateProduct]", error.message);
      return { success: false, error: "Could not update product." };
    }

    await upsertCurrentPrices(id, parsed.data, lookupIds, userId);
    await upsertReplacementCost(id, parsed.data.replacement_cost, userId);

    revalidatePath("/products");
    revalidatePath(`/products/${id}/edit`);
    return { success: true, productId: id };
  } catch (error) {
    console.error("[updateProduct]", error);
    return { success: false, error: "Could not update product." };
  }
}

export async function createBundle(
  values: BundleFormValues,
): Promise<ActionResult> {
  const parsed = bundleFormSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid form data",
    };
  }

  try {
    const { userId } = await auth();
    const lookupIds = await getLookupIds();
    const supabase = createAdminSupabaseClient();
    const productNumber = await generateNextProductNumber();
    const payload = toBundlePayload(parsed.data);

    const { data, error } = await supabase
      .from("products")
      .insert({
        name: payload.name,
        description: payload.description,
        category_id: payload.category_id,
        rental_available: payload.rental_available,
        sale_available: payload.sale_available,
        is_active: payload.is_active,
        minimum_stock: null,
        product_number: productNumber,
        tracking_type_id: lookupIds.quantityTrackingTypeId,
        product_type_id: lookupIds.bundleTypeId,
        created_by: userId,
        updated_by: userId,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("[createBundle]", error?.message);
      return { success: false, error: "Could not create bundle." };
    }

    await replaceBundleItems(data.id, payload.components, userId);
    await upsertCurrentPrices(data.id, parsed.data, lookupIds, userId);

    revalidatePath("/products");
    return { success: true, productId: data.id };
  } catch (error) {
    console.error("[createBundle]", error);
    return { success: false, error: "Could not create bundle." };
  }
}

export async function updateBundle(
  id: string,
  values: BundleFormValues,
): Promise<ActionResult> {
  const parsed = bundleFormSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid form data",
    };
  }

  try {
    const { userId } = await auth();
    const lookupIds = await getLookupIds();
    const supabase = createAdminSupabaseClient();
    const payload = toBundlePayload(parsed.data);

    const { error } = await supabase
      .from("products")
      .update({
        name: payload.name,
        description: payload.description,
        category_id: payload.category_id,
        rental_available: payload.rental_available,
        sale_available: payload.sale_available,
        is_active: payload.is_active,
        updated_by: userId,
      })
      .eq("id", id);

    if (error) {
      console.error("[updateBundle]", error.message);
      return { success: false, error: "Could not update bundle." };
    }

    await replaceBundleItems(id, payload.components, userId);
    await upsertCurrentPrices(id, parsed.data, lookupIds, userId);

    revalidatePath("/products");
    revalidatePath(`/products/${id}/edit`);
    return { success: true, productId: id };
  } catch (error) {
    console.error("[updateBundle]", error);
    return { success: false, error: "Could not update bundle." };
  }
}
