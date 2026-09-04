import { SectionHeading } from "@/components/storefront/section-heading";
import { HOME_PROCESS } from "@/lib/storefront/home-content";

export function HomeProcess() {
  return (
    <section className="border-y border-arena/70">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 md:px-6 md:py-28">
        <SectionHeading eyebrow="El proceso" title="Cómo funciona" />
        <ol className="mt-14 grid gap-10 md:grid-cols-4">
          {HOME_PROCESS.map((item) => (
            <li key={item.step}>
              <p className="font-heading text-sm tracking-[0.2em] text-brand-gold">
                {item.step}
              </p>
              <h3 className="mt-4 text-lg leading-snug">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {item.text}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
