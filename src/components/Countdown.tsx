"use client";

import { useEffect, useState } from "react";

function partes(hasta: number) {
  const diff = Math.max(0, hasta - Date.now());
  return { d: Math.floor(diff / 864e5), h: Math.floor(diff / 36e5) % 24, m: Math.floor(diff / 6e4) % 60 };
}

export function Countdown({ fecha }: { fecha: string }) {
  const hasta = new Date(fecha).getTime();
  const [t, setT] = useState<ReturnType<typeof partes> | null>(null);

  useEffect(() => {
    const tick = () => setT(partes(hasta));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [hasta]);

  if (!t) return <div className="countdown" aria-hidden="true" />;
  return (
    <div className="countdown" role="timer" aria-label={`Faltan ${t.d} días, ${t.h} horas y ${t.m} minutos`}>
      <span>{t.d}<small>{t.d === 1 ? "DÍA" : "DÍAS"}</small></span>
      <span>{t.h}<small>HS</small></span>
      <span>{t.m}<small>MIN</small></span>
    </div>
  );
}
