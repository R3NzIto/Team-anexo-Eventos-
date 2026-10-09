import type { Metadata } from "next";
import { Revelar } from "@/components/Movimiento";
import { TorneoCard } from "@/components/TorneoCard";
import { Icon } from "@/components/Icon";
import { getPasados, getProximos } from "@/lib/data";
import { LINKS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Torneos",
  description: "Próximos torneos y el historial completo de eventos de Team Anexo en Mendoza.",
};

export default async function TorneosPage() {
  const [proximos, pasados] = await Promise.all([getProximos(), getPasados()]);
  return (
    <>
      <section className="page-hero page-hero--carbon">
        <div>
          <p className="player"><span className="player__p">P1</span></p>
          <h1 className="page-hero__title">Torneos</h1>
          <p className="page-hero__lead">Las fechas que vienen y todo lo que ya jugamos. Las inscripciones se hacen en start.gg.</p>
        </div>
      </section>
      <div className="page">
        <section aria-labelledby="proximos-title">
          <h2 id="proximos-title" className="section-title">Próximos</h2>
          {proximos.length ? (
            <Revelar className="tgrid">{proximos.map((t) => <TorneoCard key={t.slug} torneo={t} />)}</Revelar>
          ) : (
            <div className="empty">
              <p className="empty__title">No hay fechas anunciadas todavía</p>
              <p>Las anunciamos primero en el grupo de la comunidad.</p>
              <p><a className="link-arrow" href={LINKS.grupoWhatsapp} target="_blank" rel="noopener">Unirme al grupo<Icon name="arrow" className="link-arrow__icon" /></a></p>
            </div>
          )}
        </section>
        <section aria-labelledby="pasados-title">
          <h2 id="pasados-title" className="section-title">Historial</h2>
          <Revelar className="tgrid">{pasados.map((t) => <TorneoCard key={t.slug} torneo={t} />)}</Revelar>
        </section>
      </div>
    </>
  );
}
