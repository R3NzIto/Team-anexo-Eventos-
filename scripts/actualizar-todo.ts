/*
  Vuelve a importar desde start.gg todos los torneos que ya tienen link,
  respetando su serie. Sirve para traer correcciones de resultados y personajes.
  Uso: npm run actualizar
*/
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import type { Torneo } from "../src/lib/types.ts";

const torneos = JSON.parse(readFileSync(resolve("src/data/torneos.json"), "utf8")) as Torneo[];
const conLink = torneos.filter((t) => t.slugStartgg);
console.log(`Actualizando ${conLink.length} torneos…\n`);

for (const t of conLink) {
  execFileSync(
    process.execPath,
    ["--env-file-if-exists=.env.local", "--no-warnings", "scripts/importar-startgg.ts", `https://www.start.gg/tournament/${t.slugStartgg}`, "--serie", t.serie],
    { stdio: "inherit" },
  );
}
