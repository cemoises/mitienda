import { NextResponse } from "next/server";
import { sendContactMessage, type ContactMessageInput } from "@/lib/email";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MESSAGE_LENGTH = 4000;

export async function POST(request: Request) {
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
    return NextResponse.json(
      { error: `No se pudo enviar tu mensaje: ${error}` },
      { status: 503 }
    );
  }

  return NextResponse.json({ success: true });
}
