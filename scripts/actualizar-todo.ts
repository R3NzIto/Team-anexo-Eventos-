/*
  Vuelve a importar desde start.gg todos los torneos que ya tienen link,
  respetando su serie. Sirve para traer correcciones de resultados y personajes.
  Uso: npm run actualizar
*/
import { execFileSync } from "node:child_process";
import { sql } from "../src/lib/db.ts";

const conLink = await sql()`select slug_startgg, serie from torneos where slug_startgg is not null order by fecha`;
console.log(`Actualizando ${conLink.length} torneos…\n`);

for (const t of conLink) {
  execFileSync(
    process.execPath,
    ["--env-file-if-exists=.env.local", "--no-warnings", "scripts/importar-startgg.ts", `https://www.start.gg/tournament/${t.slug_startgg}`, "--serie", t.serie],
    { stdio: "inherit" },
  );
}
