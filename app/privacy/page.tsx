import type { Metadata } from "next";
import Link from "next/link";
import LegalPageLayout, { LegalList, LegalSection } from "@/components/LegalPageLayout";
import { SITE_NAME, SUPPORT_EMAIL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: `Cómo ${SITE_NAME} recopila, usa y protege tus datos personales.`,
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Política de Privacidad" updatedAt="20 de julio de 2026">
      <LegalSection title="1. Quiénes somos">
        <p>
          {SITE_NAME} (&ldquo;nosotros&rdquo;, &ldquo;nuestro&rdquo;) opera esta tienda online. Esta Política de
          Privacidad explica qué datos personales recopilamos cuando comprás en nuestro sitio,
          para qué los usamos, con quién los compartimos y qué derechos tenés sobre ellos.
        </p>
        <p>
          Ante cualquier duda sobre esta política o para ejercer tus derechos, escribinos a{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="underline hover:text-black">
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. Qué datos recopilamos">
        <p>Cuando completás una compra o nos contactás, recopilamos:</p>
        <LegalList
          items={[
            "Datos de contacto: nombre, apellido, email y teléfono.",
            "Dirección de envío: dirección, ciudad, código postal y país.",
            "Datos de la orden: productos comprados, cantidades, precios y método de pago utilizado.",
            "Mensajes que nos envíes a través del formulario de contacto.",
          ]}
        />
        <p>
          No almacenamos los datos completos de tu tarjeta ni de tu método de pago: el
          procesamiento del pago ocurre directamente en la plataforma de nuestro proveedor de
          pagos (Skrill), fuera de nuestros servidores.
        </p>
      </LegalSection>

      <LegalSection title="3. Para qué usamos tus datos">
        <LegalList
          items={[
            "Procesar y entregar tu pedido, incluyendo el envío de confirmaciones y actualizaciones de seguimiento.",
            "Responder tus consultas de soporte.",
            "Cumplir con obligaciones legales y contables.",
            "Detectar y prevenir fraude o uso indebido de la plataforma.",
            "Mejorar nuestro catálogo y la experiencia de compra (de forma agregada y anónima cuando sea posible).",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Con quién compartimos tus datos">
        <p>
          No vendemos tus datos personales. Los compartimos únicamente con proveedores que nos
          ayudan a operar la tienda, bajo obligaciones de confidencialidad:
        </p>
        <LegalList
          items={[
            "Supabase — almacenamiento de la base de datos de órdenes y catálogo.",
            "Skrill (Paysafe) — procesamiento de pagos.",
            "Resend — envío de emails transaccionales (confirmación de compra, seguimiento de envío).",
            "Nuestro proveedor de dropshipping/fulfillment — para preparar y despachar tu pedido (recibe nombre, dirección y contenido de la orden).",
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Cuánto tiempo conservamos tus datos">
        <p>
          Conservamos los datos de tu orden mientras sea necesario para cumplir con obligaciones
          legales, fiscales y contables, y para poder atender reclamos de garantía o devolución
          dentro de los plazos establecidos en nuestra{" "}
          <Link href="/refunds" className="underline hover:text-black">
            Política de Reembolsos
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="6. Tus derechos">
        <p>
          Dependiendo de tu país de residencia (por ejemplo, si estás en la Unión Europea bajo el
          RGPD/GDPR, o en California bajo el CCPA), podés tener derecho a:
        </p>
        <LegalList
          items={[
            "Acceder a los datos personales que tenemos sobre vos.",
            "Solicitar la corrección de datos inexactos.",
            "Solicitar la eliminación de tus datos, sujeto a nuestras obligaciones legales de conservación.",
            "Solicitar una copia de tus datos en formato portable.",
            "Oponerte al uso de tus datos para fines de marketing.",
          ]}
        />
        <p>
          Para ejercer cualquiera de estos derechos, escribinos a{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="underline hover:text-black">
            {SUPPORT_EMAIL}
          </a>{" "}
          y te responderemos dentro de un plazo razonable.
        </p>
      </LegalSection>

      <LegalSection title="7. Cookies y tecnologías similares">
        <p>
          Usamos cookies técnicas necesarias para el funcionamiento del carrito de compras y,
          eventualmente, herramientas de analítica para entender cómo se usa el sitio. No usamos
          cookies de publicidad de terceros.
        </p>
      </LegalSection>

      <LegalSection title="8. Cambios a esta política">
        <p>
          Podemos actualizar esta política ocasionalmente. Si hacemos cambios significativos, lo
          vamos a indicar actualizando la fecha de &ldquo;Última actualización&rdquo; en esta página.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
