"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  toggleEventSourceActive,
  toggleEventSourceFavorite,
} from "@/lib/event-sources/actions";
import { Button } from "@/components/ui/button";

type EventSourceRowActionsProps = {
  sourceId: number;
  isActive: boolean;
  isFavorite: boolean;
};

export function EventSourceRowActions({
  sourceId,
  isActive,
  isFavorite,
}: EventSourceRowActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggleActive() {
    startTransition(async () => {
      await toggleEventSourceActive(sourceId, !isActive);
      router.refresh();
    });
  }

  function handleToggleFavorite() {
    startTransition(async () => {
      await toggleEventSourceFavorite(sourceId, !isFavorite);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={isPending}
        onClick={handleToggleFavorite}
      >
        {isFavorite ? "Quitar favorito" : "Favorito"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={isPending}
        onClick={handleToggleActive}
      >
        {isActive ? "Deshabilitar" : "Activar"}
      </Button>
    </div>
  );
}
