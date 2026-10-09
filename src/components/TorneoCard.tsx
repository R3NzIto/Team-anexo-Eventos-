import Image from "next/image";
import Link from "next/link";
import { Logo } from "./Logo";
import { SerieChip } from "./Torneo";
import { fechaCorta } from "@/lib/format";
import type { Torneo } from "@/lib/types";

export function TorneoCard({ torneo }: { torneo: Torneo }) {
  const inscriptos = torneo.events.reduce((n, e) => Math.max(n, e.inscriptos ?? e.standings.length), 0);
  return (
    <Link className="tcard" href={`/torneos/${torneo.slug}`}>
      <div className="tcard__media">
        {torneo.afiche ? (
          <Image src={torneo.afiche} alt="" width={675} height={1200} sizes="(max-width: 768px) 8rem, 20rem" />
        ) : (
          <Logo />
        )}
      </div>
      <div className="tcard__body">
        <p><SerieChip serie={torneo.serie} /></p>
        <p className="tcard__title">{torneo.nombre}</p>
        <p className="tcard__meta">
          {[fechaCorta(torneo.fecha), torneo.sede, inscriptos ? `${inscriptos} jugadores` : null].filter(Boolean).join(" · ")}
        </p>
      </div>
    </Link>
  );
}
