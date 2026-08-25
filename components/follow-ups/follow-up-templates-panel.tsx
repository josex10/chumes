"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil } from "lucide-react";
import { updateFollowUpTemplate } from "@/lib/follow-ups/actions";
import {
  FOLLOW_UP_STEPS,
  getFollowUpStepLabel,
  type FollowUpStep,
} from "@/lib/follow-ups/constants";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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

type FollowUpTemplatesPanelProps = {
  templates: FollowUpTemplate[];
};

const STEP_ITEMS = FOLLOW_UP_STEPS.map((step) => ({
  value: String(step),
  label: getFollowUpStepLabel(step),
}));

export function FollowUpTemplatesPanel({
  templates,
}: FollowUpTemplatesPanelProps) {
  const router = useRouter();
  const [editing, setEditing] = useState<FollowUpTemplate | null>(null);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [step, setStep] = useState<FollowUpStep>(1);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function openEditor(template: FollowUpTemplate) {
    setEditing(template);
    setName(template.name);
    setBody(template.body);
    setStep(template.step);
    setIsActive(template.is_active);
    setError(null);
  }

  function handleSave() {
    if (!editing) return;
    setError(null);
    startTransition(async () => {
      const result = await updateFollowUpTemplate({
        id: editing.id,
        name,
        body,
        step,
        isActive,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setEditing(null);
      router.refresh();
    });
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Plantillas de WhatsApp</CardTitle>
          <CardDescription>
            Usá {"{{nombre}}"}, {"{{evento}}"}, {"{{fecha}}"}, {"{{ubicacion}}"} y{" "}
            {"{{monto}}"}. El mensaje se puede editar antes de enviarlo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-medium">{template.name}</p>
                <p className="text-xs text-muted-foreground">
                  {getFollowUpStepLabel(template.step)}
                  {template.is_active ? "" : " · Inactiva"}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                  {template.body}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="inline-flex shrink-0 items-center gap-1.5"
                onClick={() => openEditor(template)}
              >
                <Pencil className="size-3.5" />
                Editar
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar plantilla</DialogTitle>
            <DialogDescription>
              El texto se personaliza con los datos del evento al momento de
              enviarlo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="template-name">Nombre</Label>
              <Input
                id="template-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="template-step">Paso</Label>
              <Select
                value={String(step)}
                onValueChange={(value) => {
                  if (value === "1" || value === "2" || value === "3") {
                    setStep(Number(value) as FollowUpStep);
                  }
                }}
                items={STEP_ITEMS}
              >
                <SelectTrigger id="template-step" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STEP_ITEMS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="template-body">Mensaje</Label>
              <Textarea
                id="template-body"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                className="min-h-40"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
              />
              Plantilla activa
            </label>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditing(null)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={handleSave} disabled={isPending}>
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
