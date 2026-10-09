import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { RankingTable, RankingVacio } from "@/components/Ranking";
import { Revelar } from "@/components/Movimiento";
import { TorneoCard } from "@/components/TorneoCard";
import { getProximos, getRanking, getTemporadas, getTorneos, getSerie } from "@/lib/data";
import { LINKS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Premier Smash League",
  description: "La liga de Super Smash Bros Ultimate de Team Anexo en Mendoza: fechas, ranking de la temporada y reglamento.",
};

export default async function PremierPage() {
  const [temporadas, torneos, proximos] = await Promise.all([getTemporadas("premier"), getTorneos(), getProximos()]);
  const temporada = temporadas[0] ?? 2026;
  const ranking = await getRanking("premier", temporada);
  const ediciones = torneos.filter((t) => t.serie === "premier");
  const proxima = proximos.find((t) => t.serie === "premier");
  const tabla = (await getSerie("premier"))?.puntos ?? [];

  return (
    <>
      <section className="page-hero page-hero--premier">
        <div className="page-hero__inner">
          <div>
            <p className="player"><span className="player__p">P1</span></p>
            <h1 className="page-hero__title">Premier Smash League</h1>
            <p className="page-hero__lead">
              La liga de Super Smash Bros Ultimate de Team Anexo. Jugadores de varias provincias compiten en Mendoza, cada
              fecha suma puntos para el ranking de la temporada y, como sede de Smash Bros Argentina, también para el ranking nacional.
            </p>
            <div className="actions">
              {proxima ? (
                <Link className="btn btn--p2" href={`/torneos/${proxima.slug}`}>Próxima fecha: {proxima.nombre}</Link>
              ) : (
                <a className="btn btn--p2" href={LINKS.grupoWhatsapp} target="_blank" rel="noopener">
                  <Icon name="whatsapp" className="btn__icon" />
                  Avisame de la próxima fecha
                </a>
              )}
              <Link className="link-arrow" href={`/ranking/premier/${temporada}`}>Ranking completo<Icon name="arrow" className="link-arrow__icon" /></Link>
            </div>
          </div>
          <Image className="page-hero__logo" src="/assets/img/series/premier-logo.png" alt="" width={450} height={600} priority />
        </div>
      </section>

      <div className="page">
        <section className="panel-box panel-box--premier" aria-labelledby="ranking-title">
          <div className="section-head">
            <h2 id="ranking-title" className="section-title">Ranking {temporada}</h2>
            <Link className="link-arrow" href={`/ranking/premier/${temporada}`}>Ver todo<Icon name="arrow" className="link-arrow__icon" /></Link>
          </div>
          {ranking.length ? <RankingTable filas={ranking} limite={10} /> : <RankingVacio temporada={temporada} />}
        </section>

        <section aria-labelledby="ediciones-title">
          <h2 id="ediciones-title" className="section-title">Ediciones</h2>
          <Revelar className="tgrid">
            {ediciones.map((t) => <TorneoCard key={t.slug} torneo={t} />)}
          </Revelar>
        </section>

        <section className="split" aria-labelledby="puntos-title">
          <div>
            <h2 id="puntos-title" className="section-title">Cómo se suman los puntos</h2>
            <div className="prose">
              <p>
                Cada fecha de la Premier reparte puntos según el puesto final en el evento de <strong>Ultimate Singles</strong>,
                tomado directamente de los resultados de start.gg. Al final de la temporada, el ranking suma todas las fechas.
              </p>
              <p>A igualdad de puntos desempata el mejor puesto conseguido y después la cantidad de fechas jugadas.</p>
            </div>
            <table className="ranking puntos">
              <thead><tr><th scope="col">Puesto</th><th scope="col" className="ranking__num">Puntos</th></tr></thead>
              <tbody>
                {tabla.map((f, i) => {
                  const hasta = tabla[i + 1] ? tabla[i + 1].desde - 1 : null;
                  const etiqueta = hasta === null ? `${f.desde}° o peor` : hasta === f.desde ? `${f.desde}°` : `${f.desde}° a ${hasta}°`;
                  return <tr key={f.desde}><td>{etiqueta}</td><td className="ranking__num ranking__pts">{f.puntos}</td></tr>;
                })}
              </tbody>
            </table>
          </div>
          <figure>
            <h2 className="section-title">Reglamento</h2>
            <Image className="ruleset" src="/assets/img/series/ruleset-smash.jpg" alt="Reglamento de Super Smash Bros Ultimate: cómo se banean escenarios entre partidas y la lista de escenarios starter y counterpick" width={990} height={1400} sizes="(max-width: 960px) 100vw, 34rem" />
          </figure>
        </section>

        <section className="federation" aria-labelledby="sba-title">
          <Image className="federation__logo" src="/assets/logos/smash-bros-argentina.png" alt="Smash Bros Argentina" width={480} height={480} />
          <div>
            <h2 id="sba-title" className="federation__title">Sede mendocina de Smash Bros Argentina</h2>
            <p>
              Smash Bros Argentina es el circuito federal de Super Smash Bros Ultimate, con jugadores de Buenos Aires, Córdoba,
              Santa Fe, Jujuy, Tucumán, Salta y Mendoza compitiendo por el ranking nacional. Los resultados de la Premier suman a ese ranking.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
