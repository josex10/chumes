"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  buildProductImageStoragePath,
  PRODUCT_IMAGES_BUCKET,
} from "@/lib/products/images";

type ActionResult =
  | { success: true; imageId?: string }
  | { success: false; error: string };

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function uploadProductImage(
  productId: string,
  formData: FormData,
): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "No autorizado." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Seleccione una imagen." };
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return { success: false, error: "Formato no permitido. Use JPG, PNG o WebP." };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: "La imagen debe pesar menos de 5 MB." };
  }

  try {
    const supabase = createAdminSupabaseClient();
    const storagePath = buildProductImageStoragePath(productId, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("[uploadProductImage]", uploadError.message);
      return { success: false, error: "No se pudo subir la imagen." };
    }

    const { data: existingImages } = await supabase
      .from("product_images")
      .select("id")
      .eq("product_id", productId);

    const isPrimary = (existingImages ?? []).length === 0;

    const { data, error } = await supabase
      .from("product_images")
      .insert({
        product_id: productId,
        storage_path: storagePath,
        alt_text: file.name.replace(/\.[^.]+$/, ""),
        sort_order: existingImages?.length ?? 0,
        is_primary: isPrimary,
      })
      .select("id")
      .single();

    if (error || !data) {
      await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([storagePath]);
      console.error("[uploadProductImage insert]", error?.message);
      return { success: false, error: "No se pudo registrar la imagen." };
    }

    revalidatePath(`/products/${productId}/edit`);
    revalidatePath("/catalogo");
    return { success: true, imageId: data.id };
  } catch (error) {
    console.error("[uploadProductImage]", error);
    return { success: false, error: "No se pudo subir la imagen." };
  }
}

export async function deleteProductImage(
  imageId: string,
  productId: string,
): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "No autorizado." };
  }

  try {
    const supabase = createAdminSupabaseClient();
    const { data: image, error: readError } = await supabase
      .from("product_images")
      .select("*")
      .eq("id", imageId)
      .eq("product_id", productId)
      .maybeSingle();

    if (readError || !image) {
      return { success: false, error: "Imagen no encontrada." };
    }

    const { error: deleteError } = await supabase
      .from("product_images")
      .delete()
      .eq("id", imageId);

    if (deleteError) {
      console.error("[deleteProductImage]", deleteError.message);
      return { success: false, error: "No se pudo eliminar la imagen." };
    }

    await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .remove([image.storage_path]);

    if (image.is_primary) {
      const { data: nextImage } = await supabase
        .from("product_images")
        .select("id")
        .eq("product_id", productId)
        .order("sort_order")
        .limit(1)
        .maybeSingle();

      if (nextImage) {
        await supabase
          .from("product_images")
          .update({ is_primary: true })
          .eq("id", nextImage.id);
      }
    }

    revalidatePath(`/products/${productId}/edit`);
    revalidatePath("/catalogo");
    return { success: true };
  } catch (error) {
    console.error("[deleteProductImage]", error);
    return { success: false, error: "No se pudo eliminar la imagen." };
  }
}

export async function setPrimaryProductImage(
  imageId: string,
  productId: string,
): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "No autorizado." };
  }

  try {
    const supabase = createAdminSupabaseClient();

    await supabase
      .from("product_images")
      .update({ is_primary: false })
      .eq("product_id", productId);

    const { error } = await supabase
      .from("product_images")
      .update({ is_primary: true })
      .eq("id", imageId)
      .eq("product_id", productId);

    if (error) {
      console.error("[setPrimaryProductImage]", error.message);
      return { success: false, error: "No se pudo actualizar la imagen principal." };
    }

    revalidatePath(`/products/${productId}/edit`);
    revalidatePath("/catalogo");
    return { success: true };
  } catch (error) {
    console.error("[setPrimaryProductImage]", error);
    return { success: false, error: "No se pudo actualizar la imagen principal." };
  }
}
