"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", nombre: "Torneos" },
  { href: "/admin/puntos", nombre: "Puntos" },
  { href: "/admin/jugadores", nombre: "Jugadores" },
];

/** "Torneos" también queda marcada al crear o editar un torneo (/admin/torneos/…). */
const activa = (ruta: string, href: string) => ruta === href || (href === "/admin" && ruta.startsWith("/admin/torneos"));

export function TabsAdmin() {
  const ruta = usePathname();
  return (
    <nav className="tabs admin-tabs" aria-label="Secciones del panel">
      {TABS.map((t) => (
        <Link key={t.href} href={t.href} aria-current={activa(ruta, t.href) ? "page" : undefined}>{t.nombre}</Link>
      ))}
    </nav>
  );
}
