"use client";

/* eslint-disable react-hooks/set-state-in-effect -- This form coordinates async geocoding, places, weather, and AI generation state. */

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  LoaderCircle,
  MapPin,
  WalletCards,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { enhanceItinerary } from "@/features/ai-planner/api/aiPlanner.client";
import type { AiPlannerSource } from "@/features/ai-planner/types";
import { useGeocoding } from "@/features/geocoding/hooks/useGeocoding";
import type { MapCenter } from "@/features/map/types";
import { usePlaces } from "@/features/places/hooks/usePlaces";
import { usePlannerEngine } from "@/features/planner/hooks/usePlannerEngine";
import type { GeneratedItinerary } from "@/features/planner/types";
import { useProvinces } from "@/features/provinces/hooks/useProvinces";
import type { ProvinceOption } from "@/features/provinces/types";
import {
  createProvinceTouristAreaFallback,
  getDefaultTouristArea,
  getTouristAreasByProvince,
} from "@/features/tourist-areas/utils/getTouristAreasByProvince";
import type { TouristArea } from "@/features/tourist-areas/types";
import { useWeather } from "@/features/weather/hooks/useWeather";
import { budgetOptions, dayOptions, destinations } from "../data/mockTrip";
import type { PlannerFormValues } from "../types";
import { EmptyState } from "./EmptyState";
import { InterestChips } from "./InterestChips";
import { ItineraryResult } from "./ItineraryResult";
import { LoadingState } from "./LoadingState";
import styles from "./TripPlanner.module.scss";

type FormErrors = Partial<Record<keyof PlannerFormValues, string>>;

type GeneratedTripContext = {
  province?: string;
  touristArea?: string;
};

const fallbackDestinationOptions: ProvinceOption[] = destinations.map((destination) => ({
  code: destination,
  name: destination,
  displayName: destination,
}));

const initialValues: PlannerFormValues = {
  province: "",
  touristAreaId: "",
  days: "",
  budget: "",
  interests: [],
};

function parseBudget(value: string) {
  return Number.parseInt(value.replace(/[^0-9]/g, ""), 10);
}

function resolveTouristArea(provinceName: string, touristAreaId: string): TouristArea | null {
  if (!provinceName.trim()) {
    return null;
  }

  const areas = getTouristAreasByProvince(provinceName);

  return (
    areas.find((area) => area.id === touristAreaId) ??
    getDefaultTouristArea(areas) ??
    createProvinceTouristAreaFallback(provinceName)
  );
}

