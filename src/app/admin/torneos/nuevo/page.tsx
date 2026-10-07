import { getSeries } from "@/lib/data";
import { FormTorneo } from "../FormTorneo";

/** Nuevo torneo a mano: para anunciar una fecha antes de que exista en start.gg. */
export default async function NuevoTorneoPage() {
  const series = (await getSeries()).filter((s) => s.activa);
  return (
    <section aria-labelledby="nuevo-title">
      <h2 id="nuevo-title" className="section-title">Nuevo torneo</h2>
      <p className="admin-nota admin-intro">
        Para anunciar una fecha antes de abrir la inscripción. Cuando el torneo exista en start.gg, editalo y pegá el link; con
        &quot;Actualizar&quot; se traen los eventos y, al terminar, los resultados.
      </p>
      <FormTorneo series={series} />
    </section>
  );
}
