/*
  Lista los torneos que administra la cuenta dueña del token, con su link para importar.
  Uso: npm run mis-torneos
*/
export {};

const token = process.env.STARTGG_TOKEN;
if (!token) {
  console.error("Falta STARTGG_TOKEN en .env.local.");
  process.exit(1);
}

const query = /* GraphQL */ `
  query MisTorneos($page: Int!) {
    currentUser {
      player { gamerTag }
      tournaments(query: { page: $page, perPage: 50, filter: { tournamentView: "admin" } }) {
        pageInfo { totalPages }
        nodes { name slug startAt numAttendees city events { name numEntrants videogame { displayName } } }
      }
    }
  }
`;

type Nodo = { name: string; slug: string; startAt: number | null; numAttendees: number | null; city: string | null; events: { name: string; numEntrants: number | null; videogame: { displayName: string } | null }[] | null };

const todos: Nodo[] = [];
let gamerTag = "";
for (let page = 1; page <= 10; page++) {
  const res = await fetch("https://api.start.gg/gql/alpha", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ query, variables: { page } }),
  });
  const json = (await res.json()) as { data?: { currentUser: { player: { gamerTag: string } | null; tournaments: { pageInfo: { totalPages: number }; nodes: Nodo[] } } }; errors?: { message: string }[] };
  if (!res.ok || json.errors) {
    console.error("start.gg respondió con error:", res.status, json.errors?.map((e) => e.message).join("; "));
    process.exit(1);
  }
  const u = json.data!.currentUser;
  gamerTag = u.player?.gamerTag ?? "";
  todos.push(...u.tournaments.nodes);
  if (page >= u.tournaments.pageInfo.totalPages) break;
}

console.log(`Cuenta: ${gamerTag} · ${todos.length} torneos como admin\n`);
for (const t of todos.sort((a, b) => (b.startAt ?? 0) - (a.startAt ?? 0))) {
  const fecha = t.startAt ? new Date(t.startAt * 1000).toISOString().slice(0, 10) : "sin fecha";
  const juegos = [...new Set((t.events ?? []).map((e) => `${e.videogame?.displayName ?? "?"} (${e.numEntrants ?? 0})`))].join(", ");
  console.log(`${fecha}  ${t.name}`);
  console.log(`            https://www.start.gg/${t.slug}  ·  ${juegos || "sin eventos"}`);
}
