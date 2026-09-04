import {
  CHUMES_STOREFRONT,
  getWhatsAppHref,
  hasWhatsAppNumber,
} from "@/lib/storefront/company";
import { WhatsAppIcon } from "@/components/storefront/whatsapp-icon";
import { cn } from "@/lib/utils";

type WhatsAppButtonProps = {
  className?: string;
  label?: string;
  compact?: boolean;
};

export function WhatsAppButton({
  className,
  label = "Cotizar por WhatsApp",
  compact = false,
}: WhatsAppButtonProps) {
  const href = getWhatsAppHref();
  const external = hasWhatsAppNumber();

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      aria-label={label}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full border border-brand/15 bg-brand text-ivory transition duration-300 hover:bg-brand-deep",
        compact ? "size-11" : "h-11 px-4",
        className,
      )}
    >
      <WhatsAppIcon />
      {compact ? <span className="sr-only">{label}</span> : <span className="text-sm">{label}</span>}
    </a>
  );
}

export function WhatsAppFloatingButton() {
  const href = getWhatsAppHref();
  const external = hasWhatsAppNumber();

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      aria-label="Cotizar por WhatsApp"
      className="storefront-whatsapp-fab group fixed right-4 z-50 flex items-center gap-3 rounded-full bg-brand text-ivory shadow-[0_10px_30px_-18px_rgba(27,60,45,0.8)] transition duration-300 hover:bg-brand-deep md:right-6"
    >
      <span className="flex size-12 items-center justify-center">
        <WhatsAppIcon className="size-6" />
      </span>
      <span className="max-w-0 overflow-hidden pr-0 text-sm whitespace-nowrap opacity-0 transition-all duration-300 group-hover:max-w-52 group-hover:pr-5 group-hover:opacity-100">
        Cotizar por WhatsApp
      </span>
      <span className="sr-only">
        {external
          ? `Escribir a ${CHUMES_STOREFRONT.name} por WhatsApp`
          : "Ir a contacto para cotizar"}
      </span>
    </a>
  );
}
