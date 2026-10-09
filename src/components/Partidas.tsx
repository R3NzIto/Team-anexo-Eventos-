import { getJugadores, getTorneos, getVideos } from "@/lib/data";
import { fechaCorta } from "@/lib/format";
import { Revelar } from "./Movimiento";
import { VideoPartida, type DatosPartida } from "./VideoPartida";

type Filtro = { torneo?: string; jugador?: string };

/** Las partidas del canal (todas, de un torneo o de un jugador), listas para mostrar. */
export async function getPartidas(filtro: Filtro = {}): Promise<DatosPartida[]> {
  const [videos, jugadores, torneos] = await Promise.all([getVideos(), getJugadores(), getTorneos()]);
  const slugDe = new Map(jugadores.map((j) => [j.id, j.slug]));
  const torneoDe = new Map(torneos.map((t) => [t.slug, t.nombre]));
  // La final de cada torneo es la partida entre su 1° y su 2°.
  const finalistas = new Map(torneos.map((t) => {
    const evento = t.events.find((e) => e.sumaRanking) ?? t.events[0];
    const ids = [1, 2].map((p) => evento?.standings.find((s) => s.puesto === p)?.jugador);
    return [t.slug, new Set(ids.filter(Boolean))];
  }));
  const esFinal = (torneo?: string, a?: string, b?: string) => {
    const f = torneo ? finalistas.get(torneo) : undefined;
    return Boolean(f && f.size === 2 && a && b && f.has(a) && f.has(b));
  };
  return videos
    .filter((v) => v.esPartida && v.a && v.b)
    .filter((v) => !filtro.torneo || v.torneo === filtro.torneo)
    .filter((v) => !filtro.jugador || v.a?.jugador === filtro.jugador || v.b?.jugador === filtro.jugador)
    .map((v) => ({
      id: v.id,
      titulo: v.titulo,
      fecha: v.publicado,
      a: { nombre: v.a!.nombre, slug: v.a!.jugador ? slugDe.get(v.a!.jugador) : undefined, personaje: v.a!.personaje },
      b: { nombre: v.b!.nombre, slug: v.b!.jugador ? slugDe.get(v.b!.jugador) : undefined, personaje: v.b!.personaje },
      torneo: v.torneo && torneoDe.has(v.torneo) ? { slug: v.torneo, nombre: torneoDe.get(v.torneo)! } : undefined,
      esFinal: esFinal(v.torneo, v.a?.jugador, v.b?.jugador),
    }));
}

/**
 * Partidas para el inicio: la primera es la final (1° contra 2°) de la última Premier
 * que tiene videos; después, las más nuevas. Si no se encuentra la final, va la más nueva.
 */
export async function getPartidasInicio(cantidad = 4): Promise<DatosPartida[]> {
  const [partidas, torneos] = await Promise.all([getPartidas(), getTorneos()]);
  // Premiers del más nuevo al más viejo: la primera que tenga videos manda su final.
  const ultima = torneos.find((t) => t.serie === "premier" && partidas.some((p) => p.torneo?.slug === t.slug));
  const final = partidas.find((p) => p.esFinal && p.torneo?.slug === ultima?.slug);
  return (final ? [final, ...partidas.filter((p) => p !== final)] : partidas).slice(0, cantidad);
}

/** Grilla de partidas. Con `destacar`, la primera va grande y arranca sola en silencio. */
export function GrillaPartidas({ partidas, destacar = false }: { partidas: DatosPartida[]; destacar?: boolean }) {
  if (!partidas.length) return null;
  const [primera, ...resto] = partidas;
  return (
    <div className={`partidas${destacar ? " partidas--con-destacada" : ""}`}>
      {destacar && <VideoPartida partida={primera} destacada fecha={fechaCorta(primera.fecha)} />}
      <Revelar className="partidas__lista">
        {(destacar ? resto : partidas).map((p) => <VideoPartida key={p.id} partida={p} fecha={fechaCorta(p.fecha)} />)}
      </Revelar>
    </div>
  );
}
