"use client";

import dynamic from "next/dynamic";
import { Map } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { DayPlanCard } from "@/features/trip-planner/components/DayPlanCard";
import { CostBreakdown } from "@/features/trip-planner/components/CostBreakdown";
import { PlaceCard } from "@/features/places/components/PlaceCard";
import { WeatherForecast } from "@/features/weather/components/WeatherForecast";
import type { MapCenter } from "@/features/map/types";
import type { NormalizedPlace } from "@/features/places/types";
import type { SavedTrip } from "../types";
import { TripDetailHeader } from "./TripDetailHeader";
import styles from "./TripDetail.module.scss";

const TripMap = dynamic(
  () => import("@/features/map/components/TripMap").then((module) => module.TripMap),
  { ssr: false },
);

type TripReadOnlyContentProps = {
  footerCta?: ReactNode;
  headerActions?: ReactNode;
  showBackLink?: boolean;
  topBanner?: ReactNode;
  trip: SavedTrip;
};

function getMapCenter(places: NormalizedPlace[]): MapCenter | null {
  if (places.length === 0) {
    return null;
  }

  const coordinateTotal = places.reduce(
    (total, place) => ({
      latitude: total.latitude + place.latitude,
      longitude: total.longitude + place.longitude,
    }),
    { latitude: 0, longitude: 0 },
  );

  return {
    latitude: coordinateTotal.latitude / places.length,
    longitude: coordinateTotal.longitude / places.length,
  };
}

export function TripReadOnlyContent({
  footerCta,
  headerActions,
  showBackLink = true,
  topBanner,
  trip,
}: TripReadOnlyContentProps) {
  const tripsText = useTranslations("Trips");
  const result = useTranslations("Result");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  function handleSelectPlace(place: NormalizedPlace) {
    setSelectedPlaceId(place.id);
  }

  const mapCenter = getMapCenter(trip.places);

  return (
    <main className={styles.detailPage}>
      {topBanner}

      <TripDetailHeader
        actions={headerActions}
        showBackLink={showBackLink}
        trip={trip}
      />

      <section className={styles.summaryPanel} aria-labelledby="trip-detail-summary-title">
        <h2 id="trip-detail-summary-title">{result("itinerary")}</h2>
        <p>{trip.itinerary.summary}</p>
        {trip.itinerary.tips?.length ? (
          <ul>
            {trip.itinerary.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className={styles.itinerarySection} aria-labelledby="trip-detail-itinerary-title">
        <h2 id="trip-detail-itinerary-title">{result("itinerary")}</h2>
        <div className={styles.dayStack}>
          {trip.itinerary.dailyPlans.map((plan) => (
            <DayPlanCard plan={plan} key={plan.day} />
          ))}
        </div>
      </section>

      {trip.places.length ? (
        <TripMap
          center={mapCenter}
          locations={trip.places}
          onSelectLocation={setSelectedPlaceId}
          selectedLocationId={selectedPlaceId}
        />
      ) : null}

      <div className={styles.insightGrid}>
        <section className={styles.savedPlacesPanel} aria-labelledby="saved-places-title">
          <div className={styles.panelHeading}>
            <span className={styles.panelIcon} aria-hidden="true">
              <Map size={18} />
            </span>
            <div>
              <h2 id="saved-places-title">{tripsText("savedPlaces")}</h2>
              <p>{tripsText("savedPlacesDescription")}</p>
            </div>
          </div>
          {trip.places.length ? (
            <div className={styles.savedPlacesList}>
              {trip.places.map((place) => (
                <PlaceCard
                  isActive={selectedPlaceId === place.id}
                  key={place.id}
                  onSelect={handleSelectPlace}
                  place={place}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyInlineState}>{tripsText("noSavedPlaces")}</div>
          )}
        </section>

        {trip.weather ? (
          <WeatherForecast
            latitude={mapCenter?.latitude}
            longitude={mapCenter?.longitude}
            weather={trip.weather}
          />
        ) : null}

        <CostBreakdown costs={trip.itinerary.estimatedCost} />
      </div>

      {footerCta}
    </main>
  );
}
