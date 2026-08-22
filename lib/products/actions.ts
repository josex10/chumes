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
import { ensureUniqueProductSlug } from "@/lib/products/slug";
import {
  getProductById,
  getQuotableProductById,
  searchQuotableProductsForCombobox,
  searchSimpleProductsForCombobox,
  type SearchProductsParams,
  type SearchQuotableProductsResult,
  type SearchSimpleProductsResult,
} from "@/lib/products/queries";
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
      error: parsed.error.issues[0]?.message ?? "Datos del formulario inválidos",
    };
  }

  try {
    const { userId } = await auth();
    const lookupIds = await getLookupIds();
    const supabase = createAdminSupabaseClient();
    const productNumber = await generateNextProductNumber();
    const payload = toProductPayload(parsed.data);
    const slug =
      parsed.data.slug?.trim() ||
      (await ensureUniqueProductSlug(parsed.data.name));

    const { data, error } = await supabase
      .from("products")
      .insert({
        ...payload,
        slug,
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
      return { success: false, error: "No se pudo crear el producto." };
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
    return { success: false, error: "No se pudo crear el producto." };
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
    return { success: false, error: "El producto se creó pero no se pudo cargar." };
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
      error: parsed.error.issues[0]?.message ?? "Datos del formulario inválidos",
    };
  }

  try {
    const { userId } = await auth();
    const lookupIds = await getLookupIds();
    const supabase = createAdminSupabaseClient();
    const payload = toProductPayload(parsed.data);
    const slug =
      parsed.data.slug?.trim() ||
      (await ensureUniqueProductSlug(parsed.data.name, id));

    const { error } = await supabase
      .from("products")
      .update({
        ...payload,
        slug,
        updated_by: userId,
      })
      .eq("id", id);

    if (error) {
      console.error("[updateProduct]", error.message);
      return { success: false, error: "No se pudo actualizar el producto." };
    }

    await upsertCurrentPrices(id, parsed.data, lookupIds, userId);
    await upsertReplacementCost(id, parsed.data.replacement_cost, userId);

    revalidatePath("/products");
    revalidatePath(`/products/${id}/edit`);
    return { success: true, productId: id };
  } catch (error) {
    console.error("[updateProduct]", error);
    return { success: false, error: "No se pudo actualizar el producto." };
  }
}

export async function createBundle(
  values: BundleFormValues,
): Promise<ActionResult> {
  const parsed = bundleFormSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos del formulario inválidos",
    };
  }

  try {
    const { userId } = await auth();
    const lookupIds = await getLookupIds();
    const supabase = createAdminSupabaseClient();
    const productNumber = await generateNextProductNumber();
    const payload = toBundlePayload(parsed.data);
    const slug =
      parsed.data.slug?.trim() ||
      (await ensureUniqueProductSlug(parsed.data.name));

    const { data, error } = await supabase
      .from("products")
      .insert({
        name: payload.name,
        description: payload.description,
        category_id: payload.category_id,
        rental_available: payload.rental_available,
        sale_available: payload.sale_available,
        is_active: payload.is_active,
        is_public: payload.is_public,
        slug,
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
      return { success: false, error: "No se pudo crear el paquete." };
    }

    await replaceBundleItems(data.id, payload.components, userId);
    await upsertCurrentPrices(data.id, parsed.data, lookupIds, userId);

    revalidatePath("/products");
    return { success: true, productId: data.id };
  } catch (error) {
    console.error("[createBundle]", error);
    return { success: false, error: "No se pudo crear el paquete." };
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
      error: parsed.error.issues[0]?.message ?? "Datos del formulario inválidos",
    };
  }

  try {
    const { userId } = await auth();
    const lookupIds = await getLookupIds();
    const supabase = createAdminSupabaseClient();
    const payload = toBundlePayload(parsed.data);
    const slug =
      parsed.data.slug?.trim() ||
      (await ensureUniqueProductSlug(parsed.data.name, id));

    const { error } = await supabase
      .from("products")
      .update({
        name: payload.name,
        description: payload.description,
        category_id: payload.category_id,
        rental_available: payload.rental_available,
        sale_available: payload.sale_available,
        is_active: payload.is_active,
        is_public: payload.is_public,
        slug,
        updated_by: userId,
      })
      .eq("id", id);

    if (error) {
      console.error("[updateBundle]", error.message);
      return { success: false, error: "No se pudo actualizar el paquete." };
    }

    await replaceBundleItems(id, payload.components, userId);
    await upsertCurrentPrices(id, parsed.data, lookupIds, userId);

    revalidatePath("/products");
    revalidatePath(`/products/${id}/edit`);
    return { success: true, productId: id };
  } catch (error) {
    console.error("[updateBundle]", error);
    return { success: false, error: "No se pudo actualizar el paquete." };
  }
}

