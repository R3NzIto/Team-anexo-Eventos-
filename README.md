# Team Anexo · sitio web

Sitio de Team Anexo, productores de eventos de fighting games en Mendoza. Hecho con Next.js 16, publicado en Vercel y con los datos en una base Postgres de Neon.

## Páginas

| Ruta | Qué muestra |
|---|---|
| `/` | Info general: pantalla P1/P2, próximo torneo, Premier, resultados, galería, socios y contacto |
| `/premier` | La Premier Smash League: ranking de la temporada, ediciones, tabla de puntos y reglamento |
| `/jugadores` | Zona de jugadores: próximos torneos, ranking y lista de perfiles |
| `/jugadores/[slug]` | Perfil de un jugador con su historial y puntos |
| `/torneos` y `/torneos/[slug]` | Próximos y pasados; el detalle tiene la inscripción de start.gg embebida y los resultados |
| `/ranking/[serie]/[temporada]` | Ranking completo por serie y temporada |

## Trabajar en tu compu

```bash
npm install
npm run dev        # http://localhost:3000
```

Necesitás un archivo `.env.local` (copiá `.env.example`) con:

- `DATABASE_URL`: la conexión a la base. Está en Vercel → proyecto → Storage → team-anexo-db → pestaña ".env.local".
- `STARTGG_TOKEN`: solo para importar torneos (ver abajo).

Ese archivo no se sube a git.

Antes de subir cambios: `npm run typecheck`, `npm run lint` y `npm run build`.

## Cargar un torneo desde start.gg

1. Creá un token en start.gg → Settings → Developer Settings → Personal Access Tokens.
2. Pegalo en `.env.local`, en `STARTGG_TOKEN=`.
3. Corré:

```bash
npm run importar -- https://www.start.gg/tournament/nombre-del-torneo --serie premier
```

El script trae nombre, fecha, sede, eventos, inscriptos, resultados finales y personajes, lo guarda en la base y crea los perfiles de jugadores. El sitio se actualiza solo en menos de una hora (o al instante cuando se guarde desde el panel de admin). Series válidas: `premier`, `sf6-kof`, `stand`. Si hay que elegir qué evento suma al ranking: `--evento slug-del-evento`.

El afiche y el precio cargados a mano no se pisan al volver a importar.

Otros comandos:

- `npm run mis-torneos`: lista los torneos que administra la cuenta del token, con su link.
- `npm run actualizar`: vuelve a importar todos los torneos ya cargados (trae correcciones de resultados y personajes).
- `npm run db:migrar`: crea o actualiza las tablas según `db/schema.sql`.
- `npm run db:semilla`: carga los datos iniciales de `db/semilla/` en una base vacía.

## Mains y cuentas duplicadas

- **Mains:** se calculan solos con los personajes reportados en start.gg (el más jugado sumando todos los torneos de singles). Para fijar uno a mano, completá la columna `personaje` del jugador en la tabla `jugadores` (por ejemplo `pikachu`, el nombre del ícono en `public/assets/smash/stock/`). Pronto se va a poder desde el panel de admin.
- **Cuentas duplicadas:** si un jugador aparece con dos cuentas de start.gg, agregá una fila en la tabla `alias` con la cuenta secundaria y la principal (`sgg:111` → `sgg:222`). Sus puntos e historial se suman.

## Dónde está cada cosa

- `src/app/`: las páginas y los estilos (`globals.css`).
- `src/components/`: piezas reutilizables (ranking, tarjetas de torneo, íconos, logo).
- `src/lib/data.ts`: única puerta a los datos para las páginas (con caché).
- `src/lib/db.ts`: lectura y escritura en la base.
- `db/schema.sql`: las tablas. `db/semilla/`: los datos con los que se cargó la base.
- `src/lib/startgg.ts`: cliente de la API de start.gg.
- `src/lib/ranking.ts`: cálculo de puntos.
- `src/data/series.ts`: series y tablas de puntos iniciales (las vigentes están en la base).
- `PRODUCT.md` y `DESIGN.md`: qué es el producto y su sistema visual.
