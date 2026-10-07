import "server-only";

/*
  Inicio de sesión con start.gg (OAuth 2). start.gg pide el intercambio del código
  en JSON, por eso está escrito a mano en vez de usar una librería.
  Docs: https://developer.start.gg/docs/oauth/oauth-overview
*/

const SCOPES = "user.identity user.email";
export const COOKIE_OAUTH = "anexo_oauth";

function credenciales() {
  const id = process.env.AUTH_STARTGG_ID;
  const secreto = process.env.AUTH_STARTGG_SECRET;
  if (!id || !secreto) throw new Error("Faltan AUTH_STARTGG_ID y AUTH_STARTGG_SECRET.");
  return { id, secreto };
}

export const callbackStartgg = (origen: string) => `${origen}/api/auth/callback/startgg`;

export function urlAutorizacion(origen: string, state: string): string {
  const url = new URL("https://start.gg/oauth/authorize");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", credenciales().id);
  url.searchParams.set("scope", SCOPES);
  url.searchParams.set("redirect_uri", callbackStartgg(origen));
  url.searchParams.set("state", state);
  // start.gg pide los scopes separados por %20 (URLSearchParams usa "+").
  return url.toString().replace(/\+/g, "%20");
}

export async function canjearCodigo(origen: string, code: string): Promise<string> {
  const { id, secreto } = credenciales();
  const res = await fetch("https://api.start.gg/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: Number(id),
      client_secret: secreto,
      code,
      scope: SCOPES,
      redirect_uri: callbackStartgg(origen),
    }),
  });
  const json = (await res.json().catch(() => ({}))) as { access_token?: string };
  if (!res.ok || !json.access_token) throw new Error(`start.gg rechazó el código (HTTP ${res.status}).`);
  return json.access_token;
}

export type PerfilStartgg = {
  id: string;
  email?: string;
  gamerTag: string;
  playerId?: number;
  imagen?: string;
};

export async function perfilStartgg(accessToken: string): Promise<PerfilStartgg> {
  const res = await fetch("https://api.start.gg/gql/alpha", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({
      query: `{ currentUser { id email player { id gamerTag } images(type: "profile") { url } } }`,
    }),
  });
  const json = (await res.json().catch(() => ({}))) as {
    data?: { currentUser?: { id: number; email?: string; player?: { id: number; gamerTag: string }; images?: { url: string }[] } };
  };
  const u = json.data?.currentUser;
  if (!u) throw new Error("No pude leer tu perfil de start.gg.");
  return {
    id: String(u.id),
    email: u.email ?? undefined,
    gamerTag: u.player?.gamerTag ?? "Jugador",
    playerId: u.player?.id,
    imagen: u.images?.[0]?.url,
  };
}
