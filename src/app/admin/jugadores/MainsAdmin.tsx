"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { StockIcon } from "@/components/Ranking";
import { fijarMain } from "../acciones";

type JugadorMain = { id: string; gamerTag: string; slug: string; main?: string; manual?: string; torneos: number };
type Personaje = { slug: string; nombre: string };

export function MainsAdmin({ jugadores, personajes }: { jugadores: JugadorMain[]; personajes: Personaje[] }) {
  const [busqueda, setBusqueda] = useState("");
  const [soloSinMain, setSoloSinMain] = useState(false);
  const texto = busqueda.trim().toLowerCase();
  const visibles = jugadores.filter((j) => (!texto || j.gamerTag.toLowerCase().includes(texto)) && (!soloSinMain || !j.main));

  return (
    <div className="admin-mains">
      <div className="admin-form">
        <label className="campo campo--ancho">
          <span>Buscar jugador</span>
          <input type="search" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Gamertag" />
        </label>
        <label className="admin-evento">
          <input type="checkbox" checked={soloSinMain} onChange={(e) => setSoloSinMain(e.target.checked)} />
          <span>Solo los que no tienen main ({jugadores.filter((j) => !j.main).length})</span>
        </label>
      </div>
      <table className="history__table">
        <thead>
          <tr>
            <th scope="col">Jugador</th>
            <th scope="col">Main</th>
          </tr>
        </thead>
        <tbody>
          {visibles.map((j) => <FilaMain key={j.id} jugador={j} personajes={personajes} />)}
        </tbody>
      </table>
      {visibles.length === 0 && <p className="admin-nota">Ningún jugador coincide con la búsqueda.</p>}
    </div>
  );
}

function FilaMain({ jugador, personajes }: { jugador: JugadorMain; personajes: Personaje[] }) {
  const router = useRouter();
  const [guardando, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function cambiar(valor: string) {
    setError(null);
    startTransition(async () => {
      const r = await fijarMain(jugador.id, valor || null);
      if (r.ok) router.refresh();
      else setError(r.mensaje);
    });
  }

  return (
    <tr aria-busy={guardando}>
      <td>
        <span className="ranking__player">
          <StockIcon personaje={jugador.main} />
          <Link href={`/jugadores/${jugador.slug}`}>{jugador.gamerTag}</Link>
        </span>
        <span className="admin-nota"> · {jugador.torneos} {jugador.torneos === 1 ? "torneo" : "torneos"}</span>
      </td>
      <td>
        <select className="admin-select" aria-label={`Main de ${jugador.gamerTag}`} value={jugador.manual ?? ""}
          disabled={guardando} onChange={(e) => cambiar(e.target.value)}>
          <option value="">Automático{!jugador.manual && jugador.main ? ` (${personajes.find((p) => p.slug === jugador.main)?.nombre ?? jugador.main})` : !jugador.manual ? " (sin datos)" : ""}</option>
          {personajes.map((p) => <option key={p.slug} value={p.slug}>{p.nombre}</option>)}
        </select>
        {error && <span className="admin-nota" role="alert"> {error}</span>}
      </td>
    </tr>
  );
}
