import { z } from "zod";
import { MANUAL_INVENTORY_MOVEMENT_TYPES } from "@/lib/inventory/constants";

export const movementFormSchema = z
  .object({
    movement_type_code: z.enum(MANUAL_INVENTORY_MOVEMENT_TYPES, {
      message: "Movement type is required",
    }),
    quantity: z.coerce.number().positive("Quantity must be greater than zero"),
    adjustment_direction: z.enum(["increase", "decrease"]).optional(),
    notes: z.string().trim().optional(),
  })
  .superRefine((values, ctx) => {
    if (
      values.movement_type_code === "ADJUSTMENT" &&
      !values.adjustment_direction
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select whether the adjustment increases or decreases stock",
        path: ["adjustment_direction"],
      });
    }
  });

export type MovementFormValues = z.infer<typeof movementFormSchema>;
