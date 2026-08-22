"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CircleOff, EyeOff, Globe, Loader2 } from "lucide-react";
import { ActiveStatusDot } from "@/components/products/active-status-dot";
import {
  toggleProductActive,
  toggleProductPublic,
} from "@/lib/products/actions";
import { SimpleTooltip } from "@/components/ui/simple-tooltip";
import { cn } from "@/lib/utils";

type ProductRowStatusTogglesProps = {
  productId: string;
  initialIsActive: boolean;
  initialIsPublic: boolean;
};

export function ProductRowStatusToggles({
  productId,
  initialIsActive,
  initialIsPublic,
}: ProductRowStatusTogglesProps) {
  const router = useRouter();
  const [isActive, setIsActive] = useState(initialIsActive);
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [pendingAction, setPendingAction] = useState<"active" | "public" | null>(
    null,
  );
  const [, startTransition] = useTransition();

  function handleToggleActive() {
    startTransition(async () => {
      setPendingAction("active");
      const result = await toggleProductActive(productId);
      setPendingAction(null);
      if (!result.success) return;
      setIsActive(result.is_active ?? !isActive);
      router.refresh();
    });
  }

  function handleTogglePublic() {
    startTransition(async () => {
      setPendingAction("public");
      const result = await toggleProductPublic(productId);
      setPendingAction(null);
      if (!result.success) return;
      setIsPublic(result.is_public ?? !isPublic);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1.5">
      <SimpleTooltip
        label={
          isActive
            ? "Producto activo — clic para desactivar"
            : "Producto inactivo — clic para activar"
        }
      >
        <button
          type="button"
          disabled={pendingAction !== null}
          onClick={handleToggleActive}
          className={cn(
            "inline-flex size-8 items-center justify-center rounded-full border transition",
            isActive
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              : "border-border bg-muted/40 text-muted-foreground hover:bg-muted",
          )}
        >
          {pendingAction === "active" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : isActive ? (
            <ActiveStatusDot active />
          ) : (
            <CircleOff className="size-3.5" />
          )}
        </button>
      </SimpleTooltip>

      <SimpleTooltip
        label={
          isPublic
            ? "Publicado en la web — clic para ocultar"
            : "Oculto en la web — clic para publicar"
        }
      >
        <button
          type="button"
          disabled={pendingAction !== null}
          onClick={handleTogglePublic}
          className={cn(
            "inline-flex size-8 items-center justify-center rounded-full border transition",
            isPublic
              ? "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400"
              : "border-border bg-muted/40 text-muted-foreground hover:bg-muted",
          )}
        >
          {pendingAction === "public" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : isPublic ? (
            <Globe className="size-3.5" />
          ) : (
            <EyeOff className="size-3.5" />
          )}
        </button>
      </SimpleTooltip>
    </div>
  );
}
