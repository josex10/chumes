"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CircleOff, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import {
  createCategory,
  deleteCategory,
  toggleCategoryActive,
  updateCategory,
} from "@/lib/products/actions";
import { ActiveStatusDot } from "@/components/products/active-status-dot";
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
import { SimpleTooltip } from "@/components/ui/simple-tooltip";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { ProductCategoryListItem } from "@/lib/products/queries";

type CategoriesManagerProps = {
  categories: ProductCategoryListItem[];
};

type EditorState = {
  id?: number;
  name: string;
  description: string;
  isActive: boolean;
};

const EMPTY_EDITOR: EditorState = {
  name: "",
  description: "",
  isActive: true,
};

export function CategoriesManager({ categories }: CategoriesManagerProps) {
  const router = useRouter();
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductCategoryListItem | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [pendingToggleId, setPendingToggleId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const isEditing = Boolean(editor?.id);

  function openCreate() {
    setEditor({ ...EMPTY_EDITOR });
    setError(null);
  }

  function openEdit(category: ProductCategoryListItem) {
    setEditor({
      id: category.id,
      name: category.name,
      description: category.description ?? "",
      isActive: category.is_active,
    });
    setError(null);
  }

  function handleSave() {
    if (!editor) return;
    const name = editor.name.trim();
    if (!name) {
      setError("El nombre es obligatorio");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = editor.id
        ? await updateCategory(editor.id, {
            name,
            description: editor.description,
            is_active: editor.isActive,
          })
        : await createCategory({
            name,
            description: editor.description,
            is_active: true,
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
    if (!deleteTarget) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteCategory(deleteTarget.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setDeleteTarget(null);
      router.refresh();
    });
  }

  function handleToggleActive(category: ProductCategoryListItem) {
    setPendingToggleId(category.id);
    startTransition(async () => {
      const result = await toggleCategoryActive(category.id);
      setPendingToggleId(null);
      if (!result.success) {
        setError(result.error);
        return;
      }
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
          Nueva categoría
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-muted-foreground">Aún no hay categorías.</p>
          <Button
            type="button"
            variant="add"
            className="mt-4 inline-flex items-center gap-1.5"
            onClick={openCreate}
          >
            <Plus className="size-4" />
            Crear primera categoría
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {category.code}
                  </TableCell>
                  <TableCell className="max-w-sm text-muted-foreground">
                    <span className="line-clamp-2">
                      {category.description || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {category.product_count}
                  </TableCell>
                  <TableCell>
                    <SimpleTooltip
                      label={
                        category.is_active
                          ? "Categoría activa — clic para desactivar"
                          : "Categoría inactiva — clic para activar"
                      }
                    >
                      <button
                        type="button"
                        disabled={pendingToggleId !== null}
                        onClick={() => handleToggleActive(category)}
                        className={cn(
                          "inline-flex size-8 items-center justify-center rounded-full border transition",
                          category.is_active
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            : "border-border bg-muted/40 text-muted-foreground hover:bg-muted",
                        )}
                        aria-label={
                          category.is_active
                            ? "Desactivar categoría"
                            : "Activar categoría"
                        }
                      >
                        {pendingToggleId === category.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : category.is_active ? (
                          <ActiveStatusDot active />
                        ) : (
                          <CircleOff className="size-3.5" />
                        )}
                      </button>
                    </SimpleTooltip>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="inline-flex items-center gap-1.5"
                        onClick={() => openEdit(category)}
                      >
                        <Pencil className="size-3.5" />
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="inline-flex items-center gap-1.5 text-destructive"
                        onClick={() => {
                          setError(null);
                          setDeleteTarget(category);
                        }}
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar categoría" : "Nueva categoría"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "El código se conserva para no romper el catálogo público."
                : "El código se genera automáticamente a partir del nombre."}
            </DialogDescription>
          </DialogHeader>
          {editor ? (
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="category-name">Nombre</Label>
                <Input
                  id="category-name"
                  value={editor.name}
                  onChange={(event) =>
                    setEditor({ ...editor, name: event.target.value })
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="category-description">Descripción</Label>
                <Textarea
                  id="category-description"
                  rows={3}
                  value={editor.description}
                  onChange={(event) =>
                    setEditor({ ...editor, description: event.target.value })
                  }
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
                  Categoría activa
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
            <Button
              type="button"
              variant="commit"
              onClick={handleSave}
              disabled={isPending}
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar categoría</DialogTitle>
            <DialogDescription>
              {deleteTarget && deleteTarget.product_count > 0
                ? `Hay ${deleteTarget.product_count} producto${
                    deleteTarget.product_count === 1 ? "" : "s"
                  } en “${deleteTarget.name}”. Reasígnelos antes de eliminarla.`
                : `Se eliminará “${deleteTarget?.name ?? ""}”. Esta acción no se puede deshacer.`}
            </DialogDescription>
          </DialogHeader>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending || (deleteTarget?.product_count ?? 0) > 0}
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
