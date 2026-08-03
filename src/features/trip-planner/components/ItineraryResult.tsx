"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { CalendarCheck2, Sparkles } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { SuggestedPlaces } from "@/features/places/components/SuggestedPlaces";
import { SaveTripButton } from "@/features/trips/components/SaveTripButton";
import type { NormalizedPlace } from "@/features/places/types";
import type { AiPlannerSource } from "@/features/ai-planner/types";
import type { GeneratedItinerary } from "@/features/planner/types";
import { recalculateItinerary } from "@/features/planner/utils/recalculateItinerary";
import { TripTools } from "./TripTools";
import type { NormalizedWeather } from "@/features/weather/types";
import type { SaveTripInput } from "@/features/trips/types";
import { NearbyRecommendations } from "@/features/recommendations/components/NearbyRecommendations";
import type { HotelSearchContext, TripRecommendations } from "@/features/recommendations/types";
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
  recommendations: TripRecommendations;
  hotelSearch?: HotelSearchContext;
  province?: string;
  touristArea?: string;
  trip: GeneratedItinerary;
  onTripChange?: (trip: GeneratedItinerary) => void;
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
  recommendations,
  hotelSearch,
  province,
  touristArea,
  trip,
  onTripChange,
  weather,
}: ItineraryResultProps) {
  const locale = useLocale();
  const result = useTranslations("Result");
  const planner = useTranslations("Planner");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [editor, setEditor] = useState<{ day: number; activityId?: string; title: string } | null>(null);
  const hasFallbackData = trip.warnings.some((warning) =>
    ["warnings.placesFallback", "warnings.weatherFallback"].includes(warning),
  );
  const aiStatusLabel = aiSource === "loading"
    ? planner("aiLoading")
    : aiSource === "ai-enhanced"
      ? planner("aiEnhanced")
      : planner("basicItinerary");
  const saveTripInput: SaveTripInput = {
    destination: trip.destination,
    ...(province ? { province } : {}),
    ...(touristArea ? { touristArea } : {}),
    days: trip.days,
    budget: trip.budget,
    interests: trip.interests,
    itinerary: trip,
    places,
    weather,
    ...(aiSource === "ai-enhanced" || aiSource === "fallback" ? { aiSource } : {}),
  };

  const handleSelectPlace = useCallback((place: NormalizedPlace) => {
    setSelectedPlaceId(place.id);
  }, []);
  function updateDay(day: number, updater: (plan: GeneratedItinerary["dailyPlans"][number]) => GeneratedItinerary["dailyPlans"][number]) {
    onTripChange?.(recalculateItinerary({ ...trip, dailyPlans: trip.dailyPlans.map((plan) => plan.day === day ? updater(plan) : plan) }));
  }
  function addActivity(day: number) {
    setEditor({ day, title: "" });
  }
  function editActivity(day: number, activityId: string) {
    const activity = trip.dailyPlans.find((plan) => plan.day === day)?.activities.find((item) => item.id === activityId);
    if (activity) setEditor({ day, activityId, title: activity.placeName ?? activity.title });
  }
  function saveEditor() {
    if (!editor?.title.trim()) return;
    if (editor.activityId) {
      updateDay(editor.day, (plan) => ({ ...plan, activities: plan.activities.map((item) => item.id === editor.activityId ? { ...item, title: editor.title.trim(), titleKey: undefined, placeName: editor.title.trim() } : item) }));
    } else {
      updateDay(editor.day, (plan) => ({ ...plan, activities: [...plan.activities, { id: editor.day + "-custom-" + Date.now(), timeOfDay: "evening", title: editor.title.trim(), description: planner("activityDescriptions.custom"), estimatedCost: 0, startTime: "20:00", durationMinutes: 90, environment: "mixed", accessibility: "easy" }] }));
    }
    setEditor(null);
  }
  function removeActivity(day: number, activityId: string) {
    updateDay(day, (plan) => ({ ...plan, activities: plan.activities.filter((item) => item.id !== activityId) }));
  }
  function regenerateDay(day: number) {
    const usedNames = new Set(trip.dailyPlans.flatMap((plan) => plan.activities.map((activity) => activity.placeName)));
    const alternative = places.find((place) => !usedNames.has(place.name));
    updateDay(day, (plan) => {
      if (!alternative || !plan.activities.length) return { ...plan, activities: [...plan.activities.slice(1), ...plan.activities.slice(0, 1)] };
      const [first, ...rest] = plan.activities;
      return { ...plan, activities: [{ ...first, id: day + "-alternative-" + alternative.id, title: alternative.name, titleKey: undefined, placeName: alternative.name, description: alternative.address ?? alternative.name, descriptionKey: undefined, latitude: alternative.latitude, longitude: alternative.longitude, category: alternative.category }, ...rest] };
    });
  }

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
            <SaveTripButton trip={saveTripInput} />
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
          <DayPlanCard editable={Boolean(onTripChange)} foodRecommendations={recommendations.food.slice((plan.day - 1) * 2, plan.day * 2)} entertainmentRecommendations={recommendations.entertainment.slice(plan.day - 1, plan.day)} onSelectRecommendation={handleSelectPlace} onAdd={addActivity} onEdit={editActivity} onRemove={removeActivity} onRegenerate={regenerateDay} plan={plan} key={plan.day} />
        ))}
      </div>

      <TripTools guests={hotelSearch?.guests} startDate={hotelSearch?.checkIn} trip={trip} weather={weather} />

      <NearbyRecommendations hotelSearch={hotelSearch} recommendations={recommendations} onSelectPlace={handleSelectPlace} selectedPlaceId={selectedPlaceId} />

      <TripMap
        center={mapCenter}
        hasLocationError={hasMapCenterError}
        isLocationLoading={isMapCenterLoading || isPlacesLoading}
        locations={[...places, ...recommendations.hotels, ...recommendations.food, ...recommendations.entertainment]}
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
      {editor ? (
        <div className={styles.editorBackdrop} role="presentation" onMouseDown={() => setEditor(null)}>
          <section className={styles.editorModal} role="dialog" aria-modal="true" aria-labelledby="activity-editor-title" onMouseDown={(event) => event.stopPropagation()}>
            <h2 id="activity-editor-title">{planner(editor.activityId ? "actions.editPrompt" : "actions.addPrompt")}</h2>
            <label>
              <span>{planner("actions.activityName")}</span>
              <input autoFocus value={editor.title} onChange={(event) => setEditor((current) => current ? { ...current, title: event.target.value } : current)} onKeyDown={(event) => { if (event.key === "Enter") saveEditor(); }} />
            </label>
            <div className={styles.editorActions}>
              <button type="button" onClick={() => setEditor(null)}>{planner("actions.cancel")}</button>
              <button type="button" onClick={saveEditor}>{planner("actions.save")}</button>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}






