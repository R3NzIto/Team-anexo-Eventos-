import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { RankingTable, RankingVacio } from "@/components/Ranking";
import { getRanking, getSeries, getTemporadas } from "@/lib/data";
import type { SerieId } from "@/lib/types";

type Props = { params: Promise<{ serie: string; temporada: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { serie, temporada } = await params;
  const s = (await getSeries()).find((x) => x.id === serie);
  return s ? { title: `Ranking ${s.corto} ${temporada}`, description: `Ranking de la temporada ${temporada} de ${s.nombre}.` } : {};
}

export default function RankingPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="page" aria-busy="true" />}>
      {params.then((p) => <Ranking serie={p.serie} temporada={Number(p.temporada)} />)}
    </Suspense>
  );
}

async function Ranking({ serie, temporada }: { serie: string; temporada: number }) {
  const series = (await getSeries()).filter((s) => s.rankeable);
  const actual = series.find((s) => s.id === serie);
  if (!actual || !Number.isInteger(temporada)) notFound();

  const [temporadas, filas] = await Promise.all([getTemporadas(actual.id as SerieId), getRanking(actual.id as SerieId, temporada)]);
  const premier = actual.id === "premier";

  return (
    <>
      <section className={`page-hero ${premier ? "page-hero--premier" : "page-hero--carbon"}`}>
        <div>
          <h1 className="page-hero__title">Ranking {actual.corto}</h1>
          <p className="page-hero__lead">Temporada {temporada} · {actual.juego}</p>
        </div>
      </section>
      <div className="page">
        <nav aria-label="Series y temporadas" style={{ display: "grid", gap: ".6rem" }}>
          <div className={`tabs${premier ? " tabs--premier" : ""}`}>
            {series.map((s) => (
              <Link key={s.id} href={`/ranking/${s.id}/${temporada}`} aria-current={s.id === actual.id ? "page" : undefined}>{s.corto}</Link>
            ))}
          </div>
          <div className={`tabs${premier ? " tabs--premier" : ""}`}>
            {(temporadas.length ? temporadas : [temporada]).map((t) => (
              <Link key={t} href={`/ranking/${actual.id}/${t}`} aria-current={t === temporada ? "page" : undefined}>{t}</Link>
            ))}
          </div>
        </nav>
        <section className={`panel-box${premier ? " panel-box--premier" : ""}`} aria-label={`Ranking ${actual.corto} ${temporada}`}>
          {filas.length ? <RankingTable filas={filas} mostrarPersonaje={premier} /> : <RankingVacio temporada={temporada} />}
        </section>
      </div>
    </>
  );
}
