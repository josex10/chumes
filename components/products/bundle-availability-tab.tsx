import { Layers } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type BundleAvailabilityTabProps = {
  availability: number;
};

export function BundleAvailabilityTab({
  availability,
}: BundleAvailabilityTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="inline-flex items-center gap-2">
          <Layers className="size-4" />
          Disponibilidad derivada
        </CardTitle>
        <CardDescription>
          El stock del paquete se calcula a partir de los productos componentes.
          Ajuste el inventario de los componentes para cambiar cuántos paquetes
          completos hay disponibles.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-4xl font-semibold tracking-tight">{availability}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Paquetes completos disponibles actualmente
        </p>
      </CardContent>
    </Card>
  );
}
