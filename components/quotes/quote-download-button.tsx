import { Download } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type QuoteDownloadButtonProps = {
  quoteId: string;
  label?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm";
  className?: string;
};

export function QuoteDownloadButton({
  quoteId,
  label = "Descargar PDF",
  variant = "outline",
  size = "default",
  className,
}: QuoteDownloadButtonProps) {
  return (
    <a
      href={`/api/quotes/${quoteId}/pdf`}
      className={cn(
        buttonVariants({ variant, size }),
        "inline-flex items-center gap-2",
        className,
      )}
    >
      <Download className="size-4" />
      {label}
    </a>
  );
}
