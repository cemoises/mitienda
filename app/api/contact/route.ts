import { NextResponse } from "next/server";
import { sendContactMessage, type ContactMessageInput } from "@/lib/email";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MESSAGE_LENGTH = 4000;
const RATE_LIMIT = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutos

export async function POST(request: Request) {
  const ip = getClientIp(request);

  if (isRateLimited(`contact:${ip}`, RATE_LIMIT, RATE_LIMIT_WINDOW_MS)) {
    console.error("[RATE_LIMIT_ERROR] Demasiados mensajes de contacto desde la misma IP.", { ip });
    return NextResponse.json(
      { error: "Demasiados mensajes enviados. Probá de nuevo en unos minutos." },
      { status: 429 }
    );
  }

  const body = (await request.json()) as Partial<ContactMessageInput>;

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const subject = body.subject?.trim() ?? "";
  const message = body.message?.trim() ?? "";

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "Completá todos los campos." }, { status: 400 });
  }

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "El email no es válido." }, { status: 400 });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: "El mensaje es demasiado largo." }, { status: 400 });
  }

  const { error } = await sendContactMessage({ name, email, subject, message });

  if (error) {
    console.error("[EMAIL_ERROR] No se pudo enviar el mensaje de contacto.", { email, error });
    return NextResponse.json(
      { error: `No se pudo enviar tu mensaje: ${error}` },
      { status: 503 }
    );
  }

  return NextResponse.json({ success: true });
}