export function TripPlannerForm() {
  const locale = useLocale();
  const form = useTranslations("PlannerForm");
  const map = useTranslations("Map");
  const validation = useTranslations("Validation");
  const generateItinerary = usePlannerEngine();
  const { provinces, isLoading: isProvincesLoading, isError: isProvincesError } =
    useProvinces();
  const [values, setValues] = useState<PlannerFormValues>(initialValues);
  const touristAreas = useMemo(
    () => getTouristAreasByProvince(values.province),
    [values.province],
  );
  const selectedTouristArea = useMemo(
    () => resolveTouristArea(values.province, values.touristAreaId),
    [values.province, values.touristAreaId],
  );
  const geocodingQuery = selectedTouristArea?.searchQuery ?? "";
  const {
    coordinates,
    isLoading: isGeocodingLoading,
    isError: isGeocodingError,
  } = useGeocoding(geocodingQuery);
  const [resolvedMapCenter, setResolvedMapCenter] = useState<MapCenter | null>(null);
  const {
    places,
    isLoading: isPlacesLoading,
    isError: isPlacesError,
    hasResolved: hasPlacesResolved,
  } = usePlaces(resolvedMapCenter?.latitude, resolvedMapCenter?.longitude);
  const {
    weather,
    isLoading: isWeatherLoading,
    isError: isWeatherError,
    hasResolved: hasWeatherResolved,
  } = useWeather(resolvedMapCenter?.latitude, resolvedMapCenter?.longitude);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [pendingValues, setPendingValues] = useState<PlannerFormValues | null>(null);
  const [result, setResult] = useState<GeneratedItinerary | null>(null);
  const [generatedTripContext, setGeneratedTripContext] = useState<GeneratedTripContext | null>(null);
  const [aiSource, setAiSource] = useState<AiPlannerSource | "loading" | null>(null);
  const aiRequestIdRef = useRef(0);

  useEffect(() => {
    setErrors({});
  }, [locale]);

  useEffect(() => {
    const defaultArea = getDefaultTouristArea(touristAreas);

    setValues((current) => {
      if (!current.province) {
        return current.touristAreaId ? { ...current, touristAreaId: "" } : current;
      }

      if (!defaultArea) {
        return current.touristAreaId ? { ...current, touristAreaId: "" } : current;
      }

      const hasCurrentArea = touristAreas.some((area) => area.id === current.touristAreaId);

      return hasCurrentArea ? current : { ...current, touristAreaId: defaultArea.id };
    });
  }, [touristAreas]);

  useEffect(() => {
    setResolvedMapCenter(null);
  }, [geocodingQuery]);

  useEffect(() => {
    if (!coordinates) {
      return;
    }

    setResolvedMapCenter({
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
    });
  }, [coordinates]);

  useEffect(() => {
    if (!pendingValues) {
      return;
    }

    const pendingTouristArea = resolveTouristArea(
      pendingValues.province,
      pendingValues.touristAreaId,
    );
    const hasCoordinates = Boolean(resolvedMapCenter) && !isGeocodingError;
    const isWaitingForGeocoding = isGeocodingLoading && !resolvedMapCenter && !isGeocodingError;
    const isWaitingForPlaces = hasCoordinates && !isPlacesError && !hasPlacesResolved;
    const isWaitingForWeather = hasCoordinates && !isWeatherError && !hasWeatherResolved;

    if (!pendingTouristArea) {
      setPendingValues(null);
      setIsLoading(false);
      return;
    }

    if (isWaitingForGeocoding || isWaitingForPlaces || isWaitingForWeather) {
      return;
    }

    const plannerInput = {
      destination: pendingTouristArea.name,
      days: Number(pendingValues.days),
      budget: parseBudget(pendingValues.budget),
      interests: pendingValues.interests,
      places: isPlacesError ? [] : places,
      weather: isWeatherError ? null : weather,
    };
    const nextResult = generateItinerary(plannerInput);
    const nextGeneratedTripContext: GeneratedTripContext = {
      province: pendingValues.province,
      touristArea: pendingTouristArea.name,
    };

    const aiRequestId = aiRequestIdRef.current + 1;
    aiRequestIdRef.current = aiRequestId;

    setPendingValues(null);

    enhanceItinerary({
      locale: locale === "vi" ? "vi" : "en",
      destination: plannerInput.destination,
      selectedProvince: pendingValues.province,
      selectedTouristArea: pendingTouristArea.name,
      touristAreaSearchQuery: pendingTouristArea.searchQuery,
      days: plannerInput.days,
      budget: plannerInput.budget,
      interests: plannerInput.interests,
      baseItinerary: nextResult,
      places: plannerInput.places,
      weather: plannerInput.weather,
    })
      .then((response) => {
        if (aiRequestIdRef.current !== aiRequestId) {
          return;
        }

        setResult(response.itinerary);
        setGeneratedTripContext(nextGeneratedTripContext);
        setAiSource(response.source);
        setIsLoading(false);
      })
      .catch(() => {
        if (aiRequestIdRef.current !== aiRequestId) {
          return;
        }

        setResult(nextResult);
        setGeneratedTripContext(nextGeneratedTripContext);
        setAiSource("fallback");
        setIsLoading(false);
      });
  }, [
    generateItinerary,
    hasPlacesResolved,
    hasWeatherResolved,
    isGeocodingError,
    isGeocodingLoading,
    isPlacesError,
    isWeatherError,
    locale,
    pendingValues,
    places,
    resolvedMapCenter,
    weather,
  ]);

  const destinationOptions = useMemo(() => {
    if (isProvincesError || !provinces.length) {
      return fallbackDestinationOptions;
    }

    return provinces;
  }, [isProvincesError, provinces]);

  const selectedSummary = useMemo(() => {
    const count = values.interests.length;

    if (!count) {
      return form("interestsEmpty");
    }

    return form("interestsSelected", { count });
  }, [form, values.interests.length]);

  function validateForm() {
    const nextErrors: FormErrors = {};

    if (!values.province) {
      nextErrors.province = validation("destination");
    }

    if (!values.days) {
      nextErrors.days = validation("days");
    }

    if (!values.budget) {
      nextErrors.budget = validation("budget");
    }

    if (!values.interests.length) {
      nextErrors.interests = validation("interests");
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function submitPlanner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm()) {
      setPendingValues(null);
      aiRequestIdRef.current += 1;
      setResult(null);
      setGeneratedTripContext(null);
      setAiSource(null);
      setIsLoading(false);
      return;
    }

    aiRequestIdRef.current += 1;
    setIsLoading(true);
    setResult(null);
    setGeneratedTripContext(null);
    setAiSource(null);
    setPendingValues({ ...values });
  }

  return (
    <section className={styles.plannerSection} id="trip-planner">
      <div className={styles.sectionIntro}>
        <span className={styles.eyebrow}>{form("eyebrow")}</span>
        <h2>{form("title")}</h2>
        <p>{form("description")}</p>
      </div>

      <div className={styles.plannerLayout}>
        <form className={styles.formCard} onSubmit={submitPlanner} noValidate>
          <div className={styles.formHeader}>
            <div>
              <span>{form("details")}</span>
              <h2>{form("formTitle")}</h2>
            </div>
          </div>

          <div className={styles.fieldGrid}>
            <label className={`${styles.field} ${styles.fieldWide}`}>
              <span>
                <MapPin size={17} aria-hidden="true" />
                {form("provinceLabel")}
              </span>
              <div className={styles.selectWrap}>
                <select
                  value={values.province}
                  aria-invalid={Boolean(errors.province)}
                  disabled={isProvincesLoading || isLoading}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      province: event.target.value,
                      touristAreaId: "",
                    }))
                  }
                >
                  <option value="">
                    {isProvincesLoading
                      ? form("destinationLoading")
                      : form("destinationPlaceholder")}
                  </option>
                  {!isProvincesLoading
                    ? destinationOptions.map((destination) => (
                        <option key={destination.code} value={destination.displayName}>
                          {destination.displayName}
                        </option>
                      ))
                    : null}
                </select>
                <ChevronDown size={18} aria-hidden="true" />
              </div>
              {isProvincesError ? (
                <small className={styles.fieldNotice}>{form("destinationLoadError")}</small>
              ) : null}
              {errors.province ? (
                <small className={styles.errorText}>{errors.province}</small>
              ) : null}
            </label>

            {values.province ? (
              <label className={`${styles.field} ${styles.fieldWide}`}>
                <span>
                  <MapPin size={17} aria-hidden="true" />
                  {form("touristAreaLabel")}
                </span>
                <div className={styles.selectWrap}>
                  <select
                    value={selectedTouristArea?.id ?? ""}
                    disabled={!touristAreas.length || isLoading}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        touristAreaId: event.target.value,
                      }))
                    }
                  >
                    {touristAreas.length ? (
                      <option value="">{form("touristAreaPlaceholder")}</option>
                    ) : null}
                    {touristAreas.length
                      ? touristAreas.map((area) => (
                          <option key={area.id} value={area.id}>
                            {area.name}
                          </option>
                        ))
                      : selectedTouristArea ? (
                          <option value={selectedTouristArea.id}>{selectedTouristArea.name}</option>
                        ) : null}
                  </select>
                  <ChevronDown size={18} aria-hidden="true" />
                </div>
                <small className={styles.fieldHelper}>{form("touristAreaHelper")}</small>
                {!touristAreas.length ? (
                  <small className={styles.fieldNotice}>{form("touristAreaFallback")}</small>
                ) : null}
                {isGeocodingLoading ? (
                  <small className={styles.fieldNotice}>{map("locationLoading")}</small>
                ) : null}
                {isGeocodingError ? (
                  <small className={styles.fieldNotice}>{map("locationError")}</small>
                ) : null}
              </label>
            ) : null}

            <label className={styles.field}>
              <span>
                <CalendarDays size={17} aria-hidden="true" />
                {form("days")}
              </span>
              <div className={styles.selectWrap}>
                <select
                  value={values.days}
                  aria-invalid={Boolean(errors.days)}
                  disabled={isLoading}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      days: event.target.value
                        ? (Number(event.target.value) as PlannerFormValues["days"])
                        : "",
                    }))
                  }
                >
                  <option value="">{form("daysPlaceholder")}</option>
                  {dayOptions.map((days) => (
                    <option key={days} value={days}>
                      {days}
                    </option>
                  ))}
                </select>
                <ChevronDown size={18} aria-hidden="true" />
              </div>
              {errors.days ? <small className={styles.errorText}>{errors.days}</small> : null}
            </label>

            <label className={styles.field}>
              <span>
                <WalletCards size={17} aria-hidden="true" />
                {form("budget")}
              </span>
              <div className={styles.selectWrap}>
                <select
                  value={values.budget}
                  aria-invalid={Boolean(errors.budget)}
                  disabled={isLoading}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      budget: event.target.value,
                    }))
                  }
                >
                  <option value="">{form("budgetPlaceholder")}</option>
                  {budgetOptions.map((budget) => (
                    <option key={budget} value={budget}>
                      {budget}
                    </option>
                  ))}
                </select>
                <ChevronDown size={18} aria-hidden="true" />
              </div>
              {errors.budget ? (
                <small className={styles.errorText}>{errors.budget}</small>
              ) : null}
            </label>
          </div>

          <div className={styles.interestField}>
            <div className={styles.interestHeader}>
              <div>
                <span>{form("interests")}</span>
                <p>{selectedSummary}</p>
              </div>
              {errors.interests ? (
                <small className={styles.errorText}>{errors.interests}</small>
              ) : null}
            </div>
            <InterestChips
              selected={values.interests}
              onChange={(nextInterests) => {
                setValues((current) => ({ ...current, interests: nextInterests }));
                setErrors((current) => ({ ...current, interests: undefined }));
              }}
            />
          </div>

          <button className={styles.submitButton} type="submit" disabled={isLoading}>
            {isLoading ? (
              <LoaderCircle className={styles.spinIcon} size={19} aria-hidden="true" />
            ) : null}
            {isLoading ? form("submitting") : form("submit")}
          </button>
        </form>

        <div className={styles.resultColumn} aria-live="polite">
          {isLoading ? <LoadingState /> : null}
          {!isLoading && result ? (
            <ItineraryResult
              aiSource={aiSource}
              hasMapCenterError={isGeocodingError}
              isMapCenterLoading={isGeocodingLoading}
              isPlacesError={isPlacesError}
              isPlacesLoading={isPlacesLoading}
              isWeatherError={isWeatherError}
              isWeatherLoading={isWeatherLoading}
              mapCenter={resolvedMapCenter}
              places={isPlacesError ? [] : places}
              province={generatedTripContext?.province}
              touristArea={generatedTripContext?.touristArea}
              trip={result}
              weather={isWeatherError ? null : weather}
            />
          ) : null}
          {!isLoading && !result ? <EmptyState /> : null}
        </div>
      </div>
    </section>
  );
}




