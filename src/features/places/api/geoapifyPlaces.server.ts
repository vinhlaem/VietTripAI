import type { NormalizedPlace } from "../types";
import { normalizePlaces } from "../utils/normalizePlaces";

const GEOAPIFY_PLACES_URL = "https://api.geoapify.com/v2/places";
const PLACE_CATEGORIES = [
  "tourism.sights",
  "tourism.attraction",
  "tourism.information",
  "tourism.attraction.viewpoint",
  "entertainment.museum",
  "beach",
  "leisure.park",
  "heritage",
].join(",");
const SEARCH_RADIUS_METERS = 20000;
const PLACE_LIMIT = 30;

function assertCoordinate(value: number, label: "latitude" | "longitude") {
  if (!Number.isFinite(value)) {
    throw new Error(`Unable to load tourist places: ${label} is invalid.`);
  }
}

function getGeoapifyApiKey() {
  return process.env.GEOAPIFY_API_KEY;
}

function buildPlacesUrl(latitude: number, longitude: number, apiKey: string) {
  const url = new URL(GEOAPIFY_PLACES_URL);
  const params = new URLSearchParams({
    categories: PLACE_CATEGORIES,
    filter: `circle:${longitude},${latitude},${SEARCH_RADIUS_METERS}`,
    bias: `proximity:${longitude},${latitude}`,
    limit: PLACE_LIMIT.toString(),
    apiKey,
  });

  url.search = params.toString();
  return url;
}

export async function getNearbyTouristPlaces(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<NormalizedPlace[]> {
  assertCoordinate(latitude, "latitude");
  assertCoordinate(longitude, "longitude");

  const apiKey = getGeoapifyApiKey();

  if (!apiKey) {
    throw new Error("Unable to load tourist places: Geoapify API key is missing.");
  }

  const response = await fetch(buildPlacesUrl(latitude, longitude, apiKey), {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    const errorDetails = await response.text();

    throw new Error(
      `Unable to load tourist places: ${response.status} ${response.statusText}. ${errorDetails.slice(0, 300)}`,
    );
  }

  const payload: unknown = await response.json();
  return normalizePlaces(payload);
}


