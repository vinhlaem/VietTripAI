import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { PublicShareTripPage } from "@/features/trips/components/PublicShareTripPage";
import { routing } from "@/i18n/routing";

type ShareTripRouteProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export default async function ShareTripRoute({ params }: ShareTripRouteProps) {
  const { locale, slug } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return <PublicShareTripPage slug={slug} />;
}
