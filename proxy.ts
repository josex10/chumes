import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/catalogo(.*)",
  "/combos(.*)",
  "/nosotros(.*)",
  "/armar-mesa(.*)",
  "/cotizar(.*)",
  "/contacto(.*)",
  "/intranet",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks/clerk",
  "/sitemap.xml",
  "/robots.txt",
  "/icon(.*)",
  "/apple-icon(.*)",
  "/opengraph-image(.*)",
  "/twitter-image(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
