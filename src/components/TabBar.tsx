"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";

/*
  Barra de abajo en el celular: las cuatro secciones siempre a mano con el pulgar.
  Ninguna queda escondida y P2 (organizadores) se ve igual que P1. En compu no se muestra:
  ahí está el menú de arriba.
*/

const SECCIONES = [
  { href: "/premier", base: "/premier", etiqueta: "Premier", icono: <Icon name="corona" className="tabbar__icono" /> },
  { href: "/torneos", base: "/torneos", etiqueta: "Torneos", icono: <Icon name="copa" className="tabbar__icono" /> },
  { href: "/jugadores", base: "/jugadores", etiqueta: "Jugadores", icono: <span className="tabbar__placa tabbar__placa--p1">P1</span> },
  { href: "/#organizar", base: null, etiqueta: "Organizar", icono: <span className="tabbar__placa tabbar__placa--p2">P2</span> },
];

export function TabBar() {
  return <Barra actual={usePathname()} />;
}

/** La barra sin saber la página (mientras carga): mismos links, ninguno marcado. */
export function Barra({ actual }: { actual: string | null }) {
  return (
    <nav className="tabbar" aria-label="Secciones">
      {SECCIONES.map((s) => {
        const activa = !!actual && !!s.base && (actual === s.base || actual.startsWith(`${s.base}/`));
        return (
          <Link key={s.href} href={s.href} className={`tabbar__item${activa ? " tabbar__item--activa" : ""}`} aria-current={activa ? "page" : undefined}>
            {s.icono}
            <span className="tabbar__etiqueta">{s.etiqueta}</span>
          </Link>
        );
      })}
    </nav>
  );
}
