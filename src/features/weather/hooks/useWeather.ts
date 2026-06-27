"use client";

import { useEffect, useState } from "react";
import { getWeatherForecast } from "../api/weather.api";
import type { NormalizedWeather } from "../types";

type UseWeatherOptions = {
  enabled?: boolean;
};

type UseWeatherResult = {
  weather: NormalizedWeather | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  hasResolved: boolean;
};

export function useWeather(
  latitude?: number | null,
  longitude?: number | null,
  options: UseWeatherOptions = {},
): UseWeatherResult {
  const { enabled = true } = options;
  const [weather, setWeather] = useState<NormalizedWeather | null>(null);
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
      setWeather(null);
      setIsLoading(false);
      setError(null);
      setHasResolved(false);
      setHasResolved(false);
      return;
    }

    const resolvedLatitude = latitude;
    const resolvedLongitude = longitude;
    const controller = new AbortController();

    async function loadWeather() {
      try {
        setIsLoading(true);
        setError(null);
        setHasResolved(false);

        const nextWeather = await getWeatherForecast(
          resolvedLatitude,
          resolvedLongitude,
          controller.signal,
        );
        setWeather(nextWeather);
      } catch (unknownError) {
        if (controller.signal.aborted) {
          return;
        }

        setWeather(null);
        setError(
          unknownError instanceof Error
            ? unknownError
            : new Error("Unable to load weather."),
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
          setHasResolved(true);
        }
      }
    }

    loadWeather();

    return () => {
      controller.abort();
    };
  }, [enabled, latitude, longitude]);

  return {
    weather,
    isLoading,
    isError: Boolean(error),
    error,
    hasResolved,
  };
}

