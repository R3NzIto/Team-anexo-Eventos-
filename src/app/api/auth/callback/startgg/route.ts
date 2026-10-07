import { type NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { COOKIE_OAUTH, canjearCodigo, perfilStartgg } from "@/lib/oauth-startgg";
import { cookieSesion, verificar } from "@/lib/sesion";

/** start.gg vuelve acá con un código; lo cambiamos por el perfil y abrimos la sesión. */
export async function GET(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl;
  const guardado = verificar<{ state: string; volver: string }>(request.cookies.get(COOKIE_OAUTH)?.value);
  const code = searchParams.get("code");
  const error = (motivo: string) => NextResponse.redirect(`${origin}/ingresar?error=${motivo}`);

  if (searchParams.get("error")) return error("cancelado");
  if (!code || !guardado || guardado.state !== searchParams.get("state")) return error("vencido");

  let usuarioId: number;
  try {
    const perfil = await perfilStartgg(await canjearCodigo(origin, code));
    const admins = (process.env.ADMIN_STARTGG_IDS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    const esAdmin = admins.includes(perfil.id);
    const [usuario] = await sql()`
      insert into usuarios (startgg_user_id, email, nombre, imagen, jugador, rol)
      values (${perfil.id}, ${perfil.email ?? null}, ${perfil.gamerTag}, ${perfil.imagen ?? null},
              ${perfil.playerId ? `sgg:${perfil.playerId}` : null}, ${esAdmin ? "admin" : "miembro"})
      on conflict (startgg_user_id) do update set
        email = coalesce(excluded.email, usuarios.email),
        nombre = excluded.nombre,
        imagen = excluded.imagen,
        jugador = coalesce(excluded.jugador, usuarios.jugador),
        rol = case when ${esAdmin} then 'admin' else usuarios.rol end,
        ultimo_ingreso = now()
      returning id`;
    usuarioId = usuario.id;
  } catch (e) {
    console.error("Login con start.gg:", e);
    return error("startgg");
  }

  const res = NextResponse.redirect(`${origin}${guardado.volver}`);
  res.cookies.delete(COOKIE_OAUTH);
  res.cookies.set(...cookieSesion(usuarioId));
  return res;
}
