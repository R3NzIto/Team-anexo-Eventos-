/*
  Cliente mínimo de la API GraphQL de start.gg (https://developer.start.gg).
  Requiere un token personal de desarrollador en STARTGG_TOKEN.
  Límites de start.gg: 80 pedidos por minuto y 1000 objetos por consulta,
  por eso los standings se piden de a páginas de 64.
  Sin dependencias de Next, para poder usarlo también desde scripts/.
*/
import type { EventoTorneo, Jugador, SerieId, Standing, Torneo } from "./types.ts";
import { slugify } from "./ranking.ts";
import { masUsado, slugPersonaje } from "./personajes.ts";

const ENDPOINT = "https://api.start.gg/gql/alpha";
const ULTIMATE_ID = 1386;

type GqlError = { message: string };

async function gql<T>(token: string, query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ query, variables }),
  });
  if (res.status === 429) throw new Error("start.gg: demasiados pedidos seguidos, esperá un minuto y volvé a intentar.");
  if (!res.ok) throw new Error(`start.gg respondió ${res.status}. Revisá que el token sea válido.`);
  const json = (await res.json()) as { data?: T; errors?: GqlError[] };
  if (json.errors?.length) throw new Error(`start.gg: ${json.errors.map((e) => e.message).join("; ")}`);
  if (!json.data) throw new Error("start.gg no devolvió datos.");
  return json.data;
}

