"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CircleOff, Eye, EyeOff, Globe, Loader2 } from "lucide-react";
import { ActiveStatusDot } from "@/components/products/active-status-dot";
import {
  toggleProductActive,
  toggleProductPublic,
} from "@/lib/products/actions";
import { cn } from "@/lib/utils";

type ProductStatusTogglesProps = {
  productId: string;
  initialIsActive: boolean;
  initialIsPublic: boolean;
};

export function ProductStatusToggles({
  productId,
  initialIsActive,
  initialIsPublic,
}: ProductStatusTogglesProps) {
  const router = useRouter();
  const [isActive, setIsActive] = useState(initialIsActive);
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleToggleActive() {
    setError(null);
    startTransition(async () => {
      const result = await toggleProductActive(productId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setIsActive(result.is_active ?? !isActive);
      router.refresh();
    });
  }

  function handleTogglePublic() {
    setError(null);
    startTransition(async () => {
      const result = await toggleProductPublic(productId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setIsPublic(result.is_public ?? !isPublic);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={handleToggleActive}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition",
            isActive
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              : "border-border bg-muted/50 text-muted-foreground hover:bg-muted",
          )}
        >
          {isPending ? (
            <Loader2 className="size-3.5 shrink-0 animate-spin" />
          ) : isActive ? (
            <ActiveStatusDot active />
          ) : (
            <CircleOff className="size-3.5 shrink-0" />
          )}
          {isActive ? "Activo" : "Inactivo"}
        </button>

        <button
          type="button"
          disabled={isPending}
          onClick={handleTogglePublic}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition",
            isPublic
              ? "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400"
              : "border-border bg-muted/50 text-muted-foreground hover:bg-muted",
          )}
        >
          {isPending ? (
            <Loader2 className="size-3.5 shrink-0 animate-spin" />
          ) : isPublic ? (
            <Globe className="size-3.5 shrink-0" />
          ) : (
            <EyeOff className="size-3.5 shrink-0" />
          )}
          {isPublic ? "Publicado" : "Oculto"}
        </button>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

type ProductStatusIconProps = {
  isActive: boolean;
  isPublic: boolean;
};

export function ProductStatusIcons({ isActive, isPublic }: ProductStatusIconProps) {
  return (
    <div className="flex items-center gap-2">
      {isActive ? (
        <span title="Activo" className="inline-flex items-center">
          <ActiveStatusDot active />
        </span>
      ) : (
        <CircleOff
          className="size-4 text-muted-foreground"
          aria-label="Inactivo"
        />
      )}
      {isPublic ? (
        <Globe
          className="size-4 text-sky-600 dark:text-sky-400"
          aria-label="Publicado en la web"
        />
      ) : (
        <EyeOff className="size-4 text-muted-foreground" aria-label="Oculto en la web" />
      )}
    </div>
  );
}

export function ProductVisibilityHint({ isPublic }: { isPublic: boolean }) {
  if (isPublic) {
    return (
      <p className="inline-flex items-center gap-1.5 text-xs text-sky-700 dark:text-sky-400">
        <Eye className="size-3.5" />
        Visible en el sitio web público
      </p>
    );
  }

  return (
    <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <EyeOff className="size-3.5" />
      No visible en el sitio web público
    </p>
  );
}
