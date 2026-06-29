"use client";

import { useTranslations } from "next-intl";
import styles from "./MyTrips.module.scss";

const skeletonCards = ["first", "second", "third"];

export function TripsLoadingState() {
  const trips = useTranslations("Trips");

  return (
    <section className={styles.loadingState} aria-label={trips("loadingTrips")}>
      <div className={styles.loadingHeader}>
        <span className={styles.skeletonPill} />
        <span className={styles.skeletonTitle} />
      </div>
      <div className={styles.skeletonGrid}>
        {skeletonCards.map((card) => (
          <div className={styles.skeletonCard} key={card}>
            <span />
            <span />
            <span />
          </div>
        ))}
      </div>
    </section>
  );
}
