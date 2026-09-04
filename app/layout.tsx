import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Cormorant_Garamond, Geist_Mono, Inter } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { getSiteUrl, STOREFRONT_SEO } from "@/lib/storefront/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: STOREFRONT_SEO.title,
    template: "%s | Chumes",
  },
  description: STOREFRONT_SEO.description,
  applicationName: "Chumes",
  keywords: [
    "alquiler de mesas Costa Rica",
    "alquiler de sillas para eventos",
    "mantelería para eventos",
    "alquiler de toldos",
    "mesas cocteleras",
    "Gran Área Metropolitana",
    "Chumes",
  ],
  openGraph: {
    type: "website",
    locale: "es_CR",
    siteName: "Chumes",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${cormorant.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <ClerkProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
