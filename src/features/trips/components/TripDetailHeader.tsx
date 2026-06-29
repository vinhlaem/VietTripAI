"use client";

import { ArrowLeft, CalendarCheck2, CalendarDays, MapPin, Sparkles, Tags, WalletCards } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import type { SavedTrip } from "../types";
import styles from "./TripDetail.module.scss";

type TripDetailHeaderProps = {
  actions?: ReactNode;
  showBackLink?: boolean;
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

export function TripDetailHeader({ actions, showBackLink = true, trip }: TripDetailHeaderProps) {
  const locale = useLocale();
  const trips = useTranslations("Trips");
  const planner = useTranslations("Planner");
  const plannerForm = useTranslations("PlannerForm");
  const interestTranslations = useTranslations("Interests");
  const sourceLabel =
    trip.aiSource === "ai-enhanced"
      ? planner("aiEnhanced")
      : trip.aiSource === "fallback"
        ? planner("basicItinerary")
        : null;

  return (
    <header className={styles.detailHeader}>
      {showBackLink ? (
        <Link className={styles.backLink} href="/my-trips">
          <ArrowLeft size={17} aria-hidden="true" />
          {trips("backToMyTrips")}
        </Link>
      ) : null}

      <div className={styles.headerMain}>
        <div>
          <span className={styles.eyebrow}>{trips("tripDetail")}</span>
          <h1>{trip.destination}</h1>
          <div className={styles.locationLine}>
            {trip.province ? (
              <span>
                <MapPin size={15} aria-hidden="true" />
                {plannerForm("provinceLabel")}: {trip.province}
              </span>
            ) : null}
            {trip.touristArea ? (
              <span>
                <MapPin size={15} aria-hidden="true" />
                {plannerForm("touristAreaLabel")}: {trip.touristArea}
              </span>
            ) : null}
          </div>
        </div>
        <div className={styles.headerAside}>
          {sourceLabel ? (
            <span className={styles.aiBadge}>
              <Sparkles size={15} aria-hidden="true" />
              {sourceLabel}
            </span>
          ) : null}
          {actions}
        </div>
      </div>

      <section className={styles.overviewPanel} aria-labelledby="trip-overview-title">
        <h2 id="trip-overview-title">{trips("tripOverview")}</h2>
        <dl className={styles.overviewGrid}>
          <div>
            <dt>
              <CalendarDays size={16} aria-hidden="true" />
              {trips("duration")}
            </dt>
            <dd>{trips("days", { count: trip.days })}</dd>
          </div>
          <div>
            <dt>
              <CalendarCheck2 size={16} aria-hidden="true" />
              {trips("createdAt")}
            </dt>
            <dd>{formatDate(trip.createdAt, locale)}</dd>
          </div>
          <div>
            <dt>
              <WalletCards size={16} aria-hidden="true" />
              {trips("budget")}
            </dt>
            <dd>{formatBudget(trip.budget, locale)}</dd>
          </div>
          <div className={styles.interestOverview}>
            <dt>
              <Tags size={16} aria-hidden="true" />
              {trips("interests")}
            </dt>
            <dd>
              {trip.interests.map((interest) => (
                <span key={interest}>{interestTranslations(interest)}</span>
              ))}
            </dd>
          </div>
        </dl>
      </section>
    </header>
  );
}
