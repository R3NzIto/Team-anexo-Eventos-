import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { StockIcon } from "@/components/Ranking";
import { SerieChip } from "@/components/Torneo";
import { getJugador, getRanking } from "@/lib/data";
import { fechaCorta } from "@/lib/format";
import { Contador } from "@/components/Movimiento";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getJugador(slug);
  return data ? { title: data.jugador.gamerTag, description: `Resultados y ranking de ${data.jugador.gamerTag} en los torneos de Team Anexo.` } : {};
}

export default function JugadorPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="page" aria-busy="true" />}>
      {params.then(({ slug }) => <Jugador slug={slug} />)}
    </Suspense>
  );
}

async function Jugador({ slug }: { slug: string }) {
  const data = await getJugador(slug);
  if (!data) notFound();
  const { jugador, historial } = data;

  const temporada = historial.find((h) => h.torneo.serie === "premier")?.torneo.temporada;
  const ranking = temporada ? await getRanking("premier", temporada) : [];
  const fila = ranking.find((f) => f.jugador.id === jugador.id);
  const mejor = historial.length ? Math.min(...historial.map((h) => h.puesto)) : null;

  return (
    <>
      <section className="page-hero page-hero--p1">
        <div className="profile">
          <StockIcon personaje={jugador.personaje} size={96} />
          <div>
            <h1 className="page-hero__title">
              {jugador.prefijo && <small style={{ fontSize: ".45em", opacity: .7 }}>{jugador.prefijo} | </small>}
              {jugador.gamerTag}
            </h1>
            <div className="profile__stats">
              {fila && <div><strong><Contador valor={fila.posicion} retraso={350} duracion={500} />°</strong><span>Premier {temporada}</span></div>}
              {fila && <div><strong><Contador valor={fila.puntos} retraso={420} /></strong><span>Puntos</span></div>}
              <div><strong><Contador valor={historial.length} retraso={490} duracion={500} /></strong><span>Torneos</span></div>
              {mejor && <div><strong><Contador valor={mejor} retraso={560} duracion={500} />°</strong><span>Mejor puesto</span></div>}
            </div>
          </div>
        </div>
      </section>

      <div className="page">
        <section aria-labelledby="historial-title">
          <h2 id="historial-title" className="section-title">Historial</h2>
          <table className="history__table">
            <thead><tr><th scope="col">Fecha</th><th scope="col">Torneo</th><th scope="col">Puesto</th></tr></thead>
            <tbody>
              {historial.map((h) => (
                <tr key={`${h.torneo.slug}-${h.evento}`}>
                  <td className="history__date">{fechaCorta(h.torneo.fecha)}</td>
                  <td className="history__event">
                    <SerieChip serie={h.torneo.serie} />
                    <Link href={`/torneos/${h.torneo.slug}`}>{h.torneo.nombre}</Link>
                    <small>{h.evento}</small>
                  </td>
                  <td className={`history__puesto${h.puesto === 1 ? " history__puesto--1" : ""}`}>{h.puesto}°</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        {jugador.slugStartgg && (
          <p><a className="link-arrow" href={`https://www.start.gg/${jugador.slugStartgg}`} target="_blank" rel="noopener">Perfil en start.gg</a></p>
        )}
      </div>
    </>
  );
}
