import type { IconName } from "@/components/Icon";

export const SITE_URL = "https://team-anexo-eventos.vercel.app";

export const LINKS = {
  grupoWhatsapp: "https://chat.whatsapp.com/CPljZCBvcLL3dmFYpi9jkz",
  contactoWhatsapp: "https://wa.me/5492615671596?text=Hola%20Team%20Anexo%2C%20quiero%20organizar%20un%20evento",
  /** Canales de YouTube de donde se traen las partidas: Replays (el principal) y el primero que usaron. */
  youtubeCanales: ["UC_MAi5lNm09s9pS0eY1_WVQ", "UCs8k46chS6y7Lpv87NZdZpQ"],
  youtubeReplays: "https://www.youtube.com/@TeamAnexoReplays",
  instagram: "https://www.instagram.com/team_anexo.mza/",
};

export const REDES: { icon: IconName; nombre: string; detalle: string; href: string; principal?: boolean }[] = [
  { icon: "whatsapp", nombre: "Grupo de WhatsApp", detalle: "Avisos y chat del día a día", href: LINKS.grupoWhatsapp, principal: true },
  { icon: "discord", nombre: "Discord", detalle: "Servidor de la comunidad", href: "https://discord.gg/wZ8dkvHjW2" },
  { icon: "twitch", nombre: "Twitch", detalle: "Torneos en vivo", href: "https://www.twitch.tv/team_anexo" },
  { icon: "youtube", nombre: "YouTube", detalle: "Partidas y finales", href: "https://www.youtube.com/@TeamAnexoReplays" },
  { icon: "instagram", nombre: "Instagram", detalle: "Afiches y anuncios", href: LINKS.instagram },
  { icon: "tiktok", nombre: "TikTok", detalle: "Clips", href: "https://www.tiktok.com/@anexo739" },
  { icon: "x", nombre: "X", detalle: "@team_anexo", href: "https://x.com/team_anexo" },
];

export const SOCIOS: { src: string; alt: string; w: number; h: number; grande?: boolean }[] = [
  { src: "/assets/logos/socios/multigeek.png", alt: "Multigeek", w: 360, h: 359 },
  { src: "/assets/logos/socios/akiba-fest.png", alt: "Akiba Fest", w: 356, h: 360 },
  { src: "/assets/logos/socios/mendotaku.png", alt: "Mendotaku", w: 462, h: 123 },
  { src: "/assets/logos/socios/las-heras.png", alt: "Tu Hogar Las Heras", w: 360, h: 360, grande: true },
  { src: "/assets/logos/socios/godoy-cruz.png", alt: "Municipalidad de Godoy Cruz", w: 345, h: 140 },
  { src: "/assets/logos/socios/casa-del-futuro.png", alt: "Casa del Futuro Godoy Cruz", w: 378, h: 158 },
  { src: "/assets/logos/socios/conectar-lab.png", alt: "Conectar Lab", w: 344, h: 158 },
  { src: "/assets/logos/socios/guaymallen.png", alt: "Municipalidad de Guaymallén", w: 275, h: 125 },
  { src: "/assets/logos/socios/fgu.png", alt: "FGU", w: 210, h: 300, grande: true },
];
