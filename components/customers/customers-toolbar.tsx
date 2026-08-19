"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CUSTOMER_SEARCH_DEBOUNCE_MS } from "@/lib/customers/constants";
import { Input } from "@/components/ui/input";

type CustomersToolbarProps = {
  initialQuery?: string;
};

export function CustomersToolbar({ initialQuery = "" }: CustomersToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const skipInitialNavigation = useRef(true);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (skipInitialNavigation.current) {
      skipInitialNavigation.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = query.trim();

      if (trimmed) {
        params.set("q", trimmed);
      } else {
        params.delete("q");
      }
      params.delete("page");

      const next = params.toString();
      const current = searchParams.toString();
      if (next === current) return;

      router.push(next ? `${pathname}?${next}` : pathname);
    }, CUSTOMER_SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [query, pathname, router, searchParams]);

  return (
    <Input
      value={query}
      onChange={(event) => setQuery(event.target.value)}
      placeholder="Buscar por nombre, teléfono o email..."
      className="max-w-md"
    />
  );
}
