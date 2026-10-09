"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { fechaCorta } from "@/lib/format";
import type { Video } from "@/lib/db";
import { cambiarVisibilidadVideo, traerVideos } from "../acciones";

export function VideosAdmin({ videos }: { videos: Video[] }) {
  const router = useRouter();
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);
  const [trayendo, startTraer] = useTransition();

  function traer() {
    setMensaje(null);
    startTraer(async () => {
      const r = await traerVideos();
      if (r.ok) {
        setMensaje({ ok: true, texto: `Listo: ${r.nuevos} ${r.nuevos === 1 ? "video nuevo" : "videos nuevos"}, ${r.partidas} partidas detectadas en el canal.` });
        router.refresh();
      } else setMensaje({ ok: false, texto: r.mensaje });
    });
  }

  return (
    <div className="admin-cuentas">
      <div className="actions">
        <button type="button" className="btn btn--p2" onClick={traer} disabled={trayendo}>
          {trayendo ? "Trayendo…" : "Traer videos de YouTube"}
        </button>
      </div>
      {mensaje && <p className={mensaje.ok ? "admin-ok" : "aviso"} role={mensaje.ok ? "status" : "alert"}>{mensaje.texto}</p>}
      {videos.length > 0 ? (
        <table className="history__table">
          <thead>
            <tr><th scope="col">Fecha</th><th scope="col">Video</th><th scope="col"><span className="sr-only">Acciones</span></th></tr>
          </thead>
          <tbody>{videos.map((v) => <FilaVideo key={v.id} video={v} />)}</tbody>
        </table>
      ) : (
        <p className="admin-nota">Todavía no se trajo ningún video.</p>
      )}
    </div>
  );
}

function FilaVideo({ video }: { video: Video }) {
  const router = useRouter();
  const [ocupado, startTransition] = useTransition();
  const lado = (l?: Video["a"]) => (l ? `${l.nombre}${l.jugador ? "" : " (sin perfil)"}` : "");
  return (
    <tr aria-busy={ocupado} style={video.oculto ? { opacity: .5 } : undefined}>
      <td className="history__date">{fechaCorta(video.publicado)}</td>
      <td>
        <a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener">{video.titulo}</a>
        <span className="admin-nota">
          {" · "}
          {video.esPartida ? `Partida: ${lado(video.a)} vs ${lado(video.b)}${video.torneo ? "" : " · sin torneo"}` : "No es partida (no aparece en el sitio)"}
          {video.oculto && " · oculto"}
        </span>
      </td>
      <td className="admin-torneos__acciones">
        {video.esPartida && (
          <button type="button" className="admin-boton" disabled={ocupado}
            onClick={() => startTransition(async () => { await cambiarVisibilidadVideo(video.id, !video.oculto); router.refresh(); })}>
            {video.oculto ? "Mostrar" : "Ocultar"}
          </button>
        )}
      </td>
    </tr>
  );
}
