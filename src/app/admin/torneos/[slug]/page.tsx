import Link from "next/link";
import { notFound } from "next/navigation";
import { getSeries, getTorneo } from "@/lib/data";
import { FormTorneo } from "../FormTorneo";

// "Volver a los datos de start.gg" vuelve a importar el torneo.
export const maxDuration = 300;

export default async function EditarTorneoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [torneo, series] = await Promise.all([getTorneo(slug), getSeries()]);
  if (!torneo) notFound();
  return (
    <section aria-labelledby="editar-title">
      <h2 id="editar-title" className="section-title">Editar torneo</h2>
      <p className="admin-nota admin-intro">
        <Link href={`/torneos/${torneo.slug}`}>Ver la página del torneo</Link>
      </p>
      <FormTorneo series={series.filter((s) => s.activa || s.id === torneo.serie)} torneo={torneo} />
    </section>
  );
}
