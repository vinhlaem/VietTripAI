"use client";

import { Clock3, CloudSun, MapPinned, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { DayPlan } from "@/features/planner/types";
import type { NormalizedPlace } from "@/features/places/types";
import styles from "./TripPlanner.module.scss";

type DayPlanCardProps = {
  plan: DayPlan;
  editable?: boolean;
  onAdd?: (day: number) => void;
  onEdit?: (day: number, activityId: string) => void;
  onRemove?: (day: number, activityId: string) => void;
  onRegenerate?: (day: number) => void;
  foodRecommendations?: NormalizedPlace[];
  entertainmentRecommendations?: NormalizedPlace[];
  onSelectRecommendation?: (place: NormalizedPlace) => void;
};

export function DayPlanCard({ plan, editable = false, onAdd, onEdit, onRemove, onRegenerate, foodRecommendations = [], entertainmentRecommendations = [], onSelectRecommendation }: DayPlanCardProps) {
  const planner = useTranslations("Planner");
  const weather = useTranslations("Weather");

  return (
    <article className={styles.dayCard}>
      <div className={styles.dayBadge}><span>{planner("day")}</span><strong>{plan.day}</strong></div>
      <div className={styles.dayBody}>
        <div className={styles.dayHeader}>
          <div>
            <h3>{plan.titleKey ? planner(plan.titleKey) : plan.title}</h3>
            {plan.daySummary ? <p>{plan.daySummary}</p> : null}
            {plan.weatherSummary ? <p className={styles.weatherLine}><CloudSun size={15} aria-hidden="true" />{weather("conditions." + plan.weatherSummary)}</p> : null}
            {plan.weatherTip ? <p className={styles.weatherTip}>{plan.weatherTip}</p> : null}
            {plan.rainPlan ? <p className={styles.weatherTip}>{planner("rainPlan")}</p> : null}
          </div>
          {editable ? (
            <div className={styles.dayActions}>
              <button type="button" onClick={() => onAdd?.(plan.day)} aria-label={planner("actions.add")}><Plus size={17} /></button>
              <button type="button" onClick={() => onRegenerate?.(plan.day)} aria-label={planner("actions.regenerate")}><RefreshCw size={17} /></button>
            </div>
          ) : <Clock3 size={20} aria-hidden="true" />}
        </div>
        <ul className={styles.activityList}>
          {plan.activities.map((activity) => (
            <li key={activity.id}>
              <MapPinned size={16} aria-hidden="true" />
              <span className={styles.activityContent}>
                <span>
                  <small>{activity.startTime ?? planner("timeOfDay." + activity.timeOfDay)} · {activity.durationMinutes ?? 90} {planner("minutes")}</small>
                  <strong>{activity.titleKey ? planner(activity.titleKey) : activity.title}</strong>
                </span>
                <p>{activity.descriptionKey ? planner(activity.descriptionKey, { place: activity.placeName ?? activity.title }) : activity.description}</p>
                <span className={styles.activityMeta}>
                  <small>{planner("environment." + (activity.environment ?? "mixed"))}</small>
                  <small>{planner("accessibility." + (activity.accessibility ?? "easy"))}</small>
                  {activity.travelFromPreviousKm != null ? <small>{planner("travelFromPrevious", { distance: activity.travelFromPreviousKm, minutes: activity.travelMinutes ?? 0 })}</small> : null}
                </span>
                {activity.localTip ? <em>{activity.localTip}</em> : null}
                {editable ? <span className={styles.activityActions}>
                  <button type="button" onClick={() => onEdit?.(plan.day, activity.id)}><Pencil size={14} />{planner("actions.edit")}</button>
                  <button type="button" onClick={() => onRemove?.(plan.day, activity.id)}><Trash2 size={14} />{planner("actions.remove")}</button>
                </span> : null}
              </span>
            </li>
          ))}
        </ul>
        {foodRecommendations.length || entertainmentRecommendations.length ? (
          <div className={styles.dayRecommendations}>
            {foodRecommendations.length ? <div><strong>{planner("dailyRecommendations.food")}</strong>{foodRecommendations.map((place) => <button type="button" key={place.id} onClick={() => onSelectRecommendation?.(place)}>{place.name}</button>)}</div> : null}
            {entertainmentRecommendations.length ? <div><strong>{planner("dailyRecommendations.entertainment")}</strong>{entertainmentRecommendations.map((place) => <button type="button" key={place.id} onClick={() => onSelectRecommendation?.(place)}>{place.name}</button>)}</div> : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}