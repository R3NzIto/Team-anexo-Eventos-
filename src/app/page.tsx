import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { SelectPanel } from "@/components/SelectPanel";
import { Podio } from "@/components/Podio";
import { GrillaPartidas, getPartidasInicio } from "@/components/Partidas";
import { RankingTable, RankingVacio } from "@/components/Ranking";
import { HistorialTable } from "@/components/Torneo";
import { getPasados, getPodioUltimaFecha, getProximos, getRanking, getResultadosDestacados, getTemporadas, type Podio as DatosPodio } from "@/lib/data";
import { fechaLarga, urlStartgg } from "@/lib/format";
import { LINKS, REDES, SOCIOS } from "@/lib/site";
import type { Torneo } from "@/lib/types";

export default async function Home() {
  const [proximos, pasados, resultados, temporadas, podio] = await Promise.all([
    getProximos(),
    getPasados(),
    getResultadosDestacados(),
    getTemporadas("premier"),
    getPodioUltimaFecha("premier"),
  ]);
  const partidas = await getPartidasInicio(4);
  const proximo = proximos[0];
  const temporada = temporadas[0] ?? 2026;
  const ranking = await getRanking("premier", temporada);

  return (
    <>
      <section className="select" aria-label="Elegí tu camino">
        <SelectPanel lado="p1" href="#competir">
          <Image className="panel__photo" src="/assets/img/p1-competir.jpg" alt="" width={1258} height={947} priority sizes="62vw" />
          <div className="panel__body">
            <p className="player"><span className="player__p">P1</span><span className="player__state" aria-hidden="true">Ready</span></p>
            <h1 className="panel__title">Quiero<br />competir</h1>
            <ProximoCompacto torneo={proximo} />
            <div className="actions">
              {proximo ? (
                <Link className="btn btn--p1" href={`/torneos/${proximo.slug}`}>Inscribirme</Link>
              ) : (
                <a className="btn btn--p1" href={LINKS.grupoWhatsapp} target="_blank" rel="noopener">
                  <Icon name="whatsapp" className="btn__icon" />
                  Unirme al grupo
                </a>
              )}
              <Link className="link-arrow" href="/jugadores">Ranking y jugadores<Icon name="arrow" className="link-arrow__icon" /></Link>
            </div>
          </div>
        </SelectPanel>

        <SelectPanel lado="p2" href="#organizar">
          <Image className="panel__photo" src="/assets/img/p2-organizar.jpg" alt="" width={1430} height={947} sizes="62vw" />
          <div className="panel__body">
            <p className="player"><span className="player__p">P2</span><span className="player__state" aria-hidden="true">Ready</span></p>
            <h2 className="panel__title">Llevá la competencia a tu espacio</h2>
            <p className="panel__lead">Torneos, zonas free-to-play y transmisión en vivo para convenciones, municipios y locales.</p>
            <ul className="mini-partners" aria-label="Algunos eventos con los que trabajamos">
              {SOCIOS.filter((s) => ["Mendotaku", "Multigeek", "Game Mania Fest", "Akiba Fest"].includes(s.alt)).map((s) => (
                <li key={s.alt}><Image src={s.src} alt={s.alt} width={s.w} height={s.h} /></li>
              ))}
            </ul>
            <div className="actions">
              <a className="btn btn--p2" href={LINKS.contactoWhatsapp} target="_blank" rel="noopener">
                <Icon name="whatsapp" className="btn__icon" />
                Contactar
              </a>
              <Link className="link-arrow" href="#organizar">Qué hacemos<Icon name="arrow" className="link-arrow__icon" /></Link>
            </div>
          </div>
        </SelectPanel>

        <div className="vs" aria-hidden="true">
          <Image src="/assets/logos/anexo-avatar.png" alt="" width={512} height={512} />
          <span className="vs__text">VS</span>
        </div>
      </section>

      {/* Ruta P1 */}
      <section className="route route--p1" id="competir" aria-labelledby="competir-title">
        <header className="route__head">
          <span className="route__tag">P1</span>
          <h2 id="competir-title" className="route__title">Competí con nosotros</h2>
        </header>

        <ProximoBloque torneo={proximo} podio={podio} />

        <div className="league">
          <div className="league__intro">
            <Image className="league__logo" src="/assets/img/series/premier-logo.png" alt="" width={450} height={600} />
            <div>
              <h3 className="league__title">Premier Smash League</h3>
              <p>
                Nuestra liga de Super Smash Bros Ultimate, el juego con más jugadores en la comunidad. Cada fecha suma puntos
                para el ranking de la temporada, y como sede de Smash Bros Argentina, también para el ranking nacional.
              </p>
              <div className="actions">
                <Link className="btn btn--p2" href="/premier">Ver la liga</Link>
                <Link className="link-arrow" href="/jugadores">Ranking completo<Icon name="arrow" className="link-arrow__icon" /></Link>
              </div>
            </div>
          </div>
          <div className="league__ranking">
            <h4 className="league__subtitle">Ranking {temporada}</h4>
            {ranking.length ? <RankingTable filas={ranking} limite={5} /> : <RankingVacio temporada={temporada} />}
          </div>
        </div>

        {partidas.length > 0 && (
          <div className="partidas-bloque">
            <div className="section-head">
              <h3 className="block-title">Partidas</h3>
              <a className="link-arrow" href={LINKS.youtubeReplays} target="_blank" rel="noopener">Ver el canal<Icon name="arrow" className="link-arrow__icon" /></a>
            </div>
            <GrillaPartidas partidas={partidas} destacar />
          </div>
        )}

        <div className="series">
          <h3 className="block-title">También jugamos</h3>
          <article className="serie serie--fgc">
            <Image className="serie__img" src="/assets/img/series/sf6.jpg" alt="Miniatura de un enfrentamiento de Street Fighter 6" width={1200} height={675} sizes="(max-width: 768px) 100vw, 50vw" />
            <div className="serie__text">
              <h4>Street Fighter 6 y KOF XV</h4>
              <p>Torneos de fighting games tradicionales con llaves completas, partidas transmitidas y VODs de las finales.</p>
            </div>
          </article>
          <article className="serie serie--stand">
            <Image className="serie__img" src="/assets/img/eventos/sala-pantallas.jpg" alt="Sala oscura con varias pantallas y jugadores en un evento" width={1258} height={947} sizes="(max-width: 768px) 100vw, 50vw" />
            <div className="serie__text">
              <h4>Stands en eventos</h4>
              <p>Zonas de torneo, free-to-play y retro dentro de convenciones como Mendotaku, Multigeek y Game Mania Fest.</p>
            </div>
          </article>
        </div>

        <div className="results">
          <h3 className="block-title">Resultados</h3>
          <ul className="results__list">
            {resultados.map((r) => (
              <li key={r.titulo}>
                <figure className="result">
                  <Image src={r.imagen} alt={r.alt} width={1080} height={1080} sizes="23rem" />
                  <figcaption>
                    <span className="result__title">{r.titulo}</span>
                    <span className="result__event">{r.evento}</span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>

        <div className="history">
          <h3 className="block-title">Historial</h3>
          <HistorialTable torneos={pasados.slice(0, 6)} />
          <p className="history__more">
            <Link className="link-arrow" href="/torneos">Todos los torneos<Icon name="arrow" className="link-arrow__icon" /></Link>
          </p>
        </div>

        <div className="community" id="comunidad">
          <h3 className="block-title">Comunidad</h3>
          <ul className="community__list">
            {REDES.map((r) => (
              <li key={r.nombre}>
                <a className={`community__item${r.principal ? " community__item--main" : ""}`} href={r.href} target="_blank" rel="noopener">
                  <Icon name={r.icon} />
                  <span>{r.nombre}</span>
                  <small>{r.detalle}</small>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Galeria />

      {/* Ruta P2 */}
      <section className="route route--p2" id="organizar" aria-labelledby="organizar-title">
        <header className="route__head">
          <span className="route__tag">P2</span>
          <h2 id="organizar-title" className="route__title">Llevamos la competencia a tu espacio</h2>
        </header>

        <div className="about">
          <div className="about__text">
            <p className="about__lead">
              Somos una organización de esports de Mendoza dedicada a los fighting games. Producimos torneos con el nivel
              competitivo y humano que la escena necesita, y llevamos esa experiencia a convenciones, municipios y locales.
            </p>
            <dl className="moves">
              <div className="moves__row"><dt>Torneos competitivos</dt><dd>Llaves en start.gg, reglamento, setups y premiación.</dd></div>
              <div className="moves__row"><dt>Free-to-play y retro</dt><dd>Estaciones para que cualquiera juegue sin inscribirse, de Smash a Just Dance.</dd></div>
              <div className="moves__row"><dt>Transmisión en vivo</dt><dd>Stream del evento con overlay y comentaristas, para quienes no pueden ir.</dd></div>
              <div className="moves__row"><dt>Sede Smash Bros Argentina</dt><dd>Torneos que suman al ranking nacional de Super Smash Bros Ultimate.</dd></div>
            </dl>
          </div>
          <Image className="about__photo" src="/assets/img/eventos/arcade-stick.jpg" alt="Estación de juego armada por Team Anexo con joysticks y arcade stick" width={1400} height={1054} sizes="(max-width: 960px) 100vw, 40vw" />
        </div>

        <div className="partners">
          <h3 className="block-title">Hicimos eventos con</h3>
          <ul className="partners__wall">
            {SOCIOS.map((s) => (
              <li key={s.alt} className={s.grande ? "logo-lg" : undefined}>
                <Image src={s.src} alt={s.alt} width={s.w} height={s.h} />
              </li>
            ))}
          </ul>
        </div>

        <div className="federation">
          <Image className="federation__logo" src="/assets/logos/smash-bros-argentina.png" alt="Smash Bros Argentina" width={480} height={480} />
          <div>
            <h3 className="federation__title">Sede mendocina de Smash Bros Argentina</h3>
            <p>
              Smash Bros Argentina es el circuito federal de Super Smash Bros Ultimate, con jugadores de Buenos Aires, Córdoba,
              Santa Fe, Jujuy, Tucumán, Salta y Mendoza compitiendo por el ranking nacional. Team Anexo es su sede en Mendoza.
            </p>
          </div>
        </div>

        <div className="contact">
          <h3 className="contact__title">¿Organizás un evento?</h3>
          <p className="contact__text">Contanos qué tenés en mente: fecha, lugar y público. Armamos la propuesta de torneos y zonas de juego para tu espacio.</p>
          <div className="actions">
            <a className="btn btn--p2 btn--big" href={LINKS.contactoWhatsapp} target="_blank" rel="noopener">
              <Icon name="whatsapp" className="btn__icon" />
              Escribinos por WhatsApp
            </a>
            <a className="btn btn--ghost-light" href={LINKS.instagram} target="_blank" rel="noopener">
              <Icon name="instagram" className="btn__icon" />
              Mensaje en Instagram
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function ProximoCompacto({ torneo }: { torneo?: Torneo }) {
  if (!torneo) {
    return (
      <div className="next">
        <p className="next__title">Próximo torneo: fecha a confirmar</p>
        <p className="next__meta">La anunciamos primero en el grupo de la comunidad.</p>
      </div>
    );
  }
  return (
    <div className="next">
      <p className="next__title">Próximo torneo: {torneo.nombre}</p>
      <p className="next__meta next__date">{[fechaLarga(torneo.fecha), torneo.sede, torneo.valor].filter(Boolean).join(" · ")}</p>
    </div>
  );
}

function ProximoBloque({ torneo, podio }: { torneo?: Torneo; podio?: DatosPodio }) {
  if (!torneo) {
    return (
      <div className={`upcoming${podio ? " upcoming--podio" : ""}`}>
        <div className="upcoming__empty">
          <h3 className="upcoming__title">Estamos armando la próxima fecha</h3>
          <p>Los torneos se anuncian con afiche, sede y link de inscripción. Sumate al grupo o seguinos en Instagram para enterarte primero.</p>
          <div className="actions">
            <a className="btn btn--p1" href={LINKS.grupoWhatsapp} target="_blank" rel="noopener">
              <Icon name="whatsapp" className="btn__icon" />
              Unirme al grupo
            </a>
            <a className="btn btn--ghost" href={LINKS.instagram} target="_blank" rel="noopener">
              <Icon name="instagram" className="btn__icon" />
              @team_anexo.mza
            </a>
          </div>
        </div>
        {podio && (
          <div className="upcoming__podio">
            <p className="upcoming__podio-titulo">
              Último podio · <Link href={`/torneos/${podio.torneo.slug}`}>{podio.torneo.nombre}</Link>
            </p>
            <Podio
              titulo={`Podio de ${podio.torneo.nombre}`}
              lugares={podio.puestos.map((p) => ({ posicion: p.puesto, gamerTag: p.jugador.gamerTag, prefijo: p.jugador.prefijo, personaje: p.personaje, href: `/jugadores/${p.jugador.slug}` }))}
            />
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="upcoming">
      <div className="upcoming__event">
        {torneo.afiche && <Image className="upcoming__poster" src={torneo.afiche} alt={`Afiche de ${torneo.nombre}`} width={675} height={1200} sizes="18rem" />}
        <div className="upcoming__info">
          <h3 className="upcoming__title">{torneo.nombre}</h3>
          <div className="upcoming__facts">
            <p><strong>Fecha: </strong>{fechaLarga(torneo.fecha)}</p>
            {torneo.sede && <p><strong>Sede: </strong>{[torneo.sede, torneo.direccion].filter(Boolean).join(", ")}</p>}
            {torneo.valor && <p><strong>Inscripción: </strong>{torneo.valor}</p>}
          </div>
          <div className="actions">
            {torneo.slugStartgg && (
              <a className="btn btn--p1" href={`${urlStartgg(torneo.slugStartgg)}/register`} target="_blank" rel="noopener">Inscribirme en start.gg</a>
            )}
            <Link className="btn btn--ghost" href={`/torneos/${torneo.slug}`}>Ver torneo</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const FOTOS = [
  { src: "equipo-stand.jpg", alt: "El equipo de Team Anexo detrás de las pantallas de un torneo en un galpón", w: 1400, h: 927 },
  { src: "publico-galpon.jpg", alt: "Jugadores con remeras de Team Anexo y credenciales mirando una partida", w: 627, h: 947 },
  { src: "premier-setup.jpg", alt: "Cartel de la Premier Smash League junto a un monitor con Smash Bros", w: 1080, h: 1080 },
  { src: "local-partidas.jpg", alt: "Jugadores compitiendo frente a dos monitores en un local", w: 1258, h: 947 },
  { src: "escenario-luces.jpg", alt: "Escenario con luces violetas y una partida proyectada", w: 713, h: 947 },
  { src: "ragnarok.jpg", alt: "Un jugador sostiene la remera de Team Anexo en un torneo", w: 1400, h: 927 },
  { src: "equipo-noche.jpg", alt: "Integrantes de Team Anexo de noche en un evento al aire libre", w: 1400, h: 1054 },
  { src: "las-heras-2023.jpg", alt: "Un chico juega con arcade stick en el evento de Las Heras", w: 1400, h: 1050 },
  { src: "planeta-comics.jpg", alt: "Jugador sonriendo en Planeta Comics frente a una partida", w: 1050, h: 1400 },
  { src: "carpa-torneo.jpg", alt: "Público dentro de una carpa siguiendo un torneo", w: 1054, h: 1400 },
];

function Galeria() {
  return (
    <section className="gallery" aria-labelledby="galeria-title">
      <h2 id="galeria-title" className="gallery__title">Así se juega en Mendoza</h2>
      <ul className="gallery__grid">
        {FOTOS.map((f) => (
          <li key={f.src}>
            <Image src={`/assets/img/eventos/${f.src}`} alt={f.alt} width={f.w} height={f.h} sizes="(max-width: 768px) 50vw, 25vw" />
          </li>
        ))}
      </ul>
    </section>
  );
}
