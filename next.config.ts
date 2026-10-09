import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Hay un package-lock.json suelto en la carpeta del usuario; la raíz es este proyecto.
  turbopack: { root: __dirname },
  // Las imágenes para compartir leen fuentes, íconos y logo del disco.
  outputFileTracingIncludes: {
    "/jugadores/**": ["./src/app/fonts/*.woff", "./public/assets/smash/stock/*.png", "./public/assets/logos/anexo.svg"],
    "/torneos/**": ["./src/app/fonts/*.woff", "./public/assets/smash/stock/*.png", "./public/assets/logos/anexo.svg"],
  },
  images: {
    // Banners y afiches de torneos importados desde start.gg.
    remotePatterns: [
      { protocol: "https", hostname: "images.start.gg" },
      // Miniaturas de los videos del canal de YouTube
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
};

export default nextConfig;
