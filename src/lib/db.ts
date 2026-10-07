/*
  Acceso a la base (Neon Postgres). Lo usan la capa de datos del sitio (data.ts),
  las acciones del panel de admin y los scripts de la terminal.
  Necesita DATABASE_URL (Vercel la carga sola; en tu compu va en .env.local).
*/
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { slugify } from "./ranking.ts";
import type { EventoTorneo, Jugador, Resultado, Serie, SerieId, TablaPuntos, Torneo } from "./types.ts";

let cliente: NeonQueryFunction<false, false> | undefined;

export function sql() {
  if (!cliente) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("Falta DATABASE_URL. En tu compu va en .env.local; en Vercel la carga la integración de Neon.");
    cliente = neon(url);
  }
  return cliente;
}

export type Datos = {
  series: Serie[];
  torneos: Torneo[];
  jugadores: Jugador[];
  alias: Record<string, string>;
  resultados: Resultado[];
};

const opcional = <T>(v: T | null): T | undefined => (v === null ? undefined : v);

/** Lee toda la base de una vez. Son pocos datos, y así el ranking se arma en memoria. */
export async function leerDatos(): Promise<Datos> {
  const db = sql();
  const [series, torneos, eventos, standings, jugadores, alias, resultados] = await db.transaction(
    [
      db`select * from series order by orden, id`,
      db`select * from torneos`,
      db`select * from eventos order by torneo, orden, id`,
      db`select * from standings order by evento, puesto, gamer_tag`,
      db`select * from jugadores`,
      db`select * from alias`,
      db`select * from resultados order by orden, id`,
    ],
    { readOnly: true },
  );

  const standingsPorEvento = new Map<number, EventoTorneo["standings"]>();
  for (const s of standings) {
    const lista = standingsPorEvento.get(s.evento) ?? [];
    lista.push({
      puesto: s.puesto,
      jugador: s.jugador,
      gamerTag: s.gamer_tag,
      personaje: opcional(s.personaje),
      personajes: opcional(s.personajes),
    });
    standingsPorEvento.set(s.evento, lista);
  }
  const eventosPorTorneo = new Map<string, EventoTorneo[]>();
  for (const e of eventos) {
    const lista = eventosPorTorneo.get(e.torneo) ?? [];
    lista.push({
      nombre: e.nombre,
      juego: e.juego,
      slugStartgg: opcional(e.slug_startgg),
      inscriptos: opcional(e.inscriptos),
      sumaRanking: e.suma_ranking,
      standings: standingsPorEvento.get(e.id) ?? [],
    });
    eventosPorTorneo.set(e.torneo, lista);
  }

  return {
    series: series.map((s) => ({
      id: s.id,
      nombre: s.nombre,
      corto: s.corto,
      juego: s.juego,
      activa: s.activa,
      rankeable: s.rankeable,
      puntos: opcional(s.puntos),
      descripcion: s.descripcion,
    })),
    torneos: torneos.map((t) => ({
      slug: t.slug,
      nombre: t.nombre,
      serie: t.serie,
      fecha: t.fecha,
      temporada: t.temporada,
      sede: opcional(t.sede),
      direccion: opcional(t.direccion),
      valor: opcional(t.valor),
      afiche: opcional(t.afiche),
      slugStartgg: opcional(t.slug_startgg),
      inscripcionAbierta: t.inscripcion_abierta || undefined,
      events: eventosPorTorneo.get(t.slug) ?? [],
    })),
    jugadores: jugadores.map((j) => ({
      id: j.id,
      slug: j.slug,
      gamerTag: j.gamer_tag,
      prefijo: opcional(j.prefijo),
      personaje: opcional(j.personaje),
      slugStartgg: opcional(j.slug_startgg),
    })),
    alias: Object.fromEntries(alias.map((a) => [a.secundario, a.principal])),
    resultados: resultados.map((r) => ({ titulo: r.titulo, evento: r.evento, imagen: r.imagen, alt: r.alt })),
  };
}

/**
 * Guarda un torneo con sus eventos y standings, reemplazando los anteriores.
 * Si ya existía (mismo slug o mismo torneo de start.gg), conserva el slug,
 * y el afiche y el precio cargados a mano.
 */
