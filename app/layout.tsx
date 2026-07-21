import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import AnnouncementBar from "@/components/AnnouncementBar";
import SalesPop from "@/components/SalesPop";
import AnalyticsListener from "@/components/AnalyticsListener";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mitienda-smoky.vercel.app";
const SITE_DESCRIPTION =
  "Accesorios de escritorio premium y minimalistas para elevar tu espacio de trabajo. Envío internacional gratis, garantía de 30 días y pago 100% seguro.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PARABOX | Tienda Oficial",
    template: "%s | PARABOX",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "PARABOX",
    "accesorios de escritorio",
    "setup minimalista",
    "desk accessories premium",
    "lámpara LED monitor",
    "soporte laptop aluminio",
    "organizador de cables",
    "desk & focus",
    "home office premium",
  ],
  openGraph: {
    title: "PARABOX | Tienda Oficial",
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: "PARABOX",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PARABOX | Tienda Oficial",
    description: SITE_DESCRIPTION,
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <AnalyticsListener />
          <AnnouncementBar />
          {children}
          <CartDrawer />
          <SalesPop />
        </CartProvider>
      </body>
    </html>
  );
}
