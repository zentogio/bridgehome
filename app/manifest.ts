import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bridge Home × สายใย",
    short_name: "Bridge Home",
    description: "ทีมดูแลพ่อแม่ในกลุ่ม LINE ครอบครัว",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2a3c8e",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
