import { resend, isResendConfigured } from "@/lib/resend";
import type { Order } from "@/lib/order";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@cemoises.com";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "PARABOX <onboarding@resend.dev>";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type OrderEmailType = "customer" | "admin" | "shipping_update";

type SendOrderEmailParams = {
  order: Order;
  type: OrderEmailType;
};

export async function sendOrderEmail({
  order,
  type,
}: SendOrderEmailParams): Promise<{ error: string | null }> {
  if (!isResendConfigured || !resend) {
    return { error: "Resend no está configurado en este entorno." };
  }

  const { to, subject, html } =
    type === "customer"
      ? buildCustomerEmail(order)
      : type === "shipping_update"
        ? buildShippingUpdateEmail(order)
        : buildAdminEmail(order);

  try {
    const { error } = await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
    return { error: error?.message ?? null };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo enviar el email." };
  }
}

function itemsRowsHtml(order: Order): string {
  return order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;color:#ffffff;font-size:14px;border-bottom:1px solid rgba(255,255,255,0.08);">
            ${item.name} <span style="color:rgba(255,255,255,0.4);">x${item.quantity}</span>
          </td>
          <td align="right" style="padding:10px 0;color:#ffffff;font-size:14px;border-bottom:1px solid rgba(255,255,255,0.08);">
            $${(item.price * item.quantity).toFixed(2)}
          </td>
        </tr>`
    )
    .join("");
}

function buildCustomerEmail(order: Order): { to: string; subject: string; html: string } {
  const html = `
  <div style="background:#f4f4f5;padding:40px 16px;font-family:Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" style="max-width:480px;margin:0 auto;background:#000000;border-radius:16px;overflow:hidden;">
      <tr>
        <td style="padding:32px;">
          <p style="color:#ffffff;font-size:18px;font-weight:bold;letter-spacing:0.08em;margin:0 0 4px;">PARABOX</p>
          <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0 0 28px;">Desk &amp; Focus Collection</p>

          <p style="color:#ffffff;font-size:16px;font-weight:bold;margin:0 0 6px;">¡Gracias por tu compra!</p>
          <p style="color:rgba(255,255,255,0.6);font-size:14px;margin:0 0 24px;">
            Tu orden <strong style="color:#ffffff;">${order.orderNumber}</strong> fue confirmada.
          </p>

          <table role="presentation" width="100%" style="border-collapse:collapse;">
            ${itemsRowsHtml(order)}
          </table>

          <table role="presentation" width="100%" style="margin-top:16px;">
            <tr>
              <td style="color:rgba(255,255,255,0.6);font-size:14px;padding-top:8px;">Total pagado</td>
              <td align="right" style="color:#ffffff;font-size:18px;font-weight:bold;padding-top:8px;">
                $${order.total.toFixed(2)} USD
              </td>
            </tr>
          </table>

          <table role="presentation" width="100%" style="margin-top:28px;border-top:1px solid rgba(255,255,255,0.1);padding-top:20px;">
            <tr>
              <td style="color:rgba(255,255,255,0.4);font-size:12px;line-height:1.6;">
                Enviaremos tu pedido a:<br />
                ${order.shipping.address}, ${order.shipping.city}, ${order.shipping.country} (${order.shipping.postalCode})
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>`;

  return {
    to: order.email,
    subject: `Confirmamos tu pedido ${order.orderNumber} — PARABOX`,
    html,
  };
}

function buildAdminEmail(order: Order): { to: string; subject: string; html: string } {
  const html = `
  <div style="background:#f4f4f5;padding:40px 16px;font-family:Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" style="max-width:480px;margin:0 auto;background:#000000;border-radius:16px;overflow:hidden;">
      <tr>
        <td style="padding:32px;">
          <p style="color:#ffffff;font-size:18px;font-weight:bold;letter-spacing:0.08em;margin:0 0 4px;">PARABOX</p>
          <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0 0 28px;">Panel de Administración</p>

          <p style="color:#ffffff;font-size:16px;font-weight:bold;margin:0 0 6px;">🔔 Nueva venta confirmada</p>
          <p style="color:rgba(255,255,255,0.6);font-size:14px;margin:0 0 24px;">
            Orden <strong style="color:#ffffff;">${order.orderNumber}</strong> vía Skrill.
          </p>

          <table role="presentation" width="100%" style="border-collapse:collapse;margin-bottom:16px;">
            <tr>
              <td style="color:rgba(255,255,255,0.5);font-size:13px;padding:4px 0;">Cliente</td>
              <td align="right" style="color:#ffffff;font-size:13px;padding:4px 0;">
                ${order.shipping.firstName} ${order.shipping.lastName}
              </td>
            </tr>
            <tr>
              <td style="color:rgba(255,255,255,0.5);font-size:13px;padding:4px 0;">Email</td>
              <td align="right" style="color:#ffffff;font-size:13px;padding:4px 0;">${order.email}</td>
            </tr>
            <tr>
              <td style="color:rgba(255,255,255,0.5);font-size:13px;padding:4px 0;">Envío</td>
              <td align="right" style="color:#ffffff;font-size:13px;padding:4px 0;">
                ${order.shipping.city}, ${order.shipping.country}
              </td>
            </tr>
            <tr>
              <td style="color:rgba(255,255,255,0.5);font-size:13px;padding:4px 0;">Transacción Skrill</td>
              <td align="right" style="color:#ffffff;font-size:13px;padding:4px 0;">
                ${order.transactionId || "—"}
              </td>
            </tr>
          </table>

          <table role="presentation" width="100%" style="border-collapse:collapse;">
            ${itemsRowsHtml(order)}
          </table>

          <table role="presentation" width="100%" style="margin-top:16px;">
            <tr>
              <td style="color:rgba(255,255,255,0.6);font-size:14px;padding-top:8px;">Total cobrado</td>
              <td align="right" style="color:#ffffff;font-size:18px;font-weight:bold;padding-top:8px;">
                $${order.total.toFixed(2)} USD
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>`;

  return {
    to: ADMIN_EMAIL,
    subject: `🔔 Nueva venta: ${order.orderNumber} — $${order.total.toFixed(2)} USD`,
    html,
  };
}

function buildShippingUpdateEmail(order: Order): { to: string; subject: string; html: string } {
  const html = `
  <div style="background:#f4f4f5;padding:40px 16px;font-family:Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" style="max-width:480px;margin:0 auto;background:#000000;border-radius:16px;overflow:hidden;">
      <tr>
        <td style="padding:32px;">
          <p style="color:#ffffff;font-size:18px;font-weight:bold;letter-spacing:0.08em;margin:0 0 4px;">PARABOX</p>
          <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0 0 28px;">Desk &amp; Focus Collection</p>

          <p style="color:#ffffff;font-size:16px;font-weight:bold;margin:0 0 6px;">📦 Tu pedido está en camino</p>
          <p style="color:rgba(255,255,255,0.6);font-size:14px;margin:0 0 24px;">
            Tu orden <strong style="color:#ffffff;">${order.orderNumber}</strong> fue despachada.
          </p>

          <table role="presentation" width="100%" style="border-collapse:collapse;margin-bottom:8px;background:rgba(255,255,255,0.05);border-radius:12px;">
            <tr>
              <td style="padding:16px 20px;">
                <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.05em;">
                  Transportista
                </p>
                <p style="color:#ffffff;font-size:15px;font-weight:bold;margin:0 0 16px;">
                  ${order.carrier ?? "—"}
                </p>
                <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.05em;">
                  Número de Seguimiento
                </p>
                <p style="color:#ffffff;font-size:15px;font-weight:bold;font-family:monospace;margin:0;">
                  ${order.trackingNumber ?? "—"}
                </p>
              </td>
            </tr>
          </table>

          <table role="presentation" width="100%" style="margin-top:24px;border-top:1px solid rgba(255,255,255,0.1);padding-top:20px;">
            <tr>
              <td style="color:rgba(255,255,255,0.4);font-size:12px;line-height:1.6;">
                Enviado a:<br />
                ${order.shipping.address}, ${order.shipping.city}, ${order.shipping.country} (${order.shipping.postalCode})
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>`;

  return {
    to: order.email,
    subject: `📦 Tu pedido ${order.orderNumber} está en camino — PARABOX`,
    html,
  };
}

export type ContactMessageInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export async function sendContactMessage(
  input: ContactMessageInput
): Promise<{ error: string | null }> {
  if (!isResendConfigured || !resend) {
    return { error: "Resend no está configurado en este entorno." };
  }

  const html = `
  <div style="background:#f4f4f5;padding:40px 16px;font-family:Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" style="max-width:480px;margin:0 auto;background:#000000;border-radius:16px;overflow:hidden;">
      <tr>
        <td style="padding:32px;">
          <p style="color:#ffffff;font-size:18px;font-weight:bold;letter-spacing:0.08em;margin:0 0 4px;">PARABOX</p>
          <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0 0 28px;">Nuevo mensaje de contacto</p>

          <table role="presentation" width="100%" style="border-collapse:collapse;margin-bottom:16px;">
            <tr>
              <td style="color:rgba(255,255,255,0.5);font-size:13px;padding:4px 0;">De</td>
              <td align="right" style="color:#ffffff;font-size:13px;padding:4px 0;">
                ${escapeHtml(input.name)} (${escapeHtml(input.email)})
              </td>
            </tr>
            <tr>
              <td style="color:rgba(255,255,255,0.5);font-size:13px;padding:4px 0;">Asunto</td>
              <td align="right" style="color:#ffffff;font-size:13px;padding:4px 0;">${escapeHtml(input.subject)}</td>
            </tr>
          </table>

          <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.05em;">
            Mensaje
          </p>
          <p style="color:#ffffff;font-size:14px;line-height:1.6;white-space:pre-wrap;margin:0;">${escapeHtml(input.message)}</p>
        </td>
      </tr>
    </table>
  </div>`;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      replyTo: input.email,
      subject: `✉️ Contacto: ${input.subject}`,
      html,
    });
    return { error: error?.message ?? null };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo enviar el mensaje." };
  }
}
