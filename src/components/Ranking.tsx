import Link from "next/link";
import Image from "next/image";
import type { FilaRanking } from "@/lib/types";

export function StockIcon({ personaje, size = 32 }: { personaje?: string; size?: number }) {
  if (!personaje) return <span className="stock stock--vacio" style={{ width: size, height: size }} aria-hidden="true" />;
  return <Image className="stock" src={`/assets/smash/stock/${personaje}.png`} alt="" width={size} height={size} />;
}

export function RankingTable({ filas, limite, mostrarPersonaje = true }: { filas: FilaRanking[]; limite?: number; mostrarPersonaje?: boolean }) {
  const visibles = limite ? filas.slice(0, limite) : filas;
  return (
    <table className="ranking">
      <thead>
        <tr>
          <th scope="col" className="ranking__pos">#</th>
          <th scope="col">Jugador</th>
          <th scope="col" className="ranking__num">Torneos</th>
          <th scope="col" className="ranking__num">Mejor</th>
          <th scope="col" className="ranking__num">Puntos</th>
        </tr>
      </thead>
      <tbody>
        {visibles.map((f) => (
          <tr key={f.jugador.id} className={f.posicion <= 3 ? `ranking__top ranking__top--${f.posicion}` : undefined}>
            <td className="ranking__pos">{f.posicion}</td>
            <td>
              <Link className="ranking__player" href={`/jugadores/${f.jugador.slug}`}>
                {mostrarPersonaje && <StockIcon personaje={f.jugador.personaje} />}
                <span>
                  {f.jugador.prefijo && <small>{f.jugador.prefijo} | </small>}
                  {f.jugador.gamerTag}
                </span>
              </Link>
            </td>
            <td className="ranking__num">{f.torneos}</td>
            <td className="ranking__num">{f.mejorPuesto}°</td>
            <td className="ranking__num ranking__pts">{f.puntos}</td>
          </tr>
        ))}
      </tbody>
    </table>
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
