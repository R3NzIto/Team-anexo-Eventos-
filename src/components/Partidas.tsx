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
    }));
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
