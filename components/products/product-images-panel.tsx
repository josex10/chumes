"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import {
  deleteProductImage,
  setPrimaryProductImage,
  uploadProductImage,
} from "@/lib/products/image-actions";
import { getProductImagePublicUrl } from "@/lib/products/images";
import type { ProductImage } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type ProductImagesPanelProps = {
  productId: string;
  images: ProductImage[];
};

export function ProductImagesPanel({
  productId,
  images: initialImages,
}: ProductImagesPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState(initialImages);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function refreshFromServer() {
    window.location.reload();
  }

  function handleUpload(file: File) {
    setError(null);
    const formData = new FormData();
    formData.set("file", file);

    startTransition(async () => {
      const result = await uploadProductImage(productId, formData);
      if (!result.success) {
        setError(result.error);
        return;
      }

      refreshFromServer();
    });
  }

  function handleDelete(imageId: string) {
    startTransition(async () => {
      const result = await deleteProductImage(imageId, productId);
      if (!result.success) {
        setError(result.error);
        return;
      }

      setImages((current) => current.filter((image) => image.id !== imageId));
    });
  }

  function handleSetPrimary(imageId: string) {
    startTransition(async () => {
      const result = await setPrimaryProductImage(imageId, productId);
      if (!result.success) {
        setError(result.error);
        return;
      }

      setImages((current) =>
        current.map((image) => ({
          ...image,
          is_primary: image.id === imageId,
        })),
      );
    });
  }

  return (
    <div className="mx-auto w-full max-w-2xl rounded-xl border bg-card p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Imágenes del catálogo</h2>
          <p className="text-sm text-muted-foreground">
            Estas fotos se muestran en el sitio público.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => inputRef.current?.click()}
        >
          Subir imagen
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            handleUpload(file);
          }
          event.target.value = "";
        }}
      />

      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

      {images.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          Todavía no hay imágenes para este producto.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {images.map((image) => (
            <div
              key={image.id}
              className="overflow-hidden rounded-xl border border-border/70"
            >
              <div className="relative aspect-[4/3] bg-muted">
                <Image
                  src={getProductImagePublicUrl(image.storage_path)}
                  alt={image.alt_text ?? "Product image"}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-3 p-4">
                {image.is_primary ? (
                  <Label>Imagen principal</Label>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleSetPrimary(image.id)}
                  >
                    Marcar como principal
                  </Button>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleDelete(image.id)}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
