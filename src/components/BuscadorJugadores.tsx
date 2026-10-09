"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { StockIcon } from "./Ranking";

export type FichaJugador = {
  slug: string;
  gamerTag: string;
  prefijo?: string;
  personaje?: string;
  torneos: number;
  posicion?: number;
  puntos?: number;
};

/** "Lukitas_011" y "lukitas 011" encuentran lo mismo; también ignora tildes. */
const normalizar = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

/** Lista de jugadores: primero los que están en el ranking (por puesto), después el resto por nombre. */
export function BuscadorJugadores({ jugadores, temporada }: { jugadores: FichaJugador[]; temporada: number }) {
  const [busqueda, setBusqueda] = useState("");
  const texto = normalizar(useDeferredValue(busqueda));
  const visibles = texto
    ? jugadores.filter((j) => normalizar(`${j.prefijo ?? ""}${j.gamerTag}`).includes(texto))
    : jugadores;

  return (
    <div className="buscador">
      <label className="buscador__campo">
        <span className="sr-only">Buscar jugador</span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 3a7.5 7.5 0 0 1 5.96 12.05l4.25 4.24-1.42 1.42-4.24-4.25A7.5 7.5 0 1 1 10.5 3Zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Z" /></svg>
        <input type="search" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscá tu gamertag" autoComplete="off" />
      </label>
      <p className="buscador__cuenta" aria-live="polite">
        {texto ? `${visibles.length} de ${jugadores.length} jugadores` : `${jugadores.length} jugadores`}
      </p>
      {visibles.length ? (
        <ul className="players">
          {visibles.map((j) => (
            <li key={j.slug}>
              <Link href={`/jugadores/${j.slug}`}>
                <StockIcon personaje={j.personaje} size={44} />
                <span className="players__nombre">
                  {j.prefijo && <small>{j.prefijo}</small>}
                  {j.gamerTag}
                </span>
                {j.posicion ? (
                  <span className="players__rank" title={`${j.posicion}° en el ranking ${temporada}`}>
                    <strong>{j.posicion}°</strong>
                    <small>{j.puntos} pts</small>
                  </span>
                ) : (
                  <span className="players__torneos">{j.torneos} {j.torneos === 1 ? "torneo" : "torneos"}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty">
          <p className="empty__title">No encontramos a &quot;{busqueda}&quot;</p>
          <p>Los perfiles se crean solos cuando jugás un torneo de Team Anexo cargado desde start.gg.</p>
        </div>
      )}
    </div>
  );
}
