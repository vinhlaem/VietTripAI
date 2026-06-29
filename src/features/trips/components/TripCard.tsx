"use client";

import { CalendarDays, MapPin, Sparkles, Tags, WalletCards } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { SavedTrip } from "../types";
import styles from "./MyTrips.module.scss";

type TripCardProps = {
  trip: SavedTrip;
};

function formatDate(value: string, locale: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatBudget(value: number, locale: string) {
  return new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
    currency: "VND",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

export function TripCard({ trip }: TripCardProps) {
  const locale = useLocale();
  const trips = useTranslations("Trips");
  const planner = useTranslations("Planner");
  const interestTranslations = useTranslations("Interests");
  const sourceLabel =
    trip.aiSource === "ai-enhanced"
      ? planner("aiEnhanced")
      : trip.aiSource === "fallback"
        ? planner("basicItinerary")
        : null;

  return (
    <article className={styles.tripCard}>
      <div className={styles.cardTopline}>
        <span className={styles.destinationIcon} aria-hidden="true">
          <MapPin size={18} />
        </span>
        {sourceLabel ? (
          <span className={styles.aiBadge}>
            <Sparkles size={14} aria-hidden="true" />
            {sourceLabel}
          </span>
        ) : null}
      </div>

      <div className={styles.cardTitleGroup}>
        <h2>{trip.destination}</h2>
        {trip.touristArea ? <p>{trip.touristArea}</p> : null}
      </div>

      <dl className={styles.tripMetaGrid}>
        <div>
          <dt>
            <CalendarDays size={15} aria-hidden="true" />
            {trips("days", { count: trip.days })}
          </dt>
          <dd>
            <span>{trips("createdAt")}</span>
            {formatDate(trip.createdAt, locale)}
          </dd>
        </div>
        <div>
          <dt>
            <WalletCards size={15} aria-hidden="true" />
            {trips("budget")}
          </dt>
          <dd>{formatBudget(trip.budget, locale)}</dd>
        </div>
      </dl>

      <div className={styles.interestBlock}>
        <span>
          <Tags size={15} aria-hidden="true" />
          {trips("interests")}
        </span>
        <div className={styles.interestList}>
          {trip.interests.map((interest) => (
            <span key={interest}>{interestTranslations(interest)}</span>
          ))}
        </div>
      </div>

      <Link className={styles.viewButton} href={`/trips/${trip.id}`}>
        {trips("viewTrip")}
      </Link>
    </article>
  );
}
