import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import styles from "../page.module.scss";
import { HeroSection } from "@/features/trip-planner/components/HeroSection";
import { TripPlannerForm } from "@/features/trip-planner/components/TripPlannerForm";
import { routing } from "@/i18n/routing";
import { getLocaleUrl, getOgImageUrl, getSiteUrl, siteConfig, type AppLocale } from "@/lib/seo";

type HomeProps = {
  params: Promise<{
    locale: string;
  }>;
};

function stringifyJsonLd(value: Record<string, unknown>) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function buildWebsiteJsonLd({
  locale,
  title,
  description,
}: {
  locale: AppLocale;
  title: string;
  description: string;
}) {
  const url = getLocaleUrl(locale);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${getSiteUrl()}/#website`,
        name: siteConfig.name,
        url: getSiteUrl(),
        inLanguage: locale,
        publisher: {
          "@id": `${getSiteUrl()}/#organization`,
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${url}#trip-planner`,
          queryInput: "required name=travelArea",
        },
      },
      {
        "@type": "Organization",
        "@id": `${getSiteUrl()}/#organization`,
        name: siteConfig.name,
        url: getSiteUrl(),
        logo: new URL("/icon.svg", getSiteUrl()).toString(),
      },
      {
        "@type": "WebApplication",
        "@id": `${url}#app`,
        name: siteConfig.name,
        url,
        applicationCategory: "TravelApplication",
        operatingSystem: "Web",
        inLanguage: locale,
        image: getOgImageUrl(),
        headline: title,
        description,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "VND",
        },
        featureList:
          locale === "vi"
            ? [
                "Lập lịch trình du lịch Việt Nam bằng AI",
                "Gợi ý địa điểm du lịch theo khu vực",
                "Dự báo thời tiết theo tọa độ",
                "Ước tính chi phí chuyến đi",
              ]
            : [
                "AI-powered Vietnam itinerary planning",
                "Suggested tourist places by travel area",
                "Coordinate-based weather forecast",
                "Estimated trip cost breakdown",
              ],
      },
    ],
  };
}

export default async function Home({ params }: HomeProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Metadata" });
  const jsonLd = buildWebsiteJsonLd({
    locale: locale as AppLocale,
    title: t("title"),
    description: t("description"),
  });

  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(jsonLd) }}
      />
      <HeroSection />
      <TripPlannerForm />
    </main>
  );
}
