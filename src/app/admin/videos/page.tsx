import { leerVideos } from "@/lib/db";
import { VideosAdmin } from "./VideosAdmin";

/** Pestaña Videos: traer del canal de YouTube y elegir cuáles se muestran. El permiso lo verifica el layout. */
export default async function AdminVideosPage() {
  const videos = await leerVideos();
  return (
    <section aria-labelledby="videos-title">
      <h2 id="videos-title" className="section-title">Videos de YouTube</h2>
      <p className="admin-nota admin-intro">
        Se traen los últimos videos del canal. Los que en el título dicen &quot;Jugador (Personaje) VS Jugador (Personaje)&quot; se
        vinculan solos al torneo y a los perfiles, y aparecen en el inicio, en el torneo y en el perfil de cada uno.
        Subí los VODs con ese formato y después tocá &quot;Traer videos&quot;.
      </p>
      <VideosAdmin videos={videos} />
    </section>
  );
}
