import { z } from "zod";

const optionalNumber = z.number().nonnegative().optional();

const bundleComponentSchema = z.object({
  component_product_id: z.string().uuid("Seleccione un producto componente"),
  quantity: z.coerce.number().positive("La cantidad debe ser mayor que cero"),
});

export const productFormSchema = z
  .object({
    name: z.string().trim().min(1, "El nombre es obligatorio"),
    description: z.string().trim().optional(),
    category_id: z.coerce.number().int().positive("La categoría es obligatoria"),
    rental_available: z.boolean(),
    sale_available: z.boolean(),
    minimum_stock: optionalNumber,
    rental_price: optionalNumber,
    sale_price: optionalNumber,
    replacement_cost: optionalNumber,
    is_active: z.boolean(),
    is_public: z.boolean(),
    slug: z.string().trim().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.rental_available && values.rental_price === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El precio de alquiler es obligatorio cuando el alquiler está activo",
        path: ["rental_price"],
      });
    }

    if (values.sale_available && values.sale_price === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El precio de venta es obligatorio cuando la venta está activa",
        path: ["sale_price"],
      });
    }

    if (!values.rental_available && !values.sale_available) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Active alquiler o venta",
        path: ["rental_available"],
      });
    }
  });

export const bundleFormSchema = z
  .object({
    name: z.string().trim().min(1, "El nombre es obligatorio"),
    description: z.string().trim().optional(),
    category_id: z.coerce.number().int().positive("La categoría es obligatoria"),
    rental_available: z.boolean(),
    sale_available: z.boolean(),
    rental_price: optionalNumber,
    sale_price: optionalNumber,
    is_active: z.boolean(),
    is_public: z.boolean(),
    slug: z.string().trim().optional(),
    components: z
      .array(bundleComponentSchema)
      .min(1, "Agregue al menos un producto componente"),
  })
  .superRefine((values, ctx) => {
    if (values.rental_available && values.rental_price === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El precio de alquiler es obligatorio cuando el alquiler está activo",
        path: ["rental_price"],
      });
    }

    if (values.sale_available && values.sale_price === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El precio de venta es obligatorio cuando la venta está activa",
        path: ["sale_price"],
      });
    }

    if (!values.rental_available && !values.sale_available) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Active alquiler o venta",
        path: ["rental_available"],
      });
    }

    const componentIds = values.components.map(
      (component) => component.component_product_id,
    );
    const uniqueIds = new Set(componentIds);

    if (uniqueIds.size !== componentIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cada componente solo puede agregarse una vez",
        path: ["components"],
      });
    }
  });

export type ProductFormValues = z.infer<typeof productFormSchema>;
export type BundleFormValues = z.infer<typeof bundleFormSchema>;

export const productGeneralSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  description: z.string().trim().optional(),
  category_id: z.coerce.number().int().positive("La categoría es obligatoria"),
});

const pricingRefinement = (
  values: {
    rental_available: boolean;
    sale_available: boolean;
    rental_price?: number;
    sale_price?: number;
  },
  ctx: z.RefinementCtx,
) => {
  if (values.rental_available && values.rental_price === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El precio de alquiler es obligatorio cuando el alquiler está activo",
      path: ["rental_price"],
    });
  }

  if (values.sale_available && values.sale_price === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El precio de venta es obligatorio cuando la venta está activa",
      path: ["sale_price"],
    });
  }

  if (!values.rental_available && !values.sale_available) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Active alquiler o venta",
      path: ["rental_available"],
    });
  }
};

export const productPricingFieldsSchema = z.object({
  rental_available: z.boolean(),
  sale_available: z.boolean(),
  rental_price: optionalNumber,
  sale_price: optionalNumber,
  replacement_cost: optionalNumber,
});

export const productPricingSchema = productPricingFieldsSchema.superRefine(
  pricingRefinement,
);

export const productCatalogSchema = z.object({
  slug: z.string().trim().optional(),
});

export const productInventorySettingsSchema = z.object({
  minimum_stock: optionalNumber,
});

export const bundleGeneralSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  description: z.string().trim().optional(),
  category_id: z.coerce.number().int().positive("La categoría es obligatoria"),
  components: z
    .array(bundleComponentSchema)
    .min(1, "Agregue al menos un producto componente"),
});

export const bundlePricingSchema = productPricingSchema;

export type ProductGeneralValues = z.infer<typeof productGeneralSchema>;
export type ProductPricingValues = z.infer<typeof productPricingSchema>;
export type ProductCatalogValues = z.infer<typeof productCatalogSchema>;
export type ProductInventorySettingsValues = z.infer<
  typeof productInventorySettingsSchema
>;
export type BundleGeneralValues = z.infer<typeof bundleGeneralSchema>;

export const productDetailsSchema = productGeneralSchema
  .merge(productPricingFieldsSchema)
  .superRefine(pricingRefinement);

export const bundleDetailsSchema = bundleGeneralSchema
  .merge(productPricingFieldsSchema)
  .superRefine((values, ctx) => {
    pricingRefinement(values, ctx);

    const componentIds = values.components.map(
      (component) => component.component_product_id,
    );
    const uniqueIds = new Set(componentIds);

    if (uniqueIds.size !== componentIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cada componente solo puede agregarse una vez",
        path: ["components"],
      });
    }
  });

export type ProductDetailsValues = z.infer<typeof productDetailsSchema>;
export type BundleDetailsValues = z.infer<typeof bundleDetailsSchema>;

export function toProductPayload(values: ProductFormValues) {
  return {
    name: values.name.trim(),
    description: values.description?.trim() || null,
    category_id: values.category_id,
    rental_available: values.rental_available,
    sale_available: values.sale_available,
    minimum_stock: values.minimum_stock ?? null,
    is_active: values.is_active,
    is_public: values.is_public,
  };
}

export function toBundlePayload(values: BundleFormValues) {
  return {
    name: values.name.trim(),
    description: values.description?.trim() || null,
    category_id: values.category_id,
    rental_available: values.rental_available,
    sale_available: values.sale_available,
    is_active: values.is_active,
    is_public: values.is_public,
    components: values.components,
  };
}
