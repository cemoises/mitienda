import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { updateOrderStatus } from "@/lib/orders-repository";

const SKRILL_MERCHANT_ID = process.env.SKRILL_MERCHANT_ID || "demo-merchant-id";
const SKRILL_SECRET_WORD = process.env.SKRILL_SECRET_WORD || "demo-secret-word";

// Skrill firma cada notificación con un MD5 calculado a partir de campos fijos
// + el secret word configurado en el panel del merchant. Referencia:
// https://www.skrill.com/en/skrill-for-business/integration-3/other-integrations/quick-checkout/
function isValidSkrillSignature(fields: Record<string, string>): boolean {
  const { transaction_id, mb_amount, mb_currency, status, md5sig } = fields;
  if (!md5sig || !transaction_id || !mb_amount || !mb_currency || !status) return false;

  const secretHash = crypto
    .createHash("md5")
    .update(SKRILL_SECRET_WORD)
    .digest("hex")
    .toUpperCase();

  const signatureBase = `${SKRILL_MERCHANT_ID}${transaction_id}${secretHash}${mb_amount}${mb_currency}${status}`;
  const expectedSignature = crypto.createHash("md5").update(signatureBase).digest("hex").toUpperCase();

  return expectedSignature === md5sig.toUpperCase();
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const fields: Record<string, string> = {};
  formData.forEach((value, key) => {
    fields[key] = String(value);
  });

  if (!isValidSkrillSignature(fields)) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  const orderNumber = fields.transaction_id;
  const skrillTransactionId = fields.mb_transaction_id ?? "";
  const status = fields.status;

  // status "2" = pago procesado exitosamente (documentación de Skrill Quick Checkout).
  if (status === "2" && orderNumber) {
    await updateOrderStatus(orderNumber, {
      status: "Pagado",
      transactionId: skrillTransactionId,
    });
  }

  return new NextResponse("OK", { status: 200 });
}
