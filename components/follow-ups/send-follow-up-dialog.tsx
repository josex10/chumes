"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Loader2 } from "lucide-react";
import { completeEventFollowUp } from "@/lib/follow-ups/actions";
import type { FollowUpStep } from "@/lib/follow-ups/constants";
import { getFollowUpPhaseLabel } from "@/lib/follow-ups/constants";
import {
  buildFollowUpTemplateVars,
  renderFollowUpTemplate,
} from "@/lib/follow-ups/templates";
import {
  formatPhoneNumber,
  getCustomerWhatsAppUrl,
} from "@/lib/customers/phone";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { FollowUpTemplate } from "@/lib/supabase/types";

export type FollowUpMessageContext = {
  eventId: string;
  step: FollowUpStep;
  customerName: string;
  eventTitle: string;
  eventDate: string | null;
  location: string | null;
  quoteTotal: number | null;
  phone: string | null;
};

type SendFollowUpDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: FollowUpMessageContext;
  templates: FollowUpTemplate[];
};

function openWhatsApp(url: string) {
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function SendFollowUpDialog({
  open,
  onOpenChange,
  context,
  templates,
}: SendFollowUpDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [templateId, setTemplateId] = useState("");
  const vars = useMemo(
    () =>
      buildFollowUpTemplateVars({
        customerName: context.customerName,
        eventTitle: context.eventTitle,
        eventDate: context.eventDate,
        location: context.location,
        quoteTotal: context.quoteTotal,
      }),
    [context],
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open) return;
    setTemplateId("");
    setMessage("");
    setError(null);
  }, [open, context.eventId, context.step]);

  const phoneLabel = context.phone ? formatPhoneNumber(context.phone) : null;
  const whatsappUrl = context.phone
    ? getCustomerWhatsAppUrl(context.phone, message)
    : null;
  const selectedTemplate = templates.find((item) => item.id === templateId);

  function applyTemplate(nextId: string | null) {
    if (!nextId) return;
    setTemplateId(nextId);
    const template = templates.find((item) => item.id === nextId);
    if (template) {
      setMessage(renderFollowUpTemplate(template.body, vars));
    }
  }

  function handleSend() {
    if (!whatsappUrl) {
      setError("Este cliente no tiene un teléfono válido para WhatsApp.");
      return;
    }

    if (!message.trim()) {
      setError("Elegí una plantilla o escribí el mensaje.");
      return;
    }

    setError(null);
    openWhatsApp(whatsappUrl);

    startTransition(async () => {
      const result = await completeEventFollowUp({
        eventId: context.eventId,
        step: context.step,
        templateId: templateId || null,
        messageBody: message,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Enviar seguimiento</DialogTitle>
          <DialogDescription>
            Mensaje para {context.customerName}
            {phoneLabel ? ` · ${phoneLabel}` : ""}. Se abre WhatsApp con el
            texto listo y se registra este paso.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label>Fase del evento</Label>
            <p className="rounded-lg border bg-muted/40 px-3 py-2 text-sm font-medium">
              {getFollowUpPhaseLabel(context.step)}
            </p>
          </div>

          {templates.length > 0 ? (
            <div className="grid gap-1.5">
              <Label htmlFor="follow-up-template">Plantilla</Label>
              <Select
                value={templateId || null}
                onValueChange={applyTemplate}
                items={templates.map((template) => ({
                  value: template.id,
                  label: template.name,
                }))}
              >
                <SelectTrigger id="follow-up-template" className="w-full">
                  <SelectValue placeholder="Elegir mensaje" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTemplate ? (
                <p className="text-xs text-muted-foreground">
                  {selectedTemplate.name}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Elegí según el caso: sin cotización, cotización enviada, etc.
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No hay plantillas activas. Creá una en Plantillas o escribí el
              mensaje abajo.
            </p>
          )}

          <div className="grid gap-1.5">
            <Label htmlFor="follow-up-message">Qué dice el mensaje</Label>
            <Textarea
              id="follow-up-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={8}
              className="min-h-40"
              placeholder="El texto aparece aquí al elegir una plantilla. Podés editarlo antes de enviar."
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSend}
            disabled={isPending || !whatsappUrl || !message.trim()}
            className="inline-flex items-center gap-1.5"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <MessageCircle className="size-4" />
            )}
            Abrir WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
