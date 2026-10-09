/*
  Videos de los canales de YouTube. Se leen del feed público del canal (los últimos 15,
  sin clave de API) y se guardan en la base para no perderlos cuando salen del feed.

  Si el título es una partida, se vincula sola. Se entienden dos formatos:
    Canal viejo:    "Premier Smash League #1 MENDOTAKU EDITION 2025 Benu (Kazuya) VS The Senpai (Link)"
                    → torneo por nombre, jugadores y personajes
    Canal Replays:  "ANX | BENU VS ANX | LUKITAS GRAND FINALS", "ANX/VAL | Trinki76 vs ZLG | Skinessito GF SF6#2"
                    → jugadores (lo que va después del "|"), ronda, juego y evento ("SF6 #2");
                      el torneo se deduce por fecha: el último jugado antes del video donde estuvieron los dos
*/
import { slugPersonaje } from "./personajes.ts";
import type { Jugador, Torneo } from "./types.ts";

export type VideoFeed = { id: string; titulo: string; publicado: string; vistas?: number };

export type Lado = { nombre: string; jugador?: string; personaje?: string };

export type VideoAnalizado = VideoFeed & {
  juego?: "smash" | "sf6" | "kof";
  torneo?: string;
  /** "Gran final", "Semifinal de winners"… */
  ronda?: string;
  /** Evento leído del título cuando no hay torneo cargado: "SF6 #2". */
  evento?: string;
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

/** Rondas de bracket, de la más específica a la más general (el orden importa). */
const RONDAS: [RegExp, string][] = [
  [/(?:^|\s)(?:grand\s*finals?|gf)\s*$/i, "Gran final"],
  [/(?:^|\s)(?:winners?\s*finals?|wf)\s*$/i, "Final de winners"],
  [/(?:^|\s)(?:losers?\s*finals?|lf)\s*$/i, "Final de losers"],
  [/(?:^|\s)(?:winners?\s*semi[-\s]?finals?|wsf|wsm)\s*$/i, "Semifinal de winners"],
  [/(?:^|\s)(?:losers?\s*semi[-\s]?finals?|lsf|lsm)\s*$/i, "Semifinal de losers"],
  [/(?:^|\s)(?:winners?\s*quarter[-\s]?finals?|wqf)\s*$/i, "Cuartos de winners"],
  [/(?:^|\s)(?:losers?\s*quarter[-\s]?finals?|lqf)\s*$/i, "Cuartos de losers"],
  [/(?:^|\s)(?:semi[-\s]?finals?|sf)\s*$/i, "Semifinal"],
  [/(?:^|\s)(?:quarter[-\s]?finals?|qf)\s*$/i, "Cuartos de final"],
  [/(?:^|\s)wr(\d+)\s*$/i, "Ronda $1 de winners"],
  [/(?:^|\s)lr(\d+)\s*$/i, "Ronda $1 de losers"],
];

/** Separa la ronda del final de un texto: "Skinessito GF" → { resto: "Skinessito", ronda: "Gran final" }. */
function sacarRonda(texto: string): { resto: string; ronda?: string } {
  for (const [patron, nombre] of RONDAS) {
    const m = patron.exec(texto);
    if (m) return { resto: texto.slice(0, m.index).trim(), ronda: nombre.replace("$1", m[1] ?? "") };
  }
  return { resto: texto.trim() };
}

/** Busca un gamertag suelto: exacto, o el único que empiece/termine igual ("Senpai" → The_Senpai). */
function jugadorPorNombre(nombre: string, candidatos: Jugador[], todos: Jugador[]): Jugador | undefined {
  const k = clave(nombre);
  if (!k) return undefined;
  for (const lista of [candidatos, todos]) {
    const exacto = lista.find((j) => clave(j.gamerTag) === k);
    if (exacto) return exacto;
  }
  if (k.length < 4) return undefined;
  for (const lista of [candidatos, todos]) {
    const parecidos = lista.filter((j) => clave(j.gamerTag).endsWith(k) || clave(j.gamerTag).startsWith(k));
    if (parecidos.length === 1) return parecidos[0];
  }
  return undefined;
}

const fechaNum = (f: string) => (/^\d{4}$/.test(f) ? Date.UTC(Number(f), 0, 1) : Date.parse(f));

export function analizarVideo(video: VideoFeed, torneos: Torneo[], jugadores: Jugador[]): VideoAnalizado {
  const partes = video.titulo.split(/\s+vs\.?\s+/i);
  // El torneo es el de nombre más largo con el que empieza el título.
  const titClave = clave(video.titulo);
  const porNombre = [...torneos].sort((x, y) => y.nombre.length - x.nombre.length).find((t) => titClave.startsWith(clave(t.nombre)));
  const base: VideoAnalizado = { ...video, juego: juegoDe(video.titulo, porNombre), torneo: porNombre?.slug, esPartida: false };
  if (partes.length !== 2) return base;
  const jugaron = (t: Torneo) => jugadores.filter((j) => t.events.some((e) => e.standings.some((s) => s.jugador === j.id)));

  // Canal viejo: "… Jugador (Personaje) VS Jugador (Personaje)"
  const izq = /^(.*?)\s*\(([^)]*)\)\s*$/.exec(partes[0].trim());
  const der = /^(.*?)\s*\(([^)]*)\)\s*$/.exec(partes[1].trim());
  if (izq && der) {
    const enTorneo = porNombre ? jugaron(porNombre) : [];
    const ladoA = buscarJugador(izq[1].trim().split(/\s+/), enTorneo, jugadores);
    const ladoB = buscarJugador(der[1].trim().split(/\s+/), enTorneo, jugadores);
    return {
      ...base,
      esPartida: true,
      a: { nombre: ladoA.jugador?.gamerTag ?? ladoA.nombre, jugador: ladoA.jugador?.id, personaje: personaje(izq[2], base.juego) },
      b: { nombre: ladoB.jugador?.gamerTag ?? der[1].trim(), jugador: ladoB.jugador?.id, personaje: personaje(der[2], base.juego) },
    };
  }

  // Canal Replays: "EQUIPO | Jugador VS EQUIPO | Jugador RONDA EVENTO#N"
  let derecha = partes[1].split("|").pop()!.trim();
  const tag = /\b(SF6|KOF|SSBU|SMASH|TEKKEN|2XKO)\s*#\s*(\d+)\b/i.exec(derecha);
  if (tag) derecha = (derecha.slice(0, tag.index) + derecha.slice(tag.index + tag[0].length)).trim();
  const { resto: nombreB, ronda } = sacarRonda(derecha);
  const nombreA = partes[0].split("|").pop()!.trim();
  if (!nombreA || !nombreB) return base;
  const evento = tag ? `${tag[1].toUpperCase()} #${tag[2]}` : undefined;
  const juego = tag ? juegoDe(tag[1], undefined) : base.juego;

  let jA = jugadorPorNombre(nombreA, [], jugadores);
  let jB = jugadorPorNombre(nombreB, [], jugadores);
  // Sin torneo en el título: el último jugado (hasta 60 días antes del video) donde estuvieron los dos.
  let torneo = porNombre;
  if (!torneo && !tag && jA && jB) {
    const publicado = Date.parse(video.publicado);
    torneo = torneos
      .filter((t) => fechaNum(t.fecha) <= publicado + 86400000 && fechaNum(t.fecha) >= publicado - 60 * 86400000)
      .filter((t) => [jA!, jB!].every((j) => t.events.some((e) => e.standings.some((s) => s.jugador === j.id))))
      .sort((x, y) => fechaNum(y.fecha) - fechaNum(x.fecha))[0];
  }
  if (torneo) {
    const enTorneo = jugaron(torneo);
    jA = jugadorPorNombre(nombreA, enTorneo, jugadores) ?? jA;
    jB = jugadorPorNombre(nombreB, enTorneo, jugadores) ?? jB;
  }
  const juegoFinal = juego ?? juegoDe(video.titulo, torneo);
  return {
    ...base,
    juego: juegoFinal,
    torneo: torneo?.slug,
    ronda,
    evento,
    esPartida: true,
    a: { nombre: jA?.gamerTag ?? nombreA, jugador: jA?.id, personaje: juegoFinal === "smash" ? jA?.personaje : undefined },
    b: { nombre: jB?.gamerTag ?? nombreB, jugador: jB?.id, personaje: juegoFinal === "smash" ? jB?.personaje : undefined },
  };
}

/**
 * Analiza un lote del mismo canal. Si una partida no dice el evento ("SF6#2") pero se subió
 * el mismo día que otras que sí, y comparte jugadores con ellas, toma el mismo evento y juego.
 */
export function analizarLote(videos: VideoFeed[], torneos: Torneo[], jugadores: Jugador[]): VideoAnalizado[] {
  const analizados = videos.map((v) => analizarVideo(v, torneos, jugadores));
  const nombres = (v: VideoAnalizado) => [v.a?.nombre, v.b?.nombre].filter(Boolean).map((n) => clave(n!));
  for (const v of analizados) {
    if (!v.esPartida || v.evento || v.torneo) continue;
    const dia = v.publicado.slice(0, 10);
    const mismo = analizados.find((o) => o.evento && o.publicado.slice(0, 10) === dia && nombres(o).some((n) => nombres(v).includes(n)));
    if (mismo) { v.evento = mismo.evento; v.juego = mismo.juego; }
  }
  return analizados;
}
