"use client";

import { useEffect, useState } from "react";
import { getVietnamProvinces } from "../api/provinces.api";
import type { ProvinceOption } from "../types";

type UseProvincesResult = {
  provinces: ProvinceOption[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
};

export function useProvinces(): UseProvincesResult {
  const [provinces, setProvinces] = useState<ProvinceOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProvinces() {
      try {
        setIsLoading(true);
        setError(null);

        const nextProvinces = await getVietnamProvinces(controller.signal);
        setProvinces(nextProvinces);
      } catch (unknownError) {
        if (controller.signal.aborted) {
          return;
        }

        setProvinces([]);
        setError(
          unknownError instanceof Error
            ? unknownError
            : new Error("Failed to load Vietnam provinces."),
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadProvinces();

    return () => {
      controller.abort();
    };
  }, []);

  return {
    provinces,
    isLoading,
    isError: Boolean(error),
    error,
  };
}
