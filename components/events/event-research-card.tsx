"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, MessageCircle, Plus, Search } from "lucide-react";
import { SendFollowUpDialog } from "@/components/follow-ups/send-follow-up-dialog";
import type { FollowUpMessageContext } from "@/components/follow-ups/send-follow-up-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import { Textarea } from "@/components/ui/textarea";
import { getLinkedQuote } from "@/lib/events/event-badges";
import { resolveCustomerPhone } from "@/lib/customers/phone";
import { formatDateKey, toCostaRicaDateKey } from "@/lib/follow-ups/calendar";
import {
  RESEARCH_STATUS,
  RESEARCH_TITLE_SUGGESTIONS,
  RESEARCH_UPDATE_KIND,
  getResearchStatusLabel,
} from "@/lib/research/constants";
import {
  addResearchNote,
  createResearchRequest,
  setResearchRequestStatus,
} from "@/lib/research/actions";
import type {
  EventResearchRequestWithUpdates,
  EventWithRelations,
  FollowUpTemplate,
} from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type EventResearchCardProps = {
  event: EventWithRelations;
  requests: EventResearchRequestWithUpdates[];
  templates: FollowUpTemplate[];
  canEdit: boolean;
};

const STATUS_PILL: Record<string, string> = {
  [RESEARCH_STATUS.OPEN]:
    "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300",
  [RESEARCH_STATUS.WAITING_CLIENT]:
    "border-sky-500/40 bg-sky-500/10 text-sky-800 dark:text-sky-300",
  [RESEARCH_STATUS.DONE]:
    "border-muted-foreground/20 bg-muted text-muted-foreground",
};

