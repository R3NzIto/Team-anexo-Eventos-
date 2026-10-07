import { PERSONAJES } from "@/data/personajes";
import { getJugadores } from "@/lib/data";
import { sql } from "@/lib/db";
import { CuentasAdmin } from "./CuentasAdmin";
import { MainsAdmin } from "./MainsAdmin";

/** Pestaña Jugadores: mains a mano y cuentas duplicadas. El permiso lo verifica el layout. */
export default async function AdminJugadoresPage() {
  const db = sql();
  const [jugadores, crudos, alias, torneos] = await Promise.all([
    getJugadores(),
    db`select id, gamer_tag, personaje from jugadores`,
    db`select secundario, principal from alias`,
    db`select jugador, count(*)::int as n from standings where jugador not like 'equipo:%' group by jugador`,
  ]);
  const manual = new Map(crudos.map((j) => [j.id as string, (j.personaje as string | null) ?? undefined]));
  const cuantos = new Map(torneos.map((t) => [t.jugador as string, t.n as number]));

  return (
    <>
      <section aria-labelledby="mains-title">
        <h2 id="mains-title" className="section-title">Mains</h2>
        <p className="admin-nota admin-intro">
          El main se calcula solo con los personajes reportados en start.gg. Si no es el correcto, o el jugador no tiene datos,
          elegilo a mano; &quot;Automático&quot; vuelve al cálculo.
        </p>
        <MainsAdmin
          personajes={PERSONAJES}
          jugadores={jugadores.map((j) => ({
            id: j.id,
            gamerTag: j.gamerTag,
            slug: j.slug,
            main: j.personaje,
            manual: manual.get(j.id),
            torneos: cuantos.get(j.id) ?? 0,
          }))}
        />
      </section>
      <section aria-labelledby="cuentas-title">
        <h2 id="cuentas-title" className="section-title">Cuentas duplicadas</h2>
        <p className="admin-nota admin-intro">
          Si alguien jugó con dos cuentas de start.gg, uní la secundaria a la principal: sus puntos y su historial se suman y
          la secundaria deja de aparecer. Se puede deshacer.
        </p>
        <CuentasAdmin
          cuentas={crudos
            .map((j) => ({ id: j.id as string, gamerTag: j.gamer_tag as string, torneos: cuantos.get(j.id) ?? 0 }))
            .sort((a, b) => a.gamerTag.localeCompare(b.gamerTag, "es"))}
          alias={alias.map((a) => ({ secundario: a.secundario as string, principal: a.principal as string }))}
        />
      </section>
    </>
  );
}
