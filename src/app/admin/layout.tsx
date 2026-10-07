import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getUsuarioActual } from "@/lib/sesion";
import { TabsAdmin } from "./TabsAdmin";

export const metadata: Metadata = { title: "Panel de admin", robots: { index: false } };

/*
  Todo /admin pasa por acá: si no sos admin, las páginas de adentro ni se renderizan.
  Igual cada acción vuelve a verificar el permiso en el servidor.
*/
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<section className="page-hero page-hero--carbon" aria-busy="true"><div /></section>}>
      <SoloAdmin>{children}</SoloAdmin>
    </Suspense>
  );
}

async function SoloAdmin({ children }: { children: React.ReactNode }) {
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
  return (
    <>
      <section className="page-hero page-hero--carbon">
        <div>
          <p className="player"><span className="player__p">P2</span></p>
          <h1 className="page-hero__title">Panel</h1>
          <p className="page-hero__lead">Lo que guardes acá aparece en el sitio al instante.</p>
          <TabsAdmin />
        </div>
      </section>
      <div className="page">{children}</div>
    </>
  );
}
