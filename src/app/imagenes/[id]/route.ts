import { leerImagen } from "@/lib/db";

/** Sirve las imágenes subidas desde el panel. Nunca cambian (cada subida es un id nuevo), así que se cachean para siempre. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const img = await leerImagen(id.replace(/\.\w+$/, ""));
  if (!img) return new Response("No encontrada", { status: 404 });
  return new Response(new Uint8Array(img.datos), {
    headers: { "Content-Type": img.tipo, "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
