-- Esquema de la base de Team Anexo (Neon Postgres).
-- Se aplica con: npm run db:migrar  (es idempotente, se puede correr varias veces).

create table if not exists series (
  id          text primary key,
  nombre      text not null,
  corto       text not null,
  juego       text not null,
  activa      boolean not null default true,
  rankeable   boolean not null default false,
  -- Tabla de puntos: [{ "desde": 1, "puntos": 100 }, ...]
  puntos      jsonb,
  descripcion text not null default '',
  orden       int not null default 0
);

create table if not exists torneos (
  slug                text primary key,
  nombre              text not null,
  serie               text not null references series(id),
  -- ISO completo, "AAAA-MM-DD" o solo "AAAA"
  fecha               text not null,
  temporada           int not null,
  sede                text,
  direccion           text,
  valor               text,
  afiche              text,
  slug_startgg        text unique,
  inscripcion_abierta boolean not null default false,
  actualizado         timestamptz not null default now()
);

create table if not exists eventos (
  id           serial primary key,
  torneo       text not null references torneos(slug) on delete cascade on update cascade,
  orden        int not null default 0,
  nombre       text not null,
  juego        text not null,
  slug_startgg text,
  inscriptos   int,
  suma_ranking boolean not null default false
);
create index if not exists eventos_torneo on eventos(torneo);

create table if not exists standings (
  evento     int not null references eventos(id) on delete cascade,
  puesto     int not null,
  -- "sgg:<id de jugador de start.gg>", un slug local o "equipo:<slug>" en dobles
  jugador    text not null,
  gamer_tag  text not null,
  personaje  text,
  -- Games jugados con cada personaje: { "corrin": 12, "byleth": 3 }
  personajes jsonb,
  primary key (evento, jugador)
);
create index if not exists standings_jugador on standings(jugador);

create table if not exists jugadores (
  id           text primary key,
  slug         text not null unique,
  gamer_tag    text not null,
  prefijo      text,
  -- Main elegido a mano; si es null se calcula con los personajes reportados
  personaje    text,
  slug_startgg text
);

-- Cuentas duplicadas: la secundaria suma a la principal.
create table if not exists alias (
  secundario text primary key,
  principal  text not null
);

create table if not exists resultados (
  id     serial primary key,
  titulo text not null,
  evento text not null,
  imagen text not null,
  alt    text not null,
  orden  int not null default 0
);

-- Cuentas del sitio. Se entra con start.gg (y más adelante con Google).
create table if not exists usuarios (
  id               serial primary key,
  startgg_user_id  text unique,
  google_sub       text unique,
  email            text,
  nombre           text not null,
  imagen           text,
  -- Perfil de jugador vinculado: "sgg:<id de jugador de start.gg>"
  jugador          text,
  -- "miembro" o "admin"
  rol              text not null default 'miembro',
  creado           timestamptz not null default now(),
  ultimo_ingreso   timestamptz not null default now()
);

-- Campos de un torneo editados a mano en el panel ("nombre", "sede"…):
-- al actualizar desde start.gg se conservan.
alter table torneos add column if not exists campos_manuales text[] not null default '{}';

-- Imágenes subidas desde el panel (afiches). Se guardan en base64 y se sirven en /imagenes/<id>.
create table if not exists imagenes (
  id     text primary key,
  tipo   text not null,
  datos  text not null,
  creado timestamptz not null default now()
);

-- Videos del canal de YouTube. Se traen del feed del canal (panel → Videos) y,
-- si el título es una partida ("A (Personaje) VS B (Personaje)"), se vinculan
-- solos con el torneo y los perfiles de los dos jugadores.
create table if not exists videos (
  id          text primary key,              -- id de YouTube
  titulo      text not null,
  publicado   timestamptz not null,
  vistas      int,
  juego       text,                          -- "smash", "sf6", "kof" o null
  torneo      text references torneos(slug) on delete set null on update cascade,
  es_partida  boolean not null default false,
  nombre_a    text, jugador_a text, personaje_a text,
  nombre_b    text, jugador_b text, personaje_b text,
  oculto      boolean not null default false,
  actualizado timestamptz not null default now()
);
create index if not exists videos_torneo on videos(torneo);

-- Ronda de la partida ("Gran final", "Semifinal de winners"…) y evento cuando
-- no se pudo vincular a un torneo cargado (p. ej. "SF6 #2").
alter table videos add column if not exists ronda text;
alter table videos add column if not exists evento text;
