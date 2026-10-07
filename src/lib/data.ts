import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { leerDatos } from "./db";
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
