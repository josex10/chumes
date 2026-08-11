import { z } from "zod";

const optionalNumber = z.number().nonnegative().optional();

const bundleComponentSchema = z.object({
  component_product_id: z.string().uuid("Select a component product"),
  quantity: z.coerce.number().positive("Quantity must be greater than zero"),
});

export const productFormSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    description: z.string().trim().optional(),
    category_id: z.coerce.number().int().positive("Category is required"),
    rental_available: z.boolean(),
    sale_available: z.boolean(),
    minimum_stock: optionalNumber,
    rental_price: optionalNumber,
    sale_price: optionalNumber,
    replacement_cost: optionalNumber,
    is_active: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.rental_available && values.rental_price === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Rental price is required when rental is enabled",
        path: ["rental_price"],
      });
    }

    if (values.sale_available && values.sale_price === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Sale price is required when sale is enabled",
        path: ["sale_price"],
      });
    }

    if (!values.rental_available && !values.sale_available) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enable rental or sale availability",
        path: ["rental_available"],
      });
    }
  });

export const bundleFormSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    description: z.string().trim().optional(),
    category_id: z.coerce.number().int().positive("Category is required"),
    rental_available: z.boolean(),
    sale_available: z.boolean(),
    rental_price: optionalNumber,
    sale_price: optionalNumber,
    is_active: z.boolean(),
    components: z
      .array(bundleComponentSchema)
      .min(1, "Add at least one component product"),
  })
  .superRefine((values, ctx) => {
    if (values.rental_available && values.rental_price === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Rental price is required when rental is enabled",
        path: ["rental_price"],
      });
    }

    if (values.sale_available && values.sale_price === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Sale price is required when sale is enabled",
        path: ["sale_price"],
      });
    }

    if (!values.rental_available && !values.sale_available) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enable rental or sale availability",
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
        message: "Each component can only be added once",
        path: ["components"],
      });
    }
  });

export type ProductFormValues = z.infer<typeof productFormSchema>;
export type BundleFormValues = z.infer<typeof bundleFormSchema>;

export function toProductPayload(values: ProductFormValues) {
  return {
    name: values.name.trim(),
    description: values.description?.trim() || null,
    category_id: values.category_id,
    rental_available: values.rental_available,
    sale_available: values.sale_available,
    minimum_stock: values.minimum_stock ?? null,
    is_active: values.is_active,
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
    components: values.components,
  };
}
