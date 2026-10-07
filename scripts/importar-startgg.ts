/*
  Importa un torneo de start.gg a la base de datos.

  Uso:
    npm run importar -- https://www.start.gg/tournament/premier-smash-league-5 --serie premier
    npm run importar -- <link> --serie sf6-kof --evento street-fighter-6

  Necesita STARTGG_TOKEN y DATABASE_URL en .env.local.
  Si el torneo ya existe se actualiza, conservando el afiche y el precio cargados a mano.
*/
import { importarTorneo } from "../src/lib/startgg.ts";
import { guardarJugadores, guardarTorneo, sql } from "../src/lib/db.ts";
import type { SerieId } from "../src/lib/types.ts";

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

const { torneo, jugadores } = await importarTorneo(token, url, { serie, eventoRanking: arg("evento") });
await guardarJugadores(jugadores);
await guardarTorneo(torneo);

const ranking = torneo.events.find((e) => e.sumaRanking);
console.log(`✔ ${torneo.nombre} (${torneo.fecha.slice(0, 10)})`);
for (const e of torneo.events) console.log(`  · ${e.nombre}: ${e.standings.length} jugadores${e.sumaRanking ? "  ← suma al ranking" : ""}`);
if (!ranking) console.log("  (ningún evento suma al ranking; usá --evento <slug-del-evento> para elegir uno)");
const [{ n }] = await sql()`select count(*)::int as n from jugadores`;
console.log(`Jugadores en la base: ${n}`);
