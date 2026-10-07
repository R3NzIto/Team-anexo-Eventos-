# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 16 (App Router, Cache Components, TypeScript) deployed on Vercel. Chosen by the user over plain HTML to support player accounts and an admin panel. Planned: Supabase for database and auth (Google login, plus start.gg OAuth linking), and the start.gg GraphQL API for tournaments, standings and players. Registration itself always happens on start.gg (the API has no registration mutation); the site links to it or embeds start.gg's registration widget.

## Users

Two audiences with equal weight:

- **Players and community** in Mendoza (fighting game and Smash players, mostly 13–30): want to know the next tournament, where and when, what it costs, how to sign up, and where the community talks (WhatsApp, Discord).
- **Brands, venues and event organizers** (conventions, municipalities, shops): evaluate Team Anexo as a producer to bring competition to their space, sponsor prizes, or partner.

## Product Purpose

The public home of Team Anexo, a fighting-game (FGC) event production team from Mendoza, Argentina. It replaces a link-in-bio page with a site that shows what Team Anexo does, what is coming next, and what it has already done, and routes each audience to its action: players to sign up / join the community, organizations to get in touch.

## Positioning

Team Anexo produces the competitive FGC scene in Mendoza: it runs its own tournament series, is the Mendoza seat of the Smash Bros Argentina federal circuit (results count toward the national ranking), streams its events live, and brings tournaments, free-to-play and retro zones to third-party events.

## Operating Context

- Tournaments are announced on Instagram with a poster per edition; sign-ups go through start.gg links or QR codes.
- Recurring venue: Planeta Comics, Av. San Martín 1245, local 100 (Mendoza).
- Events are streamed live (Twitch) and clips go to YouTube/TikTok.
- Most visitors arrive from the Instagram bio link on a phone.

## Capabilities and Constraints

- **Active series:** Premier Smash League (Smash Bros Ultimate; includes Pre-Temporada editions), SF6 / KOF tournaments, and stands at third-party events (Mendotaku, Multigeek, GMF, etc.).
- **Smash first:** Super Smash Bros Ultimate is the game with the most players; the Premier Smash League gets the most weight on the site (own page, ranking, first in navigation).
- **Past only (keep as history, do not promote as upcoming):** 2XKO Mendoza Fighting Cup, Anexo World Cup / Mendoza Cup #1.
- **No merch section.** Merch exists but is out of scope for the site.
- **No numeric stats** (members, tournaments, years) until the team confirms them. Do not show "500+", "50+" or similar.
- Contact WhatsApp: +54 9 261 567-1596 (`https://wa.me/5492615671596`). Other numbers found in old documents are not to be used.
- Undecided: next confirmed event date; whether to publish the email teamanexo666@gmail.com.

## Brand Commitments

- Name: "Team Anexo" (logo lockup "Team ANEXO™" with a paperclip — anexo = attachment).
- Logo assets: vector white/black SVG in `D:\videos anexo\png anx\Vectores logo anexo\`; round avatar with pixel-art character silhouettes.
- Brand typeface used on shirts: Rubik Bold.
- Existing brand materials use a charcoal/black ground with white logo, a yellow repeating-logo pattern (#FFF001), and purple for the Premier Smash League (#3B1858, #553589). Each series keeps its own identity on its posters.
- Voice: Spanish (Argentina), direct and enthusiastic, community-first ("Comunidad dedicada al Fighting-Games", "¿Llevamos la competencia a tu espacio?").

## Evidence on Hand

All in `D:\videos anexo\`:
- Pitch deck copy and slides: `anexo powerpoint\` (Qué es Team Anexo, Enfoque del evento, Transmisión en vivo, Qué es Smash Argentina, provincias del circuito, marcas/eventos que trabajaron con nosotros).
- Partner logos sheet: `2025\portafolio anx.png` (Multigeek, Akiba Fest, Tu Hogar Las Heras, Godoy Cruz, Casa del Futuro, Conectar Lab, Guaymallén, Mendotaku, GMF, FGU) and Smash Bros Argentina collab (`2025\collab con smash argentina.png`).
- Tournament posters and rulesets: `premier smash league META ASSETS\`, `2XKO META ASSETS\`, `torneo kof and sf6\`, `2025\`.
- ~60 real event photos 2023–2026: `fotos de eventos\` (+ `recientes\`, `Nueva carpeta\`), `fotos mendotaku 2025\`.
- Results graphics: `instagram\resultados finales*.jpg`, `fotos mendotaku 2025\ganadores *.png`.
- Absent — must not be fabricated: player testimonials, attendance figures, prize amounts beyond those printed on posters, future event dates.

## Product Principles

1. Next event first: a visitor should know within seconds whether there is a tournament coming and how to join.
2. Show, don't claim: real photos, real posters, real results instead of adjectives or invented numbers.
3. Two doors, one site: players and organizations each find their action without one burying the other.
4. Easy to keep alive: adding an event or result means editing data, not rebuilding the page.
5. Phone-first: most traffic comes from the Instagram bio link.

## Accessibility & Inclusion

Mostly mobile visitors, often on mobile data: pages must load light (optimized images) and respect reduced-motion preferences.
