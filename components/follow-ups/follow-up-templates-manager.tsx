"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import {
  createFollowUpTemplate,
  deleteFollowUpTemplate,
  updateFollowUpTemplate,
} from "@/lib/follow-ups/actions";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { FollowUpTemplate } from "@/lib/supabase/types";

type FollowUpTemplatesManagerProps = {
  templates: FollowUpTemplate[];
};

type EditorState = {
  id?: string;
  name: string;
  body: string;
  isActive: boolean;
};

const EMPTY_EDITOR: EditorState = {
  name: "",
  body: "",
  isActive: true,
};

export function FollowUpTemplatesManager({
  templates,
}: FollowUpTemplatesManagerProps) {
  const router = useRouter();
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isEditing = Boolean(editor?.id);

  function openCreate() {
    setEditor({ ...EMPTY_EDITOR });
    setError(null);
  }

  function openEdit(template: FollowUpTemplate) {
    setEditor({
      id: template.id,
      name: template.name,
      body: template.body,
      isActive: template.is_active,
    });
    setError(null);
  }

  function handleSave() {
    if (!editor) return;
    setError(null);
    startTransition(async () => {
      const result = editor.id
        ? await updateFollowUpTemplate({
            id: editor.id,
            name: editor.name,
            body: editor.body,
            isActive: editor.isActive,
          })
        : await createFollowUpTemplate({
            name: editor.name,
            body: editor.body,
          });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setEditor(null);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!deleteId) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteFollowUpTemplate(deleteId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setDeleteId(null);
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex justify-end">
        <Button
          type="button"
          variant="add"
          className="inline-flex items-center gap-1.5"
          onClick={openCreate}
        >
          <Plus className="size-4" />
          Nueva plantilla
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-muted-foreground">Aún no hay plantillas.</p>
          <Button
            type="button"
            variant="add"
            className="mt-4 inline-flex items-center gap-1.5"
            onClick={openCreate}
          >
            <Plus className="size-4" />
            Crear primera plantilla
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Mensaje</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell className="max-w-xl whitespace-pre-wrap text-muted-foreground">
                    {template.body}
                  </TableCell>
                  <TableCell>
                    {template.is_active ? "Activa" : "Inactiva"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="inline-flex items-center gap-1.5"
                        onClick={() => openEdit(template)}
                      >
                        <Pencil className="size-3.5" />
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="inline-flex items-center gap-1.5 text-destructive"
                        onClick={() => setDeleteId(template.id)}
                      >
                        <Trash2 className="size-3.5" />
                        Eliminar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog
        open={Boolean(editor)}
        onOpenChange={(open) => {
          if (!open) setEditor(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar plantilla" : "Nueva plantilla"}
            </DialogTitle>
            <DialogDescription>
              Usá {"{{nombre}}"}, {"{{evento}}"}, {"{{fecha}}"}, {"{{ubicacion}}"}{" "}
              y {"{{monto}}"}. El texto se puede ajustar al enviarlo.
            </DialogDescription>
          </DialogHeader>
          {editor ? (
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="template-name">Nombre</Label>
                <Input
                  id="template-name"
                  value={editor.name}
                  placeholder="Ej. Sin cotización"
                  onChange={(event) =>
                    setEditor({ ...editor, name: event.target.value })
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="template-body">Mensaje</Label>
                <Textarea
                  id="template-body"
                  value={editor.body}
                  onChange={(event) =>
                    setEditor({ ...editor, body: event.target.value })
                  }
                  className="min-h-40"
                />
              </div>
              {isEditing ? (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editor.isActive}
                    onChange={(event) =>
                      setEditor({ ...editor, isActive: event.target.checked })
                    }
                  />
                  Plantilla activa
                </label>
              ) : null}
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
            </div>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditor(null)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={handleSave} disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar plantilla</DialogTitle>
            <DialogDescription>
              Los seguimientos ya enviados conservan el texto. Esta plantilla
              dejará de aparecer en el dropdown.
            </DialogDescription>
          </DialogHeader>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteId(null)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
