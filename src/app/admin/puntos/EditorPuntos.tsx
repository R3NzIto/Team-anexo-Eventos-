"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { StockIcon } from "@/components/Ranking";
import type { SerieId, TablaPuntos } from "@/lib/types";
import { guardarTablaPuntos, previsualizarRanking, type FilaPrevia } from "../acciones";

type Fila = { desde: string; puntos: string };

/** "1°", "5° a 6°", "49° en adelante": a qué puestos aplica cada fila. */
function rango(filas: Fila[], i: number) {
  const desde = Number(filas[i].desde);
  const siguiente = Number(filas[i + 1]?.desde);
  if (!filas[i + 1]) return `${desde}° en adelante`;
  return siguiente - 1 > desde ? `${desde}° a ${siguiente - 1}°` : `${desde}°`;
}

export function EditorPuntos({ serie, inicial }: { serie: SerieId; inicial: TablaPuntos }) {
  const router = useRouter();
  const [filas, setFilas] = useState<Fila[]>(() => inicial.map((f) => ({ desde: String(f.desde), puntos: String(f.puntos) })));
  const [previa, setPrevia] = useState<{ temporada: number; filas: FilaPrevia[] } | null>(null);
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);
  const [calculando, startCalculo] = useTransition();
  const [guardando, startGuardar] = useTransition();

  const tabla: TablaPuntos = filas.map((f) => ({ desde: Number(f.desde), puntos: Number(f.puntos) }));
  const clave = JSON.stringify(tabla);
  const cambio = clave !== JSON.stringify(inicial.map(({ desde, puntos }) => ({ desde, puntos })));

  // Recalcula la vista previa medio segundo después del último cambio.
  useEffect(() => {
    const t = setTimeout(() => {
      startCalculo(async () => {
        const r = await previsualizarRanking(serie, JSON.parse(clave));
        if (r.ok) { setPrevia(r); setMensaje((m) => (m && !m.ok ? null : m)); }
        else setMensaje({ ok: false, texto: r.mensaje });
      });
    }, 500);
    return () => clearTimeout(t);
  }, [clave, serie]);

  const editar = (i: number, campo: keyof Fila, valor: string) =>
    setFilas((fs) => fs.map((f, j) => (j === i ? { ...f, [campo]: valor } : f)));

  function agregar() {
    setFilas((fs) => {
      const ultima = fs[fs.length - 1];
      return [...fs, { desde: String(Number(ultima?.desde ?? 0) * 2 || 1), puntos: String(Math.max(0, Math.floor(Number(ultima?.puntos ?? 0) / 2))) }];
    });
  }

  function guardar() {
    startGuardar(async () => {
      const r = await guardarTablaPuntos(serie, tabla);
      setMensaje(r.ok ? { ok: true, texto: "Tabla guardada. El ranking del sitio ya usa estos puntos." } : { ok: false, texto: r.mensaje });
      if (r.ok) router.refresh();
    });
  }

  return (
    <div className="admin-puntos">
      <div>
        <table className="history__table admin-puntos__tabla">
          <thead>
            <tr>
              <th scope="col">Desde el puesto</th>
              <th scope="col">Puntos</th>
              <th scope="col">Aplica a</th>
              <th scope="col"><span className="sr-only">Quitar</span></th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f, i) => (
              <tr key={i}>
                <td>
                  <input className="admin-num" type="number" min={1} inputMode="numeric" aria-label={`Puesto de la fila ${i + 1}`}
                    value={f.desde} readOnly={i === 0} onChange={(e) => editar(i, "desde", e.target.value)} />
                </td>
                <td>
                  <input className="admin-num" type="number" min={0} inputMode="numeric" aria-label={`Puntos de la fila ${i + 1}`}
                    value={f.puntos} onChange={(e) => editar(i, "puntos", e.target.value)} />
                </td>
                <td className="admin-nota">{rango(filas, i)}</td>
                <td>
                  {i > 0 && (
                    <button type="button" className="admin-boton admin-boton--peligro" aria-label={`Quitar fila ${i + 1}`}
                      onClick={() => setFilas((fs) => fs.filter((_, j) => j !== i))}>×</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="admin-nota">Los puestos que comparten posición en start.gg (5°, 7°, 9°…) reciben los mismos puntos.</p>
        <div className="actions">
          <button type="button" className="admin-boton" onClick={agregar}>+ Agregar fila</button>
          <button type="button" className="btn btn--p2" onClick={guardar} disabled={!cambio || guardando}>
            {guardando ? "Guardando…" : "Guardar tabla"}
          </button>
        </div>
        {mensaje && <p className={mensaje.ok ? "admin-ok" : "aviso"} role={mensaje.ok ? "status" : "alert"}>{mensaje.texto}</p>}
      </div>

      <div className="admin-puntos__previa" aria-busy={calculando}>
        <h3 className="admin-previa__titulo">{previa ? `Ranking ${previa.temporada} con esta tabla` : "Vista previa"}</h3>
        {previa && previa.filas.length === 0 && (
          <p className="admin-nota">Los torneos de {previa.temporada} todavía no tienen resultados cargados.</p>
        )}
        {previa && previa.filas.length > 0 && (
          <table className="ranking">
            <thead>
              <tr>
                <th scope="col" className="ranking__pos">#</th>
                <th scope="col">Jugador</th>
                <th scope="col" className="ranking__num">Puntos</th>
              </tr>
            </thead>
            <tbody>
              {previa.filas.map((f) => (
                <tr key={f.gamerTag + f.posicion}>
                  <td className="ranking__pos">{f.posicion}</td>
                  <td>
                    <span className="ranking__player"><StockIcon personaje={f.personaje} />{f.gamerTag}</span>
                    <Movimiento antes={f.antes} ahora={f.posicion} />
                  </td>
                  <td className="ranking__num ranking__pts">{f.puntos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Movimiento({ antes, ahora }: { antes?: number; ahora: number }) {
  if (!antes || antes === ahora) return null;
  const sube = antes > ahora;
  return (
    <span className={`admin-mov ${sube ? "admin-mov--sube" : "admin-mov--baja"}`}>
      {sube ? "▲" : "▼"} {Math.abs(antes - ahora)}<span className="sr-only"> {sube ? "puestos arriba" : "puestos abajo"} respecto de hoy</span>
    </span>
  );
}
