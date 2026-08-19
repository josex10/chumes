import { FileText } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ReservationDownloadButtonProps = {
  eventId: string;
  label?: string;
  variant?: "export" | "outline" | "ghost";
  size?: "default" | "sm";
  className?: string;
};

export function ReservationDownloadButton({
  eventId,
  label = "PDF reserva",
  variant = "outline",
  size = "sm",
  className,
}: ReservationDownloadButtonProps) {
  return (
    <a
      href={`/api/events/${eventId}/reservation/pdf`}
      className={cn(
        buttonVariants({ variant, size }),
        "inline-flex items-center gap-2",
        className,
      )}
    >
      <FileText className="size-4" strokeWidth={1.5} />
      {label}
    </a>
  );
}
