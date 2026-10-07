import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Ingresar",
  description: "Entrá con tu cuenta de start.gg para ver tus resultados y anotarte a los torneos de Team Anexo.",
  robots: { index: false },
};

const ERRORES: Record<string, string> = {
  cancelado: "Cancelaste el ingreso en start.gg. Podés intentarlo de nuevo cuando quieras.",
  vencido: "El ingreso tardó demasiado o se abrió en otra pestaña. Probá de nuevo.",
  startgg: "start.gg no respondió bien. Esperá un momento y probá de nuevo.",
};

type Props = { searchParams: Promise<{ error?: string; volver?: string }> };

export default function IngresarPage({ searchParams }: Props) {
  return (
    <section className="page-hero page-hero--carbon">
      <div>
        <p className="player"><span className="player__p">P1</span></p>
        <h1 className="page-hero__title">Ingresar</h1>
        <p className="page-hero__lead">
          Entrá con tu cuenta de start.gg, la misma con la que te anotás a los torneos. Así el sitio te reconoce, te muestra
          tus resultados y te lleva directo a la inscripción.
        </p>
        <Suspense fallback={<Acciones />}>
          {searchParams.then(({ error, volver }) => <Acciones error={error} volver={volver} />)}
        </Suspense>
      </div>
    </section>
  );
}

function Acciones({ error, volver }: { error?: string; volver?: string }) {
  const href = `/api/auth/startgg${volver ? `?volver=${encodeURIComponent(volver)}` : ""}`;
  return (
    <>
      {error && <p className="aviso" role="alert">{ERRORES[error] ?? ERRORES.startgg}</p>}
      <div className="actions">
        {/* Es un <a> y no un <Link>: lleva a start.gg y no se tiene que precargar. */}
        <a className="btn btn--p2" href={href}>Entrar con start.gg</a>
      </div>
      <p className="ingresar__nota">
        ¿No tenés cuenta? Creala gratis en <a href="https://www.start.gg/" target="_blank" rel="noopener">start.gg</a>. Solo
        pedimos tu nombre de jugador y tu mail; no publicamos nada en tu nombre.
      </p>
    </>
  );
}
