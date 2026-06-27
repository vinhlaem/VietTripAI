import { Clock3, CloudSun, MapPinned } from "lucide-react";
import { useTranslations } from "next-intl";
import type { DayPlan } from "@/features/planner/types";
import styles from "./TripPlanner.module.scss";

type DayPlanCardProps = {
  plan: DayPlan;
};

export function DayPlanCard({ plan }: DayPlanCardProps) {
  const planner = useTranslations("Planner");
  const weather = useTranslations("Weather");

  return (
    <article className={styles.dayCard}>
      <div className={styles.dayBadge}>
        <span>{planner("day")}</span>
        <strong>{plan.day}</strong>
      </div>
      <div className={styles.dayBody}>
        <div className={styles.dayHeader}>
          <div>
            <h3>{plan.titleKey ? planner(plan.titleKey) : plan.title}</h3>
            {plan.daySummary ? (
              <p>{plan.daySummary}</p>
            ) : null}
            {plan.weatherSummary ? (
              <p className={styles.weatherLine}>
                <CloudSun size={15} aria-hidden="true" />
                {weather(`conditions.${plan.weatherSummary}`)}
              </p>
            ) : null}
            {plan.weatherTip ? (
              <p className={styles.weatherTip}>{plan.weatherTip}</p>
            ) : null}
          </div>
          <Clock3 size={20} aria-hidden="true" />
        </div>
        <ul className={styles.activityList}>
          {plan.activities.map((activity) => (
            <li key={activity.id}>
              <MapPinned size={16} aria-hidden="true" />
              <span className={styles.activityContent}>
                <span>
                  <small>{planner(`timeOfDay.${activity.timeOfDay}`)}</small>
                  <strong>
                    {activity.titleKey ? planner(activity.titleKey) : activity.title}
                  </strong>
                </span>
                <p>
                  {activity.descriptionKey
                    ? planner(activity.descriptionKey, {
                        place: activity.placeName ?? activity.title,
                      })
                    : activity.description}
                </p>
                {activity.localTip ? (
                  <em>{activity.localTip}</em>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

