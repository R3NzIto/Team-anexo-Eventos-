import { slugify } from "./ranking.ts";

/*
  Nombres de personaje de start.gg → nombre del ícono en public/assets/smash/stock/.
  La mayoría coincide con slugify; acá van solo las excepciones.
*/
const EXCEPCIONES: Record<string, string> = {
  "banjo-kazooie": "banjo-and-kazooie",
  "r-o-b": "rob",
  rosalina: "rosalina-and-luma",
  pyra: "pyra-and-mythra",
  mythra: "pyra-and-mythra",
  "mii-sword-fighter": "mii-swordfighter",
  "dq-hero": "hero",
  "pokemon-trainer": "pokemon-trainer",
  "random-character": "",
};

/** Devuelve el slug del ícono, o "" si no corresponde a un personaje (p. ej. Random). */
export function slugPersonaje(nombreStartgg: string): string {
  const base = slugify(nombreStartgg);
  return base in EXCEPCIONES ? EXCEPCIONES[base] : base;
}

/** El personaje más usado; en empate gana el que aparece primero. */
export function masUsado(usos: Record<string, number> | undefined): string | undefined {
  if (!usos) return undefined;
  let mejor: string | undefined;
  let max = 0;
  for (const [p, n] of Object.entries(usos)) {
    if (n > max) { mejor = p; max = n; }
  }
  return mejor;
}

export function sumarUsos(destino: Record<string, number>, origen: Record<string, number> | undefined) {
  for (const [p, n] of Object.entries(origen ?? {})) destino[p] = (destino[p] ?? 0) + n;
}
