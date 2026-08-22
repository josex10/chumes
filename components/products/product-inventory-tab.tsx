"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Package, PackageX } from "lucide-react";
import { recordMovement } from "@/lib/inventory/actions";
import {
  movementFormSchema,
  type MovementFormValues,
} from "@/lib/inventory/schema";
import { updateProductInventorySettings } from "@/lib/products/actions";
import {
  productInventorySettingsSchema,
  type ProductInventorySettingsValues,
} from "@/lib/products/schema";
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
import { cn } from "@/lib/utils";

type ProductInventoryTabProps = {
  productId: string;
  stock: number;
  minimumStock: number | null;
  movementTypes: InventoryMovementType[];
  movements: InventoryMovementWithRelations[];
};

function formatQuantity(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

export function ProductInventoryTab({
  productId,
  stock,
  minimumStock,
  movementTypes,
  movements,
}: ProductInventoryTabProps) {
  const router = useRouter();
  const [settingsPending, startSettingsTransition] = useTransition();
  const [movementPending, startMovementTransition] = useTransition();
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [movementError, setMovementError] = useState<string | null>(null);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const belowMinimum = minimumStock !== null && stock < Number(minimumStock);
  const outOfStock = stock <= 0;

  const settingsForm = useForm<ProductInventorySettingsValues>({
    resolver: zodResolver(productInventorySettingsSchema),
    defaultValues: { minimum_stock: minimumStock ?? undefined },
  });

  const movementForm = useForm<MovementFormValues>({
    resolver: zodResolver(movementFormSchema),
    defaultValues: {
      movement_type_code: "INITIAL_LOAD",
      quantity: 1,
      adjustment_direction: "increase",
      notes: "",
    },
  });

  const movementTypeCode = movementForm.watch("movement_type_code");

  function onSaveSettings(values: ProductInventorySettingsValues) {
    setSettingsError(null);
    setSettingsSaved(false);
    startSettingsTransition(async () => {
      const result = await updateProductInventorySettings(productId, values);
      if (!result.success) {
        setSettingsError(result.error);
        return;
      }
      setSettingsSaved(true);
      router.refresh();
    });
  }

  function onRecordMovement(values: MovementFormValues) {
    setMovementError(null);
    startMovementTransition(async () => {
      const result = await recordMovement(productId, values);
      if (!result.success) {
        setMovementError(result.error);
        return;
      }
      movementForm.reset({
        movement_type_code: values.movement_type_code,
        quantity: 1,
        adjustment_direction: "increase",
        notes: "",
      });
      router.refresh();
    });
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Registrar movimiento</CardTitle>
            <CardDescription>
              Agregue entradas de stock, ajustes u otros eventos de inventario.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={movementForm.handleSubmit(onRecordMovement)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="movement_type_code">Tipo de movimiento</Label>
                <Controller
                  control={movementForm.control}
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
                        <SelectValue placeholder="Seleccione el tipo de movimiento" />
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Cantidad</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0.01"
                  step="0.01"
                  {...movementForm.register("quantity", { valueAsNumber: true })}
                />
              </div>

              {movementTypeCode === "ADJUSTMENT" ? (
                <div className="space-y-2">
                  <Label htmlFor="adjustment_direction">Dirección</Label>
                  <Controller
                    control={movementForm.control}
                    name="adjustment_direction"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        items={[
                          { value: "increase", label: "Aumentar stock" },
                          { value: "decrease", label: "Disminuir stock" },
                        ]}
                      >
                        <SelectTrigger id="adjustment_direction" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="increase">Aumentar stock</SelectItem>
                          <SelectItem value="decrease">Disminuir stock</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea id="notes" rows={3} {...movementForm.register("notes")} />
              </div>

              {movementError ? (
                <p className="text-sm text-destructive">{movementError}</p>
              ) : null}

              <Button type="submit" variant="commit" disabled={movementPending}>
                {movementPending ? "Registrando..." : "Registrar movimiento"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2">
              {outOfStock ? (
                <PackageX className="size-4 text-destructive" />
              ) : belowMinimum ? (
                <AlertTriangle className="size-4 text-amber-500" />
              ) : (
                <Package className="size-4" />
              )}
              Resumen de stock
            </CardTitle>
            <CardDescription>
              Saldo actual según todos los movimientos registrados.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p
                className={cn(
                  "text-5xl font-semibold tracking-tight",
                  outOfStock && "text-destructive",
                  belowMinimum && !outOfStock && "text-amber-600 dark:text-amber-400",
                )}
              >
                {formatQuantity(stock)}
              </p>
              {belowMinimum ? (
                <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                  Por debajo del stock mínimo
                </p>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  Unidades disponibles actualmente
                </p>
              )}
            </div>

            <form
              onSubmit={settingsForm.handleSubmit(onSaveSettings)}
              className="space-y-2 border-t border-border/60 pt-6"
            >
              <Label htmlFor="minimum_stock">Alerta de stock mínimo</Label>
              <div className="flex gap-2">
                <Input
                  id="minimum_stock"
                  type="number"
                  min="0"
                  step="0.01"
                  {...settingsForm.register("minimum_stock", {
                    setValueAs: (value) =>
                      value === "" || Number.isNaN(Number(value))
                        ? undefined
                        : Number(value),
                  })}
                />
                <Button type="submit" variant="outline" disabled={settingsPending}>
                  Guardar
                </Button>
              </div>
              {settingsError ? (
                <p className="text-sm text-destructive">{settingsError}</p>
              ) : null}
              {settingsSaved ? (
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  Umbral guardado.
                </p>
              ) : null}
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Historial de movimientos</CardTitle>
          <CardDescription>Registro completo de cambios de inventario de este producto.</CardDescription>
        </CardHeader>
        <CardContent>
          {movements.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no hay movimientos de inventario registrados.
            </p>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Notas</TableHead>
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
                      <TableCell>
                        {formatQuantity(Number(movement.quantity))}
                      </TableCell>
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
