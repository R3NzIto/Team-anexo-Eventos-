const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** "2026-04-24" → "24 abr 2026"; "2026" → "2026"; ISO con hora → "24 abr 2026". */
export function fechaCorta(fecha: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(fecha);
  if (!m) return fecha;
  return `${Number(m[3])} ${MESES[Number(m[2]) - 1]} ${m[1]}`;
}

/** "sábado 14 de noviembre · 16:30 h" en hora de Mendoza. */
export function fechaLarga(fecha: string): string {
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime()) || fecha.length <= 10) return fechaCorta(fecha);
  const dia = d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", timeZone: "America/Argentina/Mendoza" });
  const hora = d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "America/Argentina/Mendoza" });
  return `${dia} · ${hora} h`;
}

/** Fecha comparable aunque solo se conozca el año (se ubica al final de ese año). */
export function fechaOrdenable(fecha: string): number {
  // Solo el año: cuenta como 1° de enero, así no aparece arriba de torneos de ese año con fecha conocida.
  if (/^\d{4}$/.test(fecha)) return Date.UTC(Number(fecha), 0, 1);
  const t = Date.parse(fecha);
  return Number.isNaN(t) ? 0 : t;
}

export function urlStartgg(slug: string): string {
  return `https://www.start.gg/tournament/${slug}`;
}
