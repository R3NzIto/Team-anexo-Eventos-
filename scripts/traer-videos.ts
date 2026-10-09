/*
  Trae los últimos videos del canal de YouTube y detecta las partidas
  (torneo, jugadores y personajes según el título). Lo mismo que el botón
  "Traer videos de YouTube" del panel.
  Uso: npm run videos
*/
import { guardarVideos, leerDatos, sql } from "../src/lib/db.ts";
import { analizarLote, leerFeed } from "../src/lib/youtube.ts";

const CANALES = [
  "UC_MAi5lNm09s9pS0eY1_WVQ", // @TeamAnexoReplays
  "UCs8k46chS6y7Lpv87NZdZpQ", // @teamanexo554 (el primero)
];

const datos = await leerDatos();
// Igual que el sitio: las cuentas secundarias cuentan como la principal.
const principal = (id: string) => datos.alias[id] ?? id;
const jugadores = datos.jugadores.filter((j) => !datos.alias[j.id]);
const torneos = datos.torneos.map((t) => ({
  ...t,
  events: t.events.map((e) => ({ ...e, standings: e.standings.map((s) => ({ ...s, jugador: principal(s.jugador) })) })),
}));
const videos: Awaited<ReturnType<typeof analizarLote>> = [];
for (const canal of CANALES) videos.push(...analizarLote(await leerFeed(canal), torneos, jugadores));
await guardarVideos(videos);

for (const v of videos) {
  console.log(v.esPartida ? `✔ ${v.a?.nombre} vs ${v.b?.nombre}${v.ronda ? ` · ${v.ronda}` : ""} · ${v.torneo ?? v.evento ?? "sin torneo"}` : `· ${v.titulo} (no es partida)`);
}
const [{ n }] = await sql()`select count(*)::int as n from videos`;
console.log(`\nVideos en la base: ${n}`);
