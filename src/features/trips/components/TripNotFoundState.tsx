"use client";

import { Compass } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import styles from "./TripDetail.module.scss";

export function TripNotFoundState() {
  const trips = useTranslations("Trips");

  return (
    <main className={styles.detailPage}>
      <section className={styles.statePanel} aria-labelledby="trip-not-found-title">
        <span className={styles.stateIcon} aria-hidden="true">
          <Compass size={28} />
        </span>
        <div>
          <h1 id="trip-not-found-title">{trips("tripNotFoundTitle")}</h1>
          <p>{trips("tripNotFoundDescription")}</p>
        </div>
        <Link className={styles.primaryAction} href="/my-trips">
          {trips("backToMyTrips")}
        </Link>
      </section>
    </main>
  );
}
