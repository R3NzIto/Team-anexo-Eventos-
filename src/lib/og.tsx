import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/*
  Piezas compartidas de las imágenes para compartir (opengraph-image).
  Los archivos se leen del disco; next.config.ts los incluye en el deploy
  (outputFileTracingIncludes), así funcionan igual en Vercel.
*/

export const TAMANO_OG = { width: 1200, height: 630 };

export const COLORES = {
  carbon: "#1E1E1E",
  ink: "#0E0E0E",
  yellow: "#FFF001",
  purpleDeep: "#3B1858",
  purple: "#553589",
  lilac: "#E7DCF7",
  white: "#FFFFFF",
  mute: "#B9B9B9",
};

const raiz = process.cwd();

export async function fuentesOg() {
  const [black, medium] = await Promise.all([
    readFile(join(raiz, "src/app/fonts/Rubik-Black.woff")),
    readFile(join(raiz, "src/app/fonts/Rubik-Medium.woff")),
  ]);
  return [
    { name: "Rubik", data: black, weight: 900 as const, style: "normal" as const },
    { name: "Rubik", data: medium, weight: 500 as const, style: "normal" as const },
  ];
}

/** Ícono de personaje como data URL, o undefined si no hay. */
export async function iconoOg(personaje?: string): Promise<string | undefined> {
  if (!personaje || !/^[a-z0-9-]+$/.test(personaje)) return undefined;
  try {
    const png = await readFile(join(raiz, "public/assets/smash/stock", `${personaje}.png`));
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return undefined;
  }
}

/** El logo Team ANEXO en el color pedido, como data URL de SVG. */
export async function logoOg(color: string): Promise<string> {
  const svg = (await readFile(join(raiz, "public/assets/logos/anexo.svg"), "utf8")).replaceAll("currentColor", color);
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
