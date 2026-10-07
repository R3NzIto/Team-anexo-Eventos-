export type SerieId = "premier" | "sf6-kof" | "stand" | "2xko" | "anexo";

/** Puntos por puesto final. Cada fila cubre desde `desde` hasta el siguiente umbral. */
export type TablaPuntos = { desde: number; puntos: number }[];

export type Serie = {
  id: SerieId;
  nombre: string;
  corto: string;
  juego: string;
  activa: boolean;
  /** Si los torneos de esta serie suman a un ranking por temporada. */
  rankeable: boolean;
  puntos?: TablaPuntos;
  descripcion: string;
};

export type Standing = {
  puesto: number;
  /** Clave estable del jugador: id de jugador de start.gg o slug local. */
  jugador: string;
  gamerTag: string;
  /** Personaje más usado en este evento (slug del ícono). */
  personaje?: string;
  /** Games jugados con cada personaje en este evento, según lo reportado en start.gg. */
  personajes?: Record<string, number>;
};

export type EventoTorneo = {
  nombre: string;
  juego: string;
  slugStartgg?: string;
  inscriptos?: number;
  /** Solo el evento principal suma puntos (p. ej. Ultimate Singles). */
  sumaRanking: boolean;
  standings: Standing[];
};

/** Datos de un torneo que el admin puede fijar a mano. */
export type CampoManual = "nombre" | "serie" | "fecha" | "sede" | "direccion" | "valor" | "afiche";

export type Torneo = {
  slug: string;
  nombre: string;
  serie: SerieId;
  /** ISO completo, "AAAA-MM-DD" o solo "AAAA" cuando no se conoce el día. */
  fecha: string;
  temporada: number;
  sede?: string;
  direccion?: string;
  valor?: string;
  afiche?: string;
  /** Slug del torneo en start.gg, p. ej. "premier-smash-league-5". */
  slugStartgg?: string;
  inscripcionAbierta?: boolean;
  /** Campos editados a mano en el panel; al actualizar desde start.gg se conservan. */
  camposManuales?: CampoManual[];
  events: EventoTorneo[];
};

export type Jugador = {
  /** Mismo valor que Standing.jugador. */
  id: string;
  slug: string;
  gamerTag: string;
  prefijo?: string;
  /** Main elegido a mano; si falta, se calcula con los personajes reportados en sus torneos. */
  personaje?: string;
  slugStartgg?: string;
};

export type FilaRanking = {
  posicion: number;
  jugador: Jugador;
  puntos: number;
  torneos: number;
  mejorPuesto: number;
};

export type Resultado = {
  titulo: string;
  evento: string;
  imagen: string;
  alt: string;
};
