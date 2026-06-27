"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { CalendarCheck2, Sparkles } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { SuggestedPlaces } from "@/features/places/components/SuggestedPlaces";
import type { NormalizedPlace } from "@/features/places/types";
import type { AiPlannerSource } from "@/features/ai-planner/types";
import type { GeneratedItinerary } from "@/features/planner/types";
import type { NormalizedWeather } from "@/features/weather/types";
import { WeatherForecast } from "@/features/weather/components/WeatherForecast";
import type { MapCenter } from "@/features/map/types";
import { CostBreakdown } from "./CostBreakdown";
import { DayPlanCard } from "./DayPlanCard";
import styles from "./TripPlanner.module.scss";

const TripMap = dynamic(
  () => import("@/features/map/components/TripMap").then((module) => module.TripMap),
  { ssr: false },
);

type ItineraryResultProps = {
  aiSource?: AiPlannerSource | "loading" | null;
  hasMapCenterError?: boolean;
  isMapCenterLoading?: boolean;
  isPlacesError?: boolean;
  isPlacesLoading?: boolean;
  isWeatherError?: boolean;
  isWeatherLoading?: boolean;
  mapCenter?: MapCenter | null;
  places: NormalizedPlace[];
  trip: GeneratedItinerary;
  weather: NormalizedWeather | null;
};

function formatBudget(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "VND",
  }).format(value);
}

export function ItineraryResult({
  aiSource,
  hasMapCenterError = false,
  isMapCenterLoading = false,
  isPlacesError = false,
  isPlacesLoading = false,
  isWeatherError = false,
  isWeatherLoading = false,
  mapCenter,
  places,
  trip,
  weather,
}: ItineraryResultProps) {
  const locale = useLocale();
  const result = useTranslations("Result");
  const planner = useTranslations("Planner");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const hasFallbackData = trip.warnings.some((warning) =>
    ["warnings.placesFallback", "warnings.weatherFallback"].includes(warning),
  );
  const aiStatusLabel = aiSource === "loading"
    ? planner("aiLoading")
    : aiSource === "ai-enhanced"
      ? planner("aiEnhanced")
      : planner("basicItinerary");

  const handleSelectPlace = useCallback((place: NormalizedPlace) => {
    setSelectedPlaceId(place.id);
  }, []);

  return (
    <section className={styles.result} aria-labelledby="itinerary-result-title">
      <div className={styles.resultHero}>
        <span className={styles.eyebrow}>
          <Sparkles size={15} aria-hidden="true" />
          {planner(hasFallbackData ? "fallbackNotice" : "generatedFromRealData")}
        </span>
        <div className={styles.resultTitleRow}>
          <div>
            <h2 id="itinerary-result-title">{trip.destination}</h2>
            <p>
              {result("days", { count: trip.days })} · {formatBudget(trip.budget, locale)}
            </p>
          </div>
          <div className={styles.resultHeroAside}>
            <span className={styles.aiBadge}>{aiStatusLabel}</span>
            <CalendarCheck2 size={28} aria-hidden="true" />
          </div>
        </div>
      </div>

      <section className={styles.plannerSummary} aria-labelledby="planner-summary-title">
        <div>
          <h2 id="planner-summary-title">{planner("summaryTitle")}</h2>
          <p>{trip.summaryKey ? planner(trip.summaryKey, { destination: trip.destination, days: trip.days }) : trip.summary}</p>
        </div>
        {trip.warnings.length || trip.tips?.length ? (
          <div>
            <h3>{planner("warningsTitle")}</h3>
            <ul>
              {trip.warnings.map((warning) => (
                <li key={warning}>{planner(warning)}</li>
              ))}
              {trip.tips?.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <div className={styles.itineraryStack}>
        <h2>{result("itinerary")}</h2>
        {trip.dailyPlans.map((plan) => (
          <DayPlanCard plan={plan} key={plan.day} />
        ))}
      </div>

      <TripMap
        center={mapCenter}
        hasLocationError={hasMapCenterError}
        isLocationLoading={isMapCenterLoading || isPlacesLoading}
        locations={places}
        onSelectLocation={setSelectedPlaceId}
        selectedLocationId={selectedPlaceId}
      />

      <div className={styles.insightGrid}>
        <SuggestedPlaces
          hasLocationError={hasMapCenterError}
          isLocationLoading={isMapCenterLoading}
          isPlacesError={isPlacesError}
          isPlacesLoading={isPlacesLoading}
          latitude={mapCenter?.latitude}
          longitude={mapCenter?.longitude}
          onSelectPlace={handleSelectPlace}
          places={places}
          selectedPlaceId={selectedPlaceId}
        />
        <WeatherForecast
          hasLocationError={hasMapCenterError}
          isLocationLoading={isMapCenterLoading}
          isWeatherError={isWeatherError}
          isWeatherLoading={isWeatherLoading}
          latitude={mapCenter?.latitude}
          longitude={mapCenter?.longitude}
          weather={weather}
        />
        <CostBreakdown costs={trip.estimatedCost} />
      </div>
    </section>
  );
}


