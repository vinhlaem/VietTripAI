import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import {
  getAlternateLanguages,
  getLocaleUrl,
  type AppLocale,
} from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return routing.locales.map((locale) => ({
    url: getLocaleUrl(locale as AppLocale),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: locale === routing.defaultLocale ? 1 : 0.9,
    alternates: {
      languages: getAlternateLanguages(),
    },
  }));
}

