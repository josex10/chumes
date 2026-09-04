"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getWhatsAppHref, hasWhatsAppNumber } from "@/lib/storefront/company";
import { LAST_QUOTE_WHATSAPP_KEY } from "@/lib/storefront/quote-message";

export function QuoteSuccessActions() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(LAST_QUOTE_WHATSAPP_KEY);
    if (stored) {
      setMessage(stored);
    }
  }, []);

  const whatsappHref = getWhatsAppHref(message ?? undefined);

  return (
    <div className="mt-10 flex flex-col gap-3 sm:flex-row">
      <Link
        href="/catalogo"
        className="inline-flex h-12 items-center justify-center rounded-full bg-brand px-7 text-sm text-ivory hover:bg-brand-deep"
      >
        Seguir explorando
      </Link>
      <a
        href={whatsappHref}
        target={hasWhatsAppNumber() ? "_blank" : undefined}
        rel={hasWhatsAppNumber() ? "noreferrer" : undefined}
        className="inline-flex h-12 items-center justify-center rounded-full border border-arena px-7 text-sm text-brand"
      >
        También escribinos por WhatsApp
      </a>
    </div>
  );
}
