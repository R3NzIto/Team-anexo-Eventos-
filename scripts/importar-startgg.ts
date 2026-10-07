/*
  Importa un torneo de start.gg a src/data (torneos.json y jugadores.json).

  Uso:
    npm run importar -- https://www.start.gg/tournament/premier-smash-league-5 --serie premier
    npm run importar -- <link> --serie sf6-kof --evento street-fighter-6

  Necesita STARTGG_TOKEN en .env.local (start.gg → Settings → Developer Settings).
  Si el torneo ya existe se actualiza, conservando el afiche y la serie cargados a mano.
*/
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { importarTorneo } from "../src/lib/startgg.ts";
import type { Jugador, SerieId, Torneo } from "../src/lib/types.ts";

const SERIES: SerieId[] = ["premier", "sf6-kof", "stand", "2xko", "anexo"];

function arg(nombre: string): string | undefined {
  const i = process.argv.indexOf(`--${nombre}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

const url = process.argv.slice(2).find((a) => !a.startsWith("--") && !SERIES.includes(a as SerieId) && a !== arg("evento"));
const serie = (arg("serie") ?? "premier") as SerieId;
const token = process.env.STARTGG_TOKEN;

if (!url) {
  console.error("Falta el link del torneo. Ejemplo: npm run importar -- https://www.start.gg/tournament/mi-torneo --serie premier");
  process.exit(1);
}
if (!SERIES.includes(serie)) {
  console.error(`Serie desconocida "${serie}". Opciones: ${SERIES.join(", ")}`);
  process.exit(1);
}
if (!token) {
  console.error("Falta STARTGG_TOKEN en .env.local. Crealo en start.gg → Settings → Developer Settings.");
  process.exit(1);
}

const rutaTorneos = resolve("src/data/torneos.json");
const rutaJugadores = resolve("src/data/jugadores.json");
const torneos = JSON.parse(readFileSync(rutaTorneos, "utf8")) as Torneo[];
const jugadores = JSON.parse(readFileSync(rutaJugadores, "utf8")) as Jugador[];

const { torneo, jugadores: nuevos } = await importarTorneo(token, url, { serie, eventoRanking: arg("evento") });

const previo = torneos.findIndex((t) => t.slug === torneo.slug || (t.slugStartgg && t.slugStartgg === torneo.slugStartgg));
if (previo > -1) {
  const viejo = torneos[previo];
  torneos[previo] = { ...torneo, afiche: viejo.afiche ?? torneo.afiche, valor: viejo.valor ?? torneo.valor };
} else {
  torneos.push(torneo);
}

const porId = new Map(jugadores.map((j) => [j.id, j]));
for (const j of nuevos) {
  const existente = porId.get(j.id);
  porId.set(j.id, existente ? { ...j, slug: existente.slug, personaje: existente.personaje ?? j.personaje } : j);
}
// Slugs únicos: si dos jugadores comparten gamertag, el segundo lleva sufijo.
const usados = new Set<string>();
const lista = [...porId.values()].map((j) => {
  let slug = j.slug;
  for (let n = 2; usados.has(slug); n++) slug = `${j.slug}-${n}`;
  usados.add(slug);
  return { ...j, slug };
});

writeFileSync(rutaTorneos, JSON.stringify(torneos, null, 2) + "\n");
writeFileSync(rutaJugadores, JSON.stringify(lista, null, 2) + "\n");

const ranking = torneo.events.find((e) => e.sumaRanking);
console.log(`✔ ${torneo.nombre} (${torneo.fecha.slice(0, 10)})`);
for (const e of torneo.events) console.log(`  · ${e.nombre}: ${e.standings.length} jugadores${e.sumaRanking ? "  ← suma al ranking" : ""}`);
if (!ranking) console.log("  (ningún evento suma al ranking; usá --evento <slug-del-evento> para elegir uno)");
console.log(`Jugadores en total: ${lista.length}`);
