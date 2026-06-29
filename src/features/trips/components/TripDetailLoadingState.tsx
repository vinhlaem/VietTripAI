"use client";

import { useTranslations } from "next-intl";
import styles from "./TripDetail.module.scss";

const skeletonCards = ["overview", "day-one", "day-two", "insights"];

export function TripDetailLoadingState() {
  const trips = useTranslations("Trips");

  return (
    <main className={styles.detailPage}>
      <section className={styles.loadingState} aria-label={trips("loadingTrip")} role="status">
        <span className={styles.skeletonPill} />
        <span className={styles.skeletonTitle} />
        <div className={styles.skeletonGrid}>
          {skeletonCards.map((card) => (
            <span className={styles.skeletonCard} key={card} />
          ))}
        </div>
      </section>
    </main>
  );
}
