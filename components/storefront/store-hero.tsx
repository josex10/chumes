import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function StoreHero({
  eyebrow,
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-16 md:py-24">
      {eyebrow ? (
        <p className="text-xs tracking-[0.28em] text-muted-foreground uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="font-heading max-w-3xl text-4xl font-medium tracking-tight md:text-5xl">
        {title}
      </h1>
      <p className="max-w-2xl text-lg text-muted-foreground">{description}</p>
      {primaryHref && primaryLabel ? (
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href={primaryHref}
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "rounded-full bg-brand px-8 text-ivory hover:bg-brand-deep",
            )}
          >
            {primaryLabel}
          </Link>
          {secondaryHref && secondaryLabel ? (
            <Link
              href={secondaryHref}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-full border-arena px-8",
              )}
            >
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
