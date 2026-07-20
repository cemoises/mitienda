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

export const metadata: Metadata = {
  title: "PARABOX — Desk & Focus",
  description:
    "Accesorios de escritorio premium y minimalistas. Envío internacional gratis, garantía de 30 días y pago seguro.",
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
