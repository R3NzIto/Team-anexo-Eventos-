"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", nombre: "Torneos" },
  { href: "/admin/puntos", nombre: "Puntos" },
  { href: "/admin/jugadores", nombre: "Jugadores" },
];

export function TabsAdmin() {
  const ruta = usePathname();
  return (
    <nav className="tabs admin-tabs" aria-label="Secciones del panel">
      {TABS.map((t) => (
        <Link key={t.href} href={t.href} aria-current={ruta === t.href ? "page" : undefined}>{t.nombre}</Link>
      ))}
    </nav>
  );
}
