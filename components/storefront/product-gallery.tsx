import Image from "next/image";
import { StorefrontImage } from "@/components/storefront/storefront-image";
import { getProductImagePublicUrl } from "@/lib/products/images";
import type { PublicProduct } from "@/lib/supabase/types";

type ProductGalleryProps = {
  product: PublicProduct;
};

export function ProductGallery({ product }: ProductGalleryProps) {
  if (product.images.length === 0) {
    return (
      <StorefrontImage
        placeholder="inspiracion-detalle"
        alt={product.name}
        className="aspect-[4/5]"
        sizes="(max-width: 1024px) 100vw, 55vw"
        priority
      />
    );
  }

  const [primary, ...rest] = [...product.images].sort(
    (left, right) => Number(right.is_primary) - Number(left.is_primary),
  );

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Image
          src={getProductImagePublicUrl(primary.storage_path)}
          alt={primary.alt_text ?? product.name}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 55vw"
        />
      </div>
      {rest.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {rest.map((image) => (
            <div key={image.id} className="relative aspect-square overflow-hidden bg-muted">
              <Image
                src={getProductImagePublicUrl(image.storage_path)}
                alt={image.alt_text ?? product.name}
                fill
                className="object-cover"
                sizes="20vw"
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
