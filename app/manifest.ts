// app/manifest.ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RenderPDF",
    short_name: "RenderPDF",
    description:
      "Transform HTML, CSS, and JavaScript into beautiful, print-ready PDFs. Free online editor with live preview.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#ea580c",
    icons: [
      {
        src: "/favicon/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/favicon/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
