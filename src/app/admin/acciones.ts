"use server";

import { updateTag } from "next/cache";
import { requerirAdmin } from "@/lib/admin";
import { PERSONAJES } from "@/data/personajes";
import { getJugadores, getRanking, getTemporadas, getTorneos } from "@/lib/data";
import { guardarJugadores, guardarPuntos, guardarTorneo, sql } from "@/lib/db";
import { calcularRanking } from "@/lib/ranking";
import { importarTorneo, type Importacion } from "@/lib/startgg";
import type { SerieId, TablaPuntos } from "@/lib/types";

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

/* ---------- Tabla de puntos ---------- */

/** Revisa que la tabla tenga sentido: arranca en el 1°, puestos crecientes, puntos enteros. */
function validarTabla(tabla: TablaPuntos): string | null {
  if (!Array.isArray(tabla) || tabla.length === 0) return "La tabla tiene que tener al menos una fila.";
  if (tabla.length > 40) return "La tabla tiene demasiadas filas.";
  if (tabla[0].desde !== 1) return "La primera fila tiene que ser el 1° puesto.";
  for (let i = 0; i < tabla.length; i++) {
    const { desde, puntos } = tabla[i];
    if (!Number.isInteger(desde) || desde < 1) return `Fila ${i + 1}: el puesto tiene que ser un número entero.`;
    if (!Number.isInteger(puntos) || puntos < 0 || puntos > 10000) return `Fila ${i + 1}: los puntos tienen que ser un entero entre 0 y 10000.`;
    if (i > 0 && desde <= tabla[i - 1].desde) return `Fila ${i + 1}: los puestos tienen que ir de menor a mayor.`;
  }
  return null;
}

export type FilaPrevia = { gamerTag: string; personaje?: string; puntos: number; posicion: number; antes?: number };

/** Cómo quedaría el ranking de la última temporada con una tabla nueva, sin guardar. */
export async function previsualizarRanking(serie: SerieId, tabla: TablaPuntos): Promise<{ ok: true; temporada: number; filas: FilaPrevia[] } | { ok: false; mensaje: string }> {
  try {
    await requerirAdmin();
    const error = validarTabla(tabla);
    if (error) return { ok: false, mensaje: error };
    const temporada = (await getTemporadas(serie))[0];
    if (!temporada) return { ok: false, mensaje: "Esta serie todavía no tiene torneos." };
    const [actual, torneos, jugadores] = await Promise.all([getRanking(serie, temporada), getTorneos(), getJugadores()]);
    const delTemporada = torneos.filter((t) => t.serie === serie && t.temporada === temporada);
    const nuevo = calcularRanking(delTemporada, tabla, new Map(jugadores.map((j) => [j.id, j])));
    const antes = new Map(actual.map((f) => [f.jugador.id, f.posicion]));
    return {
      ok: true,
      temporada,
      filas: nuevo.slice(0, 20).map((f) => ({
        gamerTag: f.jugador.gamerTag,
        personaje: f.jugador.personaje,
        puntos: f.puntos,
        posicion: f.posicion,
        antes: antes.get(f.jugador.id),
      })),
    };
  } catch (e) {
    return { ok: false, mensaje: e instanceof Error ? e.message : "No se pudo calcular." };
  }
}

export async function guardarTablaPuntos(serie: SerieId, tabla: TablaPuntos): Promise<Guardado> {
  try {
    await requerirAdmin();
    await serieValida(serie);
    const error = validarTabla(tabla);
    if (error) return { ok: false, mensaje: error };
    await guardarPuntos(serie, tabla.map(({ desde, puntos }) => ({ desde, puntos })));
    updateTag("datos");
    return { ok: true, slug: serie };
  } catch (e) {
    return { ok: false, mensaje: e instanceof Error ? e.message : "No se pudo guardar." };
  }
}

/* ---------- Jugadores: mains y cuentas duplicadas ---------- */

const PERSONAJES_VALIDOS = new Set(PERSONAJES.map((p) => p.slug));

/** Fija el main de un jugador. Con `null` vuelve a calcularse solo. */
export async function fijarMain(jugador: string, personaje: string | null): Promise<Guardado> {
  try {
    await requerirAdmin();
    if (personaje !== null && !PERSONAJES_VALIDOS.has(personaje)) return { ok: false, mensaje: "Ese personaje no existe." };
    const filas = await sql()`update jugadores set personaje = ${personaje} where id = ${jugador} returning id`;
    if (!filas.length) return { ok: false, mensaje: "No encontré ese jugador." };
    updateTag("datos");
    return { ok: true, slug: jugador };
  } catch (e) {
    return { ok: false, mensaje: e instanceof Error ? e.message : "No se pudo guardar." };
  }
}

/** Suma la cuenta `secundaria` a la `principal`: puntos, historial y main pasan a la principal. */
export async function unirCuentas(secundaria: string, principal: string): Promise<Guardado> {
  try {
    await requerirAdmin();
    if (!secundaria || !principal || secundaria === principal) return { ok: false, mensaje: "Elegí dos cuentas distintas." };
    const db = sql();
    const existen = await db`select id from jugadores where id in (${secundaria}, ${principal})`;
    if (existen.length !== 2) return { ok: false, mensaje: "No encontré alguna de las dos cuentas." };
    const [esSecundaria] = await db`select principal from alias where secundario = ${principal}`;
    if (esSecundaria) return { ok: false, mensaje: "La cuenta principal ya está unida a otra. Elegí esa otra como principal." };
    await db.transaction([
      // Si otras cuentas apuntaban a la secundaria, pasan a apuntar a la principal.
      db`update alias set principal = ${principal} where principal = ${secundaria}`,
      db`insert into alias (secundario, principal) values (${secundaria}, ${principal})
         on conflict (secundario) do update set principal = excluded.principal`,
    ]);
    updateTag("datos");
    return { ok: true, slug: principal };
  } catch (e) {
    return { ok: false, mensaje: e instanceof Error ? e.message : "No se pudo unir." };
  }
}

export async function separarCuenta(secundaria: string): Promise<Guardado> {
  try {
    await requerirAdmin();
    await sql()`delete from alias where secundario = ${secundaria}`;
    updateTag("datos");
    return { ok: true, slug: secundaria };
  } catch (e) {
    return { ok: false, mensaje: e instanceof Error ? e.message : "No se pudo separar." };
  }
}
