"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

/** Panel de la pantalla de selección: tocar el fondo lleva a la ruta del jugador. */
export function SelectPanel({ lado, href, children }: { lado: "p1" | "p2"; href: string; children: ReactNode }) {
  const router = useRouter();
  return (
    <div
      className={`panel panel--${lado}`}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a, button")) return;
        router.push(href);
      }}
    >
      {children}
    </div>
  );
}
