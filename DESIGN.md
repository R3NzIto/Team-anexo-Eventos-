---
name: Team Anexo
description: Fighting-game player-select screen for Mendoza's FGC events team; two players, two doors, one page.
colors:
  carbon: "#1E1E1E"
  carbon-deep: "#161616"
  carbon-raised: "#2A2A2A"
  ink: "#0E0E0E"
  white: "#FFFFFF"
  mute: "#B9B9B9"
  signal-yellow: "#FFF001"
  premier-purple-deep: "#3B1858"
  premier-purple: "#553589"
  lilac-ink: "#E7DCF7"
  series-teal: "#26ACAD"
typography:
  display:
    fontFamily: "Rubik, system-ui, sans-serif"
    fontSize: "clamp(2.6rem, 5.4vw, 5.6rem)"
    fontWeight: 900
    lineHeight: 0.9
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Rubik, system-ui, sans-serif"
    fontSize: "clamp(2.2rem, 5.5vw, 4.6rem)"
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Rubik, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 2.6vw, 2.1rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Rubik, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "Rubik, system-ui, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.02em"
  caption:
    fontFamily: "Rubik, system-ui, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.1em"
rounded:
  none: "0px"
  medallion: "50%"
spacing:
  gutter: "clamp(1rem, 4vw, 3.5rem)"
  container: "78rem"
  tight: "0.5rem"
  base: "1rem"
  block: "clamp(4rem, 8vw, 6rem)"
  section: "clamp(4rem, 9vw, 7.5rem)"
  cut: "14px"
  cut-large: "28px"
components:
  button-p1:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.signal-yellow}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.95rem 1.4rem 0.95rem 1.15rem"
  button-p1-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
  button-p2:
    backgroundColor: "{colors.white}"
    textColor: "{colors.premier-purple-deep}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.95rem 1.4rem 0.95rem 1.15rem"
  button-p2-hover:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.ink}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.95rem 1.4rem 0.95rem 1.15rem"
  button-ghost-hover:
    backgroundColor: "{colors.carbon-raised}"
    textColor: "{colors.white}"
  button-big:
    padding: "1.2rem 1.7rem 1.2rem 1.4rem"
  tag-p1:
    backgroundColor: "{colors.carbon-raised}"
    textColor: "{colors.white}"
    rounded: "{rounded.none}"
    padding: "0.35rem 0.8rem 0.35rem 0.35rem"
  tag-p1-hover:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.ink}"
  tag-p2:
    backgroundColor: "{colors.carbon-raised}"
    textColor: "{colors.white}"
    rounded: "{rounded.none}"
    padding: "0.35rem 0.8rem 0.35rem 0.35rem"
  tag-p2-hover:
    backgroundColor: "{colors.premier-purple}"
    textColor: "{colors.white}"
  route-tag-p1:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.ink}"
    size: "clamp(3.4rem, 6vw, 4.6rem)"
  route-tag-p2:
    backgroundColor: "{colors.white}"
    textColor: "{colors.premier-purple-deep}"
    size: "clamp(3.4rem, 6vw, 4.6rem)"
  next-card:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    padding: "0.9rem 1.1rem"
    width: "26rem"
  upcoming-card:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.ink}"
    padding: "clamp(1.75rem, 4vw, 3rem)"
  serie-card:
    backgroundColor: "{colors.carbon-deep}"
    textColor: "{colors.white}"
    padding: "1.4rem 1.5rem 1.6rem"
  community-item:
    backgroundColor: "{colors.carbon-deep}"
    textColor: "{colors.white}"
    padding: "1rem 1.1rem"
  community-item-hover:
    backgroundColor: "{colors.carbon-raised}"
  community-item-main:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.ink}"
  community-item-main-hover:
    backgroundColor: "{colors.white}"
  chip-premier:
    backgroundColor: "{colors.premier-purple}"
    textColor: "{colors.white}"
    padding: "0.15rem 0.5rem"
  chip-anexo:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.ink}"
    padding: "0.15rem 0.5rem"
  chip-2xko:
    backgroundColor: "{colors.series-teal}"
    textColor: "{colors.ink}"
    padding: "0.15rem 0.5rem"
  countdown-cell:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.signal-yellow}"
    padding: "0.5rem 0.4rem"
    width: "4.2rem"
---

# Design System: Team Anexo

## Overview

**Creative North Star: "The Player-Select Screen"**

The site is a fighting-game character-select screen that keeps going. The hero is two players split by a hard diagonal: P1 owns yellow with black ink, P2 owns Premier purple with white ink, and the Anexo avatar sits on the seam as the VS medallion. Everything below the hero is the route each player picked, built from the same select-screen chrome: P1/P2 badges, cut-corner plates, bracket cursors on focus, uppercase Rubik Black headlines.

