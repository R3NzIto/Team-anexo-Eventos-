/*
  Trae los últimos videos del canal de YouTube y detecta las partidas
  (torneo, jugadores y personajes según el título). Lo mismo que el botón
  "Traer videos de YouTube" del panel.
  Uso: npm run videos
*/
import { guardarVideos, leerDatos, sql } from "../src/lib/db.ts";
import { analizarVideo, leerFeed } from "../src/lib/youtube.ts";

const CANAL = "UCs8k46chS6y7Lpv87NZdZpQ"; // @teamanexo554

const datos = await leerDatos();
const jugadores = datos.jugadores.filter((j) => !datos.alias[j.id]);
const videos = (await leerFeed(CANAL)).map((v) => analizarVideo(v, datos.torneos, jugadores));
await guardarVideos(videos);

for (const v of videos) {
  console.log(v.esPartida ? `✔ ${v.a?.nombre} vs ${v.b?.nombre}${v.torneo ? ` · ${v.torneo}` : ""}` : `· ${v.titulo} (no es partida)`);
}
const [{ n }] = await sql()`select count(*)::int as n from videos`;
console.log(`\nVideos en la base: ${n}`);