export async function searchQuotableProductsAction(
  params: SearchProductsParams,
): Promise<SearchQuotableProductsResult> {
  return searchQuotableProductsForCombobox(params);
}

export async function searchSimpleProductsAction(
  params: SearchProductsParams,
): Promise<SearchSimpleProductsResult> {
  return searchSimpleProductsForCombobox(params);
}

export async function getQuotableProductByIdAction(id: string) {
  return getQuotableProductById(id);
}

export async function getProductByIdAction(id: string) {
  return getProductById(id);
}

type ToggleResult =
  | { success: true; is_active?: boolean; is_public?: boolean }
  | { success: false; error: string };

type MutationResult =
  | { success: true; productId?: string }
  | { success: false; error: string };

export async function toggleProductActive(productId: string): Promise<ToggleResult> {
  try {
    const { userId } = await auth();
    const product = await getProductById(productId);
    if (!product) {
      return { success: false, error: "Producto no encontrado." };
    }

    const is_active = !product.is_active;
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase
      .from("products")
      .update({ is_active, updated_by: userId })
      .eq("id", productId);

    if (error) {
      console.error("[toggleProductActive]", error.message);
      return { success: false, error: "No se pudo actualizar el estado del producto." };
    }

    revalidatePath("/products");
    revalidatePath(`/products/${productId}/edit`);
    revalidatePath("/catalogo");
    return { success: true, is_active };
  } catch (error) {
    console.error("[toggleProductActive]", error);
    return { success: false, error: "No se pudo actualizar el estado del producto." };
  }
}

export async function toggleProductPublic(productId: string): Promise<ToggleResult> {
  try {
    const { userId } = await auth();
    const product = await getProductById(productId);
    if (!product) {
      return { success: false, error: "Producto no encontrado." };
    }

    const is_public = !product.is_public;
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase
      .from("products")
      .update({ is_public, updated_by: userId })
      .eq("id", productId);

    if (error) {
      console.error("[toggleProductPublic]", error.message);
      return { success: false, error: "No se pudo actualizar la visibilidad en el catálogo." };
    }

    revalidatePath("/products");
    revalidatePath(`/products/${productId}/edit`);
    revalidatePath("/catalogo");
    revalidatePath("/");
    return { success: true, is_public };
  } catch (error) {
    console.error("[toggleProductPublic]", error);
    return { success: false, error: "No se pudo actualizar la visibilidad en el catálogo." };
  }
}

export async function updateProductGeneral(
  id: string,
  values: import("@/lib/products/schema").ProductGeneralValues,
): Promise<MutationResult> {
  const parsed = (await import("@/lib/products/schema")).productGeneralSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos del formulario inválidos",
    };
  }

  try {
    const { userId } = await auth();
    const supabase = createAdminSupabaseClient();

    const { error } = await supabase
      .from("products")
      .update({
        name: parsed.data.name.trim(),
        description: parsed.data.description?.trim() || null,
        category_id: parsed.data.category_id,
        updated_by: userId,
      })
      .eq("id", id);

    if (error) {
      console.error("[updateProductGeneral]", error.message);
      return { success: false, error: "No se pudo actualizar el producto." };
    }

    revalidatePath("/products");
    revalidatePath(`/products/${id}/edit`);
    revalidatePath("/catalogo");
    return { success: true, productId: id };
  } catch (error) {
    console.error("[updateProductGeneral]", error);
    return { success: false, error: "No se pudo actualizar el producto." };
  }
}

export async function updateProductPricing(
  id: string,
  values: import("@/lib/products/schema").ProductPricingValues,
): Promise<MutationResult> {
  const { productPricingSchema } = await import("@/lib/products/schema");
  const parsed = productPricingSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos del formulario inválidos",
    };
  }

  try {
    const { userId } = await auth();
    const lookupIds = await getLookupIds();
    const supabase = createAdminSupabaseClient();

    const { error } = await supabase
      .from("products")
      .update({
        rental_available: parsed.data.rental_available,
        sale_available: parsed.data.sale_available,
        updated_by: userId,
      })
      .eq("id", id);

    if (error) {
      console.error("[updateProductPricing]", error.message);
      return { success: false, error: "No se pudieron actualizar los precios." };
    }

    await upsertCurrentPrices(id, parsed.data, lookupIds, userId);
    await upsertReplacementCost(id, parsed.data.replacement_cost, userId);

    revalidatePath("/products");
    revalidatePath(`/products/${id}/edit`);
    revalidatePath("/catalogo");
    return { success: true, productId: id };
  } catch (error) {
    console.error("[updateProductPricing]", error);
    return { success: false, error: "No se pudieron actualizar los precios." };
  }
}