export async function guardarTorneo(torneo: Torneo): Promise<string> {
  const db = sql();
  const [previo] = await db`
    select slug, afiche, valor from torneos
    where slug = ${torneo.slug} or (slug_startgg is not null and slug_startgg = ${torneo.slugStartgg ?? null})
    limit 1`;
  const slug: string = previo?.slug ?? torneo.slug;
  const afiche = previo?.afiche ?? torneo.afiche ?? null;
  const valor = previo?.valor ?? torneo.valor ?? null;

  await db.transaction([
    db`insert into torneos (slug, nombre, serie, fecha, temporada, sede, direccion, valor, afiche, slug_startgg, inscripcion_abierta, actualizado)
       values (${slug}, ${torneo.nombre}, ${torneo.serie}, ${torneo.fecha}, ${torneo.temporada}, ${torneo.sede ?? null},
               ${torneo.direccion ?? null}, ${valor}, ${afiche}, ${torneo.slugStartgg ?? null}, ${torneo.inscripcionAbierta ?? false}, now())
       on conflict (slug) do update set
         nombre = excluded.nombre, serie = excluded.serie, fecha = excluded.fecha, temporada = excluded.temporada,
         sede = excluded.sede, direccion = excluded.direccion, valor = excluded.valor, afiche = excluded.afiche,
         slug_startgg = excluded.slug_startgg, inscripcion_abierta = excluded.inscripcion_abierta, actualizado = now()`,
    db`delete from eventos where torneo = ${slug}`,
    ...torneo.events.map((e, orden) => {
      const st = e.standings;
      // Un solo viaje por evento: crea el evento y carga sus standings con unnest.
      return db`
        with ev as (
          insert into eventos (torneo, orden, nombre, juego, slug_startgg, inscriptos, suma_ranking)
          values (${slug}, ${orden}, ${e.nombre}, ${e.juego}, ${e.slugStartgg ?? null}, ${e.inscriptos ?? null}, ${e.sumaRanking})
          returning id
        )
        insert into standings (evento, puesto, jugador, gamer_tag, personaje, personajes)
        select ev.id, s.puesto, s.jugador, s.gamer_tag, s.personaje, s.personajes
        from ev, unnest(
          ${st.map((s) => s.puesto)}::int[],
          ${st.map((s) => s.jugador)}::text[],
          ${st.map((s) => s.gamerTag)}::text[],
          ${st.map((s) => s.personaje ?? null)}::text[],
          ${st.map((s) => (s.personajes ? JSON.stringify(s.personajes) : null))}::jsonb[]
        ) as s(puesto, jugador, gamer_tag, personaje, personajes)
        on conflict (evento, jugador) do nothing`;
    }),
  ]);
  return slug;
}

/**
 * Crea o actualiza jugadores. A los existentes no les cambia el slug ni el main
 * elegido a mano; a los nuevos les asigna un slug libre (trinki76, trinki76-2…).
 */
export async function guardarJugadores(nuevos: Jugador[]): Promise<void> {
  if (!nuevos.length) return;
  const db = sql();
  const existentes = await db`select id, slug from jugadores`;
  const slugPorId = new Map(existentes.map((j) => [j.id as string, j.slug as string]));
  const usados = new Set(slugPorId.values());

  const filas = nuevos.map((j) => {
    let slug = slugPorId.get(j.id);
    if (!slug) {
      const base = j.slug || slugify(j.gamerTag) || j.id.replace(":", "-");
      slug = base;
      for (let n = 2; usados.has(slug); n++) slug = `${base}-${n}`;
      usados.add(slug);
    }
    return { ...j, slug };
  });

  await db`
    insert into jugadores (id, slug, gamer_tag, prefijo, personaje, slug_startgg)
    select * from unnest(
      ${filas.map((j) => j.id)}::text[],
      ${filas.map((j) => j.slug)}::text[],
      ${filas.map((j) => j.gamerTag)}::text[],
      ${filas.map((j) => j.prefijo ?? null)}::text[],
      ${filas.map((j) => j.personaje ?? null)}::text[],
      ${filas.map((j) => j.slugStartgg ?? null)}::text[]
    )
    on conflict (id) do update set
      gamer_tag = excluded.gamer_tag,
      prefijo = coalesce(excluded.prefijo, jugadores.prefijo),
      slug_startgg = coalesce(excluded.slug_startgg, jugadores.slug_startgg)`;
}

export async function guardarSerie(s: Serie, orden: number): Promise<void> {
  await sql()`
    insert into series (id, nombre, corto, juego, activa, rankeable, puntos, descripcion, orden)
    values (${s.id}, ${s.nombre}, ${s.corto}, ${s.juego}, ${s.activa}, ${s.rankeable},
            ${s.puntos ? JSON.stringify(s.puntos) : null}::jsonb, ${s.descripcion}, ${orden})
    on conflict (id) do update set
      nombre = excluded.nombre, corto = excluded.corto, juego = excluded.juego, activa = excluded.activa,
      rankeable = excluded.rankeable, puntos = excluded.puntos, descripcion = excluded.descripcion, orden = excluded.orden`;
}

export async function guardarPuntos(serie: SerieId, puntos: TablaPuntos): Promise<void> {
  await sql()`update series set puntos = ${JSON.stringify(puntos)}::jsonb where id = ${serie}`;
}
