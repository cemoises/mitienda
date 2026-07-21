import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import { SITE_NAME, SUPPORT_EMAIL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contacto",
  description: `Contactá al equipo de soporte de ${SITE_NAME}.`,
};

export default function ContactPage() {
  return (
    <>
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">Contacto</h1>
          <p className="mt-3 max-w-xl text-base text-black/60">
            ¿Tenés una consulta sobre tu pedido, un producto o cualquier otra cosa? Escribinos y
            te respondemos a la brevedad.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-black/60">
            <span>También podés escribirnos directamente a</span>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="font-semibold text-black underline hover:text-black/70"
            >
              {SUPPORT_EMAIL}
            </a>
          </div>

          <div className="mt-10 rounded-2xl border border-black/10 bg-white p-6 sm:p-8">
            <ContactForm />
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
