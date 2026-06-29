"use client";

import { Compass } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import styles from "./MyTrips.module.scss";

export function TripsEmptyState() {
  const trips = useTranslations("Trips");
  const hero = useTranslations("Hero");

  return (
    <section className={styles.emptyState} aria-labelledby="trips-empty-title">
      <span className={styles.emptyIcon} aria-hidden="true">
        <Compass size={26} />
      </span>
      <div>
        <h2 id="trips-empty-title">{trips("noTripsTitle")}</h2>
        <p>{trips("noTripsDescription")}</p>
      </div>
      <Link className={styles.primaryAction} href="/">
        {hero("navAction")}
      </Link>
    </section>
  );
}
