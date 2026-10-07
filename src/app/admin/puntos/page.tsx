import { getSeries } from "@/lib/data";
import { EditorPuntos } from "./EditorPuntos";

/** Pestaña Puntos: la tabla de cada serie que tiene ranking. El permiso lo verifica el layout. */
export default async function AdminPuntosPage() {
  const series = (await getSeries()).filter((s) => s.rankeable);
  return (
    <>
      {series.map((s) => (
        <section key={s.id} aria-labelledby={`puntos-${s.id}`}>
          <h2 id={`puntos-${s.id}`} className="section-title">{s.nombre}</h2>
          <EditorPuntos serie={s.id} inicial={s.puntos ?? [{ desde: 1, puntos: 0 }]} />
        </section>
      ))}
    </>
  );
}
