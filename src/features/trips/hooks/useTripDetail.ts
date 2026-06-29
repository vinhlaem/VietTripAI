"use client";

/* eslint-disable react-hooks/set-state-in-effect -- The hook mirrors Firebase auth and Firestore request state for a client-only detail page. */
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getTripById } from "../api/trips.client";
import type { SavedTrip } from "../types";

export function useTripDetail(tripId: string) {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
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

    if (isAuthLoading) {
      setIsLoading(true);
      setIsError(false);
      setError(null);
      return () => {
        isMounted = false;
      };
    }

    if (!isAuthenticated || !user) {
      setTrip(null);
      setIsLoading(false);
      setIsError(false);
      setError(null);
      return () => {
        isMounted = false;
      };
    }

    if (!tripId.trim()) {
      setTrip(null);
      setIsLoading(false);
      setIsError(true);
      setError(new Error("Trip id is required."));
      return () => {
        isMounted = false;
      };
    }

    setIsLoading(true);
    setIsError(false);
    setError(null);

    getTripById(user.uid, tripId)
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
            : new Error("Unable to load trip."),
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
  }, [isAuthenticated, isAuthLoading, refreshIndex, tripId, user]);

  return {
    trip,
    isLoading,
    isError,
    error,
    refetch,
  };
}
