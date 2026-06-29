"use client";

/* eslint-disable react-hooks/set-state-in-effect -- The hook mirrors Firebase auth and Firestore request state for a client-only page. */
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getUserTrips } from "../api/trips.client";
import type { SavedTrip } from "../types";

export function useUserTrips() {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const [trips, setTrips] = useState<SavedTrip[]>([]);
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
      setTrips([]);
      setIsLoading(false);
      setIsError(false);
      setError(null);
      return () => {
        isMounted = false;
      };
    }

    setIsLoading(true);
    setIsError(false);
    setError(null);

    getUserTrips(user.uid)
      .then((nextTrips) => {
        if (!isMounted) {
          return;
        }

        setTrips(nextTrips);
      })
      .catch((nextError: unknown) => {
        if (!isMounted) {
          return;
        }

        setTrips([]);
        setIsError(true);
        setError(
          nextError instanceof Error
            ? nextError
            : new Error("Unable to load trips."),
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
  }, [isAuthenticated, isAuthLoading, refreshIndex, user]);

  return {
    trips,
    isLoading,
    isError,
    error,
    refetch,
  };
}
