import type { ProductImage } from "@/lib/supabase/types";

const BUCKET = "product-images";

// Static access so Next.js inlines this in client bundles.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export function getProductImagePublicUrl(storagePath: string): string {
  if (!SUPABASE_URL) {
    throw new Error(
      "Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL",
    );
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

export function getPrimaryImageUrl(images: ProductImage[]): string | null {
  if (images.length === 0) {
    return null;
  }

  const primary = images.find((image) => image.is_primary) ?? images[0];
  return getProductImagePublicUrl(primary.storage_path);
}

export function buildProductImageStoragePath(
  productId: string,
  fileName: string,
): string {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeExtension = extension.replace(/[^a-z0-9]/g, "") || "jpg";
  return `${productId}/${crypto.randomUUID()}.${safeExtension}`;
}

export { BUCKET as PRODUCT_IMAGES_BUCKET };
