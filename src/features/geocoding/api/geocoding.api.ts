import type { GeocodingResult, NominatimSearchResult } from "../types";
import { normalizeGeocoding } from "../utils/normalizeGeocoding";

const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search";

const coordinatesCache = new Map<string, GeocodingResult>();

function getCacheKey(destination: string) {
  return destination.trim().toLocaleLowerCase("vi-VN");
}

function normalizeSearchQuery(destination: string) {
  return destination
    .trim()
    .replace(/\s*,\s*/g, ", ")
    .replace(/(?:,\s*Vietnam\s*){2,}$/i, ", Vietnam");
}

function ensureVietnamSuffix(destination: string) {
  const normalizedDestination = normalizeSearchQuery(destination);

  return /(?:^|,\s*)Vietnam$/i.test(normalizedDestination)
    ? normalizedDestination
    : `${normalizedDestination}, Vietnam`;
}

function getSearchQueries(destination: string) {
  const primaryQuery = ensureVietnamSuffix(destination);
  const withoutCityCenter = primaryQuery.replace(/\s+City Center(?=,|$)/i, "");
  const firstSegment = primaryQuery.split(",")[0]?.trim();
  const queries = [primaryQuery, withoutCityCenter];

  if (firstSegment && firstSegment.length >= 2) {
    queries.push(ensureVietnamSuffix(firstSegment));
  }

  return Array.from(new Set(queries.map(normalizeSearchQuery)));
}

function buildSearchUrl(query: string) {
  const url = new URL(NOMINATIM_SEARCH_URL);
  const params = new URLSearchParams({
    q: query,
    format: "jsonv2",
    limit: "1",
    countrycodes: "vn",
  });

  url.search = params.toString();
  return url;
}

function isNominatimSearchResult(value: unknown): value is NominatimSearchResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.lat === "string" &&
    typeof candidate.lon === "string" &&
    typeof candidate.display_name === "string"
  );
}

async function searchCoordinates(
  query: string,
  signal?: AbortSignal,
): Promise<GeocodingResult | null> {
  const response = await fetch(buildSearchUrl(query), {
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(
      `Unable to resolve location: ${response.status} ${response.statusText}`,
    );
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  const firstResult = data.find(isNominatimSearchResult);

  if (!firstResult) {
    throw new Error("Unable to resolve location: unexpected response format.");
  }

  return normalizeGeocoding(firstResult);
}

export async function getCoordinates(
  destination: string,
  signal?: AbortSignal,
): Promise<GeocodingResult> {
  const normalizedDestination = destination.trim();

  if (!normalizedDestination) {
    throw new Error("Unable to resolve location: destination is required.");
  }

  const cacheKey = getCacheKey(normalizedDestination);
  const cachedCoordinates = coordinatesCache.get(cacheKey);

  if (cachedCoordinates) {
    return cachedCoordinates;
  }

  for (const query of getSearchQueries(normalizedDestination)) {
    const coordinates = await searchCoordinates(query, signal);

    if (coordinates) {
      coordinatesCache.set(cacheKey, coordinates);
      return coordinates;
    }
  }

  throw new Error("Unable to resolve location: no result found.");
}
