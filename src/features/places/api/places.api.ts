import type { NormalizedPlace } from "../types";

const PLACES_API_PATH = "/api/places";

const placesCache = new Map<string, NormalizedPlace[]>();

type PlacesApiResponse = {
  places?: unknown;
  error?: string;
};

function assertCoordinate(value: number, label: "latitude" | "longitude") {
  if (!Number.isFinite(value)) {
    throw new Error(`Unable to load tourist places: ${label} is invalid.`);
  }
}

function getCacheKey(latitude: number, longitude: number) {
  return `${latitude.toFixed(4)}:${longitude.toFixed(4)}`;
}

function isNormalizedPlace(value: unknown): value is NormalizedPlace {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<NormalizedPlace>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.latitude === "number" &&
    Number.isFinite(candidate.latitude) &&
    typeof candidate.longitude === "number" &&
    Number.isFinite(candidate.longitude) &&
    typeof candidate.category === "string" &&
    candidate.source === "geoapify"
  );
}

function normalizeApiResponse(payload: PlacesApiResponse): NormalizedPlace[] {
  if (!Array.isArray(payload.places)) {
    throw new Error(payload.error ?? "Unable to load tourist places.");
  }

  return payload.places.filter(isNormalizedPlace);
}

function buildPlacesApiUrl(latitude: number, longitude: number) {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
  });

  return `${PLACES_API_PATH}?${params.toString()}`;
}

export async function getNearbyPlaces(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<NormalizedPlace[]> {
  assertCoordinate(latitude, "latitude");
  assertCoordinate(longitude, "longitude");

  const cacheKey = getCacheKey(latitude, longitude);
  const cachedPlaces = placesCache.get(cacheKey);

  if (cachedPlaces) {
    return cachedPlaces;
  }

  const response = await fetch(buildPlacesApiUrl(latitude, longitude), {
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  const payload = (await response.json()) as PlacesApiResponse;

  if (!response.ok) {
    throw new Error(payload.error ?? "Unable to load tourist places.");
  }

  const places = normalizeApiResponse(payload);

  placesCache.set(cacheKey, places);
  return places;
}
