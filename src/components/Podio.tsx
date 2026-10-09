import Link from "next/link";
import type { CSSProperties } from "react";
import { Revelar } from "./Movimiento";
import { StockIcon } from "./Ranking";

export type LugarPodio = {
  posicion: number;
  gamerTag: string;
  prefijo?: string;
  personaje?: string;
  href: string;
  /** Lo que se muestra debajo del nombre: "300 pts", "1° en la final"… */
  dato?: string;
};

/**
 * Podio del top 3, como el final de un torneo: el 1° al medio y más alto.
 * La lista conserva el orden 1-2-3 para lectores de pantalla; solo cambia el orden visual.
 */
export function Podio({ lugares, titulo }: { lugares: LugarPodio[]; titulo: string }) {
  const top = lugares.slice(0, 3);
  if (top.length < 2) return null;
  return (
    <Revelar className="revelar-podio">
    <ol className="podio" aria-label={titulo}>
      {top.map((l, i) => (
        <li key={l.href} className={`podio__lugar podio__lugar--${i + 1}`} style={{ "--i": i } as CSSProperties}>
          <Link className="podio__jugador" href={l.href}>
            <StockIcon personaje={l.personaje} size={96} />
            <span className="podio__nombre">
              {l.prefijo && <small>{l.prefijo}</small>}
              {l.gamerTag}
            </span>
            {l.dato && <span className="podio__dato">{l.dato}</span>}
          </Link>
          <div className="podio__pedestal" aria-hidden="true">{l.posicion}</div>
          <span className="sr-only">{l.posicion}° puesto</span>
        </li>
      ))}
    </ol>
    </Revelar>
  );
}
