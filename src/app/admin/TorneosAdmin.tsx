"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { fechaCorta } from "@/lib/format";
import { actualizarDesdeStartgg, borrarTorneo } from "./acciones";

type Fila = { slug: string; nombre: string; fecha: string; serie: string; vinculado: boolean; jugadores: number };

export function TorneosAdmin({ torneos }: { torneos: Fila[] }) {
  return (
    <>
    <div className="actions admin-lista-acciones">
      <Link className="btn btn--p2" href="/admin/torneos/nuevo">Nuevo torneo a mano</Link>
      <span className="admin-nota">Para anunciar una fecha antes de que exista en start.gg.</span>
    </div>
    <table className="history__table admin-torneos">
      <thead>
        <tr>
          <th scope="col">Fecha</th>
          <th scope="col">Torneo</th>
          <th scope="col">Serie</th>
          <th scope="col"><span className="sr-only">Acciones</span></th>
        </tr>
      </thead>
      <tbody>
        {torneos.map((t) => <FilaTorneo key={t.slug} torneo={t} />)}
      </tbody>
    </table>
    </>
  );
}

function FilaTorneo({ torneo }: { torneo: Fila }) {
  const router = useRouter();
  const [ocupado, startTransition] = useTransition();
  const [mensaje, setMensaje] = useState<string | null>(null);

  function correr(accion: () => ReturnType<typeof borrarTorneo>, exito: string) {
    setMensaje(null);
    startTransition(async () => {
      const r = await accion();
      setMensaje(r.ok ? exito : r.mensaje);
      if (r.ok) router.refresh();
    });
  }

  return (
    <tr aria-busy={ocupado}>
      <td>{fechaCorta(torneo.fecha)}</td>
      <td>
        <Link href={`/torneos/${torneo.slug}`}>{torneo.nombre}</Link>
        {torneo.jugadores > 0 && <span className="admin-nota"> · {torneo.jugadores} jugadores</span>}
        {mensaje && <span className="admin-nota" role="status"> · {mensaje}</span>}
      </td>
      <td>{torneo.serie}</td>
      <td className="admin-torneos__acciones">
        <Link className="admin-boton" href={`/admin/torneos/${torneo.slug}`}>Editar</Link>
        {torneo.vinculado && (
          <button type="button" className="admin-boton" disabled={ocupado}
            onClick={() => correr(() => actualizarDesdeStartgg(torneo.slug), "actualizado")}>
            {ocupado ? "…" : "Actualizar"}
          </button>
        )}
        <button type="button" className="admin-boton admin-boton--peligro" disabled={ocupado}
          onClick={() => {
            if (confirm(`¿Borrar "${torneo.nombre}"? Se borran sus resultados y deja de sumar al ranking.`)) {
              correr(() => borrarTorneo(torneo.slug), "borrado");
            }
          }}>
          Borrar
        </button>
      </td>
    </tr>
  );
}
