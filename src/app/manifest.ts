import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VietTrip AI",
    short_name: "VietTrip AI",
    description: "AI travel planner for Vietnam itineraries, places, weather, and trip budgets.",
    start_url: "/vi",
    scope: "/",
    display: "standalone",
    background_color: "#f4f7f4",
    theme_color: siteConfig.themeColor,
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/favicon.ico",
        sizes: "32x32",
        type: "image/x-icon",
      },
    ],
  };
}

