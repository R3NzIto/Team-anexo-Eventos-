import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getJugadores } from "@/lib/data";
import { getUsuarioActual } from "@/lib/sesion";

export const metadata: Metadata = { title: "Mi cuenta", robots: { index: false } };

export default function CuentaPage() {
  return (
    <Suspense fallback={<section className="page-hero page-hero--carbon" aria-busy="true"><div /></section>}>
      <Cuenta />
    </Suspense>
  );
}

async function Cuenta() {
  const usuario = await getUsuarioActual();
  if (!usuario) redirect("/ingresar?volver=/cuenta");
  const perfil = usuario.jugador ? (await getJugadores()).find((j) => j.id === usuario.jugador) : undefined;

  return (
    <section className="page-hero page-hero--carbon">
      <div>
        <p className="player"><span className="player__p">{usuario.rol === "admin" ? "Admin" : "P1"}</span></p>
        <h1 className="page-hero__title">Hola, {usuario.nombre}</h1>
        <p className="page-hero__lead">
          {perfil
            ? "Tu cuenta de start.gg está vinculada a tu perfil de jugador, con tus resultados y tu lugar en el ranking."
            : "Todavía no jugaste un torneo de Team Anexo con esta cuenta. Cuando juegues uno, tu perfil aparece solo."}
        </p>
        <div className="actions">
          {perfil && <Link className="btn btn--p2" href={`/jugadores/${perfil.slug}`}>Ver mi perfil</Link>}
          <Link className="btn btn--ghost-light" href="/torneos">Próximos torneos</Link>
          <form action="/api/auth/salir" method="post">
            <button className="link-arrow" type="submit">Cerrar sesión</button>
          </form>
        </div>
      </div>
    </section>
  );
}
