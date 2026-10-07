"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { StockIcon } from "@/components/Ranking";
import { fechaCorta } from "@/lib/format";
import { puntosPorPuesto } from "@/lib/ranking";
import type { Serie } from "@/lib/types";
import { guardarImportacion, previsualizar, type Guardado, type Previa } from "./acciones";

const esDobles = (standings: { jugador: string }[]) => standings.some((s) => s.jugador.startsWith("equipo:"));

export function CargarTorneo({ series }: { series: Serie[] }) {
  const [previa, pedirPrevia, trayendo] = useActionState(previsualizar, { estado: "inicial" } as Previa);

  return (
    <div className="admin-carga">
      <form action={pedirPrevia} className="admin-form">
        <label className="campo campo--ancho">
          <span>Link del torneo en start.gg</span>
          <input name="url" type="url" required placeholder="https://www.start.gg/tournament/premier-smash-league-3" />
        </label>
        <label className="campo">
          <span>Serie</span>
          <select name="serie" defaultValue="premier">
            {series.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
        </label>
        <button className="btn btn--p2" type="submit" disabled={trayendo}>
          {trayendo ? "Trayendo de start.gg…" : "Previsualizar"}
        </button>
      </form>
      {trayendo && <p className="admin-nota" role="status">Esto puede tardar hasta un minuto: también se traen los personajes de cada set.</p>}
      {!trayendo && previa.estado === "error" && <p className="aviso" role="alert">{previa.mensaje}</p>}
      {!trayendo && previa.estado === "ok" && (
        // La key reinicia la vista previa cada vez que llega un torneo nuevo.
        <VistaPrevia key={previa.importacion.torneo.slug + previa.importacion.torneo.fecha} previa={previa} series={series} />
      )}
    </div>
  );
}

function VistaPrevia({ previa, series }: { previa: Extract<Previa, { estado: "ok" }>; series: Serie[] }) {
  const { torneo } = previa.importacion;
  const router = useRouter();
  const [evento, setEvento] = useState(() => torneo.events.findIndex((e) => e.sumaRanking));
  const [resultado, setResultado] = useState<Guardado | null>(null);
  const [guardando, startGuardar] = useTransition();
  const serie = series.find((s) => s.id === torneo.serie);
  const elegido = torneo.events[evento];

  function guardar() {
    startGuardar(async () => {
      const r = await guardarImportacion(previa.importacion, evento);
      setResultado(r);
      if (r.ok) router.refresh();
    });
  }

  if (resultado?.ok) {
    return (
      <div className="admin-ok" role="status">
        <p><strong>{torneo.nombre}</strong> quedó guardado y ya se ve en el sitio.</p>
        <Link className="link-arrow" href={`/torneos/${resultado.slug}`}>Ver el torneo</Link>
      </div>
    );
  }

  return (
    <div className="admin-previa">
      <div className="admin-previa__cabecera">
        <div>
          <h3 className="admin-previa__titulo">{torneo.nombre}</h3>
          <p className="admin-nota">
            {[fechaCorta(torneo.fecha), torneo.sede, serie?.nombre].filter(Boolean).join(" · ")}
          </p>
        </div>
        {previa.yaCargado && <p className="admin-chip">Ya estaba cargado: al guardar se actualiza</p>}
      </div>

      <fieldset className="admin-eventos">
        <legend>¿Qué evento suma al ranking?</legend>
        {torneo.events.map((e, i) => {
          const dobles = esDobles(e.standings);
          return (
            <label key={e.slugStartgg ?? i} className="admin-evento">
              <input type="radio" name="evento" checked={evento === i} disabled={dobles} onChange={() => setEvento(i)} />
              <span>
                <strong>{e.nombre}</strong> · {e.juego} · {e.standings.length} {dobles ? "equipos (dobles, no suma)" : "jugadores"}
              </span>
            </label>
          );
        })}
        <label className="admin-evento">
          <input type="radio" name="evento" checked={evento === -1} onChange={() => setEvento(-1)} />
          <span>Ninguno (el torneo se muestra pero no suma puntos)</span>
        </label>
      </fieldset>

      {elegido && (
        <table className="ranking admin-tabla">
          <caption>{elegido.nombre}: resultados y puntos que reparte</caption>
          <thead>
            <tr>
              <th scope="col" className="ranking__pos">#</th>
              <th scope="col">Jugador</th>
              <th scope="col" className="ranking__num">Puntos</th>
            </tr>
          </thead>
          <tbody>
            {elegido.standings.map((s) => (
              <tr key={s.jugador}>
                <td className="ranking__pos">{s.puesto}</td>
                <td><span className="ranking__player"><StockIcon personaje={s.personaje} />{s.gamerTag}</span></td>
                <td className="ranking__num ranking__pts">{serie?.puntos ? puntosPorPuesto(s.puesto, serie.puntos) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="actions">
        <button className="btn btn--p2" type="button" onClick={guardar} disabled={guardando}>
          {guardando ? "Guardando…" : previa.yaCargado ? "Actualizar torneo" : "Guardar torneo"}
        </button>
      </div>
      {resultado && !resultado.ok && <p className="aviso" role="alert">{resultado.mensaje}</p>}
    </div>
  );
}
