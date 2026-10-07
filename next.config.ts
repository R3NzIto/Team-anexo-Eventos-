import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Hay un package-lock.json suelto en la carpeta del usuario; la raíz es este proyecto.
  turbopack: { root: __dirname },
  images: {
    // Banners y afiches de torneos importados desde start.gg.
    remotePatterns: [{ protocol: "https", hostname: "images.start.gg" }],
  },
};

export default nextConfig;
