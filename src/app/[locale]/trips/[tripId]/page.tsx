import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { TripDetailPage } from "@/features/trips/components/TripDetailPage";
import { routing } from "@/i18n/routing";

type TripDetailRouteProps = {
  params: Promise<{
    locale: string;
    tripId: string;
  }>;
};

export default async function TripDetailRoute({ params }: TripDetailRouteProps) {
  const { locale, tripId } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return <TripDetailPage tripId={tripId} />;
}
