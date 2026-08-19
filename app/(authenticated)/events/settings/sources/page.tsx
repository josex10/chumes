import Link from "next/link";
import { getEventSources } from "@/lib/event-sources/queries";
import { EventSourceRowActions } from "@/components/events/event-source-row-actions";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EventSourcesSettingsPage() {
  const sources = await getEventSources();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/events"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Volver a eventos
          </Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Fuentes de eventos
          </h1>
          <p className="mt-2 text-muted-foreground">
            Administra campañas y canales de origen. Las favoritas aparecen primero al crear eventos.
          </p>
        </div>
        <Link
          href="/events/settings/sources/new"
          className={cn(buttonVariants({ variant: "add" }))}
        >
          Nueva fuente
        </Link>
      </div>

      {sources.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-muted-foreground">Aún no hay fuentes configuradas.</p>
          <Link
            href="/events/settings/sources/new"
            className={cn(buttonVariants({ variant: "add" }), "mt-4 inline-flex")}
          >
            Crear primera fuente
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Favorita</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map((source) => (
                <TableRow key={source.id}>
                  <TableCell className="font-medium">
                    {source.is_favorite ? `★ ${source.name}` : source.name}
                  </TableCell>
                  <TableCell>{source.code}</TableCell>
                  <TableCell>{source.is_favorite ? "Sí" : "No"}</TableCell>
                  <TableCell>{source.is_active ? "Activa" : "Inactiva"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/events/settings/sources/${source.id}/edit`}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "sm" }),
                        )}
                      >
                        Editar
                      </Link>
                      <EventSourceRowActions
                        sourceId={source.id}
                        isActive={source.is_active}
                        isFavorite={source.is_favorite}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </main>
  );
}
