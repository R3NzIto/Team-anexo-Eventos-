# Team Anexo · sitio web

Sitio de Team Anexo, productores de eventos de fighting games en Mendoza. Hecho con Next.js 16 y publicado en Vercel.

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

Antes de subir cambios: `npm run typecheck`, `npm run lint` y `npm run build`.

## Cargar un torneo desde start.gg

1. Creá un token en start.gg → Settings → Developer Settings → Personal Access Tokens.
2. Copiá `.env.example` a `.env.local` y pegá el token en `STARTGG_TOKEN=`. Ese archivo no se sube a git.
3. Corré:

```bash
npm run importar -- https://www.start.gg/tournament/nombre-del-torneo --serie premier
```

El script trae nombre, fecha, sede, eventos, inscriptos y resultados finales, crea los perfiles de jugadores y recalcula el ranking. Series válidas: `premier`, `sf6-kof`, `stand`. Si hay que elegir qué evento suma al ranking: `--evento slug-del-evento`.

El afiche y el precio se pueden completar a mano en `src/data/torneos.json` (no se pisan al volver a importar).

Otros comandos:

- `npm run mis-torneos`: lista los torneos que administra la cuenta del token, con su link.
- `npm run actualizar`: vuelve a importar todos los torneos ya cargados (trae correcciones de resultados y personajes).

## Mains y cuentas duplicadas

- **Mains:** se calculan solos con los personajes reportados en start.gg (el más jugado sumando todos los torneos de singles). Para fijar uno a mano, agregá `"personaje": "pikachu"` al jugador en `src/data/jugadores.json`, usando el nombre del ícono de `public/assets/smash/stock/`.
- **Cuentas duplicadas:** si un jugador aparece con dos cuentas de start.gg, agregá en `src/data/alias.json` la cuenta secundaria apuntando a la principal (`"sgg:111": "sgg:222"`). Sus puntos e historial se suman.

## Dónde está cada cosa

- `src/app/`: las páginas y los estilos (`globals.css`).
- `src/components/`: piezas reutilizables (ranking, tarjetas de torneo, íconos, logo).
- `src/lib/data.ts`: única puerta a los datos. Hoy lee `src/data/`; cuando se conecte Supabase solo cambia este archivo.
- `src/lib/startgg.ts`: cliente de la API de start.gg.
- `src/lib/ranking.ts`: cálculo de puntos.
- `src/data/series.ts`: series y tablas de puntos (editables).
- `PRODUCT.md` y `DESIGN.md`: qué es el producto y su sistema visual.
