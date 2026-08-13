"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { recordMovement } from "@/lib/inventory/actions";
import {
  movementFormSchema,
  type MovementFormValues,
} from "@/lib/inventory/schema";
import type {
  InventoryMovementType,
  InventoryMovementWithRelations,
} from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type InventoryPanelProps = {
  productId: string;
  stock: number;
  minimumStock: number | null;
  movementTypes: InventoryMovementType[];
  movements: InventoryMovementWithRelations[];
};

function formatQuantity(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

export function InventoryPanel({
  productId,
  stock,
  minimumStock,
  movementTypes,
  movements,
}: InventoryPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<MovementFormValues>({
    resolver: zodResolver(movementFormSchema),
    defaultValues: {
      movement_type_code: "INITIAL_LOAD",
      quantity: 1,
      adjustment_direction: "increase",
      notes: "",
    },
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = form;

  const movementTypeCode = watch("movement_type_code");
  const belowMinimum =
    minimumStock !== null && stock < Number(minimumStock);

  function onSubmit(values: MovementFormValues) {
    setSubmitError(null);

    startTransition(async () => {
      const result = await recordMovement(productId, values);

      if (!result.success) {
        setSubmitError(result.error);
        return;
      }

      reset({
        movement_type_code: values.movement_type_code,
        quantity: 1,
        adjustment_direction: "increase",
        notes: "",
      });
      router.refresh();
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Inventory</CardTitle>
          <CardDescription>
            Stock is calculated from recorded movements. Direct stock edits are
            not allowed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-3xl font-semibold">{formatQuantity(stock)}</p>
          <p className="text-sm text-muted-foreground">
            Current balance
            {minimumStock !== null ? ` · Minimum stock: ${minimumStock}` : ""}
          </p>
          {belowMinimum && (
            <p className="text-sm text-destructive">
              Stock is below the configured minimum.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Record movement</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="movement_type_code">Movement type</Label>
                <Controller
                  control={control}
                  name="movement_type_code"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      items={movementTypes.map((type) => ({
                        value: type.code,
                        label: type.name,
                      }))}
                    >
                      <SelectTrigger id="movement_type_code" className="w-full">
                        <SelectValue placeholder="Select movement type" />
                      </SelectTrigger>
                      <SelectContent>
                        {movementTypes.map((type) => (
                          <SelectItem key={type.id} value={type.code}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.movement_type_code && (
                  <p className="text-sm text-destructive">
                    {errors.movement_type_code.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0.01"
                  step="0.01"
                  {...register("quantity", { valueAsNumber: true })}
                />
                {errors.quantity && (
                  <p className="text-sm text-destructive">
                    {errors.quantity.message}
                  </p>
                )}
              </div>
            </div>

            {movementTypeCode === "ADJUSTMENT" && (
              <div className="space-y-2">
                <Label htmlFor="adjustment_direction">Adjustment direction</Label>
                <Controller
                  control={control}
                  name="adjustment_direction"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      items={[
                        { value: "increase", label: "Increase stock" },
                        { value: "decrease", label: "Decrease stock" },
                      ]}
                    >
                      <SelectTrigger
                        id="adjustment_direction"
                        className="w-full"
                      >
                        <SelectValue placeholder="Select direction" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="increase">Increase stock</SelectItem>
                        <SelectItem value="decrease">Decrease stock</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.adjustment_direction && (
                  <p className="text-sm text-destructive">
                    {errors.adjustment_direction.message}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={3} {...register("notes")} />
            </div>

            {submitError && (
              <p className="text-sm text-destructive">{submitError}</p>
            )}

            <Button type="submit" variant="commit" disabled={isPending}>
              {isPending ? "Recording..." : "Record movement"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Movement history</CardTitle>
        </CardHeader>
        <CardContent>
          {movements.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No inventory movements recorded yet.
            </p>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>
                        {new Date(movement.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {movement.inventory_movement_types.name}
                      </TableCell>
                      <TableCell>{formatQuantity(Number(movement.quantity))}</TableCell>
                      <TableCell>{movement.notes ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
