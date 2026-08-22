"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Globe, ImageIcon, Link2 } from "lucide-react";
import { ProductImagesPanel } from "@/components/products/product-images-panel";
import { ProductVisibilityHint } from "@/components/products/product-status-toggles";
import { updateProductCatalog } from "@/lib/products/actions";
import {
  productCatalogSchema,
  type ProductCatalogValues,
} from "@/lib/products/schema";
import type { ProductImage } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ProductCatalogTabProps = {
  productId: string;
  slug: string;
  isPublic: boolean;
  images: ProductImage[];
};

export function ProductCatalogTab({
  productId,
  slug,
  isPublic,
  images,
}: ProductCatalogTabProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const form = useForm<ProductCatalogValues>({
    resolver: zodResolver(productCatalogSchema),
    defaultValues: { slug },
  });

  const { register, handleSubmit, watch } = form;
  const currentSlug = watch("slug") || slug;

  function onSubmit(values: ProductCatalogValues) {
    setSubmitError(null);
    setSaved(false);

    startTransition(async () => {
      const result = await updateProductCatalog(productId, values);
      if (!result.success) {
        setSubmitError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2">
            <Globe className="size-4" />
            Catálogo web
          </CardTitle>
          <CardDescription>
            URL pública y configuración de visibilidad en el sitio web.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
            <div className="space-y-4">
              <ProductVisibilityHint isPublic={isPublic} />
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug de URL pública</Label>
                  <Input
                    id="slug"
                    placeholder="Se genera automáticamente si se deja vacío"
                    {...register("slug")}
                  />
                  <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Link2 className="size-3.5 shrink-0" />
                    /catalogo/{currentSlug || slug}
                  </p>
                </div>

                {submitError ? (
                  <p className="text-sm text-destructive">{submitError}</p>
                ) : null}
                {saved ? (
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">
                    Slug guardado.
                  </p>
                ) : null}

                <Button type="submit" variant="commit" disabled={isPending}>
                  {isPending ? "Guardando..." : "Guardar slug"}
                </Button>
              </form>
            </div>

            <div className="rounded-xl border border-dashed border-border/80 bg-muted/15 p-5 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Consejos</p>
              <ul className="mt-3 list-inside list-disc space-y-2">
                <li>Use los toggles del encabezado para publicar u ocultar al instante.</li>
                <li>Agregue al menos una foto para que el producto se vea bien en línea.</li>
                <li>La primera imagen subida será la foto principal del catálogo.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2">
            <ImageIcon className="size-4" />
            Fotos del producto
          </CardTitle>
          <CardDescription>
            Imágenes mostradas en el catálogo público y la página de detalle.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductImagesPanel productId={productId} images={images} embedded />
        </CardContent>
      </Card>
    </div>
  );
}
