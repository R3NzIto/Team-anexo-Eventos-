import { getSeries, getTorneos } from "@/lib/data";
import { CargarTorneo } from "./CargarTorneo";
import { TorneosAdmin } from "./TorneosAdmin";

// Traer un torneo de start.gg con personajes puede tardar; las acciones de esta página tienen hasta 5 min.
export const maxDuration = 300;

/** Pestaña Torneos. El permiso de admin lo verifica el layout. */
export default async function AdminTorneosPage() {
  const [series, torneos] = await Promise.all([getSeries(), getTorneos()]);
  return (
    <>
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
    </>
  );
}
