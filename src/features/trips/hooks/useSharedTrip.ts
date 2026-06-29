"use client";

/* eslint-disable react-hooks/set-state-in-effect -- The hook mirrors Firestore request state for a public client-only share page. */
import { useCallback, useEffect, useState } from "react";
import { getTripByShareSlug } from "../api/trips.client";
import type { SavedTrip } from "../types";

export function useSharedTrip(slug: string) {
  const [trip, setTrip] = useState<SavedTrip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const refetch = useCallback(() => {
    setRefreshIndex((currentIndex) => currentIndex + 1);
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (!slug.trim()) {
      setTrip(null);
      setIsLoading(false);
      setIsError(true);
      setError(new Error("Share slug is required."));
      return () => {
        isMounted = false;
      };
    }

    setIsLoading(true);
    setIsError(false);
    setError(null);

    getTripByShareSlug(slug)
      .then((nextTrip) => {
        if (!isMounted) {
          return;
        }

        setTrip(nextTrip);
      })
      .catch((nextError: unknown) => {
        if (!isMounted) {
          return;
        }

        setTrip(null);
        setIsError(true);
        setError(
          nextError instanceof Error
            ? nextError
            : new Error("Unable to load shared trip."),
        );
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [refreshIndex, slug]);

  return {
    trip,
    isLoading,
    isError,
    error,
    refetch,
  };
}
