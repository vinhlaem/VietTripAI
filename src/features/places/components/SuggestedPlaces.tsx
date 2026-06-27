"use client";

import { Map } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePlaces } from "../hooks/usePlaces";
import type { NormalizedPlace } from "../types";
import { PlaceCard } from "./PlaceCard";
import styles from "./Places.module.scss";

type SuggestedPlacesProps = {
  hasLocationError?: boolean;
  isLocationLoading?: boolean;
  isPlacesError?: boolean;
  isPlacesLoading?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  onSelectPlace?: (place: NormalizedPlace) => void;
  places?: NormalizedPlace[];
  selectedPlaceId?: string | null;
};

function PlacesSkeleton() {
  const places = useTranslations("Places");

  return (
    <div className={styles.skeletonList} aria-label={places("loading")} role="status">
      {[0, 1, 2, 3].map((item) => (
        <span className={styles.skeletonCard} key={item} />
      ))}
    </div>
  );
}

export function SuggestedPlaces({
  hasLocationError = false,
  isLocationLoading = false,
  isPlacesError,
  isPlacesLoading,
  latitude,
  longitude,
  onSelectPlace,
  places: providedPlaces,
  selectedPlaceId,
}: SuggestedPlacesProps) {
  const placesT = useTranslations("Places");
  const shouldUseProvidedPlaces = providedPlaces !== undefined;
  const fetchedPlaces = usePlaces(latitude, longitude, {
    enabled: !shouldUseProvidedPlaces,
  });
  const places = providedPlaces ?? fetchedPlaces.places;
  const loading = isPlacesLoading ?? fetchedPlaces.isLoading;
  const error = isPlacesError ?? fetchedPlaces.isError;

  const shouldShowError = hasLocationError || error;
  const shouldShowLoading =
    isLocationLoading ||
    loading ||
    (!shouldShowError && latitude == null) ||
    (!shouldShowError && longitude == null);
  const shouldShowEmpty = !shouldShowError && !shouldShowLoading && places.length === 0;

  return (
    <section className={styles.placesPanel} aria-labelledby="suggested-places-title">
      <div className={styles.panelHeading}>
        <span className={styles.panelIcon} aria-hidden="true">
          <Map size={18} />
        </span>
        <div>
          <h2 id="suggested-places-title">{placesT("title")}</h2>
          <p>{placesT("nearby")}</p>
        </div>
      </div>

      {shouldShowError ? (
        <div className={styles.errorState} role="status">
          {placesT("error")}
        </div>
      ) : null}

      {!shouldShowError && shouldShowLoading ? <PlacesSkeleton /> : null}

      {shouldShowEmpty ? (
        <div className={styles.emptyState} role="status">
          {placesT("empty")}
        </div>
      ) : null}

      {!shouldShowError && !shouldShowLoading && places.length > 0 ? (
        <div className={styles.placeList}>
          {places.map((place) => (
            <PlaceCard
              isActive={selectedPlaceId === place.id}
              key={place.id}
              onSelect={(selectedPlace) => onSelectPlace?.(selectedPlace)}
              place={place}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
