import Image from "next/image";
import Link from "next/link";
import { CHUMES_STOREFRONT } from "@/lib/storefront/company";
import { STOREFRONT_LOGO } from "@/lib/storefront/media";
import { cn } from "@/lib/utils";

type StorefrontLogoProps = {
  compact?: boolean;
  showWordmark?: boolean;
  className?: string;
};

export function StorefrontLogo({
  compact = false,
  showWordmark = true,
  className,
}: StorefrontLogoProps) {
  const size = showWordmark ? (compact ? 44 : 56) : compact ? 72 : 96;

  return (
    <Link
      href="/"
      className={cn("flex min-w-0 items-center gap-3", className)}
      aria-label={`${CHUMES_STOREFRONT.name} — inicio`}
    >
      <Image
        src={STOREFRONT_LOGO.src}
        alt={STOREFRONT_LOGO.alt}
        width={size}
        height={size}
        priority
        className={cn(
          "w-auto object-contain transition-[height] duration-300",
          showWordmark
            ? compact
              ? "h-11"
              : "h-14"
            : compact
              ? "h-[4.5rem]"
              : "h-24",
        )}
      />
      {showWordmark ? (
        <span className="min-w-0">
          <span className="font-heading block text-[1.05rem] leading-none font-medium tracking-wide text-brand">
            {CHUMES_STOREFRONT.name}
          </span>
          <span className="mt-1 hidden max-w-[16rem] truncate text-[0.7rem] tracking-[0.04em] text-muted-foreground sm:block">
            {CHUMES_STOREFRONT.tagline}
          </span>
        </span>
      ) : null}
    </Link>
  );
}
