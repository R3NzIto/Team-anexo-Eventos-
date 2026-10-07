"use server";

import { updateTag } from "next/cache";
import { requerirAdmin } from "@/lib/admin";
import { guardarJugadores, guardarTorneo, sql } from "@/lib/db";
import { importarTorneo, type Importacion } from "@/lib/startgg";
import type { SerieId } from "@/lib/types";

/*
  Acciones del panel de admin. Cada una verifica que quien llama sea admin y,
  si cambia datos, invalida la caché ("datos") para que el sitio se actualice al toque.
*/

export type Previa =
  | { estado: "inicial" }
  | { estado: "error"; mensaje: string }
  | { estado: "ok"; importacion: Importacion; yaCargado: boolean };

function tokenStartgg() {
  const token = process.env.STARTGG_TOKEN;
  if (!token) throw new Error("Falta STARTGG_TOKEN en el servidor.");
  return token;
}

async function serieValida(serie: string): Promise<SerieId> {
  const [fila] = await sql()`select id from series where id = ${serie}`;
  if (!fila) throw new Error(`La serie "${serie}" no existe.`);
  return fila.id;
}

/** Trae el torneo de start.gg sin guardar nada, para revisarlo antes. */
export async function previsualizar(_previa: Previa, form: FormData): Promise<Previa> {
  try {
    await requerirAdmin();
    const url = String(form.get("url") ?? "").trim();
    if (!url) return { estado: "error", mensaje: "Pegá el link del torneo de start.gg." };
    const serie = await serieValida(String(form.get("serie") ?? ""));
    const importacion = await importarTorneo(tokenStartgg(), url, { serie });
    const [existe] = await sql()`
      select 1 from torneos where slug = ${importacion.torneo.slug} or slug_startgg = ${importacion.torneo.slugStartgg ?? ""}`;
    return { estado: "ok", importacion, yaCargado: Boolean(existe) };
  } catch (e) {
    return { estado: "error", mensaje: e instanceof Error ? e.message : "No se pudo traer el torneo." };
  }
}

export type Guardado = { ok: true; slug: string } | { ok: false; mensaje: string };

/**
 * Guarda lo que se previsualizó. `eventoRanking` es el índice del evento que suma
 * al ranking (-1 para ninguno). Los datos vienen del navegador del admin, así que
 * se revisa la forma antes de escribir.
 */
export async function guardarImportacion(importacion: Importacion, eventoRanking: number): Promise<Guardado> {
  try {
    await requerirAdmin();
    const { torneo, jugadores } = importacion;
    if (typeof torneo?.slug !== "string" || !Array.isArray(torneo.events) || !Array.isArray(jugadores)) {
      return { ok: false, mensaje: "Los datos del torneo llegaron incompletos. Volvé a previsualizar." };
    }
    await serieValida(torneo.serie);
    const events = torneo.events.map((e, i) => ({ ...e, sumaRanking: i === eventoRanking && !esDobles(e.standings) }));
    await guardarJugadores(jugadores);
    const slug = await guardarTorneo({ ...torneo, events });
    updateTag("datos");
    return { ok: true, slug };
  } catch (e) {
    return { ok: false, mensaje: e instanceof Error ? e.message : "No se pudo guardar." };
  }
}

/** Los eventos de dobles no suman a un ranking individual. */
const esDobles = (standings: { jugador: string }[]) => standings.some((s) => s.jugador.startsWith("equipo:"));

/** Vuelve a traer un torneo ya cargado, manteniendo su serie y el evento que suma. */
export async function actualizarDesdeStartgg(slug: string): Promise<Guardado> {
  try {
    await requerirAdmin();
    const [t] = await sql()`select slug_startgg, serie from torneos where slug = ${slug}`;
    if (!t?.slug_startgg) return { ok: false, mensaje: "Este torneo no está vinculado a start.gg." };
    const [ev] = await sql()`select slug_startgg from eventos where torneo = ${slug} and suma_ranking`;
    const importacion = await importarTorneo(tokenStartgg(), t.slug_startgg, {
      serie: t.serie,
      eventoRanking: ev?.slug_startgg ?? undefined,
    });
    await guardarJugadores(importacion.jugadores);
    await guardarTorneo(importacion.torneo);
    updateTag("datos");
    return { ok: true, slug };
  } catch (e) {
    return { ok: false, mensaje: e instanceof Error ? e.message : "No se pudo actualizar." };
  }
}

export async function borrarTorneo(slug: string): Promise<Guardado> {
  try {
    await requerirAdmin();
    await sql()`delete from torneos where slug = ${slug}`;
    updateTag("datos");
    return { ok: true, slug };
  } catch (e) {
    return { ok: false, mensaje: e instanceof Error ? e.message : "No se pudo borrar." };
  }
}