export function EventResearchCard({
  event,
  requests,
  templates,
  canEdit,
}: EventResearchCardProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [noteRequestId, setNoteRequestId] = useState<string | null>(null);
  const [noteBody, setNoteBody] = useState("");
  const [whatsAppRequestId, setWhatsAppRequestId] = useState<string | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();
  const quoteTotal = getLinkedQuote(event)?.total ?? null;
  const phone = resolveCustomerPhone(
    event.customer_contacts?.phone,
    event.customers.phone,
  );
  const openRequests = requests.filter(
    (request) => request.status !== RESEARCH_STATUS.DONE,
  );
  const doneRequests = requests.filter(
    (request) => request.status === RESEARCH_STATUS.DONE,
  );
  const noteRequest = requests.find((request) => request.id === noteRequestId);
  const whatsAppRequest = requests.find(
    (request) => request.id === whatsAppRequestId,
  );

  const whatsAppContext = useMemo((): FollowUpMessageContext | null => {
    if (!whatsAppRequest) return null;
    return {
      eventId: event.id,
      customerName: event.customers.name,
      eventTitle: event.title,
      eventDate: event.event_date,
      location: event.estimated_location,
      quoteTotal,
      phone,
      researchRequestId: whatsAppRequest.id,
      solicitud: whatsAppRequest.title,
    };
  }, [event, phone, quoteTotal, whatsAppRequest]);

  function runAction(action: () => Promise<{ success: true } | { success: false; error: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        setError(result.error);
        return;
      }
      setTitle("");
      setNoteBody("");
      setNoteRequestId(null);
      router.refresh();
    });
  }

  function handleCreate(nextTitle = title) {
    const trimmed = nextTitle.trim();
    if (!trimmed) {
      setError("Escribí qué hay que investigar.");
      return;
    }
    runAction(() =>
      createResearchRequest({ eventId: event.id, title: trimmed }),
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle className="inline-flex items-center gap-1.5">
            <Search className="size-4 text-muted-foreground" />
            Investigación
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Productos o extras que hay que buscar para este cliente.
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {canEdit ? (
          <div className="space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={title}
                onChange={(eventChange) => setTitle(eventChange.target.value)}
                placeholder="Ej. Cristalería"
                maxLength={80}
                disabled={isPending}
                onKeyDown={(keyEvent) => {
                  if (keyEvent.key === "Enter") {
                    keyEvent.preventDefault();
                    handleCreate();
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => handleCreate()}
                disabled={isPending}
                className="inline-flex items-center gap-1.5"
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Plus className="size-4" />
                )}
                Agregar
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {RESEARCH_TITLE_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    setTitle(suggestion);
                    handleCreate(suggestion);
                  }}
                  className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground transition hover:bg-muted"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Todavía no hay investigaciones. Marcá una cuando el cliente pida
            algo que hay que cotizar o buscar.
          </p>
        ) : (
          <div className="space-y-3">
            {openRequests.map((request) => (
              <ResearchRequestBlock
                key={request.id}
                request={request}
                canEdit={canEdit}
                canWhatsApp={Boolean(phone)}
                pending={isPending}
                onNote={() => {
                  setNoteBody("");
                  setNoteRequestId(request.id);
                }}
                onWhatsApp={() => setWhatsAppRequestId(request.id)}
                onStatus={(status) =>
                  runAction(() =>
                    setResearchRequestStatus({
                      requestId: request.id,
                      status,
                    }),
                  )
                }
              />
            ))}
            {doneRequests.length > 0 ? (
              <details className="rounded-lg border border-dashed px-3 py-2">
                <summary className="cursor-pointer text-sm text-muted-foreground">
                  Hechas ({doneRequests.length})
                </summary>
                <div className="mt-3 space-y-3">
                  {doneRequests.map((request) => (
                    <ResearchRequestBlock
                      key={request.id}
                      request={request}
                      canEdit={canEdit}
                      canWhatsApp={false}
                      pending={isPending}
                      onStatus={(status) =>
                        runAction(() =>
                          setResearchRequestStatus({
                            requestId: request.id,
                            status,
                          }),
                        )
                      }
                    />
                  ))}
                </div>
              </details>
            ) : null}
          </div>
        )}
      </CardContent>

      <Dialog
        open={Boolean(noteRequest)}
        onOpenChange={(open) => {
          if (!open) setNoteRequestId(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nota de investigación</DialogTitle>
            <DialogDescription>
              {noteRequest
                ? `Qué se hizo o se está haciendo con ${noteRequest.title}.`
                : "Qué se hizo."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-1.5">
            <Label htmlFor="research-note">Nota</Label>
            <Textarea
              id="research-note"
              value={noteBody}
              onChange={(eventChange) => setNoteBody(eventChange.target.value)}
              rows={5}
              placeholder="Ej. Pedí cotización a 3 proveedores de cristalería."
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setNoteRequestId(null)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={isPending || !noteBody.trim() || !noteRequest}
              onClick={() => {
                if (!noteRequest) return;
                runAction(() =>
                  addResearchNote({
                    requestId: noteRequest.id,
                    body: noteBody,
                  }),
                );
              }}
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {whatsAppContext ? (
        <SendFollowUpDialog
          open={Boolean(whatsAppRequest)}
          onOpenChange={(open) => {
            if (!open) setWhatsAppRequestId(null);
          }}
          context={whatsAppContext}
          templates={templates}
        />
      ) : null}
    </Card>
  );
}

function ResearchRequestBlock({
  request,
  canEdit,
  canWhatsApp,
  pending,
  onNote,
  onWhatsApp,
  onStatus,
}: {
  request: EventResearchRequestWithUpdates;
  canEdit: boolean;
  canWhatsApp: boolean;
  pending: boolean;
  onNote?: () => void;
  onWhatsApp?: () => void;
  onStatus: (
    status: (typeof RESEARCH_STATUS)[keyof typeof RESEARCH_STATUS],
  ) => void;
}) {
  const isDone = request.status === RESEARCH_STATUS.DONE;
  const updates = request.event_research_updates ?? [];

  return (
    <div className="space-y-3 rounded-lg border p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="font-medium">{request.title}</p>
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
                STATUS_PILL[request.status],
              )}
            >
              {getResearchStatusLabel(request.status)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Desde {formatDateKey(toCostaRicaDateKey(request.created_at))}
          </p>
        </div>
        {canEdit ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {!isDone && onNote ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={onNote}
              >
                Nota
              </Button>
            ) : null}
            {!isDone && canWhatsApp && onWhatsApp ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="inline-flex items-center gap-1.5"
                disabled={pending}
                onClick={onWhatsApp}
              >
                <MessageCircle className="size-3.5" />
                WhatsApp
              </Button>
            ) : null}
            {request.status === RESEARCH_STATUS.OPEN ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={pending}
                onClick={() => onStatus(RESEARCH_STATUS.WAITING_CLIENT)}
              >
                Esperando cliente
              </Button>
            ) : null}
            {request.status === RESEARCH_STATUS.WAITING_CLIENT ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={pending}
                onClick={() => onStatus(RESEARCH_STATUS.OPEN)}
              >
                Seguir buscando
              </Button>
            ) : null}
            {isDone ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={pending}
                onClick={() => onStatus(RESEARCH_STATUS.OPEN)}
              >
                Reabrir
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                disabled={pending}
                className="inline-flex items-center gap-1.5"
                onClick={() => onStatus(RESEARCH_STATUS.DONE)}
              >
                <Check className="size-3.5" />
                Hecha
              </Button>
            )}
          </div>
        ) : null}
      </div>

      {updates.length > 0 ? (
        <ol className="space-y-2 border-t pt-3">
          {updates.map((update) => (
            <li key={update.id} className="text-sm">
              <p className="text-xs text-muted-foreground">
                {formatDateKey(toCostaRicaDateKey(update.created_at))}
                {update.kind === RESEARCH_UPDATE_KIND.WHATSAPP
                  ? " · WhatsApp"
                  : " · Nota"}
              </p>
              <p className="whitespace-pre-wrap text-muted-foreground">
                {update.kind === RESEARCH_UPDATE_KIND.WHATSAPP
                  ? (update.message_body ?? update.body)
                  : update.body}
              </p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-muted-foreground">
          Todavía no hay notas en esta solicitud.
        </p>
      )}
    </div>
  );
}
