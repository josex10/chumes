import { formatPhoneNumber } from "@/lib/customers/phone";
import type { CustomerWithRelations } from "@/lib/supabase/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type CustomerDetailInfoProps = {
  customer: CustomerWithRelations;
};

export function CustomerDetailInfo({ customer }: CustomerDetailInfoProps) {
  const phone = customer.phone ? formatPhoneNumber(customer.phone) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del cliente</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-sm text-muted-foreground">Tipo</p>
          <p className="font-medium">{customer.customer_types.name}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Identificación</p>
          <p className="font-medium">{customer.identification ?? "—"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Teléfono</p>
          {phone ? (
            <a href={`tel:${customer.phone}`} className="font-medium hover:underline">
              {phone}
            </a>
          ) : (
            <p className="font-medium">—</p>
          )}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Email</p>
          {customer.email ? (
            <a href={`mailto:${customer.email}`} className="font-medium hover:underline">
              {customer.email}
            </a>
          ) : (
            <p className="font-medium">—</p>
          )}
        </div>
        {customer.notes && (
          <div className="sm:col-span-2">
            <p className="text-sm text-muted-foreground">Notas</p>
            <p className="font-medium whitespace-pre-wrap">{customer.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
