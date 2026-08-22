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
  embedded?: boolean;
};

export function ProductImagesPanel({
  productId,
  images: initialImages,
  embedded = false,
}: ProductImagesPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState(initialImages);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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

      setImages((current) => [...current, result.image]);
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

  const content = (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        {!embedded ? (
          <div>
            <h2 className="text-lg font-semibold">Imágenes del catálogo</h2>
            <p className="text-sm text-muted-foreground">
              Estas fotos aparecen en el sitio web público.
            </p>
          </div>
        ) : (
          <div />
        )}
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => inputRef.current?.click()}
        >
          {isPending ? "Subiendo..." : "Subir imagen"}
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

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {images.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/80 px-6 py-12 text-center text-sm text-muted-foreground">
          Aún no hay fotos. Suba la primera imagen de este producto.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {images.map((image) => (
            <div
              key={image.id}
              className="overflow-hidden rounded-xl border border-border/70"
            >
              <div className="relative aspect-[4/3] bg-muted">
                <Image
                  src={getProductImagePublicUrl(image.storage_path)}
                  alt={image.alt_text ?? "Imagen del producto"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 p-4">
                {image.is_primary ? (
                  <Label>Foto principal</Label>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleSetPrimary(image.id)}
                  >
                    Usar como principal
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
    </>
  );

  if (embedded) {
    return <div className="space-y-6">{content}</div>;
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 rounded-xl border bg-card p-6">
      {content}
    </div>
  );
}
