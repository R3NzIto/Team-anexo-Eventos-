import Link from "next/link";
import { fechaCorta } from "@/lib/format";
import type { SerieId, Torneo } from "@/lib/types";

const CORTO: Record<SerieId, string> = {
  premier: "Premier",
  "sf6-kof": "SF6 / KOF",
  stand: "Stand",
  "2xko": "2XKO",
  anexo: "Copa Anexo",
};

export function SerieChip({ serie }: { serie: SerieId }) {
  return <span className={`chip chip--${serie}`}>{CORTO[serie]}</span>;
}

export function HistorialTable({ torneos }: { torneos: Torneo[] }) {
  return (
    <table className="history__table">
      <caption className="sr-only">Eventos realizados por Team Anexo</caption>
      <thead>
        <tr><th scope="col">Fecha</th><th scope="col">Evento</th><th scope="col">Juego</th></tr>
      </thead>
      <tbody>
        {torneos.map((t) => (
          <tr key={t.slug}>
            <td className="history__date">{fechaCorta(t.fecha)}</td>
            <td className="history__event">
              <SerieChip serie={t.serie} />
              <Link href={`/torneos/${t.slug}`}>{t.nombre}</Link>
              {t.sede && <small>{t.sede}</small>}
            </td>
            <td className="history__game">{[...new Set(t.events.map((e) => e.juego))].join(", ") || "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
