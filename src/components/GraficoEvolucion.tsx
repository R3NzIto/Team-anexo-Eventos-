"use client";

import { useState } from "react";
import { fechaCorta } from "@/lib/format";
import type { PuntoEvolucion } from "@/lib/data";

/*
  Posición en el ranking después de cada fecha. El 1° va arriba (el eje está invertido,
  como se lee un ranking). Una sola serie: el título la nombra, no hace falta leyenda.
  Cada punto se puede tocar, pasar con el mouse o recorrer con el teclado.
*/

const ANCHO = 640;
const ALTO = 240;
const M = { arriba: 22, derecha: 40, abajo: 36, izquierda: 40 };

export function GraficoEvolucion({ puntos, titulo }: { puntos: PuntoEvolucion[]; titulo: string }) {
  const [activo, setActivo] = useState<number | null>(null);
  const jugadas = puntos.filter((p) => p.posicion !== null);
  const peor = Math.max(5, ...jugadas.map((p) => p.posicion!));
  const x = (i: number) => M.izquierda + (puntos.length === 1 ? 0 : (i * (ANCHO - M.izquierda - M.derecha)) / (puntos.length - 1));
  const y = (pos: number) => M.arriba + ((pos - 1) * (ALTO - M.arriba - M.abajo)) / (peor - 1);

  // La línea se corta donde el jugador todavía no tenía puntos.
  const tramos: string[] = [];
  let tramo = "";
  puntos.forEach((p, i) => {
    if (p.posicion === null) { if (tramo) tramos.push(tramo); tramo = ""; return; }
    tramo += `${tramo ? "L" : "M"}${x(i).toFixed(1)},${y(p.posicion).toFixed(1)}`;
  });
  if (tramo) tramos.push(tramo);

  const marcas = [1, Math.ceil(peor / 2), peor].filter((v, i, a) => a.indexOf(v) === i);
  const ultimo = [...puntos.keys()].reverse().find((i) => puntos[i].posicion !== null);
  const sel = activo !== null ? puntos[activo] : null;

  return (
    <figure className="evolucion">
      <figcaption className="evolucion__titulo">{titulo}</figcaption>
      <div className="evolucion__lienzo">
        <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} role="img" aria-label={`${titulo}. Detalle en la tabla de abajo.`} onMouseLeave={() => setActivo(null)}>
          {marcas.map((m) => (
            <g key={m} className="evolucion__guia">
              <line x1={M.izquierda} x2={ANCHO - M.derecha} y1={y(m)} y2={y(m)} />
              <text x={M.izquierda - 10} y={y(m)} textAnchor="end" dominantBaseline="middle">{m}°</text>
            </g>
          ))}
          {puntos.map((p, i) => (
            <text key={p.slug} className="evolucion__eje" x={x(i)} y={ALTO - 10} textAnchor="middle">{fechaCorta(p.fecha).replace(/ \d{4}$/, "")}</text>
          ))}
          {activo !== null && <line className="evolucion__cruz" x1={x(activo)} x2={x(activo)} y1={M.arriba - 8} y2={ALTO - M.abajo + 4} />}
          {tramos.map((d) => <path key={d} className="evolucion__linea" d={d} />)}
          {puntos.map((p, i) => p.posicion !== null && (
            <g key={p.slug}>
              <circle className={`evolucion__punto${activo === i ? " is-activo" : ""}`} cx={x(i)} cy={y(p.posicion)} r={activo === i ? 7 : 5.5} />
              {i === ultimo && (
                <text className="evolucion__etiqueta" x={x(i) + 12} y={y(p.posicion)} dominantBaseline="middle">{p.posicion}°</text>
              )}
              {/* Zona de toque más grande que el punto */}
              <rect className="evolucion__zona" x={x(i) - 22} y={M.arriba - 12} width={44} height={ALTO - M.arriba - M.abajo + 24}
                tabIndex={0} aria-label={`${p.torneo}: ${p.posicion}° con ${p.puntos} puntos`}
                onMouseEnter={() => setActivo(i)} onFocus={() => setActivo(i)} onBlur={() => setActivo(null)} onClick={() => setActivo(i)} />
            </g>
          ))}
        </svg>
        {sel && sel.posicion !== null && (
          <div className="evolucion__tip" style={{ left: `${(x(activo!) / ANCHO) * 100}%`, top: `${(y(sel.posicion) / ALTO) * 100}%` }} role="status">
            <strong>{sel.posicion}°</strong> · {sel.puntos} pts
            <small>{sel.torneo}</small>
          </div>
        )}
      </div>
      <table className="sr-only">
        <caption>{titulo}</caption>
        <thead><tr><th scope="col">Fecha</th><th scope="col">Torneo</th><th scope="col">Posición</th><th scope="col">Puntos</th></tr></thead>
        <tbody>
          {puntos.map((p) => (
            <tr key={p.slug}><td>{fechaCorta(p.fecha)}</td><td>{p.torneo}</td><td>{p.posicion ? `${p.posicion}°` : "—"}</td><td>{p.puntos}</td></tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
