"use client";

import { useEffect, useState } from "react";
import { getNearbyPlaces } from "../api/places.api";
import type { NormalizedPlace, PlacesQueryGroup } from "../types";

type UsePlacesOptions = {
  enabled?: boolean;
  group?: PlacesQueryGroup;
};

type UsePlacesResult = {
  places: NormalizedPlace[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  hasResolved: boolean;
};

const REQUEST_DEBOUNCE_MS = 250;

export function usePlaces(
  latitude?: number | null,
  longitude?: number | null,
  options: UsePlacesOptions = {},
): UsePlacesResult {
  const { enabled = true, group = "attraction" } = options;
  const [places, setPlaces] = useState<NormalizedPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasResolved, setHasResolved] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      setError(null);
      setHasResolved(false);
      return;
    }

    if (latitude == null || longitude == null) {
      setPlaces([]);
      setIsLoading(false);
      setError(null);
      setHasResolved(false);
      setHasResolved(false);
      return;
    }

    const resolvedLatitude = latitude;
    const resolvedLongitude = longitude;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      async function loadPlaces() {
        try {
          setIsLoading(true);
          setError(null);
          setHasResolved(false);

          const nextPlaces = await getNearbyPlaces(
            resolvedLatitude,
            resolvedLongitude,
            group,
            controller.signal,
          );
          setPlaces(nextPlaces);
        } catch (unknownError) {
          if (controller.signal.aborted) {
            return;
          }

          setPlaces([]);
          setError(
            unknownError instanceof Error
              ? unknownError
              : new Error("Unable to load places."),
          );
        } finally {
          if (!controller.signal.aborted) {
            setIsLoading(false);
            setHasResolved(true);
          }
        }
      }

      loadPlaces();
    }, REQUEST_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [enabled, group, latitude, longitude]);

  return {
    places,
    isLoading,
    isError: Boolean(error),
    error,
    hasResolved,
  };
}

