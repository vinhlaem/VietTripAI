import type { Metadata } from "next";
import type { routing } from "@/i18n/routing";

export type AppLocale = (typeof routing.locales)[number];

const defaultSiteUrl = "https://viettrip-ai.vercel.app";

export const siteConfig = {
  name: "VietTrip AI",
  url: process.env.NEXT_PUBLIC_SITE_URL || defaultSiteUrl,
  ogImage: "/vietnam-hero.png",
  themeColor: "#0f766e",
  creator: "VietTrip AI",
};

export const localeMetadata: Record<
  AppLocale,
  {
    ogLocale: string;
    keywords: string[];
  }
> = {
  vi: {
    ogLocale: "vi_VN",
    keywords: [
      "VietTrip AI",
      "lịch trình du lịch Việt Nam",
      "AI travel planner Việt Nam",
      "du lịch Đà Nẵng",
      "du lịch Đà Lạt",
      "du lịch Nha Trang",
      "du lịch Huế",
      "lập kế hoạch du lịch",
    ],
  },
  en: {
    ogLocale: "en_US",
    keywords: [
      "VietTrip AI",
      "Vietnam trip planner",
      "AI travel itinerary Vietnam",
      "Da Nang travel planner",
      "Da Lat itinerary",
      "Nha Trang travel",
      "Hue itinerary",
      "Vietnam travel app",
    ],
  },
};

export function getSiteUrl() {
  return siteConfig.url.replace(/\/$/, "");
}

export function getLocalePath(locale: AppLocale) {
  return `/${locale}`;
}

export function getLocaleUrl(locale: AppLocale) {
  return new URL(getLocalePath(locale), getSiteUrl()).toString();
}

export function getOgImageUrl() {
  return new URL(siteConfig.ogImage, getSiteUrl()).toString();
}

export function getAlternateLanguages() {
  return {
    "x-default": getLocaleUrl("vi"),
    vi: getLocaleUrl("vi"),
    en: getLocaleUrl("en"),
  };
}

export function buildLocaleMetadata({
  locale,
  title,
  description,
}: {
  locale: AppLocale;
  title: string;
  description: string;
}): Metadata {
  const metadata = localeMetadata[locale];
  const url = getLocaleUrl(locale);
  const ogImage = getOgImageUrl();

  return {
    metadataBase: new URL(getSiteUrl()),
    applicationName: siteConfig.name,
    title,
    description,
    keywords: metadata.keywords,
    authors: [{ name: siteConfig.name, url: getSiteUrl() }],
    creator: siteConfig.creator,
    publisher: siteConfig.name,
    category: "travel",
    icons: {
      icon: [
        { url: "/icon.svg", type: "image/svg+xml" },
        { url: "/favicon.ico", sizes: "32x32" },
      ],
      shortcut: "/favicon.ico",
    },
    alternates: {
      canonical: url,
      languages: getAlternateLanguages(),
    },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title,
      description,
      url,
      locale: metadata.ogLocale,
      alternateLocale: locale === "vi" ? ["en_US"] : ["vi_VN"],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    manifest: "/manifest.webmanifest",
  };
}
