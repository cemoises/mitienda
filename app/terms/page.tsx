import type { Metadata } from "next";
import Link from "next/link";
import LegalPageLayout, { LegalList, LegalSection } from "@/components/LegalPageLayout";
import { SITE_NAME, SUPPORT_EMAIL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Términos de Servicio",
  description: `Términos y condiciones de compra en ${SITE_NAME}.`,
};

export default function TermsPage() {
  return (
    <LegalPageLayout title="Términos de Servicio" updatedAt="20 de julio de 2026">
      <LegalSection title="1. Aceptación de los términos">
        <p>
          Al acceder o comprar en {SITE_NAME}, aceptás estos Términos de Servicio en su
          totalidad. Si no estás de acuerdo con alguna parte, te pedimos que no uses el sitio.
        </p>
      </LegalSection>

      <LegalSection title="2. Sobre nuestra tienda">
        <p>
          {SITE_NAME} es una tienda online que vende accesorios de escritorio bajo un modelo de
          comercio electrónico internacional. Los productos se despachan desde nuestros
          proveedores logísticos hacia el destino que indiques en el checkout.
        </p>
      </LegalSection>

      <LegalSection title="3. Precios y moneda">
        <LegalList
          items={[
            "Todos los precios se muestran en Dólares Estadounidenses (USD), salvo que se indique lo contrario.",
            "Los precios pueden cambiar sin previo aviso, pero el precio cobrado en tu orden es el que estaba vigente al momento de la compra.",
            "Impuestos, aranceles de importación o tasas aduaneras del país de destino no están incluidos en el precio y son responsabilidad del comprador (ver nuestra Política de Envíos).",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Proceso de compra y pago">
        <p>
          El pago se procesa a través de Skrill, un procesador de pagos externo. Al completar el
          checkout, tu pedido queda registrado con estado &ldquo;Pendiente de Pago&rdquo; hasta que Skrill
          confirme la transacción; una vez confirmado, tu orden pasa a &ldquo;Pagado&rdquo; y comienza el
          proceso de despacho.
        </p>
        <p>
          Nos reservamos el derecho de cancelar y reembolsar cualquier orden en caso de
          sospecha de fraude, error de precio evidente, o falta de stock del producto
          solicitado.
        </p>
      </LegalSection>

      <LegalSection title="5. Envíos">
        <p>
          Los tiempos de envío, transportistas y responsabilidad por aranceles de importación
          están detallados en nuestra{" "}
          <Link href="/shipping" className="underline hover:text-black">
            Política de Envíos
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="6. Devoluciones y reembolsos">
        <p>
          Las condiciones para solicitar una devolución o reembolso están detalladas en nuestra{" "}
          <Link href="/refunds" className="underline hover:text-black">
            Política de Reembolsos
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="7. Propiedad intelectual">
        <p>
          El nombre {SITE_NAME}, el logo, los textos, imágenes y el diseño de este sitio son
          propiedad de {SITE_NAME} o de sus proveedores, y no pueden reproducirse sin
          autorización.
        </p>
      </LegalSection>

      <LegalSection title="8. Limitación de responsabilidad">
        <p>
          {SITE_NAME} no será responsable por daños indirectos, incidentales o consecuentes
          derivados del uso de nuestros productos o de retrasos en el envío ocasionados por
          transportistas, aduanas o causas de fuerza mayor. Nuestra responsabilidad máxima ante
          cualquier reclamo se limita al monto efectivamente pagado por el producto en cuestión.
        </p>
      </LegalSection>

      <LegalSection title="9. Ley aplicable">
        <p>
          Estos términos se rigen, en la medida en que lo permita la ley aplicable, por las
          normas de protección al consumidor del país de residencia del comprador. Para
          compradores en la Unión Europea, se aplican además los derechos irrenunciables
          reconocidos por la normativa de protección al consumidor de la UE.
        </p>
      </LegalSection>

      <LegalSection title="10. Cambios a estos términos">
        <p>
          Podemos actualizar estos Términos de Servicio ocasionalmente. Los cambios entran en
          vigencia al publicarse en esta página.
        </p>
      </LegalSection>

      <LegalSection title="11. Contacto">
        <p>
          ¿Preguntas sobre estos términos? Escribinos a{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="underline hover:text-black">
            {SUPPORT_EMAIL}
          </a>{" "}
          o visitá nuestra{" "}
          <Link href="/contact" className="underline hover:text-black">
            página de contacto
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
