import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const rubik = localFont({
  src: "./fonts/Rubik-Variable.ttf",
  weight: "300 900",
  variable: "--font-rubik",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Team Anexo · Torneos de fighting games en Mendoza",
    template: "%s · Team Anexo",
  },
  description:
    "Team Anexo produce torneos de fighting games en Mendoza: Premier Smash League, Street Fighter 6 y KOF. Sede mendocina de Smash Bros Argentina. Llevamos la competencia a tu evento.",
  icons: { icon: "/assets/logos/anexo-avatar.png", apple: "/assets/logos/anexo-avatar.png" },
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "Team Anexo",
    images: [{ url: "/assets/img/og.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", site: "@team_anexo" },
};

export const viewport: Viewport = {
  themeColor: "#1E1E1E",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR" className={rubik.variable}>
      <body>
        <a className="skip" href="#contenido">Saltar al contenido</a>
        <SiteHeader />
        <main id="contenido">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
