import type { FilaRanking, Jugador, TablaPuntos, Torneo } from "./types";

export function puntosPorPuesto(puesto: number, tabla: TablaPuntos): number {
  let puntos = 0;
  for (const fila of tabla) {
    if (puesto >= fila.desde) puntos = fila.puntos;
    else break;
  }
  return puntos;
}

/**
 * Suma los puntos de cada jugador en los eventos que suman ranking.
 * Desempate: más puntos, luego mejor puesto, luego más torneos jugados.
 */
export function calcularRanking(
  torneos: Torneo[],
  tabla: TablaPuntos,
  jugadores: Map<string, Jugador>,
): FilaRanking[] {
  const acumulado = new Map<string, { puntos: number; torneos: number; mejorPuesto: number; gamerTag: string; personaje?: string }>();

  for (const torneo of torneos) {
    for (const evento of torneo.events) {
      if (!evento.sumaRanking) continue;
      for (const s of evento.standings) {
        const actual = acumulado.get(s.jugador) ?? { puntos: 0, torneos: 0, mejorPuesto: Infinity, gamerTag: s.gamerTag };
        actual.puntos += puntosPorPuesto(s.puesto, tabla);
        actual.torneos += 1;
        actual.mejorPuesto = Math.min(actual.mejorPuesto, s.puesto);
        actual.gamerTag = s.gamerTag;
        if (s.personaje) actual.personaje = s.personaje;
        acumulado.set(s.jugador, actual);
      }
    }
  }

  const filas = [...acumulado.entries()]
    .map(([id, a]) => ({
      jugador: jugadores.get(id) ?? { id, slug: slugify(a.gamerTag), gamerTag: a.gamerTag, personaje: a.personaje },
      puntos: a.puntos,
      torneos: a.torneos,
      mejorPuesto: a.mejorPuesto,
    }))
    .sort((a, b) => b.puntos - a.puntos || a.mejorPuesto - b.mejorPuesto || b.torneos - a.torneos);

  // Empates comparten posición (1, 2, 2, 4).
  let posicion = 0;
  return filas.map((f, i) => {
    const prev = filas[i - 1];
    const empata = prev && prev.puntos === f.puntos && prev.mejorPuesto === f.mejorPuesto && prev.torneos === f.torneos;
    if (!empata) posicion = i + 1;
    return { ...f, posicion };
  });
}

export function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
