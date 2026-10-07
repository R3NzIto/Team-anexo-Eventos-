/*
  Carga en la base los datos iniciales de db/semilla (los que se importaron
  antes de tener base) y las series de src/data/series.ts.
  Uso: npm run db:semilla
  Si la base ya tiene torneos no hace nada, salvo que se agregue --forzar.
*/
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { guardarJugadores, guardarSerie, guardarTorneo, sql } from "../src/lib/db.ts";
import { SERIES } from "../src/data/series.ts";
import type { Jugador, Resultado, Torneo } from "../src/lib/types.ts";

const leer = <T>(archivo: string) => JSON.parse(readFileSync(resolve("db/semilla", archivo), "utf8")) as T;
const db = sql();

const [{ n }] = await db`select count(*)::int as n from torneos`;
if (n > 0 && !process.argv.includes("--forzar")) {
  console.log(`La base ya tiene ${n} torneos; no cargo nada. Usá --forzar para pisar con la semilla.`);
  process.exit(0);
}

for (const [i, s] of SERIES.entries()) await guardarSerie(s, i);
console.log(`✔ ${SERIES.length} series`);

await guardarJugadores(leer<Jugador[]>("jugadores.json"));
console.log("✔ jugadores");

const torneos = leer<Torneo[]>("torneos.json");
for (const t of torneos) await guardarTorneo(t);
console.log(`✔ ${torneos.length} torneos`);

const alias = leer<Record<string, string>>("alias.json");
for (const [secundario, principal] of Object.entries(alias)) {
  await db`insert into alias values (${secundario}, ${principal}) on conflict (secundario) do update set principal = excluded.principal`;
}
console.log(`✔ ${Object.keys(alias).length} alias`);

const resultados = leer<Resultado[]>("resultados.json");
await db`delete from resultados`;
for (const [i, r] of resultados.entries()) {
  await db`insert into resultados (titulo, evento, imagen, alt, orden) values (${r.titulo}, ${r.evento}, ${r.imagen}, ${r.alt}, ${i})`;
}
console.log(`✔ ${resultados.length} resultados destacados`);
