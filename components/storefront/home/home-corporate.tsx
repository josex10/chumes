import Link from "next/link";

export function HomeCorporate() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 pb-20 md:px-6 md:pb-28">
      <div className="border border-arena/80 bg-ivory px-6 py-14 md:px-16 md:py-20">
        <p className="text-[0.7rem] tracking-[0.28em] text-brand-gold uppercase">
          Empresas
        </p>
        <h2 className="font-heading mt-4 max-w-2xl text-3xl md:text-5xl">
          Soluciones para eventos corporativos
        </h2>
        <p className="mt-5 max-w-xl text-muted-foreground">
          Equipamos reuniones, activaciones, celebraciones empresariales y
          eventos corporativos con una solución práctica, profesional y puntual.
        </p>
        <Link
          href="/cotizar?tipo=corporativo"
          className="mt-8 inline-flex h-12 items-center rounded-full bg-brand px-7 text-sm text-ivory hover:bg-brand-deep"
        >
          Cotizar evento corporativo
        </Link>
      </div>
    </section>
  );
}
