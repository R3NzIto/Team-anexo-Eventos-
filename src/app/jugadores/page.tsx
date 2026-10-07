import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { RankingTable, RankingVacio, StockIcon } from "@/components/Ranking";
import { TorneoCard } from "@/components/TorneoCard";
import { getJugadores, getProximos, getRanking, getTemporadas } from "@/lib/data";
import { LINKS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Jugadores",
  description: "La zona de jugadores de Team Anexo: próximos torneos, ranking de la Premier Smash League y perfiles.",
};

export default async function JugadoresPage() {
  const [proximos, temporadas, jugadores] = await Promise.all([getProximos(), getTemporadas("premier"), getJugadores()]);
  const temporada = temporadas[0] ?? 2026;
  const ranking = await getRanking("premier", temporada);

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
            <div className="tgrid">{proximos.map((t) => <TorneoCard key={t.slug} torneo={t} />)}</div>
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
            <ul className="players">
              {jugadores.map((j) => (
                <li key={j.id}>
                  <Link href={`/jugadores/${j.slug}`}>
                    <StockIcon personaje={j.personaje} />
                    {j.gamerTag}
                  </Link>
                </li>
              ))}
            </ul>
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
