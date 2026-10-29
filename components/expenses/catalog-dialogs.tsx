"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  createCompanyPaymentMethod,
  createExpenseCategory,
  deleteCompanyPaymentMethod,
  deleteExpenseCategory,
  updateCompanyPaymentMethod,
  updateExpenseCategory,
} from "@/lib/expenses/actions";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CompanyPaymentMethod, ExpenseCategory } from "@/lib/supabase/types";

type EditorState = {
  id?: number;
  name: string;
  sortOrder: string;
  isActive: boolean;
  requiresDetail: boolean;
};

function nextSort(items: { sort_order: number }[]): string {
  const max = items.reduce((current, item) => Math.max(current, item.sort_order), 0);
  return String(max + 10);
}

function CatalogEditor({
  title,
  editor,
  setEditor,
  showDetailFlag,
  error,
  pending,
  onSave,
  onClose,
}: {
  title: string;
  editor: EditorState;
  setEditor: (editor: EditorState) => void;
  showDetailFlag: boolean;
  error: string | null;
  pending: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            El nombre es el que sale al registrar un gasto o un abono.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="catalog-name">Nombre</Label>
            <Input
              id="catalog-name"
              value={editor.name}
              onChange={(event) => setEditor({ ...editor, name: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="catalog-order">Orden</Label>
            <Input
              id="catalog-order"
              type="number"
              min="0"
              step="1"
              value={editor.sortOrder}
              onChange={(event) =>
                setEditor({ ...editor, sortOrder: event.target.value })
              }
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
            Activo
          </label>
          {showDetailFlag ? (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editor.requiresDetail}
                onChange={(event) =>
                  setEditor({ ...editor, requiresDetail: event.target.checked })
                }
              />
              Exigir detalle
            </label>
          ) : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" variant="commit" disabled={pending} onClick={onSave}>
            {pending ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PaymentMethodsDialog({
  methods,
  open,
  onOpenChange,
}: {
  methods: CompanyPaymentMethod[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CompanyPaymentMethod | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function save() {
    if (!editor) return;
    setError(null);
    startTransition(async () => {
      const values = {
        name: editor.name,
        is_active: editor.isActive,
        sort_order: Number(editor.sortOrder) || 0,
      };
      const result = editor.id
        ? await updateCompanyPaymentMethod(editor.id, values)
        : await createCompanyPaymentMethod(values);
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
      const result = await deleteCompanyPaymentMethod(deleteTarget.id);
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
            <DialogTitle>Métodos de pago</DialogTitle>
            <DialogDescription>
              Efectivo, Sinpe o una tarjeta. Si ya se usó, desactívalo en lugar de borrarlo.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="add"
              onClick={() => {
                setError(null);
                setEditor({
                  name: "",
                  sortOrder: nextSort(methods),
                  isActive: true,
                  requiresDetail: false,
                });
              }}
            >
              <Plus className="size-4" />
              Nuevo método
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Orden</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {methods.map((method) => (
                <TableRow key={method.id}>
                  <TableCell className="font-medium">{method.name}</TableCell>
                  <TableCell>{method.sort_order}</TableCell>
                  <TableCell>{method.is_active ? "Activo" : "Inactivo"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Editar ${method.name}`}
                        onClick={() => {
                          setError(null);
                          setEditor({
                            id: method.id,
                            name: method.name,
                            sortOrder: String(method.sort_order),
                            isActive: method.is_active,
                            requiresDetail: false,
                          });
                        }}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Eliminar ${method.name}`}
                        onClick={() => {
                          setError(null);
                          setDeleteTarget(method);
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {error && !editor && !deleteTarget ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}
        </DialogContent>
      </Dialog>

      {editor ? (
        <CatalogEditor
          title={editor.id ? "Editar método" : "Nuevo método"}
          editor={editor}
          setEditor={setEditor}
          showDetailFlag={false}
          error={error}
          pending={isPending}
          onSave={save}
          onClose={() => {
            setEditor(null);
            setError(null);
          }}
        />
      ) : null}

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
            <DialogTitle>Eliminar método</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `Se eliminará “${deleteTarget.name}”. Si ya tiene gastos o abonos, desactívalo.`
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

export function CategoriesDialog({
  categories,
  open,
  onOpenChange,
}: {
  categories: ExpenseCategory[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExpenseCategory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function save() {
    if (!editor) return;
    setError(null);
    startTransition(async () => {
      const values = {
        name: editor.name,
        requires_detail: editor.requiresDetail,
        is_active: editor.isActive,
        sort_order: Number(editor.sortOrder) || 0,
      };
      const result = editor.id
        ? await updateExpenseCategory(editor.id, values)
        : await createExpenseCategory(values);
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
      const result = await deleteExpenseCategory(deleteTarget.id);
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
            <DialogTitle>Categorías</DialogTitle>
            <DialogDescription>
              Insumos, gasolina, viáticos, compras flash y lo que se agregue después.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="add"
              onClick={() => {
                setError(null);
                setEditor({
                  name: "",
                  sortOrder: nextSort(categories),
                  isActive: true,
                  requiresDetail: false,
                });
              }}
            >
              <Plus className="size-4" />
              Nueva categoría
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Detalle</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.requires_detail ? "Obligatorio" : "Opcional"}</TableCell>
                  <TableCell>{category.is_active ? "Activa" : "Inactiva"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Editar ${category.name}`}
                        onClick={() => {
                          setError(null);
                          setEditor({
                            id: category.id,
                            name: category.name,
                            sortOrder: String(category.sort_order),
                            isActive: category.is_active,
                            requiresDetail: category.requires_detail,
                          });
                        }}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Eliminar ${category.name}`}
                        onClick={() => {
                          setError(null);
                          setDeleteTarget(category);
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {error && !editor && !deleteTarget ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}
        </DialogContent>
      </Dialog>

      {editor ? (
        <CatalogEditor
          title={editor.id ? "Editar categoría" : "Nueva categoría"}
          editor={editor}
          setEditor={setEditor}
          showDetailFlag
          error={error}
          pending={isPending}
          onSave={save}
          onClose={() => {
            setEditor(null);
            setError(null);
          }}
        />
      ) : null}

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
            <DialogTitle>Eliminar categoría</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `Se eliminará “${deleteTarget.name}”. Si ya tiene gastos, desactívala.`
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
