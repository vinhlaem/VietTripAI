"use client";

import { Compass, Info, RefreshCw, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useSharedTrip } from "../hooks/useSharedTrip";
import { TripDetailLoadingState } from "./TripDetailLoadingState";
import { TripReadOnlyContent } from "./TripReadOnlyContent";
import styles from "./TripDetail.module.scss";

type PublicShareTripPageProps = {
  slug: string;
};

function PublicShareBanner() {
  const trips = useTranslations("Trips");

  return (
    <section className={styles.publicBanner} aria-label={trips("publicShareBannerLabel")}>
      <Info size={18} aria-hidden="true" />
      <p>{trips("publicShareBanner")}</p>
    </section>
  );
}

function PublicShareCta() {
  const trips = useTranslations("Trips");

  return (
    <section className={styles.publicCta} aria-labelledby="public-share-cta-title">
      <span className={styles.publicCtaIcon} aria-hidden="true">
        <Sparkles size={20} />
      </span>
      <div>
        <h2 id="public-share-cta-title">{trips("createPrivateTripTitle")}</h2>
        <p>{trips("createPrivateTripDescription")}</p>
      </div>
      <Link className={styles.primaryAction} href="/">
        {trips("openVietTrip")}
      </Link>
    </section>
  );
}

function PublicShareNotFoundState() {
  const trips = useTranslations("Trips");

  return (
    <main className={styles.detailPage}>
      <section className={styles.statePanel} aria-labelledby="shared-trip-not-found-title">
        <span className={styles.stateIcon} aria-hidden="true">
          <Compass size={28} />
        </span>
        <div>
          <h1 id="shared-trip-not-found-title">{trips("tripNotFoundTitle")}</h1>
          <p>{trips("tripNotFoundDescription")}</p>
        </div>
        <Link className={styles.primaryAction} href="/">
          {trips("openVietTrip")}
        </Link>
      </section>
    </main>
  );
}

export function PublicShareTripPage({ slug }: PublicShareTripPageProps) {
  const trips = useTranslations("Trips");
  const { trip, isLoading, isError, refetch } = useSharedTrip(slug);

  if (isLoading) {
    return <TripDetailLoadingState />;
  }

  if (isError) {
    return (
      <main className={styles.detailPage}>
        <section className={styles.statePanel} aria-labelledby="shared-trip-error-title">
          <span className={styles.stateIcon} aria-hidden="true">
            <RefreshCw size={28} />
          </span>
          <div>
            <h1 id="shared-trip-error-title">{trips("tripNotFoundTitle")}</h1>
            <p>{trips("tripNotFoundDescription")}</p>
          </div>
          <button className={styles.primaryAction} type="button" onClick={refetch}>
            {trips("tryAgain")}
          </button>
        </section>
      </main>
    );
  }

  if (!trip) {
    return <PublicShareNotFoundState />;
  }

  return (
    <TripReadOnlyContent
      footerCta={<PublicShareCta />}
      showBackLink={false}
      topBanner={<PublicShareBanner />}
      trip={trip}
    />
  );
}
