"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { Logo } from "./Logo";

/*
  Movimiento del sitio. Todo parte visible: si el JavaScript falla o la persona
  pidió menos movimiento, la página se ve completa y quieta.
*/

const quieto = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Cambio de página = cambio de round: la pantalla se cubre de amarillo y dos placas
 * diagonales (P1 amarillo, P2 violeta) barren hacia la derecha descubriendo la página nueva.
 * No corre en el panel de admin, que es para trabajar.
 */
export function TransicionRonda() {
  const ruta = usePathname();
  const previa = useRef(ruta);
  const ref = useRef<HTMLDivElement>(null);

  // Antes de pintar la página nueva, así nunca se ve el corte en seco.
  useLayoutEffect(() => {
    const desde = previa.current;
    previa.current = ruta;
    const el = ref.current;
    if (!el || desde === ruta || quieto()) return;
    if (ruta.startsWith("/admin") || desde.startsWith("/admin")) return;
    // Cubre la pantalla y espera a que la página nueva tenga su contenido
    // (sin bloques "cargando") antes de barrer; tope de 1,5 s.
    el.dataset.estado = "cubrir";
    const inicio = performance.now();
    let cuadro = 0;
    const esperar = () => {
      const cargando = document.querySelector('main [aria-busy="true"]');
      if (cargando && performance.now() - inicio < 1500) {
        cuadro = requestAnimationFrame(esperar);
        return;
      }
      el.dataset.estado = "barrer";
    };
    cuadro = requestAnimationFrame(esperar);
    return () => cancelAnimationFrame(cuadro);
  }, [ruta]);

  return (
    <div ref={ref} className="ronda" aria-hidden="true" onAnimationEnd={(e) => {
      if (e.target === e.currentTarget && e.currentTarget.dataset.estado === "barrer") e.currentTarget.removeAttribute("data-estado");
    }}>
      <span className="ronda__p2" />
      <span className="ronda__p1" />
      <span className="ronda__logo"><Logo /></span>
    </div>
  );
}

/**
 * Marca un bloque para que se anime cuando entra en pantalla (filas de ranking,
 * tarjetas). Solo lo oculta si el JavaScript corrió y la persona no pidió menos movimiento.
 */
export function Revelar({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || quieto()) return;
    el.dataset.revelar = "pendiente";
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      el.dataset.revelar = "listo";
      io.disconnect();
    }, { threshold: 0, rootMargin: "0px 0px -8% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={className} style={style}>{children}</div>;
}

/** Número que cuenta desde 0 cuando aparece en pantalla, como un marcador. */
export function Contador({ valor, retraso = 0, duracion = 900 }: { valor: number; retraso?: number; duracion?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || quieto() || valor <= 0) return;
    el.textContent = "0";
    let cuadro = 0;
    let espera = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      espera = window.setTimeout(() => {
        const inicio = performance.now();
        const paso = (t: number) => {
          const k = Math.min(1, (t - inicio) / duracion);
          el.textContent = String(Math.round(valor * (1 - Math.pow(1 - k, 4))));
          if (k < 1) cuadro = requestAnimationFrame(paso);
        };
        cuadro = requestAnimationFrame(paso);
      }, retraso);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(espera);
      cancelAnimationFrame(cuadro);
      el.textContent = String(valor);
    };
  }, [valor, retraso, duracion]);
  return <span ref={ref}>{valor}</span>;
}