Density is arcade-loud but disciplined. Grounds are flat charcoal, carrying the brand's repeating-logo pattern at very low opacity, rotated -12°. Color shows up in solid blocks owned by a player, never as gradients or glow. Real event photos sit behind the hero text as grayscale duotone portraits, multiplied into yellow on P1 and luminosity-blended into purple on P2. They are fighter portraits, not decoration.

The world rejects the centered link-in-bio stack and the headline-over-cards hero. Its chrome comes from the game screen (player tags, the READY lock, VS, the move list), not from generic UI kits.

**Key Characteristics:**
- Two owned sides: yellow/ink (P1) and purple/white (P2), on a charcoal ground.
- Rubik at 800–900 in uppercase for every heading and action; regular-weight Rubik for prose.
- Square or diagonally cut corners; the only circle is the VS medallion.
- Focus is a four-corner select-cursor bracket, recolored to stay visible on whichever side it sits.
- Motion is select-screen motion: panels slide in from the sides, VS stamps down, a hovered side widens along the diagonal.

## Colors

Two saturated player colors on a stack of near-neutral charcoals. Each color is owned by one side, not spread around.

### Primary
- **Signal Yellow** (P1): P1's owned field. Fills the P1 hero panel, the upcoming-tournament plate, the P1 route badge and P1 tag pip, the main community item, and countdown numerals. It is also the global accent for focus outlines, selection, caret and scrollbar. Text on it is always Ink.

### Secondary
- **Premier Purple Deep** (P2): P2's owned field. Fills the P2 hero panel, the P2 route background and the Premier series card. Text on it is White or Lilac Ink.
- **Premier Purple**: the brighter purple, used for interaction and labels only: the P2 tag hover fill and the Premier series chip.
- **Lilac Ink**: secondary text on purple (hero lead, move-list descriptions, contact copy, series meta) and the P2 tag pip.

### Tertiary
- **Series Teal**: reserved for the 2XKO series chip in the history table. Each series keeps its own poster identity; teal exists only to label that series.

### Neutral
- **Carbon**: page ground and P1 route background; partner-wall tiles on purple.
- **Carbon Deep**: card and tile surfaces sitting on Carbon (series cards, result cards, community items, gallery placeholders).
- **Carbon Raised**: resting fill for top-bar tags, ghost-button ring and hover fill, table rules, the Stand chip.
- **Ink**: the darkest layer. Top bar, hero backing, gallery band and footer, text on yellow, button fill on yellow.
- **White**: primary text on dark grounds, P2 button fill, VS ring and plate, federation plate.
- **Mute**: secondary text on charcoal (metadata, table headers, dates, footer).

### Named Rules
**The Owned Side Rule.** Yellow belongs to P1 and purple belongs to P2. A P1 surface uses Ink text and Ink controls. A P2 surface uses White and Lilac text and White controls. Don't mix the two sides on one surface. The one deliberate crossover is the P2 button turning yellow on hover.

**The Flat Field Rule.** Player colors are solid fills. Depth and texture come from the masked logo pattern and the duotone photos, never from gradients on the colors themselves.

## Typography

**Display Font:** Rubik variable, self-hosted (weights 300–900), with system-ui and sans-serif fallbacks
**Body Font:** Rubik (same family)

**Character:** Rubik is the brand's shirt face. Its rounded geometry at 900 weight in tight-tracked caps gives the arcade-cabinet punch, and at 400 it stays friendly for Spanish prose. One family carries everything; hierarchy comes from weight, case and size.

### Hierarchy
- **Display** (900, clamp(2.6rem, 5.4vw, 5.6rem), 0.9, uppercase, balanced wrap): hero panel titles. The P2 title steps down to clamp(2.2rem, 4.3vw, 4.4rem) because it is longer. The closing contact title runs larger (clamp(2.6rem, 7vw, 6rem), -0.03em).
- **Headline** (900, clamp(2.2rem, 5.5vw, 4.6rem), 0.95, uppercase): route titles beside the P1/P2 badge. Gallery and upcoming-plate titles use the same voice one step down.
- **Title** (800, clamp(1.5rem, 2.6vw, 2.1rem), uppercase): block titles inside a route (series, results, history, community, partners). Card titles run 900 at clamp(1.35rem, 2.2vw, 1.75rem).
- **Body** (400, 1.0625rem, 1.55): prose. Leads run 1.1–1.45rem. Line length is capped at 30–62ch depending on context.
- **Label** (800, 1.05rem, 1, +0.02em, uppercase): buttons. Tags use 700 at 0.95rem. Move-list terms use 800 uppercase.
- **Caption** (700, 0.8rem, +0.1em, uppercase): table headers. Chips use 800 at 0.72rem, +0.06em. The READY state uses 900 at 0.95rem, +0.12em.

