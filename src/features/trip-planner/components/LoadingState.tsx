import { useTranslations } from "next-intl";
import styles from "./TripPlanner.module.scss";

export function LoadingState() {
  const loading = useTranslations("Loading");

  return (
    <section className={styles.loadingState} aria-label={loading("ariaLabel")}>
      <div className={styles.loadingHeader}>
        <span className={styles.skeletonPill} />
        <span className={styles.skeletonTitle} />
      </div>
      <div className={styles.skeletonGrid}>
        {Array.from({ length: 3 }).map((_, index) => (
          <div className={styles.skeletonCard} key={index}>
            <span />
            <span />
            <span />
          </div>
        ))}
      </div>
    </section>
  );
}
