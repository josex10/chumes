"use client";

import { useEffect, useState, useTransition } from "react";
import {
  ChevronDown,
  Dices,
  IdCard,
  Mail,
  Phone,
  SlidersHorizontal,
  StickyNote,
  User,
  UserRound,
} from "lucide-react";
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import { generateUniqueAnonymousCustomerName } from "@/lib/customers/actions";
import { getIndividualCustomerTypeId } from "@/lib/customers/constants";
import {
  formatPhoneNumber,
  PHONE_COUNTRY_PREFIX,
  PHONE_MASK_PLACEHOLDER,
} from "@/lib/customers/phone";
import type { CustomerFormValues } from "@/lib/customers/schema";
import type { CustomerType, CustomerWithRelations } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CustomerFormFieldsProps = {
  customerTypes: CustomerType[];
  register: UseFormRegister<CustomerFormValues>;
  control: Control<CustomerFormValues>;
  errors: FieldErrors<CustomerFormValues>;
  idPrefix?: string;
  defaultAdvancedOpen?: boolean;
  resetKey?: string | number | boolean;
  notesRows?: number;
};

export function getEmptyCustomerFormValues(
  customerTypes: CustomerType[],
): CustomerFormValues {
  return {
    name: "",
    identification: "",
    customer_type_id: getIndividualCustomerTypeId(customerTypes) ?? 0,
    email: "",
    phone: "",
    notes: "",
  };
}

export function getCustomerFormValues(
  customer: CustomerWithRelations,
): CustomerFormValues {
  return {
    name: customer.name,
    identification: customer.identification ?? "",
    customer_type_id: customer.customer_type_id,
    email: customer.email ?? "",
    phone: formatPhoneNumber(customer.phone ?? ""),
    notes: customer.notes ?? "",
  };
}

export function hasAdvancedCustomerFields(values: {
  identification?: string | null;
  email?: string | null;
  notes?: string | null;
}): boolean {
  return Boolean(
    values.identification?.trim() ||
      values.email?.trim() ||
      values.notes?.trim(),
  );
}

export function CustomerFormFields({
  customerTypes,
  register,
  control,
  errors,
  idPrefix = "customer",
  defaultAdvancedOpen = false,
  resetKey,
  notesRows = 3,
}: CustomerFormFieldsProps) {
  const [advancedOpen, setAdvancedOpen] = useState(defaultAdvancedOpen);
  const [isGeneratingName, startGeneratingName] = useTransition();
  const [generateNameError, setGenerateNameError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setAdvancedOpen(defaultAdvancedOpen);
    setGenerateNameError(null);
  }, [defaultAdvancedOpen, resetKey]);

  const nameId = `${idPrefix}-name`;
  const phoneId = `${idPrefix}-phone`;
  const typeId = `${idPrefix}-type`;
  const identificationId = `${idPrefix}-identification`;
  const emailId = `${idPrefix}-email`;
  const notesId = `${idPrefix}-notes`;
  const typeItems = customerTypes.map((type) => ({
    value: String(type.id),
    label: type.name,
  }));

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={nameId}>
          Nombre <span className="text-destructive">*</span>
        </Label>
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <InputGroup>
              <InputGroupAddon>
                <User className="size-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                id={nameId}
                autoComplete="name"
                placeholder="Nombre del cliente"
                aria-invalid={!!errors.name}
                value={field.value}
                onBlur={field.onBlur}
                onChange={field.onChange}
                name={field.name}
                ref={field.ref}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-xs"
                  variant="ghost"
                  disabled={isGeneratingName}
                  title="Generar nombre aleatorio"
                  aria-label="Generar nombre aleatorio"
                  onClick={() => {
                    setGenerateNameError(null);
                    startGeneratingName(async () => {
                      const result =
                        await generateUniqueAnonymousCustomerName();
                      if (!result.success) {
                        setGenerateNameError(result.error);
                        return;
                      }
                      field.onChange(result.name);
                    });
                  }}
                >
                  <Dices />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          )}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
        {generateNameError && (
          <p className="text-sm text-destructive">{generateNameError}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={phoneId}>
          Teléfono <span className="text-destructive">*</span>
        </Label>
        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <InputGroup>
              <InputGroupAddon className="border-r border-input pr-2">
                <Phone className="size-4 text-muted-foreground" />
                <InputGroupText className="font-medium tabular-nums text-foreground/80">
                  {PHONE_COUNTRY_PREFIX}
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id={phoneId}
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder={PHONE_MASK_PLACEHOLDER}
                value={field.value}
                onBlur={field.onBlur}
                onChange={(event) =>
                  field.onChange(formatPhoneNumber(event.target.value))
                }
                aria-invalid={!!errors.phone}
              />
            </InputGroup>
          )}
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={typeId}>
          Tipo de cliente <span className="text-destructive">*</span>
        </Label>
        <Controller
          control={control}
          name="customer_type_id"
          render={({ field }) => (
            <Select
              value={field.value ? String(field.value) : undefined}
              onValueChange={(value) => field.onChange(Number(value))}
              items={typeItems}
            >
              <SelectTrigger id={typeId} className="w-full">
                <UserRound className="size-4 text-muted-foreground" />
                <SelectValue placeholder="Seleccionar tipo" />
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

      <div className="space-y-3">
        <button
          type="button"
          aria-expanded={advancedOpen}
          onClick={() => setAdvancedOpen((open) => !open)}
          className="flex w-full items-center gap-2 rounded-lg border border-dashed border-border/80 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
        >
          <SlidersHorizontal className="size-4" />
          <span className="flex-1 text-left font-medium">
            Opciones avanzadas
          </span>
          <ChevronDown
            className={cn(
              "size-4 transition-transform",
              advancedOpen && "rotate-180",
            )}
          />
        </button>

        {advancedOpen ? (
          <div className="space-y-4 rounded-xl border border-border/70 bg-muted/20 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={identificationId}>Identificación</Label>
                <InputGroup>
                  <InputGroupAddon>
                    <IdCard className="size-4 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id={identificationId}
                    placeholder="Cédula o ID"
                    {...register("identification")}
                  />
                </InputGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor={emailId}>Email</Label>
                <InputGroup>
                  <InputGroupAddon>
                    <Mail className="size-4 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id={emailId}
                    type="email"
                    autoComplete="email"
                    placeholder="correo@ejemplo.com"
                    aria-invalid={!!errors.email}
                    {...register("email")}
                  />
                </InputGroup>
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={notesId}>Notas</Label>
              <InputGroup className="h-auto items-start">
                <InputGroupAddon className="pt-2.5">
                  <StickyNote className="size-4 text-muted-foreground" />
                </InputGroupAddon>
                <InputGroupTextarea
                  id={notesId}
                  rows={notesRows}
                  placeholder="Notas internas del cliente"
                  {...register("notes")}
                />
              </InputGroup>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
