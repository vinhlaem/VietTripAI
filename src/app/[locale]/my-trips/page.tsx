import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { MyTripsPage } from "@/features/trips/components/MyTripsPage";
import { routing } from "@/i18n/routing";

type MyTripsRouteProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function MyTripsRoute({ params }: MyTripsRouteProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return <MyTripsPage />;
}
