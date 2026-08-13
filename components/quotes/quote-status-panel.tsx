"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateQuoteStatus } from "@/lib/quotes/actions";
import { QUOTE_STATUS } from "@/lib/quotes/constants";
import {
  getAllowedTransitions,
  getStatusActionLabel,
} from "@/lib/quotes/status-transitions";
import type { QuoteStatus } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type QuoteStatusPanelProps = {
  quoteId: string;
  currentStatus: QuoteStatus;
};

export function QuoteStatusPanel({
  quoteId,
  currentStatus,
}: QuoteStatusPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const transitions = getAllowedTransitions(currentStatus.code);

  function handleTransition(nextStatusCode: string) {
    setError(null);
    startTransition(async () => {
      const result = await updateQuoteStatus(quoteId, nextStatusCode);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status</CardTitle>
        <CardDescription>Manage quote lifecycle</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Current status</p>
          <p className="mt-1 font-medium">{currentStatus.name}</p>
        </div>

        {transitions.length > 0 && (
          <div className="flex flex-col gap-2">
            {transitions.map((statusCode) => {
              const isConvert = statusCode === QUOTE_STATUS.CONVERTED;
              return (
                <Button
                  key={statusCode}
                  type="button"
                  variant={isConvert ? "default" : "outline"}
                  disabled={isPending || isConvert}
                  title={isConvert ? "Events module coming soon" : undefined}
                  onClick={() => handleTransition(statusCode)}
                >
                  {getStatusActionLabel(statusCode)}
                </Button>
              );
            })}
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