export async function updateProductCatalog(
  id: string,
  values: import("@/lib/products/schema").ProductCatalogValues,
): Promise<MutationResult> {
  const { productCatalogSchema } = await import("@/lib/products/schema");
  const parsed = productCatalogSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos del formulario inválidos",
    };
  }

  try {
    const { userId } = await auth();
    const product = await getProductById(id);
    if (!product) {
      return { success: false, error: "Producto no encontrado." };
    }

    const slug =
      parsed.data.slug?.trim() ||
      (await ensureUniqueProductSlug(product.name, id));

    const supabase = createAdminSupabaseClient();
    const { error } = await supabase
      .from("products")
      .update({ slug, updated_by: userId })
      .eq("id", id);

    if (error) {
      console.error("[updateProductCatalog]", error.message);
      return { success: false, error: "No se pudo actualizar la configuración del catálogo." };
    }

    revalidatePath("/products");
    revalidatePath(`/products/${id}/edit`);
    revalidatePath("/catalogo");
    return { success: true, productId: id };
  } catch (error) {
    console.error("[updateProductCatalog]", error);
    return { success: false, error: "No se pudo actualizar la configuración del catálogo." };
  }
}

export async function updateProductInventorySettings(
  id: string,
  values: import("@/lib/products/schema").ProductInventorySettingsValues,
): Promise<MutationResult> {
  const { productInventorySettingsSchema } = await import("@/lib/products/schema");
  const parsed = productInventorySettingsSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos del formulario inválidos",
    };
  }

  try {
    const { userId } = await auth();
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase
      .from("products")
      .update({
        minimum_stock: parsed.data.minimum_stock ?? null,
        updated_by: userId,
      })
      .eq("id", id);

    if (error) {
      console.error("[updateProductInventorySettings]", error.message);
      return { success: false, error: "No se pudo actualizar la configuración de inventario." };
    }

    revalidatePath(`/products/${id}/edit`);
    return { success: true, productId: id };
  } catch (error) {
    console.error("[updateProductInventorySettings]", error);
    return { success: false, error: "No se pudo actualizar la configuración de inventario." };
  }
}

export async function updateBundleGeneral(
  id: string,
  values: import("@/lib/products/schema").BundleGeneralValues,
): Promise<MutationResult> {
  const { bundleGeneralSchema } = await import("@/lib/products/schema");
  const parsed = bundleGeneralSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos del formulario inválidos",
    };
  }

  try {
    const { userId } = await auth();
    const supabase = createAdminSupabaseClient();

    const { error } = await supabase
      .from("products")
      .update({
        name: parsed.data.name.trim(),
        description: parsed.data.description?.trim() || null,
        category_id: parsed.data.category_id,
        updated_by: userId,
      })
      .eq("id", id);

    if (error) {
      console.error("[updateBundleGeneral]", error.message);
      return { success: false, error: "No se pudo actualizar el paquete." };
    }

    await replaceBundleItems(id, parsed.data.components, userId);

    revalidatePath("/products");
    revalidatePath(`/products/${id}/edit`);
    revalidatePath("/catalogo");
    return { success: true, productId: id };
  } catch (error) {
    console.error("[updateBundleGeneral]", error);
    return { success: false, error: "No se pudo actualizar el paquete." };
  }
}

export async function updateBundlePricing(
  id: string,
  values: import("@/lib/products/schema").ProductPricingValues,
): Promise<MutationResult> {
  return updateProductPricing(id, values);
}

export async function updateProductDetails(
  id: string,
  values: import("@/lib/products/schema").ProductDetailsValues,
): Promise<MutationResult> {
  const { productDetailsSchema } = await import("@/lib/products/schema");
  const parsed = productDetailsSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos del formulario inválidos",
    };
  }

  const generalResult = await updateProductGeneral(id, {
    name: parsed.data.name,
    description: parsed.data.description,
    category_id: parsed.data.category_id,
  });

  if (!generalResult.success) {
    return generalResult;
  }

  return updateProductPricing(id, {
    rental_available: parsed.data.rental_available,
    sale_available: parsed.data.sale_available,
    rental_price: parsed.data.rental_price,
    sale_price: parsed.data.sale_price,
    replacement_cost: parsed.data.replacement_cost,
  });
}

export async function updateBundleDetails(
  id: string,
  values: import("@/lib/products/schema").BundleDetailsValues,
): Promise<MutationResult> {
  const { bundleDetailsSchema } = await import("@/lib/products/schema");
  const parsed = bundleDetailsSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Datos del formulario inválidos",
    };
  }

  const generalResult = await updateBundleGeneral(id, {
    name: parsed.data.name,
    description: parsed.data.description,
    category_id: parsed.data.category_id,
    components: parsed.data.components,
  });

  if (!generalResult.success) {
    return generalResult;
  }

  return updateProductPricing(id, {
    rental_available: parsed.data.rental_available,
    sale_available: parsed.data.sale_available,
    rental_price: parsed.data.rental_price,
    sale_price: parsed.data.sale_price,
  });
}
