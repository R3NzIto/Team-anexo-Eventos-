import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Página no encontrada", robots: { index: false } };

export default function NotFound() {
  return (
    <section className="page-hero page-hero--carbon">
      <div>
        <p className="player"><span className="player__p">404</span></p>
        <h1 className="page-hero__title">Game over</h1>
        <p className="page-hero__lead">No encontramos esta página. Puede que el torneo o el jugador todavía no esté cargado.</p>
        <div className="actions">
          <Link className="btn btn--p1" href="/">Volver al inicio</Link>
          <Link className="link-arrow" href="/torneos">Ver torneos</Link>
        </div>
      </div>
    </section>
  );
}
