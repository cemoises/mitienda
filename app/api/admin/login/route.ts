import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  computeAdminToken,
  isValidAdminPassword,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  const token = computeAdminToken();

  if (!token) {
    return NextResponse.json(
      { error: "El acceso de administrador no está configurado (falta ADMIN_PASSWORD)." },
      { status: 503 }
    );
  }

  const { password } = (await request.json()) as { password?: string };

  if (!isValidAdminPassword(password)) {
    return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 horas
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(ADMIN_SESSION_COOKIE);
  return response;
}
