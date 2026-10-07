import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import torneosSeed from "@/data/torneos.json";
import jugadoresSeed from "@/data/jugadores.json";
import resultadosSeed from "@/data/resultados.json";
import aliasSeed from "@/data/alias.json";
import { SERIES, getSerieConfig } from "@/data/series";
import { calcularRanking, slugify } from "./ranking";
import { masUsado, sumarUsos } from "./personajes";
import { fechaOrdenable } from "./format";
import type { FilaRanking, Jugador, Resultado, Serie, SerieId, Torneo } from "./types";

/*
  Capa de datos del sitio. Hoy lee los archivos de src/data; cuando se conecte
  Supabase, solo cambia la implementación de estas funciones. Las páginas no se tocan.
  Las etiquetas (cacheTag) permiten que el panel de admin refresque al guardar.
*/

/*
  alias.json une cuentas duplicadas de un mismo jugador en start.gg:
  { "sgg:<id-secundario>": "sgg:<id-principal>" }. Los puntos y el historial
  de la cuenta secundaria pasan a la principal.
*/
const alias = aliasSeed as Record<string, string>;
const principal = (id: string) => alias[id] ?? id;

const torneos = (torneosSeed as Torneo[]).map((t) => ({
  ...t,
  events: t.events.map((e) => ({ ...e, standings: e.standings.map((s) => ({ ...s, jugador: principal(s.jugador) })) })),
}));
/*
  Todos los jugadores individuales con su main: el elegido a mano en jugadores.json
  o, si no hay, el personaje con más games sumando todos sus torneos.
*/
const jugadores: Jugador[] = (() => {
  const porId = new Map((jugadoresSeed as Jugador[]).filter((j) => !alias[j.id]).map((j) => [j.id, { ...j }]));
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
  return [...porId.values()].map((j) => ({ ...j, personaje: j.personaje ?? masUsado(usos.get(j.id)) }));
})();

function ordenarRecientes(lista: Torneo[]) {
  return [...lista].sort((a, b) => fechaOrdenable(b.fecha) - fechaOrdenable(a.fecha));
}

export async function getSeries(): Promise<Serie[]> {
  "use cache";
  cacheLife("days");
  cacheTag("series");
  return SERIES;
}

export async function getTorneos(): Promise<Torneo[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("torneos");
  return ordenarRecientes(torneos);
}

export async function getTorneo(slug: string): Promise<Torneo | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag("torneos", `torneo:${slug}`);
  return torneos.find((t) => t.slug === slug);
}

/** Próximos torneos (fecha con día en el futuro), el más cercano primero. */
export async function getProximos(): Promise<Torneo[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("torneos");
  const ahora = Date.now() - 12 * 3600 * 1000;
  return torneos
    .filter((t) => t.fecha.length > 4 && fechaOrdenable(t.fecha) > ahora)
    .sort((a, b) => fechaOrdenable(a.fecha) - fechaOrdenable(b.fecha));
}

export async function getPasados(): Promise<Torneo[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("torneos");
  const ahora = Date.now() - 12 * 3600 * 1000;
  return ordenarRecientes(torneos.filter((t) => t.fecha.length === 4 || fechaOrdenable(t.fecha) <= ahora));
}

export async function getTemporadas(serie: SerieId): Promise<number[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("torneos");
  return [...new Set(torneos.filter((t) => t.serie === serie).map((t) => t.temporada))].sort((a, b) => b - a);
}

export async function getRanking(serie: SerieId, temporada: number): Promise<FilaRanking[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("torneos", "jugadores", `ranking:${serie}`);
  const config = getSerieConfig(serie);
  if (!config?.puntos) return [];
  const delTemporada = torneos.filter((t) => t.serie === serie && t.temporada === temporada);
  return calcularRanking(delTemporada, config.puntos, new Map(jugadores.map((j) => [j.id, j])));
}

export async function getJugadores(): Promise<Jugador[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("jugadores", "torneos");
  return [...jugadores].sort((a, b) => a.gamerTag.localeCompare(b.gamerTag, "es"));
}

export type Participacion = { torneo: Torneo; evento: string; puesto: number; personaje?: string };

export async function getJugador(slug: string): Promise<{ jugador: Jugador; historial: Participacion[] } | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag("jugadores", "torneos", `jugador:${slug}`);
  const todos = await getJugadores();
  const jugador = todos.find((j) => j.slug === slug);
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
  cacheLife("days");
  cacheTag("resultados");
  return resultadosSeed as Resultado[];
}

