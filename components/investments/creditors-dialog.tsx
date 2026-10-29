"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  createCreditor,
  deleteCreditor,
  updateCreditor,
} from "@/lib/investments/actions";
import type { InvestmentCreditor } from "@/lib/supabase/types";

type EditorState = {
  id?: number;
  name: string;
  isActive: boolean;
};

export function CreditorsDialog({
  creditors,
  open,
  onOpenChange,
}: {
  creditors: InvestmentCreditor[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InvestmentCreditor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function save() {
    if (!editor) return;
    setError(null);
    startTransition(async () => {
      const values = { name: editor.name, is_active: editor.isActive };
      const result = editor.id
        ? await updateCreditor(editor.id, values)
        : await createCreditor(values);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setEditor(null);
      router.refresh();
    });
  }

  function remove() {
    if (!deleteTarget) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteCreditor(deleteTarget.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setDeleteTarget(null);
      router.refresh();
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Quién invirtió</DialogTitle>
            <DialogDescription>
              Personas a las que la empresa les debe lo que pusieron de su plata.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="add"
              onClick={() => {
                setError(null);
                setEditor({ name: "", isActive: true });
              }}
            >
              <Plus className="size-4" />
              Nueva persona
            </Button>
          </div>
          {creditors.length === 0 ? (
            <p className="text-sm text-muted-foreground">Todavía no hay personas.</p>
          ) : (
            <ul className="divide-y divide-border/60 rounded-lg ring-1 ring-border/60">
              {creditors.map((creditor) => (
                <li key={creditor.id} className="flex items-center justify-between gap-3 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{creditor.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {creditor.is_active ? "Activa" : "Inactiva"}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Editar ${creditor.name}`}
                      onClick={() => {
                        setError(null);
                        setEditor({
                          id: creditor.id,
                          name: creditor.name,
                          isActive: creditor.is_active,
                        });
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Eliminar ${creditor.name}`}
                      onClick={() => {
                        setError(null);
                        setDeleteTarget(creditor);
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {error && !editor && !deleteTarget ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={editor !== null} onOpenChange={(next) => !next && setEditor(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editor?.id ? "Editar persona" : "Nueva persona"}</DialogTitle>
            <DialogDescription>El nombre sale en cada inversión y en el saldo pendiente.</DialogDescription>
          </DialogHeader>
          {editor ? (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="creditor-name">Nombre</Label>
                <Input
                  id="creditor-name"
                  value={editor.name}
                  onChange={(event) => setEditor({ ...editor, name: event.target.value })}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editor.isActive}
                  onChange={(event) =>
                    setEditor({ ...editor, isActive: event.target.checked })
                  }
                />
                Activa
              </label>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
            </div>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditor(null)}>
              Cancelar
            </Button>
            <Button type="button" variant="commit" disabled={isPending} onClick={save}>
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(next) => {
          if (!next) {
            setDeleteTarget(null);
            setError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar persona</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `Se eliminará “${deleteTarget.name}”. Si ya tiene inversiones, desactívala.`
                : null}
            </DialogDescription>
          </DialogHeader>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button type="button" variant="destructive" disabled={isPending} onClick={remove}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