/** Acepta el link completo o el slug: devuelve "nombre-del-torneo". */
export function slugDesdeUrl(input: string): string {
  const limpio = input.trim().replace(/^https?:\/\/(www\.)?start\.gg\//, "");
  const m = /(?:^|\/)tournament\/([^/?#]+)/.exec(limpio);
  return (m ? m[1] : limpio.split(/[/?#]/)[0]).toLowerCase();
}

const TORNEO_QUERY = /* GraphQL */ `
  query Torneo($slug: String) {
    tournament(slug: $slug) {
      id
      name
      slug
      startAt
      venueName
      venueAddress
      city
      isRegistrationOpen
      images { type url }
      events {
        id
        name
        slug
        numEntrants
        videogame { id displayName }
      }
    }
  }
`;

const STANDINGS_QUERY = /* GraphQL */ `
  query Standings($eventId: ID!, $page: Int!, $perPage: Int!) {
    event(id: $eventId) {
      standings(query: { page: $page, perPage: $perPage }) {
        pageInfo { totalPages }
        nodes {
          placement
          entrant {
            name
            participants {
              prefix
              gamerTag
              player { id }
              user { slug }
            }
          }
        }
      }
    }
  }
`;

const SETS_QUERY = /* GraphQL */ `
  query Sets($eventId: ID!, $page: Int!, $perPage: Int!) {
    event(id: $eventId) {
      sets(page: $page, perPage: $perPage, sortType: STANDARD) {
        pageInfo { totalPages }
        nodes {
          games {
            selections {
              character { name }
              entrant { participants { player { id } } }
            }
          }
        }
      }
    }
  }
`;

type SggSet = {
  games: { selections: { character: { name: string } | null; entrant: { participants: { player: { id: number } | null }[] | null } | null }[] | null }[] | null;
};

const pausa = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Cuenta, por jugador, cuántos games jugó con cada personaje en un evento.
 * Solo singles: en dobles start.gg no dice qué integrante eligió cada personaje.
 */
async function getPersonajes(token: string, eventId: number) {
  const usos = new Map<string, Record<string, number>>();
  for (let page = 1; page <= 20; page++) {
    const data = await gql<{ event: { sets: { pageInfo: { totalPages: number }; nodes: SggSet[] } } | null }>(
      token, SETS_QUERY, { eventId, page, perPage: 15 },
    );
    const sets = data.event?.sets;
    if (!sets) break;
    for (const set of sets.nodes) {
      for (const game of set.games ?? []) {
        for (const sel of game.selections ?? []) {
          const participantes = sel.entrant?.participants ?? [];
          const player = participantes.length === 1 ? participantes[0].player : null;
          const personaje = sel.character ? slugPersonaje(sel.character.name) : "";
          if (!player || !personaje) continue;
          const id = `sgg:${player.id}`;
          const cuenta = usos.get(id) ?? {};
          cuenta[personaje] = (cuenta[personaje] ?? 0) + 1;
          usos.set(id, cuenta);
        }
      }
    }
    if (page >= sets.pageInfo.totalPages) break;
    await pausa(800); // Margen para el límite de 80 pedidos por minuto.
  }
  return usos;
}

type SggEvent = { id: number; name: string; slug: string; numEntrants: number | null; videogame: { id: number; displayName: string } | null };
type SggTorneo = {
  id: number;
  name: string;
  slug: string;
  startAt: number | null;
  venueName: string | null;
  venueAddress: string | null;
  city: string | null;
  isRegistrationOpen: boolean | null;
  images: { type: string; url: string }[] | null;
  events: SggEvent[] | null;
};
type SggStanding = {
  placement: number;
  entrant: { name: string; participants: { prefix: string | null; gamerTag: string; player: { id: number } | null; user: { slug: string } | null }[] | null } | null;
};

async function getStandings(token: string, eventId: number) {
  const out: SggStanding[] = [];
  for (let page = 1; page <= 20; page++) {
    const data = await gql<{ event: { standings: { pageInfo: { totalPages: number }; nodes: SggStanding[] } } | null }>(
      token, STANDINGS_QUERY, { eventId, page, perPage: 64 },
    );
    const st = data.event?.standings;
    if (!st) break;
    out.push(...st.nodes);
    if (page >= st.pageInfo.totalPages) break;
  }
  return out;
}

/** "2026-04-24T16:30:00-03:00" a partir de un timestamp de start.gg, en hora de Argentina. */
function isoArgentina(unix: number): string {
  const d = new Date((unix - 3 * 3600) * 1000);
  return d.toISOString().replace(/\.\d{3}Z$/, "-03:00");
}

export type Importacion = { torneo: Torneo; jugadores: Jugador[] };

/**
 * Trae un torneo de start.gg con sus eventos y standings, listo para guardar.
 * Suma ranking el evento de singles del juego de la serie (o el que se indique).
 */
export async function importarTorneo(
  token: string,
  urlOSlug: string,
  opciones: { serie: SerieId; eventoRanking?: string },
): Promise<Importacion> {
  const slug = slugDesdeUrl(urlOSlug);
  const { tournament: t } = await gql<{ tournament: SggTorneo | null }>(token, TORNEO_QUERY, { slug });
  if (!t) throw new Error(`No encontré el torneo "${slug}" en start.gg.`);

  const events = t.events ?? [];
  // Dobles/2v2 no suman a un ranking individual: cada entrada es un equipo.
  const esDobles = (e: SggEvent) => /doubles|dobles|2v2|crew/i.test(e.name);
  const delJuego = events.filter((e) =>
    !esDobles(e) && (opciones.serie === "premier" ? e.videogame?.id === ULTIMATE_ID : true),
  );
  // Si no se indica, suma el evento del juego de la serie con más inscriptos
  // (evita elegir un side event vacío que se llame "Singles").
  const elegido =
    events.find((e) => opciones.eventoRanking && e.slug.endsWith(opciones.eventoRanking)) ??
    [...delJuego].sort((a, b) => (b.numEntrants ?? 0) - (a.numEntrants ?? 0))[0];

  const jugadores = new Map<string, Jugador>();
  const eventos: EventoTorneo[] = [];
  for (const e of events) {
    const crudos = await getStandings(token, e.id);
    const usos = esDobles(e) ? new Map<string, Record<string, number>>() : await getPersonajes(token, e.id);
    const standings: Standing[] = [];
    for (const s of crudos) {
      const participantes = s.entrant?.participants ?? [];
      const p = participantes[0];
      if (!p) continue;
      if (participantes.length > 1) {
        // Dobles: se muestra el equipo completo y no se crean perfiles individuales.
        const nombre = s.entrant?.name ?? participantes.map((x) => x.gamerTag).join(" / ");
        standings.push({ puesto: s.placement, jugador: `equipo:${slugify(nombre)}`, gamerTag: nombre });
        continue;
      }
      const id = p.player ? `sgg:${p.player.id}` : `tag:${slugify(p.gamerTag)}`;
      const personajes = usos.get(id);
      standings.push({ puesto: s.placement, jugador: id, gamerTag: p.gamerTag, personaje: masUsado(personajes), personajes });
      if (!jugadores.has(id)) {
        jugadores.set(id, {
          id,
          slug: slugify(p.gamerTag) || id.replace(":", "-"),
          gamerTag: p.gamerTag,
          prefijo: p.prefix || undefined,
          slugStartgg: p.user?.slug ?? undefined,
        });
      }
    }
    eventos.push({
      nombre: e.name,
      juego: e.videogame?.displayName ?? "",
      slugStartgg: e.slug,
      inscriptos: e.numEntrants ?? undefined,
      sumaRanking: e.id === elegido?.id,
      standings: standings.sort((a, b) => a.puesto - b.puesto),
    });
  }

  const fecha = t.startAt ? isoArgentina(t.startAt) : String(new Date().getFullYear());
  const banner = t.images?.find((i) => i.type === "banner")?.url ?? t.images?.find((i) => i.type === "profile")?.url;

  return {
    torneo: {
      slug: t.slug.replace(/^tournament\//, ""),
      nombre: t.name,
      serie: opciones.serie,
      fecha,
      temporada: Number(fecha.slice(0, 4)),
      sede: t.venueName ?? undefined,
      direccion: [t.venueAddress, t.city].filter(Boolean).join(", ") || undefined,
      afiche: banner,
      slugStartgg: t.slug.replace(/^tournament\//, ""),
      inscripcionAbierta: t.isRegistrationOpen ?? undefined,
      events: eventos,
    },
    jugadores: [...jugadores.values()],
  };
}
