"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CampoManual, Serie, Torneo } from "@/lib/types";
import { crearTorneo, guardarEdicion, subirAfiche, volverADatosDeStartgg } from "../acciones";

const NOMBRES: Record<CampoManual, string> = {
  nombre: "nombre", serie: "serie", fecha: "fecha", sede: "sede", direccion: "dirección", valor: "precio", afiche: "afiche",
};

/** "2026-11-14T16:30:00-03:00" → ["2026-11-14", "16:30"]; "2026-11-14" → ["2026-11-14", ""]; "2026" → ["", ""]. */
function partirFecha(fecha?: string): [string, string] {
  if (!fecha || fecha.length < 10) return ["", ""];
  return [fecha.slice(0, 10), fecha.length > 10 ? fecha.slice(11, 16) : ""];
}

/**
 * Achica la imagen en el navegador (máx. 1400 px de alto, WebP) antes de subirla:
 * un afiche de celular de 5 MB queda en unos 200 KB.
 */
async function achicar(archivo: File): Promise<Blob> {
  const bitmap = await createImageBitmap(archivo);
  const escala = Math.min(1, 1400 / bitmap.height, 1400 / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  for (const calidad of [0.85, 0.7, 0.55]) {
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", calidad));
    if (blob && blob.size < 850 * 1024) return blob;
  }
  throw new Error("La imagen es demasiado pesada aun achicada.");
}

export function FormTorneo({ series, torneo }: { series: Serie[]; torneo?: Torneo }) {
  const router = useRouter();
  const [dia, hora] = partirFecha(torneo?.fecha);
  const [afiche, setAfiche] = useState(torneo?.afiche ?? "");
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardando, startGuardar] = useTransition();
  const [restaurando, startRestaurar] = useTransition();
  const manuales = torneo?.camposManuales ?? [];
  const soloAnio = torneo?.fecha.length === 4;

  async function elegirAfiche(archivo: File | undefined) {
    if (!archivo) return;
    setError(null);
    setSubiendo(true);
    try {
      const form = new FormData();
      form.set("archivo", new File([await achicar(archivo)], "afiche.webp", { type: "image/webp" }));
      const r = await subirAfiche(form);
      if (r.ok) setAfiche(r.url);
      else setError(r.mensaje);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo leer la imagen.");
    } finally {
      setSubiendo(false);
    }
  }

  function enviar(form: FormData) {
    setError(null);
    startGuardar(async () => {
      const r = torneo ? await guardarEdicion(torneo.slug, form) : await crearTorneo(form);
      if (r.ok) {
        router.push(`/admin?guardado=${encodeURIComponent(r.slug)}`);
        router.refresh();
      } else setError(r.mensaje);
    });
  }

  function restaurar() {
    if (!torneo || !confirm("¿Volver a usar los datos de start.gg? Se pierden los cambios hechos a mano.")) return;
    startRestaurar(async () => {
      const r = await volverADatosDeStartgg(torneo.slug);
      if (r.ok) router.refresh();
      else setError(r.mensaje);
    });
  }

  return (
    <form action={enviar} className="admin-torneo-form">
      <div className="admin-torneo-form__campos">
        <label className="campo">
          <span>Nombre</span>
          <input name="nombre" required defaultValue={torneo?.nombre} placeholder="Premier Smash League #3" />
        </label>
        <label className="campo">
          <span>Serie</span>
          <select name="serie" defaultValue={torneo?.serie ?? "premier"}>
            {series.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
        </label>
        <div className="admin-fila">
          <label className="campo">
            <span>Fecha</span>
            <input name="fecha" type="date" required={!soloAnio} defaultValue={dia} />
            {soloAnio && <small className="admin-nota">Solo se sabe el año ({torneo?.fecha}); dejalo vacío para mantenerlo.</small>}
          </label>
          <label className="campo">
            <span>Hora <small>(opcional)</small></span>
            <input name="hora" type="time" defaultValue={hora} />
          </label>
        </div>
        <label className="campo">
          <span>Sede</span>
          <input name="sede" defaultValue={torneo?.sede} placeholder="Nombre del lugar" />
        </label>
        <label className="campo">
          <span>Dirección</span>
          <input name="direccion" defaultValue={torneo?.direccion} placeholder="Calle y número, ciudad" />
        </label>
        <label className="campo">
          <span>Inscripción</span>
          <input name="valor" defaultValue={torneo?.valor} placeholder="$5.000 · cupo 32" />
        </label>
        <label className="campo">
          <span>Link de start.gg <small>(opcional, se puede agregar después)</small></span>
          <input name="startgg" type="url" defaultValue={torneo?.slugStartgg ? `https://www.start.gg/tournament/${torneo.slugStartgg}` : ""}
            placeholder="https://www.start.gg/tournament/…" />
        </label>
        <input type="hidden" name="afiche" value={afiche} />
        {soloAnio && <input type="hidden" name="anio" value={torneo?.fecha} />}
      </div>

      <div className="admin-torneo-form__afiche">
        <span className="campo"><span>Afiche</span></span>
        <div className="admin-afiche">
          {afiche ? <Image src={afiche} alt="Afiche del torneo" width={300} height={533} sizes="16rem" /> : <p className="admin-nota">Sin afiche</p>}
        </div>
        <label className="admin-boton admin-subir">
          {subiendo ? "Subiendo…" : afiche ? "Cambiar afiche" : "Subir afiche"}
          <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={subiendo}
            onChange={(e) => elegirAfiche(e.target.files?.[0])} />
        </label>
        {afiche && <button type="button" className="admin-boton admin-boton--peligro" onClick={() => setAfiche("")}>Quitar</button>}
      </div>

      <div className="admin-torneo-form__pie">
        {manuales.length > 0 && torneo?.slugStartgg && (
          <p className="admin-nota">
            Editado a mano: {manuales.map((c) => NOMBRES[c]).join(", ")}. Al actualizar desde start.gg, esto se mantiene.{" "}
            <button type="button" className="admin-link" onClick={restaurar} disabled={restaurando}>
              {restaurando ? "Restaurando…" : "Volver a los datos de start.gg"}
            </button>
          </p>
        )}
        {error && <p className="aviso" role="alert">{error}</p>}
        <div className="actions">
          <button className="btn btn--p2" type="submit" disabled={guardando || subiendo}>
            {guardando ? "Guardando…" : torneo ? "Guardar cambios" : "Crear torneo"}
          </button>
          <Link className="link-arrow" href="/admin">Cancelar</Link>
        </div>
      </div>
    </form>
  );
}
