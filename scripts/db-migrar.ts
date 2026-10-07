/*
  Crea o actualiza las tablas de la base según db/schema.sql.
  Uso: npm run db:migrar   (se puede correr las veces que haga falta)
*/
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { sql } from "../src/lib/db.ts";

const sentencias = readFileSync(resolve("db/schema.sql"), "utf8")
  .replace(/--.*$/gm, "")
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);

const db = sql();
await db.transaction(sentencias.map((s) => db.query(s)));
console.log(`✔ Esquema aplicado (${sentencias.length} sentencias).`);
