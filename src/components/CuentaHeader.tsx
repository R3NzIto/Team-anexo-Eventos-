import Image from "next/image";
import Link from "next/link";
import { getUsuarioActual } from "@/lib/sesion";

/** Botón de cuenta en la barra: "Ingresar" o el nombre del usuario. Va dentro de un <Suspense>. */
export async function CuentaHeader() {
  const usuario = await getUsuarioActual();
  if (!usuario) return <IngresarLink />;
  return (
    <Link className="topbar__cuenta" href="/cuenta" title="Mi cuenta">
      {usuario.imagen ? <Image src={usuario.imagen} alt="" width={28} height={28} /> : <span aria-hidden="true">{usuario.nombre.slice(0, 1)}</span>}
      <span className="topbar__cuenta-nombre">{usuario.nombre}</span>
    </Link>
  );
}

export function IngresarLink() {
  return <Link className="topbar__link" href="/ingresar">Ingresar</Link>;
}
