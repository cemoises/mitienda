import type { Metadata } from "next";
import Link from "next/link";
import LegalPageLayout, { LegalList, LegalSection } from "@/components/LegalPageLayout";
import { SITE_NAME, SUPPORT_EMAIL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Política de Reembolsos",
  description: `Cómo solicitar una devolución o reembolso en ${SITE_NAME}, dentro de los 30 días.`,
};

export default function RefundsPage() {
  return (
    <LegalPageLayout title="Política de Reembolsos y Devoluciones" updatedAt="20 de julio de 2026">
      <LegalSection title="1. Plazo de 30 días">
        <p>
          Tenés 30 días corridos desde la fecha de recepción de tu pedido para solicitar una
          devolución o reembolso, sin necesidad de justificar el motivo.
        </p>
      </LegalSection>

      <LegalSection title="2. Condiciones del producto">
        <p>Para que aceptemos una devolución, el producto debe estar:</p>
        <LegalList
          items={[
            "Sin usar y en las mismas condiciones en que lo recibiste.",
            "En su empaque original, con todos los accesorios incluidos.",
            "Acompañado del número de orden.",
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Cómo solicitar una devolución">
        <p>
          Escribinos a{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="underline hover:text-black">
            {SUPPORT_EMAIL}
          </a>{" "}
          o desde nuestra{" "}
          <Link href="/contact" className="underline hover:text-black">
            página de contacto
          </Link>
          , indicando tu número de orden y el motivo de la devolución. Te vamos a responder con
          las instrucciones para el envío del producto.
        </p>
      </LegalSection>

      <LegalSection title="4. Productos defectuosos o incorrectos">
        <p>
          Si recibiste un producto dañado, defectuoso, o distinto al que compraste, cubrimos el
          100% del costo de la devolución y te ofrecemos reemplazo o reembolso completo, a tu
          elección. Por favor, incluí fotos del producto al contactarnos para agilizar el
          proceso.
        </p>
      </LegalSection>

      <LegalSection title="5. Costo de envío de la devolución">
        <p>
          Si te arrepentiste de la compra (y el producto no está defectuoso), el costo de envío
          de la devolución corre por tu cuenta. Si el producto llegó dañado, incorrecto o
          defectuoso, el costo de la devolución lo cubrimos nosotros.
        </p>
      </LegalSection>

      <LegalSection title="6. Procesamiento del reembolso">
        <p>
          Una vez que recibimos y verificamos el producto devuelto, procesamos el reembolso
          dentro de 5 a 10 días hábiles, acreditado al mismo método de pago utilizado en la
          compra original.
        </p>
      </LegalSection>

      <LegalSection title="7. Pedidos no entregados">
        <p>
          Si tu pedido nunca llegó dentro del plazo estimado en nuestra{" "}
          <Link href="/shipping" className="underline hover:text-black">
            Política de Envíos
          </Link>{" "}
          y confirmamos que se perdió en tránsito, te ofrecemos reenvío sin costo o reembolso
          completo, a tu elección.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
