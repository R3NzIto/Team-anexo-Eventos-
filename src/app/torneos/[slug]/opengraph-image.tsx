/* eslint-disable @next/next/no-img-element -- ImageResponse dibuja con <img>; next/image no aplica acá. */
import { ImageResponse } from "next/og";
import { getJugadores, getProximos, getTorneo } from "@/lib/data";
import { fechaLarga } from "@/lib/format";
import { COLORES as C, TAMANO_OG, fuentesOg, iconoOg, logoOg } from "@/lib/og";

export const alt = "Torneo de Team Anexo";
export const size = TAMANO_OG;
export const contentType = "image/png";

/**
 * Tarjeta para compartir un torneo. Si ya se jugó, muestra el podio; si viene, la fecha y la sede.
 * La Premier va en violeta (lado P2 de la marca); el resto en carbón.
 */
export default async function Imagen({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [torneo, proximos, jugadores, fuentes, logo] = await Promise.all([
    getTorneo(slug), getProximos(), getJugadores(), fuentesOg(), logoOg(C.white),
  ]);
  const premier = torneo?.serie === "premier";
  const fondo = premier ? C.purpleDeep : C.carbon;
  const proximo = proximos.some((t) => t.slug === slug);
  const evento = torneo?.events.find((e) => e.sumaRanking && e.standings.length) ?? torneo?.events.find((e) => e.standings.length);
  const porId = new Map(jugadores.map((j) => [j.id, j]));
  const podio = proximo || !evento ? [] : await Promise.all(
    evento.standings.filter((s) => s.puesto <= 3).slice(0, 3).map(async (s) => ({
      puesto: s.puesto,
      nombre: s.gamerTag,
      icono: await iconoOg(s.personaje ?? porId.get(s.jugador)?.personaje),
    })),
  );
  const nombre = torneo?.nombre ?? "Torneo";
  const inscriptos = Math.max(0, ...(torneo?.events.map((e) => e.inscriptos ?? e.standings.length) ?? [0]));
  const linea = [torneo ? fechaLarga(torneo.fecha) : null, torneo?.sede, inscriptos ? `${inscriptos} jugadores` : null].filter(Boolean).join(" · ");
  const alturas = [190, 140, 105];
  const colores = [C.yellow, C.white, "#2A2A2A"];
  const tinta = [C.ink, C.purpleDeep, C.white];

  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: fondo, color: C.white, fontFamily: "Rubik", padding: "52px 64px", position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <img src={logo} width={170} height={59} alt="" />
          <div style={{ display: "flex", background: proximo ? C.yellow : C.white, color: proximo ? C.ink : fondo, fontSize: 24, fontWeight: 900, padding: "8px 16px", textTransform: "uppercase", letterSpacing: 2 }}>
            {proximo ? "Inscripción abierta" : premier ? "Premier Smash League" : "Resultados"}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 30, maxWidth: podio.length ? 560 : 1060 }}>
          <div style={{ fontSize: nombre.length > 26 ? 60 : 76, fontWeight: 900, lineHeight: 0.98, letterSpacing: -2, textTransform: "uppercase" }}>{nombre}</div>
          <div style={{ fontSize: 28, fontWeight: 500, color: premier ? C.lilac : C.mute, marginTop: 18 }}>{linea}</div>
        </div>
        {podio.length > 0 && (
          <div style={{ position: "absolute", right: 64, bottom: 0, display: "flex", alignItems: "flex-end", gap: 12 }}>
            {[1, 0, 2].filter((i) => podio[i]).map((i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 172 }}>
                {podio[i].icono ? <img src={podio[i].icono} width={i === 0 ? 120 : 96} height={i === 0 ? 120 : 96} alt="" /> : <div style={{ display: "flex", height: 96 }} />}
                <div style={{ fontSize: 24, fontWeight: 900, marginTop: 8, marginBottom: 10, maxWidth: 172, textAlign: "center" }}>{podio[i].nombre}</div>
                <div style={{ display: "flex", justifyContent: "center", width: "100%", height: alturas[i], background: colores[i], color: tinta[i], fontSize: 64, fontWeight: 900, paddingTop: 10 }}>{podio[i].puesto}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    ),
    { ...TAMANO_OG, fonts: fuentes },
  );
}
