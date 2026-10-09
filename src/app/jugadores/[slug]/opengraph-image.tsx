/* eslint-disable @next/next/no-img-element -- ImageResponse dibuja con <img>; next/image no aplica acá. */
import { ImageResponse } from "next/og";
import { getJugador, getRanking } from "@/lib/data";
import { COLORES as C, TAMANO_OG, fuentesOg, iconoOg, logoOg } from "@/lib/og";

export const alt = "Perfil de jugador en Team Anexo";
export const size = TAMANO_OG;
export const contentType = "image/png";

/** Tarjeta para compartir el perfil: personaje, gamertag y su lugar en la Premier. Lado P1: amarillo y tinta. */
export default async function Imagen({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getJugador(slug);
  const [fuentes, logo] = await Promise.all([fuentesOg(), logoOg(C.ink)]);

  const jugador = data?.jugador;
  const historial = data?.historial ?? [];
  const temporada = historial.find((h) => h.torneo.serie === "premier")?.torneo.temporada;
  const fila = temporada && jugador ? (await getRanking("premier", temporada)).find((f) => f.jugador.id === jugador.id) : undefined;
  const icono = await iconoOg(jugador?.personaje);
  const nombre = jugador?.gamerTag ?? "Jugador";
  // Rubik Black en mayúsculas ocupa ~0,72 em por letra: el nombre entra siempre en ~680 px, antes de la franja.
  const grande = Math.max(48, Math.min(128, Math.floor(680 / (nombre.length * 0.72))));

  const datos = [
    fila ? { valor: `${fila.posicion}°`, nombre: `Premier ${temporada}` } : null,
    fila ? { valor: String(fila.puntos), nombre: "Puntos" } : null,
    { valor: String(historial.length), nombre: historial.length === 1 ? "Torneo" : "Torneos" },
  ].filter((d): d is { valor: string; nombre: string } => d !== null);

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: C.yellow, color: C.ink, fontFamily: "Rubik", position: "relative" }}>
        {/* Franja de tinta en diagonal, el ángulo del logo */}
        <div style={{ position: "absolute", right: -120, top: -40, width: 520, height: 760, background: C.ink, transform: "skewX(-12deg)", display: "flex" }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "56px 64px", width: 820 }}>
          <img src={logo} width={190} height={66} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            {jugador?.prefijo && <div style={{ fontSize: 34, fontWeight: 500, opacity: 0.7 }}>{jugador.prefijo}</div>}
            <div style={{ fontSize: grande, fontWeight: 900, lineHeight: 0.95, letterSpacing: -3, textTransform: "uppercase" }}>{nombre}</div>
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            {datos.map((d) => (
              <div key={d.nombre} style={{ display: "flex", flexDirection: "column", background: C.ink, color: C.yellow, padding: "16px 22px" }}>
                <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1 }}>{d.valor}</div>
                <div style={{ fontSize: 20, fontWeight: 900, textTransform: "uppercase", letterSpacing: 2, marginTop: 6 }}>{d.nombre}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: "absolute", right: 70, top: 150, display: "flex", width: 300, height: 300, alignItems: "center", justifyContent: "center" }}>
          {icono ? <img src={icono} width={288} height={288} alt="" style={{ imageRendering: "pixelated" }} /> : (
            <div style={{ display: "flex", fontSize: 220, fontWeight: 900, color: C.yellow }}>{nombre.slice(0, 1).toUpperCase()}</div>
          )}
        </div>
      </div>
    ),
    { ...TAMANO_OG, fonts: fuentes },
  );
}
