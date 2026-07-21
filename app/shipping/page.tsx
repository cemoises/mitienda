import type { Metadata } from "next";
import Link from "next/link";
import LegalPageLayout, { LegalList, LegalSection } from "@/components/LegalPageLayout";
import { SITE_NAME, SUPPORT_EMAIL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Política de Envíos",
  description: `Destinos, tiempos estimados y transportistas de ${SITE_NAME}.`,
};

export default function ShippingPage() {
  return (
    <LegalPageLayout title="Política de Envíos" updatedAt="20 de julio de 2026">
      <LegalSection title="1. Destinos">
        <p>
          Actualmente enviamos a Estados Unidos, Canadá y a la mayoría de los países de la Unión
          Europea. Si tu país no aparece como opción en el checkout, todavía no llegamos a esa
          región — escribinos a{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="underline hover:text-black">
            {SUPPORT_EMAIL}
          </a>{" "}
          y te avisamos apenas esté disponible.
        </p>
      </LegalSection>

      <LegalSection title="2. Tiempo de procesamiento">
        <p>
          Una vez confirmado el pago, tu pedido se procesa y despacha con nuestro proveedor
          logístico dentro de 1 a 3 días hábiles.
        </p>
      </LegalSection>

      <LegalSection title="3. Tiempo estimado de entrega">
        <p>
          Después del despacho, el tiempo de tránsito estimado según destino es:
        </p>
        <LegalList
          items={[
            "Estados Unidos y Canadá: 7 a 12 días hábiles.",
            "Unión Europea: 8 a 15 días hábiles.",
          ]}
        />
        <p>
          Estos plazos son estimados y no garantizados: pueden variar por aduana, feriados,
          clima o demoras del transportista. Te avisamos por email si detectamos un retraso
          significativo.
        </p>
      </LegalSection>

      <LegalSection title="4. Transportistas">
        <p>
          Según el destino y el producto, tu pedido puede despacharse con DHL, FedEx o Cainiao /
          AliExpress Standard. Vas a recibir el nombre del transportista y el número de
          seguimiento por email apenas se despache tu pedido.
        </p>
      </LegalSection>

      <LegalSection title="5. Envío gratis">
        <p>El envío es gratuito en todos los pedidos, sin monto mínimo de compra.</p>
      </LegalSection>

      <LegalSection title="6. Aranceles e impuestos de importación">
        <p>
          Para envíos internacionales, tu país puede aplicar aranceles de importación, IVA o
          tasas aduaneras al recibir el paquete. Estos costos no están incluidos en el precio
          de compra y son responsabilidad del comprador. Te recomendamos consultar las
          regulaciones de importación de tu país antes de comprar si tenés dudas.
        </p>
      </LegalSection>

      <LegalSection title="7. Pedidos perdidos o dañados">
        <p>
          Si tu pedido no llega dentro del plazo estimado, se pierde en tránsito, o llega dañado,
          escribinos a{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="underline hover:text-black">
            {SUPPORT_EMAIL}
          </a>{" "}
          con tu número de orden. Vamos a investigar con el transportista y ofrecerte un
          reenvío o reembolso según corresponda — ver nuestra{" "}
          <Link href="/refunds" className="underline hover:text-black">
            Política de Reembolsos
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
