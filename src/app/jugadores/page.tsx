import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { BuscadorJugadores } from "@/components/BuscadorJugadores";
import { RankingTable, RankingVacio } from "@/components/Ranking";
import { Revelar } from "@/components/Movimiento";
import { TorneoCard } from "@/components/TorneoCard";
import { getJugadores, getProximos, getRanking, getTemporadas, getTorneos } from "@/lib/data";
import { LINKS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Jugadores",
  description: "La zona de jugadores de Team Anexo: próximos torneos, ranking de la Premier Smash League y perfiles.",
};

export default async function JugadoresPage() {
  const [proximos, temporadas, jugadores, torneos] = await Promise.all([getProximos(), getTemporadas("premier"), getJugadores(), getTorneos()]);
  const temporada = temporadas[0] ?? 2026;
  const ranking = await getRanking("premier", temporada);

  // Torneos jugados por cada uno (un torneo cuenta una vez aunque haya jugado varios eventos)
  const jugados = new Map<string, Set<string>>();
  for (const t of torneos) for (const e of t.events) for (const s of e.standings) {
    jugados.set(s.jugador, (jugados.get(s.jugador) ?? new Set()).add(t.slug));
  }
  const enRanking = new Map(ranking.map((f) => [f.jugador.id, f]));
  const fichas = jugadores
    .map((j) => ({
      slug: j.slug,
      gamerTag: j.gamerTag,
      prefijo: j.prefijo,
      personaje: j.personaje,
      torneos: jugados.get(j.id)?.size ?? 0,
      posicion: enRanking.get(j.id)?.posicion,
      puntos: enRanking.get(j.id)?.puntos,
    }))
    .sort((a, b) => (a.posicion ?? 9999) - (b.posicion ?? 9999) || a.gamerTag.localeCompare(b.gamerTag, "es"));

  return (
    <>
      <section className="page-hero page-hero--p1">
        <div>
          <p className="player"><span className="player__p">P1</span></p>
          <h1 className="page-hero__title">Zona de jugadores</h1>
          <p className="page-hero__lead">
            Inscribite a la próxima fecha, mirá cómo va el ranking de la Premier y buscá tu perfil con tus resultados.
          </p>
        </div>
      </section>

      <div className="page">
        <section aria-labelledby="proximos-title">
          <h2 id="proximos-title" className="section-title">Próximos torneos</h2>
          {proximos.length ? (
            <Revelar className="tgrid">{proximos.map((t) => <TorneoCard key={t.slug} torneo={t} />)}</Revelar>
          ) : (
            <div className="empty">
              <p className="empty__title">Todavía no hay fecha confirmada</p>
              <p>Sumate al grupo de la comunidad para enterarte apenas abran las inscripciones.</p>
              <p><a className="link-arrow" href={LINKS.grupoWhatsapp} target="_blank" rel="noopener">Unirme al grupo<Icon name="arrow" className="link-arrow__icon" /></a></p>
            </div>
          )}
        </section>

        <section className="panel-box panel-box--premier" aria-labelledby="ranking-title">
          <div className="section-head">
            <h2 id="ranking-title" className="section-title">Ranking Premier {temporada}</h2>
            <Link className="link-arrow" href={`/ranking/premier/${temporada}`}>Ranking completo<Icon name="arrow" className="link-arrow__icon" /></Link>
          </div>
          {ranking.length ? <RankingTable filas={ranking} limite={10} /> : <RankingVacio temporada={temporada} />}
        </section>

        <section aria-labelledby="jugadores-title">
          <h2 id="jugadores-title" className="section-title">Jugadores</h2>
          {jugadores.length ? (
            <BuscadorJugadores jugadores={fichas} temporada={temporada} />
          ) : (
            <div className="empty">
              <p className="empty__title">Los perfiles aparecen al cargar resultados</p>
              <p>Cada jugador que participa en un torneo importado desde start.gg tiene su perfil con historial y puntos.</p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
