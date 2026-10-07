import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getSeries, getTorneos } from "@/lib/data";
import { getUsuarioActual } from "@/lib/sesion";
import { CargarTorneo } from "./CargarTorneo";
import { TorneosAdmin } from "./TorneosAdmin";

export const metadata: Metadata = { title: "Panel de admin", robots: { index: false } };

// Traer un torneo de start.gg con personajes puede tardar; las acciones de esta página tienen hasta 5 min.
export const maxDuration = 300;

export default function AdminPage() {
  return (
    <Suspense fallback={<section className="page-hero page-hero--carbon" aria-busy="true"><div /></section>}>
      <Panel />
    </Suspense>
  );
}

async function Panel() {
  const usuario = await getUsuarioActual();
  if (!usuario) redirect("/ingresar?volver=/admin");
  if (usuario.rol !== "admin") {
    return (
      <section className="page-hero page-hero--carbon">
        <div>
          <h1 className="page-hero__title">Solo admins</h1>
          <p className="page-hero__lead">Tu cuenta no tiene permiso para el panel. Si sos del equipo, pedile a un admin que te habilite.</p>
          <div className="actions"><Link className="btn btn--p2" href="/">Volver al inicio</Link></div>
        </div>
      </section>
    );
  }

  const [series, torneos] = await Promise.all([getSeries(), getTorneos()]);

  return (
    <>
      <section className="page-hero page-hero--carbon">
        <div>
          <p className="player"><span className="player__p">P2</span></p>
          <h1 className="page-hero__title">Panel</h1>
          <p className="page-hero__lead">Cargá torneos desde start.gg y mantené el ranking al día. Lo que guardes aparece en el sitio al instante.</p>
        </div>
      </section>
      <div className="page">
        <section aria-labelledby="cargar-title">
          <h2 id="cargar-title" className="section-title">Cargar torneo</h2>
          <CargarTorneo series={series.filter((s) => s.activa)} />
        </section>
        <section aria-labelledby="cargados-title">
          <h2 id="cargados-title" className="section-title">Torneos cargados</h2>
          <TorneosAdmin
            torneos={torneos.map((t) => ({
              slug: t.slug,
              nombre: t.nombre,
              fecha: t.fecha,
              serie: series.find((s) => s.id === t.serie)?.corto ?? t.serie,
              vinculado: Boolean(t.slugStartgg),
              jugadores: Math.max(0, ...t.events.map((e) => e.standings.length)),
            }))}
          />
        </section>
      </div>
    </>
  );
}
