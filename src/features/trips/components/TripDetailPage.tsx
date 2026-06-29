"use client";

import { LockKeyhole, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useTripDetail } from "../hooks/useTripDetail";
import { ShareTripButton } from "./ShareTripButton";
import { TripDetailLoadingState } from "./TripDetailLoadingState";
import { TripNotFoundState } from "./TripNotFoundState";
import { TripReadOnlyContent } from "./TripReadOnlyContent";
import styles from "./TripDetail.module.scss";

type TripDetailPageProps = {
  tripId: string;
};

export function TripDetailPage({ tripId }: TripDetailPageProps) {
  const tripsText = useTranslations("Trips");
  const auth = useTranslations("Auth");
  const { isAuthenticated, isLoading: isAuthLoading, signInWithGoogle } = useAuth();
  const { trip, isLoading, isError, refetch } = useTripDetail(tripId);
  const [isSigningIn, setIsSigningIn] = useState(false);

  async function handleSignIn() {
    setIsSigningIn(true);

    try {
      await signInWithGoogle();
    } catch {
      // Keep auth failures local until a dedicated notification surface exists.
    } finally {
      setIsSigningIn(false);
    }
  }

  if (isAuthLoading || isLoading) {
    return <TripDetailLoadingState />;
  }

  if (!isAuthenticated) {
    return (
      <main className={styles.detailPage}>
        <section className={styles.statePanel} aria-labelledby="trip-detail-sign-in-title">
          <span className={styles.stateIcon} aria-hidden="true">
            <LockKeyhole size={28} />
          </span>
          <div>
            <h1 id="trip-detail-sign-in-title">{tripsText("tripDetail")}</h1>
            <p>{tripsText("signInToViewTrips")}</p>
          </div>
          <button
            className={styles.primaryAction}
            type="button"
            onClick={handleSignIn}
            disabled={isSigningIn}
          >
            {auth("signIn")}
          </button>
        </section>
      </main>
    );
  }

  if (isError) {
    return (
      <main className={styles.detailPage}>
        <section className={styles.statePanel} aria-labelledby="trip-detail-error-title">
          <span className={styles.stateIcon} aria-hidden="true">
            <RefreshCw size={28} />
          </span>
          <div>
            <h1 id="trip-detail-error-title">{tripsText("tripNotFoundTitle")}</h1>
            <p>{tripsText("tripNotFoundDescription")}</p>
          </div>
          <button className={styles.primaryAction} type="button" onClick={refetch}>
            {tripsText("tryAgain")}
          </button>
        </section>
      </main>
    );
  }

  if (!trip) {
    return <TripNotFoundState />;
  }

  return <TripReadOnlyContent headerActions={<ShareTripButton trip={trip} />} trip={trip} />;
}
