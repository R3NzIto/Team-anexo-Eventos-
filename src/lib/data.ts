import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { leerAlias, leerDatos, leerVideos, type Video } from "./db";
import { calcularRanking, slugify } from "./ranking";
import { masUsado, sumarUsos } from "./personajes";
import { fechaOrdenable } from "./format";
import type { FilaRanking, Jugador, Resultado, Serie, SerieId, Torneo } from "./types";

/*
  Capa de datos del sitio: única puerta a la base. Las páginas solo llaman a
  estas funciones. Todo queda en caché con la etiqueta "datos"; el panel de
  admin la invalida al guardar (updateTag("datos")) y el sitio se actualiza.
*/

/*
  Lee la base una vez y prepara:
  - Los standings con los alias aplicados: la cuenta secundaria de un jugador
    (tabla alias) suma a la principal.
  - Todos los jugadores individuales con su main: el elegido a mano o, si no hay,
    el personaje con más games sumando todos sus torneos.
*/
async function getBase() {
  "use cache";
  cacheLife("hours");
  cacheTag("datos");
  const datos = await leerDatos();
  const principal = (id: string) => datos.alias[id] ?? id;

  const torneos: Torneo[] = datos.torneos.map((t) => ({
    ...t,
    events: t.events.map((e) => ({ ...e, standings: e.standings.map((s) => ({ ...s, jugador: principal(s.jugador) })) })),
  }));

  const porId = new Map(datos.jugadores.filter((j) => !datos.alias[j.id]).map((j) => [j.id, { ...j }]));
  const usos = new Map<string, Record<string, number>>();
  for (const t of torneos) {
    for (const e of t.events) {
      for (const s of e.standings) {
        if (s.jugador.startsWith("equipo:")) continue;
        if (!porId.has(s.jugador)) {
          porId.set(s.jugador, { id: s.jugador, slug: slugify(s.gamerTag) || s.jugador, gamerTag: s.gamerTag });
        }
        const acumulado = usos.get(s.jugador) ?? {};
        sumarUsos(acumulado, s.personajes);
        usos.set(s.jugador, acumulado);
      }
    }
  }
  const jugadores: Jugador[] = [...porId.values()].map((j) => ({ ...j, personaje: j.personaje ?? masUsado(usos.get(j.id)) }));

  return { series: datos.series, torneos, jugadores, resultados: datos.resultados };
}

function ordenarRecientes(lista: Torneo[]) {
  return [...lista].sort((a, b) => fechaOrdenable(b.fecha) - fechaOrdenable(a.fecha));
}

/** Un torneo pasó si ya transcurrieron 12 h desde su inicio (o si solo se sabe el año). */
const yaPaso = (t: Torneo) => t.fecha.length === 4 || fechaOrdenable(t.fecha) <= Date.now() - 12 * 3600 * 1000;

export async function getSeries(): Promise<Serie[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("datos");
  return (await getBase()).series;
}

export async function getSerie(id: string): Promise<Serie | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag("datos");
  return (await getBase()).series.find((s) => s.id === id);
}

export async function getTorneos(): Promise<Torneo[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("datos");
  return ordenarRecientes((await getBase()).torneos);
}

export async function getTorneo(slug: string): Promise<Torneo | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag("datos");
  return (await getBase()).torneos.find((t) => t.slug === slug);
}

/** Próximos torneos (fecha con día en el futuro), el más cercano primero. */
export async function getProximos(): Promise<Torneo[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("datos");
  return (await getBase()).torneos
    .filter((t) => !yaPaso(t))
    .sort((a, b) => fechaOrdenable(a.fecha) - fechaOrdenable(b.fecha));
}

export async function getPasados(): Promise<Torneo[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("datos");
  return ordenarRecientes((await getBase()).torneos.filter(yaPaso));
}

export async function getTemporadas(serie: SerieId): Promise<number[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("datos");
  const { torneos } = await getBase();
  return [...new Set(torneos.filter((t) => t.serie === serie).map((t) => t.temporada))].sort((a, b) => b - a);
}

export async function getRanking(serie: SerieId, temporada: number): Promise<FilaRanking[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("datos");
  const { series, torneos, jugadores } = await getBase();
  const config = series.find((s) => s.id === serie);
  if (!config?.puntos) return [];
  const delTemporada = torneos.filter((t) => t.serie === serie && t.temporada === temporada);
  return calcularRanking(delTemporada, config.puntos, new Map(jugadores.map((j) => [j.id, j])));
}

