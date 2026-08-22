import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function IntranetPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="w-full max-w-lg text-center">
        <h1 className="text-4xl font-semibold tracking-tight">Chumes Intranet</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Plataforma interna para operaciones de alquiler y ventas.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/sign-in"
            className={cn(
              buttonVariants({ variant: "commit" }),
              "inline-flex h-12 items-center justify-center rounded-full px-8 text-sm",
            )}
          >
            Iniciar sesión
          </Link>
          <Link
            href="/sign-up"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "inline-flex h-12 items-center justify-center rounded-full px-8 text-sm",
            )}
          >
            Registrarse
          </Link>
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          ¿Busca el catálogo público?{" "}
          <Link href="/" className="text-primary hover:underline">
            Ir al sitio web
          </Link>
        </p>
      </div>
    </main>
  );
}
