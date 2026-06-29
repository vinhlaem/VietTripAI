/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRequireAuthAction } from "@/features/auth/hooks/useRequireAuthAction";
import { saveTrip } from "../api/trips.client";
import type { SavedTrip, SaveTripInput } from "../types";

function buildSaveKey(input: SaveTripInput | null) {
  if (!input) {
    return "";
  }

  return JSON.stringify({
    destination: input.destination,
    days: input.days,
    budget: input.budget,
    interests: input.interests,
    summary: input.itinerary.summary,
    planIds: input.itinerary.dailyPlans.map((plan) =>
      plan.activities.map((activity) => activity.id),
    ),
    places: input.places.map((place) => place.id),
    aiSource: input.aiSource,
  });
}

export function useSaveTrip(input: SaveTripInput | null) {
  const { authPromptModalProps, runWithAuth } = useRequireAuthAction();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [savedTrip, setSavedTrip] = useState<SavedTrip | null>(null);
  const saveKey = useMemo(() => buildSaveKey(input), [input]);

  useEffect(() => {
    setIsSaving(false);
    setIsSaved(false);
    setError(null);
    setSavedTrip(null);
  }, [saveKey]);

  const saveGeneratedTrip = useCallback(async () => {
    if (!input || isSaving || isSaved) {
      return null;
    }

    setError(null);

    return runWithAuth(async (user) => {
      setIsSaving(true);

      try {
        const nextSavedTrip = await saveTrip(user.uid, input);
        setSavedTrip(nextSavedTrip);
        setIsSaved(true);

        return nextSavedTrip;
      } catch (nextError) {
        console.error("Failed to save trip:", nextError);
        setError(
          nextError instanceof Error
            ? nextError
            : new Error("Unable to save trip."),
        );
        return null;
      } finally {
        setIsSaving(false);
      }
    });
  }, [input, isSaved, isSaving, runWithAuth]);

  return {
    authPromptModalProps,
    error,
    isSaved,
    isSaving,
    saveGeneratedTrip,
    savedTrip,
  };
}
