import type { CSSProperties } from "react";
import { PERSONAJES } from "@/data/personajes";
import { StockIcon } from "./Ranking";

const NOMBRE = new Map(PERSONAJES.map((p) => [p.slug, p.nombre]));

/** Los personajes que más usa, en games reportados en start.gg. Barras de un solo color: es cantidad, no categoría. */
export function PersonajesJugador({ usos }: { usos: { personaje: string; games: number }[] }) {
  const top = usos.slice(0, 6);
  const total = usos.reduce((n, u) => n + u.games, 0);
  const max = top[0]?.games ?? 1;
  return (
    <figure className="personajes">
      <figcaption className="evolucion__titulo">Personajes · {total} games reportados</figcaption>
      <ul className="personajes__lista">
        {top.map((u, i) => (
          <li key={u.personaje} style={{ "--i": i, "--ancho": `${(u.games / max) * 100}%` } as CSSProperties}>
            <StockIcon personaje={u.personaje} size={36} />
            <span className="personajes__nombre">{NOMBRE.get(u.personaje) ?? u.personaje}</span>
            <span className="personajes__barra" aria-hidden="true"><span /></span>
            <span className="personajes__valor">{u.games} <small>{Math.round((u.games / total) * 100)}%</small></span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
