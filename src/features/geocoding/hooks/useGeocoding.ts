"use client";

import { useEffect, useState } from "react";
import { getCoordinates } from "../api/geocoding.api";
import type { GeocodingResult } from "../types";

type UseGeocodingResult = {
  coordinates: GeocodingResult | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
};

export function useGeocoding(destination: string): UseGeocodingResult {
  const [coordinates, setCoordinates] = useState<GeocodingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const normalizedDestination = destination.trim();

    if (!normalizedDestination) {
      setCoordinates(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();

    async function resolveCoordinates() {
      try {
        setIsLoading(true);
        setError(null);

        const nextCoordinates = await getCoordinates(
          normalizedDestination,
          controller.signal,
        );
        setCoordinates(nextCoordinates);
      } catch (unknownError) {
        if (controller.signal.aborted) {
          return;
        }

        setCoordinates(null);
        setError(
          unknownError instanceof Error
            ? unknownError
            : new Error("Unable to resolve location."),
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    resolveCoordinates();

    return () => {
      controller.abort();
    };
  }, [destination]);

  return {
    coordinates,
    isLoading,
    isError: Boolean(error),
    error,
  };
}
