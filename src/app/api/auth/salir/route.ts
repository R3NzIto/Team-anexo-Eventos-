import { type NextRequest, NextResponse } from "next/server";
import { COOKIE_SESION } from "@/lib/sesion";

/** Cierra la sesión. Es POST para que un link o una imagen ajena no puedan cerrarla. */
export async function POST(request: NextRequest) {
  const res = NextResponse.redirect(`${request.nextUrl.origin}/`, 303);
  res.cookies.delete(COOKIE_SESION);
  return res;
}
