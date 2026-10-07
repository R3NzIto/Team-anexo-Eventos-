import "server-only";
import { getUsuarioActual, type Usuario } from "./sesion";

/**
 * Corta si quien llama no es admin. Va al principio de cada acción del panel:
 * que la página esté protegida no alcanza, una acción se puede invocar directo.
 */
export async function requerirAdmin(): Promise<Usuario> {
  const usuario = await getUsuarioActual();
  if (usuario?.rol !== "admin") throw new Error("Solo los admins pueden hacer esto.");
  return usuario;
}
