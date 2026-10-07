import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Countdown } from "@/components/Countdown";
import { StockIcon } from "@/components/Ranking";
import { SerieChip } from "@/components/Torneo";
import { getJugadores, getProximos, getTorneo } from "@/lib/data";
import { fechaLarga, urlStartgg } from "@/lib/format";
import { getSerieConfig } from "@/data/series";
import { puntosPorPuesto } from "@/lib/ranking";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const torneo = await getTorneo(slug);
  return torneo ? { title: torneo.nombre, description: `${torneo.nombre}: fecha, sede, inscripción y resultados.` } : {};
}

export default function TorneoPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="page" aria-busy="true" />}>
      {params.then(({ slug }) => <Torneo slug={slug} />)}
    </Suspense>
  );
}

async function Torneo({ slug }: { slug: string }) {
  const [torneo, proximos, jugadores] = await Promise.all([getTorneo(slug), getProximos(), getJugadores()]);
  if (!torneo) notFound();
  const esProximo = proximos.some((t) => t.slug === torneo.slug);
  const serie = getSerieConfig(torneo.serie);
  const porId = new Map(jugadores.map((j) => [j.id, j]));
  const hero = torneo.serie === "premier" ? "page-hero--premier" : "page-hero--carbon";

  return (
    <>
      <section className={`page-hero ${hero}`}>
        <div>
          <p><SerieChip serie={torneo.serie} /></p>
          <h1 className="page-hero__title" style={{ marginTop: "1rem" }}>{torneo.nombre}</h1>
          <p className="page-hero__lead">{[fechaLarga(torneo.fecha), torneo.sede].filter(Boolean).join(" · ")}</p>
          {esProximo && torneo.fecha.length > 10 && <div style={{ marginTop: "1.4rem" }}><Countdown fecha={torneo.fecha} /></div>}
        </div>
      </section>

      <div className="page">
        <section className="tdetail">
          {torneo.afiche ? (
            <Image className="tdetail__poster" src={torneo.afiche} alt={`Afiche de ${torneo.nombre}`} width={675} height={1200} sizes="20rem" />
          ) : <div />}
          <div>
            <dl className="facts">
              <div><dt>Fecha: </dt><dd>{fechaLarga(torneo.fecha)}</dd></div>
              {torneo.sede && <div><dt>Sede: </dt><dd>{[torneo.sede, torneo.direccion].filter(Boolean).join(", ")}</dd></div>}
              {torneo.valor && <div><dt>Inscripción: </dt><dd>{torneo.valor}</dd></div>}
              {serie && <div><dt>Serie: </dt><dd>{serie.nombre}</dd></div>}
            </dl>
            {torneo.slugStartgg && (
              <div className="actions" style={{ marginTop: "1.5rem" }}>
                {esProximo && (
                  <a className="btn btn--p1" href={`${urlStartgg(torneo.slugStartgg)}/register`} target="_blank" rel="noopener">Inscribirme en start.gg</a>
                )}
                <a className="btn btn--ghost" href={urlStartgg(torneo.slugStartgg)} target="_blank" rel="noopener">Ver en start.gg</a>
              </div>
            )}
          </div>
        </section>

        {esProximo && torneo.slugStartgg && (
          <section aria-labelledby="inscripcion-title">
            <h2 id="inscripcion-title" className="section-title">Inscripción</h2>
            <p className="prose" style={{ marginBottom: "1rem" }}>Te inscribís con tu cuenta de start.gg sin salir de esta página.</p>
            <iframe className="embed" title={`Inscripción a ${torneo.nombre}`} src={`https://start.gg/tournament/${torneo.slugStartgg}/register/embed`} loading="lazy" />
          </section>
        )}

        {torneo.events.some((e) => e.standings.length) && (
          <section aria-labelledby="resultados-title">
            <h2 id="resultados-title" className="section-title">Resultados</h2>
            {torneo.events.filter((e) => e.standings.length).map((e) => (
              <div key={e.nombre} className="event-block">
                <div className="event-block__head">
                  <h3 className="event-block__title">{e.nombre}</h3>
                  {e.sumaRanking && serie?.puntos && <span className="badge">Suma al ranking</span>}
                </div>
                <table className="ranking">
                  <thead>
                    <tr>
                      <th scope="col" className="ranking__pos">Puesto</th>
                      <th scope="col">Jugador</th>
                      {e.sumaRanking && serie?.puntos && <th scope="col" className="ranking__num">Puntos</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {e.standings.map((s) => {
                      const j = porId.get(s.jugador);
                      return (
                        <tr key={s.jugador} className={s.puesto === 1 ? "ranking__top ranking__top--1" : undefined}>
                          <td className="ranking__pos">{s.puesto}°</td>
                          <td>
                            {j ? (
                              <Link className="ranking__player" href={`/jugadores/${j.slug}`}>
                                {torneo.serie === "premier" && <StockIcon personaje={s.personaje ?? j.personaje} />}
                                <span>{s.gamerTag}</span>
                              </Link>
                            ) : (
                              <span className="ranking__player">{s.gamerTag}</span>
                            )}
                          </td>
                          {e.sumaRanking && serie?.puntos && <td className="ranking__num ranking__pts">{puntosPorPuesto(s.puesto, serie.puntos)}</td>}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
          </section>
        )}
      </div>
    </>
  );
}