### Named Rules
**The Caps Are Loud Rule.** Every heading, button, tag and badge is uppercase at weight 800–900. Body copy is never uppercase and never heavier than 400, except bold facts.

**The Tabular Numbers Rule.** Dates, the countdown and the history table use tabular-nums so numbers line up like a timer.

## Layout

A single long page. Full-bleed bands hold content in a centered 78rem container, with a fluid gutter of clamp(1rem, 4vw, 3.5rem).

- **Hero (select screen):** at least max(40rem, 100svh − 4rem) tall. Both panels fill the whole area. Each is clipped by a polygon whose seam sits at `--split` (50%) and leans ±5vw, so the diagonal runs roughly 12°. The P2 polygon is offset 6px, which leaves a thin Ink seam. Panel text is anchored bottom-outside at clamp(2rem, 7vh, 5rem) from the bottom, on the side away from the diagonal. Photos sit on the diagonal side.
- **Routes:** vertical padding of clamp(4rem, 9vw, 7.5rem). Each route opens with a square player badge and a headline. Blocks are separated by clamp(4rem, 8vw, 6rem).
- **Grids:** the series grid has 12 columns (a full-width Premier card, then two 6-column cards). Results are a horizontal scroll-snap strip, 16–23rem per card. Community is a 3-column grid whose first item spans the full width. Partners are a 5-column wall. The gallery is a 4-column dense mosaic with named areas. The about section is 1.15fr / 0.85fr.
- **Gaps:** 0.5rem for walls and mosaics, 0.6–1rem for card grids, 0.9–1.4rem for action rows.
- **Responsive:** at 60rem and below, about collapses to one column, the partner wall goes to 3 columns, and the Premier poster drops. Below 48rem, the diagonal turns horizontal: P1 stacks on top with a 2.5rem slanted bottom edge, P2 overlaps it by 2.5rem with a matching slanted top, the VS shrinks to 5.5rem and sits bottom-right on the P1 panel, the READY state is hidden, the hero entrance animation is off, the history table becomes stacked rows, the gallery goes to 2 columns with every third tile full width, and the partner wall goes to 2 columns.

**The Text Outside the Diagonal Rule.** Hero copy always sits on the outer edge of its panel. The diagonal, the photo and the VS share the middle.

## Elevation & Depth

The system is flat. Surfaces are tonal layers (Ink, Carbon Deep, Carbon, Carbon Raised) with no resting shadows on UI. Depth is suggested by the masked logo pattern, by the overlapping hero panels, and by photos blending into the panel color.

### Shadow Vocabulary
- **Medallion** (`box-shadow: 0 0 0 5px #FFFFFF, 0 14px 34px rgba(0,0,0,.45)`): the VS avatar only. A white ring plus a drop so it reads as a coin stamped onto the seam.
- **Poster lift** (`box-shadow: 0 12px 30px rgba(0,0,0,.3)` on yellow; `0 16px 34px rgba(0,0,0,.45)` with a 3° rotation on purple): printed tournament posters, treated as physical objects.

### Named Rules
**The Objects Cast Shadows Rule.** Only physical things cast shadows: posters and the VS coin. Buttons, cards, tags and plates never do.

## Shapes

Corners are square. Character comes from diagonal cuts, all carried by clip-path:
- **Corner cut** (14px): the bottom-right corner of buttons and the hero next-event card. The upcoming-tournament plate uses a 28px cut.
- **Slanted tail** (8px): the right edge of the top-bar tags leans in.
- **The hero diagonal:** a seam of about 12° on desktop. On phones it becomes a 2.5rem horizontal slant.
- **Skew:** the VS plate is skewed -12°, and the logo pattern is rotated -12°. One angle family runs through the whole system.
- **The single circle:** the VS medallion (50%), which is the brand avatar.

Square badges (P1/P2 pips, route badges, countdown cells, chips) are always uncut rectangles. The cut is reserved for things you press or plates that announce.

## Components

### Buttons
Cut-corner plates in heavy caps, with an optional 1.25rem inline SVG icon.
- **Shape:** square, with a 14px bottom-right corner cut. The fill lives on a pseudo-layer, so the focus bracket can sit outside the cut.
- **P1:** Ink plate with Signal Yellow text. Text turns White on hover. Used on yellow surfaces and for player actions.
- **P2:** White plate with Premier Purple Deep text. On hover it flips to a Signal Yellow plate with Ink text.
- **Ghost:** transparent with a 2px inset Carbon Raised ring and White text. On hover it fills Carbon Raised. On the yellow plate the ring and text become Ink, and hover fills Ink with Yellow text. A light variant on purple uses a 35% white ring and a 12% white hover fill.
- **Big:** clamp(1.05rem, 2vw, 1.35rem) text with 1.2rem/1.7rem padding, for the closing contact action.
- **Motion:** lifts 2px on hover and presses 1px on active (0.25s, ease-out). Color changes take 0.2s.

