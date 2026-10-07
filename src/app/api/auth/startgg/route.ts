import { randomBytes } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { COOKIE_OAUTH, urlAutorizacion } from "@/lib/oauth-startgg";
import { firmar, opcionesCookie } from "@/lib/sesion";

/** Arranca el inicio de sesión: manda a start.gg y recuerda a qué página volver. */
export async function GET(request: NextRequest) {
  const volver = request.nextUrl.searchParams.get("volver") ?? "/";
  const state = randomBytes(16).toString("base64url");
  const res = NextResponse.redirect(urlAutorizacion(request.nextUrl.origin, state));
  res.cookies.set(COOKIE_OAUTH, firmar({ state, volver: rutaSegura(volver) }), { ...opcionesCookie, maxAge: 600 });
  return res;
}

/** Solo rutas internas, para que nadie use el login para redirigir a otro sitio. */
function rutaSegura(ruta: string) {
  return ruta.startsWith("/") && !ruta.startsWith("//") ? ruta : "/";
}
