import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { sql } from "./db";

/*
  Sesión del sitio: una cookie firmada con AUTH_SECRET que guarda el id de usuario
  y su vencimiento. No se puede leer desde JavaScript ni falsificar sin la clave.
  Para cerrar todas las sesiones de golpe alcanza con cambiar AUTH_SECRET.
*/

export const COOKIE_SESION = "anexo_sesion";
const DURACION = 60 * 60 * 24 * 30; // 30 días

export type Usuario = {
  id: number;
  nombre: string;
  imagen?: string;
  jugador?: string;
  rol: "miembro" | "admin";
};

function clave() {
  const secreto = process.env.AUTH_SECRET;
  if (!secreto) throw new Error("Falta AUTH_SECRET en las variables de entorno.");
  return secreto;
}

const firma = (datos: string) => createHmac("sha256", clave()).update(datos).digest("base64url");

export function firmar(valor: object): string {
  const datos = Buffer.from(JSON.stringify(valor)).toString("base64url");
  return `${datos}.${firma(datos)}`;
}

export function verificar<T>(token: string | undefined): T | undefined {
  if (!token) return undefined;
  const [datos, f] = token.split(".");
  if (!datos || !f) return undefined;
  const esperada = Buffer.from(firma(datos));
  const recibida = Buffer.from(f);
  if (esperada.length !== recibida.length || !timingSafeEqual(esperada, recibida)) return undefined;
  try {
    return JSON.parse(Buffer.from(datos, "base64url").toString()) as T;
  } catch {
    return undefined;
  }
}

export const opcionesCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

/** Valor y opciones de la cookie de sesión, para ponerla en la respuesta del login. */
export function cookieSesion(usuarioId: number) {
  const exp = Math.floor(Date.now() / 1000) + DURACION;
  return [COOKIE_SESION, firmar({ uid: usuarioId, exp }), { ...opcionesCookie, maxAge: DURACION }] as const;
}

/** El usuario que está navegando, o undefined si no inició sesión. Va siempre dentro de un <Suspense>. */
export async function getUsuarioActual(): Promise<Usuario | undefined> {
  // El vencimiento se compara con la hora actual: esto solo puede correr con un pedido real, nunca al prerenderizar.
  await connection();
  const sesion = verificar<{ uid: number; exp: number }>((await cookies()).get(COOKIE_SESION)?.value);
  if (!sesion || sesion.exp < Date.now() / 1000) return undefined;
  const [u] = await sql()`select id, nombre, imagen, jugador, rol from usuarios where id = ${sesion.uid}`;
  if (!u) return undefined;
  return { id: u.id, nombre: u.nombre, imagen: u.imagen ?? undefined, jugador: u.jugador ?? undefined, rol: u.rol };
}