### Text link with arrow
Bold underlined link (2px thick, 0.3em offset) with a trailing SVG arrow that slides 4px on hover. It is the secondary action beside a button.

### Player tags (top bar)
Uppercase tags on Carbon Raised with an 8px slanted tail and a square pip (P1 is a yellow pip; P2 is a lilac pip with purple numerals). On hover the P1 tag fills yellow and its pip inverts to Ink/Yellow. The P2 tag fills Premier Purple.

### Player badge and READY state (hero)
A 3.4rem square pip (P1: Ink on yellow; P2: White on purple). Beside it, a READY plate wipes in from the left via clip-path (0.35s) when its panel is hovered or focused. The plate has a 2px divider in the opposite color. It is hidden on phones.

### Select panel (signature)
Hovering or focusing within a side selects it. `--split` animates from 50% to 56% (P1) or 44% (P2) over 0.55s. The selected portrait brightens (P1 0.5→0.7, P2 0.55→0.75), and the other side's portrait dims to 0.25. Clicking anywhere on the panel scrolls to that player's route. On entrance, the panels slide in ±18% and the VS stamps down from 1.6× scale after 0.55s.

### Cards / Containers
- **Corner Style:** square. Plates that announce (the next-event card, the upcoming plate) get the corner cut.
- **Background:** Carbon Deep on Carbon. Premier Purple Deep for the Premier card. Signal Yellow for the upcoming plate. White for the federation plate.
- **Shadow Strategy:** none (see Elevation).
- **Border:** none. Separation comes from tone.
- **Internal Padding:** 1.4–1.6rem on cards, clamp(1.5rem, 3vw, 2.5rem) on feature plates.

### Chips
Small uppercase rectangles (800, 0.72rem) in the history table, colored by series identity: Premier is purple/white, SF6-KOF is white/ink, 2XKO is teal/ink, Stand is carbon-raised/white, Anexo is yellow/ink.

### Countdown
Ink cells at least 4.2rem wide with 1.8rem/900 yellow tabular numerals and a 0.7rem caption, set on the yellow plate.

### Move list
The P2 "what we do" list, styled like a character's command list. Two columns (term 11–15rem, description) are separated by 1px rules at 18% white. Terms are uppercase 800 and descriptions are Lilac Ink.

### Navigation
A sticky Ink top bar holds the logo on the left and the two player tags on the right, with a 1px black bottom rule. Anchors scroll with a 4.5rem scroll padding. The skip link is a yellow plate that drops in on focus.

### Focus
**The Select Cursor Rule.** Buttons, tags, community items and the logo show four 16×3px corner brackets 7px outside the element instead of an outline. Bracket color follows the surface: Ink on yellow (P1 panel, upcoming plate), White on purple (P2 panel, P2 route), Yellow everywhere else. Every other focusable element gets a 3px Signal Yellow outline at a 4px offset.

## Do's and Don'ts

### Do:
- **Do** give each new surface to one player. Yellow surfaces get Ink text and Ink controls. Purple surfaces get White or Lilac text and White controls.
- **Do** set headings, buttons, tags and badges in Rubik 800–900 uppercase, with tracking between -0.03em and -0.01em on large sizes and +0.02em to +0.12em on small labels.
- **Do** cut pressable plates at the bottom-right corner (14px, or 28px on large plates) with clip-path, and keep badges, chips and cells square.
- **Do** use the four-corner select-cursor bracket for focus on pressable chrome, recolored per surface (Ink on yellow, White on purple, Yellow elsewhere).
- **Do** carry texture with the masked logo pattern (260px tile, rotated -12°, 3.5–6% opacity) and real event photos in grayscale duotone.
- **Do** use the ease-out curve cubic-bezier(.16, 1, .3, 1) for all state motion, and keep hero entrance and split motion behind prefers-reduced-motion: no-preference.
- **Do** use tabular figures for dates, timers and results.

### Don't:
- **Don't** round corners on UI. The only circle is the VS medallion.
- **Don't** put shadows on buttons, cards or tags. Shadows belong to posters and the VS coin.
- **Don't** use gradients on the player colors. Gradients appear only as photo masks.
- **Don't** mix the player sides on one surface. P2 hover turning yellow is the single sanctioned crossover.
- **Don't** introduce a second typeface or system display fonts. Rubik is self-hosted and carries every role.
- **Don't** use icon fonts or glyph characters as icons. Icons are inline SVG symbols that inherit currentColor.
