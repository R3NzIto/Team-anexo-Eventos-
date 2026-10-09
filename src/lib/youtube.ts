/*
  Videos del canal de YouTube. Se leen del feed público del canal (los últimos 15,
  sin clave de API) y se guardan en la base para no perderlos cuando salen del feed.

  Si el título es una partida, se vincula sola:
    "Premier Smash League #1 MENDOTAKU EDITION 2025 Benu (Kazuya) VS The Senpai (Link)"
    → torneo: premier-smash-league-1 · Benu con Kazuya · The_Senpai con Link
*/
import { slugPersonaje } from "./personajes.ts";
import type { Jugador, Torneo } from "./types.ts";

export type VideoFeed = { id: string; titulo: string; publicado: string; vistas?: number };

export type Lado = { nombre: string; jugador?: string; personaje?: string };

export type VideoAnalizado = VideoFeed & {
  juego?: "smash" | "sf6" | "kof";
  torneo?: string;
  esPartida: boolean;
  a?: Lado;
  b?: Lado;
};

const entidades = (t: string) =>
  t.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

export async function leerFeed(canalId: string): Promise<VideoFeed[]> {
  const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${canalId}`);
  if (!res.ok) throw new Error(`YouTube no respondió (HTTP ${res.status}).`);
  const xml = await res.text();
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, e]) => ({
    id: /<yt:videoId>([^<]+)/.exec(e)?.[1] ?? "",
    titulo: entidades(/<title>([^<]*)/.exec(e)?.[1] ?? "").trim(),
    publicado: /<published>([^<]+)/.exec(e)?.[1] ?? new Date().toISOString(),
    vistas: Number(/views="(\d+)"/.exec(e)?.[1]) || undefined,
  })).filter((v) => v.id);
}

/** "The Senpai", "The_Senpai" y "THE SENPAI" son lo mismo. */
const clave = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

function juegoDe(titulo: string, torneo?: Torneo): VideoAnalizado["juego"] {
  if (torneo?.serie === "premier" || /smash|ultimate|ssbu/i.test(titulo)) return "smash";
  if (/street\s*fighter|sf6/i.test(titulo)) return "sf6";
  if (/king of fighters|kof/i.test(titulo)) return "kof";
  return undefined;
}

/** El primer personaje de "(Samus/Terry)" como slug de ícono, si existe. */
function personaje(texto: string, juego: VideoAnalizado["juego"]): string | undefined {
  if (juego !== "smash") return undefined;
  const slug = slugPersonaje(texto.split(/[/,]/)[0].trim());
  return slug || undefined;
}

/** Busca al jugador por gamertag: primero entre los que jugaron ese torneo (hay nombres repetidos). */
function buscarJugador(palabras: string[], candidatos: Jugador[], todos: Jugador[]): { jugador?: Jugador; nombre: string } {
  for (const lista of [candidatos, todos]) {
    const porClave = new Map(lista.map((j) => [clave(j.gamerTag), j]));
    // Desde el final: "… EDITION 2025 The Senpai" prueba "Senpai", "The Senpai", "2025 The Senpai"…
    for (let n = 1; n <= Math.min(4, palabras.length); n++) {
      const nombre = palabras.slice(-n).join(" ");
      const j = porClave.get(clave(nombre));
      if (j) return { jugador: j, nombre };
    }
  }
  return { nombre: palabras.slice(-1).join(" ") };
}

export function analizarVideo(video: VideoFeed, torneos: Torneo[], jugadores: Jugador[]): VideoAnalizado {
  const partes = video.titulo.split(/\s+vs\.?\s+/i);
  // El torneo es el de nombre más largo con el que empieza el título.
  const titClave = clave(video.titulo);
  const torneo = [...torneos].sort((x, y) => y.nombre.length - x.nombre.length).find((t) => titClave.startsWith(clave(t.nombre)));
  const juego = juegoDe(video.titulo, torneo);
  const base: VideoAnalizado = { ...video, juego, torneo: torneo?.slug, esPartida: false };
  if (partes.length !== 2) return base;

  const izq = /^(.*?)\s*\(([^)]*)\)\s*$/.exec(partes[0].trim());
  const der = /^(.*?)\s*\(([^)]*)\)\s*$/.exec(partes[1].trim());
  if (!izq || !der) return base;

  const enTorneo = torneo
    ? jugadores.filter((j) => torneo.events.some((e) => e.standings.some((s) => s.jugador === j.id)))
    : [];
  const ladoA = buscarJugador(izq[1].trim().split(/\s+/), enTorneo, jugadores);
  const ladoB = buscarJugador(der[1].trim().split(/\s+/), enTorneo, jugadores);

  return {
    ...base,
    esPartida: true,
    a: { nombre: ladoA.jugador?.gamerTag ?? ladoA.nombre, jugador: ladoA.jugador?.id, personaje: personaje(izq[2], juego) },
    b: { nombre: ladoB.jugador?.gamerTag ?? der[1].trim(), jugador: ladoB.jugador?.id, personaje: personaje(der[2], juego) },
  };
}
