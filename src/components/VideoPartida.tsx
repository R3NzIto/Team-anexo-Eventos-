"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { StockIcon } from "./Ranking";

export type LadoPartida = { nombre: string; slug?: string; personaje?: string };
export type DatosPartida = {
  id: string;
  titulo: string;
  fecha: string;
  a: LadoPartida;
  b: LadoPartida;
  torneo?: { nombre: string; slug: string };
  /** Es la gran final del torneo (se marca en la tarjeta). */
  esFinal?: boolean;
  /** "Semifinal de winners"…; y el evento cuando no hay torneo cargado ("SF6 #2"). */
  ronda?: string;
  evento?: string;
};

const embed = (id: string, extra: string) => `https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1&${extra}`;

/**
 * Una partida del canal. La miniatura del canal ya trae su propia pantalla de pelea;
 * abajo van los dos jugadores con su personaje, enlazados a sus perfiles.
 * El video de YouTube recién se carga al tocar (no pesa en el celular).
 * La destacada arranca sola, en silencio y en loop, cuando se ve en pantalla en compu.
 */
export function VideoPartida({ partida, destacada = false, fecha }: { partida: DatosPartida; destacada?: boolean; fecha: string }) {
  const [modo, setModo] = useState<"miniatura" | "vista" | "reproduciendo">("miniatura");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!destacada || !ref.current) return;
    const puede = matchMedia("(min-width: 60rem) and (prefers-reduced-motion: no-preference)").matches
      && !(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (!puede) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setModo((m) => (m === "miniatura" ? "vista" : m)); io.disconnect(); }
    }, { threshold: 0.5 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [destacada]);

  const { a, b } = partida;
  const titulo = `${a.nombre} vs ${b.nombre}`;

  return (
    <article className={`partida${destacada ? " partida--destacada" : ""}`}>
      <div ref={ref} className="partida__media">
        {modo === "miniatura" ? (
          <button type="button" className="partida__play" onClick={() => setModo("reproduciendo")} aria-label={`Ver ${titulo}`}>
            <Image className="partida__miniatura" src={`https://i.ytimg.com/vi/${partida.id}/${destacada ? "sddefault" : "hqdefault"}.jpg`} alt="" width={destacada ? 640 : 480} height={destacada ? 480 : 360}
              sizes={destacada ? "(max-width: 960px) 100vw, 46rem" : "(max-width: 960px) 100vw, 22rem"} />
            <span className="partida__boton" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </span>
          </button>
        ) : (
          <iframe
            src={modo === "vista" ? embed(partida.id, `autoplay=1&mute=1&loop=1&playlist=${partida.id}`) : embed(partida.id, "autoplay=1")}
            title={partida.titulo}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        )}
      </div>
      <div className="partida__info">
        <p className="partida__jugadores">
          <Lado lado={a} />
          <span className="partida__contra">vs</span>
          <Lado lado={b} />
        </p>
        <p className="partida__meta">
          {partida.esFinal ? <span className="partida__final">Gran final</span> : partida.ronda && <span className="partida__ronda">{partida.ronda}</span>}
          {partida.torneo ? <Link href={`/torneos/${partida.torneo.slug}`}>{partida.torneo.nombre}</Link> : partida.evento ?? "Team Anexo"}
          {" · "}{fecha}
        </p>
      </div>
    </article>
  );
}

function Lado({ lado }: { lado: LadoPartida }) {
  const contenido = <>{lado.personaje && <StockIcon personaje={lado.personaje} size={28} />}{lado.nombre}</>;
  return lado.slug
    ? <Link className="partida__lado" href={`/jugadores/${lado.slug}`}>{contenido}</Link>
    : <span className="partida__lado">{contenido}</span>;
}
