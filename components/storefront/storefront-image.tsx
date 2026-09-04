import Image from "next/image";
import {
  STOREFRONT_PLACEHOLDERS,
  type StorefrontPlaceholderKey,
} from "@/lib/storefront/media";
import { cn } from "@/lib/utils";

type StorefrontImageProps = {
  src?: string | null;
  alt: string;
  placeholder: StorefrontPlaceholderKey;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
};

export function StorefrontImage({
  src,
  alt,
  placeholder,
  className,
  imageClassName,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
}: StorefrontImageProps) {
  const label = STOREFRONT_PLACEHOLDERS[placeholder];

  return (
    <div className={cn("relative overflow-hidden bg-charcoal", className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className={cn(
            "object-cover transition duration-700 ease-out group-hover:scale-[1.03]",
            imageClassName,
          )}
        />
      ) : (
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(198,161,91,0.16),transparent_42%),linear-gradient(160deg,#1b3c2d_0%,#14261c_55%,#1a1a1a_100%)]"
          aria-hidden
        />
      )}
      {!src ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <p className="font-heading text-2xl text-ivory/90 md:text-3xl">{alt}</p>
          <p className="mt-3 text-[0.7rem] tracking-[0.18em] text-brand-gold-soft uppercase">
            [placeholder: {placeholder}]
          </p>
          <p className="sr-only">{label}</p>
        </div>
      ) : null}
    </div>
  );
}
