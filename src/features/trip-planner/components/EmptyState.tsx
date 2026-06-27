import { Compass, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import styles from "./TripPlanner.module.scss";

export function EmptyState() {
  const empty = useTranslations("EmptyState");

  return (
    <aside className={styles.emptyState} aria-label={empty("ariaLabel")}>
      <div className={styles.emptyIcon}>
        <Compass size={26} aria-hidden="true" />
      </div>
      <div>
        <span>
          <Sparkles size={15} aria-hidden="true" />
          {empty("eyebrow")}
        </span>
        <h2>{empty("title")}</h2>
        <p>{empty("description")}</p>
      </div>
    </aside>
  );
}
