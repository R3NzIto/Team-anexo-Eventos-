import type { Serie, TablaPuntos } from "@/lib/types";

/**
 * Tabla de puntos propuesta para la Premier: más peso a los primeros puestos
 * y algo para todos los que juegan, así la asistencia también cuenta.
 * Se puede editar libremente; el ranking se recalcula solo.
 */
const PUNTOS_PREMIER: TablaPuntos = [
  { desde: 1, puntos: 100 },
  { desde: 2, puntos: 80 },
  { desde: 3, puntos: 65 },
  { desde: 4, puntos: 55 },
  { desde: 5, puntos: 45 },
  { desde: 7, puntos: 35 },
  { desde: 9, puntos: 25 },
  { desde: 13, puntos: 18 },
  { desde: 17, puntos: 12 },
  { desde: 25, puntos: 8 },
  { desde: 33, puntos: 5 },
  { desde: 49, puntos: 3 },
];

const PUNTOS_FGC: TablaPuntos = [
  { desde: 1, puntos: 50 },
  { desde: 2, puntos: 40 },
  { desde: 3, puntos: 32 },
  { desde: 4, puntos: 26 },
  { desde: 5, puntos: 20 },
  { desde: 7, puntos: 15 },
  { desde: 9, puntos: 10 },
  { desde: 13, puntos: 6 },
  { desde: 17, puntos: 3 },
];

export const SERIES: Serie[] = [
  {
    id: "premier",
    nombre: "Premier Smash League",
    corto: "Premier",
    juego: "Super Smash Bros Ultimate",
    activa: true,
    rankeable: true,
    puntos: PUNTOS_PREMIER,
    descripcion:
      "El circuito de Super Smash Bros Ultimate que reúne a jugadores de varias provincias en Mendoza. Como sede de Smash Bros Argentina, los resultados suman al ranking nacional.",
  },
  {
    id: "sf6-kof",
    nombre: "Street Fighter 6 y KOF XV",
    corto: "SF6 / KOF",
    juego: "Street Fighter 6 · KOF XV",
    activa: true,
    rankeable: true,
    puntos: PUNTOS_FGC,
    descripcion:
      "Torneos de fighting games tradicionales con llaves completas, partidas transmitidas y VODs de las finales.",
  },
  {
    id: "stand",
    nombre: "Stands en eventos",
    corto: "Stand",
    juego: "Torneos y free-to-play",
    activa: true,
    rankeable: false,
    descripcion:
      "Zonas de torneo, free-to-play y retro dentro de convenciones como Mendotaku, Multigeek y Game Mania Fest.",
  },
  {
    id: "2xko",
    nombre: "2XKO Mendoza Fighting Cup",
    corto: "2XKO",
    juego: "2XKO",
    activa: false,
    rankeable: false,
    descripcion: "Copa de 2XKO realizada en 2026. Ya no está activa.",
  },
  {
    id: "anexo",
    nombre: "Anexo World Cup",
    corto: "Copa Anexo",
    juego: "Copa propia",
    activa: false,
    rankeable: false,
    descripcion: "La primera copa del Anexo, en 2022.",
  },
];

export function getSerieConfig(id: string): Serie | undefined {
  return SERIES.find((s) => s.id === id);
}