export async function getJugadores(): Promise<Jugador[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("datos");
  return [...(await getBase()).jugadores].sort((a, b) => a.gamerTag.localeCompare(b.gamerTag, "es"));
}

export type Participacion = { torneo: Torneo; evento: string; puesto: number; personaje?: string };

export async function getJugador(slug: string): Promise<{ jugador: Jugador; historial: Participacion[] } | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag("datos");
  const { torneos, jugadores } = await getBase();
  const jugador = jugadores.find((j) => j.slug === slug);
  if (!jugador) return undefined;
  const historial: Participacion[] = [];
  for (const t of ordenarRecientes(torneos)) {
    for (const e of t.events) {
      const s = e.standings.find((x) => x.jugador === jugador.id);
      if (s) historial.push({ torneo: t, evento: e.nombre, puesto: s.puesto, personaje: s.personaje });
    }
  }
  return { jugador, historial };
}

export async function getResultadosDestacados(): Promise<Resultado[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("datos");
  return (await getBase()).resultados;
}

export type Podio = { torneo: Torneo; puestos: { puesto: number; jugador: Jugador; personaje?: string }[] };

/** El podio (top 3 del evento que suma) de la última fecha jugada de una serie. */
export async function getPodioUltimaFecha(serie: SerieId): Promise<Podio | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag("datos");
  const { torneos, jugadores } = await getBase();
  const porId = new Map(jugadores.map((j) => [j.id, j]));
  for (const t of ordenarRecientes(torneos.filter((x) => x.serie === serie && yaPaso(x)))) {
    const evento = t.events.find((e) => e.sumaRanking && e.standings.length >= 3);
    if (!evento) continue;
    const puestos = evento.standings
      .filter((s) => s.puesto <= 3 && porId.has(s.jugador))
      .slice(0, 3)
      .map((s) => ({ puesto: s.puesto, jugador: porId.get(s.jugador)!, personaje: s.personaje ?? porId.get(s.jugador)!.personaje }));
    if (puestos.length) return { torneo: t, puestos };
  }
  return undefined;
}

export type PuntoEvolucion = { torneo: string; slug: string; fecha: string; posicion: number | null; puntos: number };

/** Posición del jugador en el ranking de la temporada después de cada fecha. */
export async function getEvolucion(jugadorId: string, serie: SerieId, temporada: number): Promise<PuntoEvolucion[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("datos");
  const { series, torneos, jugadores } = await getBase();
  const tabla = series.find((s) => s.id === serie)?.puntos;
  if (!tabla) return [];
  const mapa = new Map(jugadores.map((j) => [j.id, j]));
  const fechas = torneos
    .filter((t) => t.serie === serie && t.temporada === temporada && t.events.some((e) => e.sumaRanking && e.standings.length))
    .sort((a, b) => fechaOrdenable(a.fecha) - fechaOrdenable(b.fecha));
  return fechas.map((t, i) => {
    const fila = calcularRanking(fechas.slice(0, i + 1), tabla, mapa).find((f) => f.jugador.id === jugadorId);
    return { torneo: t.nombre, slug: t.slug, fecha: t.fecha, posicion: fila?.posicion ?? null, puntos: fila?.puntos ?? 0 };
  });
}

/** Games jugados con cada personaje, sumando todos sus torneos de singles. */
export async function getPersonajesJugador(jugadorId: string): Promise<{ personaje: string; games: number }[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("datos");
  const { torneos } = await getBase();
  const usos: Record<string, number> = {};
  for (const t of torneos) for (const e of t.events) for (const s of e.standings) if (s.jugador === jugadorId) sumarUsos(usos, s.personajes);
  return Object.entries(usos).map(([personaje, games]) => ({ personaje, games })).sort((a, b) => b.games - a.games);
}

/** Videos visibles del canal, del más nuevo al más viejo. Los alias de jugador ya aplicados. */
export async function getVideos(): Promise<Video[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("datos");
  const [videos, datos] = await Promise.all([leerVideos(), leerAlias()]);
  const principal = (id?: string) => (id ? datos[id] ?? id : undefined);
  return videos
    .filter((v) => !v.oculto)
    .map((v) => ({
      ...v,
      a: v.a && { ...v.a, jugador: principal(v.a.jugador) },
      b: v.b && { ...v.b, jugador: principal(v.b.jugador) },
    }));
}
