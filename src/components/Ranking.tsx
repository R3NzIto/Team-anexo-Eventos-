import Link from "next/link";
import Image from "next/image";
import type { CSSProperties } from "react";
import { Contador, Revelar } from "./Movimiento";
import type { FilaRanking } from "@/lib/types";

export function StockIcon({ personaje, size = 32 }: { personaje?: string; size?: number }) {
  if (!personaje) return <span className="stock stock--vacio" style={{ width: size, height: size }} aria-hidden="true" />;
  return <Image className="stock" src={`/assets/smash/stock/${personaje}.png`} alt="" width={size} height={size} />;
}

export function RankingTable({ filas, limite, mostrarPersonaje = true }: { filas: FilaRanking[]; limite?: number; mostrarPersonaje?: boolean }) {
  const visibles = limite ? filas.slice(0, limite) : filas;
  return (
    <Revelar className="revelar-ranking">
    <table className="ranking">
      <thead>
        <tr>
          <th scope="col" className="ranking__pos">#</th>
          <th scope="col">Jugador</th>
          <th scope="col" className="ranking__num ranking__extra">Torneos</th>
          <th scope="col" className="ranking__num ranking__extra">Mejor</th>
          <th scope="col" className="ranking__num">Puntos</th>
        </tr>
      </thead>
      <tbody>
        {visibles.map((f, i) => (
          <tr key={f.jugador.id} className={f.posicion <= 3 ? `ranking__top ranking__top--${f.posicion}` : undefined} style={{ "--i": i } as CSSProperties}>
            <td className="ranking__pos">{f.posicion}</td>
            <td>
              <Link className="ranking__player" href={`/jugadores/${f.jugador.slug}`}>
                {mostrarPersonaje && <StockIcon personaje={f.jugador.personaje} />}
                <span>
                  {f.jugador.prefijo && <small className="ranking__prefijo">{f.jugador.prefijo}</small>}
                  {f.jugador.gamerTag}
                </span>
              </Link>
            </td>
            <td className="ranking__num ranking__extra">{f.torneos}</td>
            <td className="ranking__num ranking__extra">{f.mejorPuesto}°</td>
            <td className="ranking__num ranking__pts"><Contador valor={f.puntos} retraso={150 + Math.min(i, 12) * 55} /></td>
          </tr>
        ))}
      </tbody>
    </table>
    </Revelar>
  );
}

export function RankingVacio({ temporada }: { temporada: number }) {
  return (
    <div className="empty">
      <p className="empty__title">El ranking {temporada} arranca con la próxima fecha</p>
      <p>Los puntos se cargan desde los resultados de start.gg después de cada torneo de la Premier.</p>
    </div>
  );
}
