"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { createCustomer, updateCustomer } from "@/lib/customers/actions";
import {
  customerFormSchema,
  type CustomerFormValues,
} from "@/lib/customers/schema";
import {
  formatPhoneNumber,
  PHONE_MASK_PLACEHOLDER,
} from "@/lib/customers/phone";
import type { CustomerType, CustomerWithRelations } from "@/lib/supabase/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CustomerFormProps = {
  customerTypes: CustomerType[];
  customer?: CustomerWithRelations;
};

export function CustomerForm({ customerTypes, customer }: CustomerFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEditing = Boolean(customer);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: customer?.name ?? "",
      identification: customer?.identification ?? "",
      customer_type_id: customer?.customer_type_id ?? undefined,
      email: customer?.email ?? "",
      phone: formatPhoneNumber(customer?.phone ?? ""),
      notes: customer?.notes ?? "",
    },
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  function onSubmit(values: CustomerFormValues) {
    setSubmitError(null);

    startTransition(async () => {
      const result = isEditing
        ? await updateCustomer(customer!.id, values)
        : await createCustomer(values);

      if (!result.success) {
        setSubmitError(result.error);
        return;
      }

      router.push("/customers");
      router.refresh();
    });
  }

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit customer" : "New customer"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Update customer information."
            : "Add a new customer to the system."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone <span className="text-destructive">*</span>
            </Label>
            <Controller
              control={control}
              name="phone"
              render={({ field }) => (
                <Input
                  id="phone"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder={PHONE_MASK_PLACEHOLDER}
                  value={field.value}
                  onChange={(event) =>
                    field.onChange(formatPhoneNumber(event.target.value))
                  }
                  aria-invalid={!!errors.phone}
                />
              )}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer_type_id">
              Customer type <span className="text-destructive">*</span>
            </Label>
            <Controller
              control={control}
              name="customer_type_id"
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : undefined}
                  onValueChange={(value) => field.onChange(Number(value))}
                  items={customerTypes.map((type) => ({
                    value: String(type.id),
                    label: type.name,
                  }))}
                >
                  <SelectTrigger id="customer_type_id" className="w-full">
                    <SelectValue placeholder="Select a customer type" />
                  </SelectTrigger>
                  <SelectContent>
                    {customerTypes.map((type) => (
                      <SelectItem key={type.id} value={String(type.id)}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.customer_type_id && (
              <p className="text-sm text-destructive">
                {errors.customer_type_id.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="identification">Identification</Label>
            <Input id="identification" {...register("identification")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={4} {...register("notes")} />
          </div>

          {submitError && (
            <p className="text-sm text-destructive">{submitError}</p>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/customers"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Cancel
            </Link>
            <Button type="submit" variant="commit" disabled={isPending}>
              {isPending
                ? "Saving..."
                : isEditing
                  ? "Save changes"
                  : "Create customer"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
