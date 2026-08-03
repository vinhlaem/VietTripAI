import type { NormalizedPlace, PlacesQueryGroup } from "../types";
import { normalizePlaces } from "../utils/normalizePlaces";

const GEOAPIFY_PLACES_URL = "https://api.geoapify.com/v2/places";
const PLACE_CATEGORIES: Record<PlacesQueryGroup, string[]> = {
  attraction: ["tourism.sights", "tourism.attraction", "tourism.information", "tourism.attraction.viewpoint", "entertainment.museum", "beach", "leisure.park", "heritage"],
  hotel: ["accommodation.hotel", "accommodation.hostel", "accommodation.guest_house"],
  food: ["catering.restaurant", "catering.cafe", "catering.fast_food", "catering.food_court"],
  entertainment: ["entertainment", "leisure", "adult.nightclub"],
  recommendation: ["accommodation.hotel", "accommodation.hostel", "accommodation.guest_house", "catering.restaurant", "catering.cafe", "catering.fast_food", "entertainment", "leisure", "adult.nightclub"],
};
const ATTRACTION_CATEGORY_BATCHES = [
  { categories: PLACE_CATEGORIES.attraction, limit: 80 },
  { categories: ["religion.place_of_worship"], limit: 160 },
  { categories: ["beach"], limit: 60 },
];
const SEARCH_RADIUS_METERS: Record<PlacesQueryGroup, number> = { attraction: 25000, hotel: 10000, food: 3000, entertainment: 8000, recommendation: 8000 };
const PLACE_LIMIT = 30;
const MERGED_ATTRACTION_LIMIT = 60;

function assertCoordinate(value: number, label: "latitude" | "longitude") {
  if (!Number.isFinite(value)) throw new Error(`Unable to load tourist places: ${label} is invalid.`);
}
function getGeoapifyApiKey() { return process.env.GEOAPIFY_API_KEY; }
function buildPlacesUrl(latitude: number, longitude: number, apiKey: string, group: PlacesQueryGroup, categories = PLACE_CATEGORIES[group], limit = PLACE_LIMIT) {
  const url = new URL(GEOAPIFY_PLACES_URL);
  url.search = new URLSearchParams({ categories: categories.join(","), filter: `circle:${longitude},${latitude},${SEARCH_RADIUS_METERS[group]}`, bias: `proximity:${longitude},${latitude}`, limit: limit.toString(), apiKey }).toString();
  return url;
}
async function fetchPlaces(url: URL, signal?: AbortSignal) {
  const response = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store", signal });
  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Unable to load tourist places: ${response.status} ${response.statusText}. ${details.slice(0, 300)}`);
  }
  return normalizePlaces(await response.json());
}
function mergePlaces(groups: NormalizedPlace[][]) {
  const uniqueById = new Map<string, NormalizedPlace>();
  const coordinates = new Set<string>();
  for (const place of groups.flat()) {
    const coordinateKey = `${place.latitude.toFixed(5)}:${place.longitude.toFixed(5)}`;
    if (!uniqueById.has(place.id) && !coordinates.has(coordinateKey)) {
      uniqueById.set(place.id, place);
      coordinates.add(coordinateKey);
    }
  }
  const places = [...uniqueById.values()];
  const nameFrequency = new Map<string, number>();
  for (const place of places) {
    const key = place.name.toLocaleLowerCase("vi").replace(/\s+/g, " ").trim();
    nameFrequency.set(key, (nameFrequency.get(key) ?? 0) + 1);
  }
  function landmarkScore(place: NormalizedPlace) {
    const categories = place.sourceCategories ?? [];
    const nameKey = place.name.toLocaleLowerCase("vi").replace(/\s+/g, " ").trim();
    const definingCategory = categories.some((category) => /tourism|heritage|beach|viewpoint/.test(category)) ? 8 : 0;
    const repeatedLandmark = (nameFrequency.get(nameKey) ?? 0) > 1 ? 6 : 0;
    const distancePenalty = Math.min((place.distance ?? 20000) / 5000, 4);
    return definingCategory + repeatedLandmark - distancePenalty;
  }
  return places.sort((a, b) => landmarkScore(b) - landmarkScore(a) || (a.distance ?? Number.MAX_SAFE_INTEGER) - (b.distance ?? Number.MAX_SAFE_INTEGER)).slice(0, MERGED_ATTRACTION_LIMIT);
}

export async function getNearbyTouristPlaces(latitude: number, longitude: number, group: PlacesQueryGroup = "attraction", signal?: AbortSignal): Promise<NormalizedPlace[]> {
  assertCoordinate(latitude, "latitude");
  assertCoordinate(longitude, "longitude");
  const apiKey = getGeoapifyApiKey();
  if (!apiKey) throw new Error("Unable to load tourist places: Geoapify API key is missing.");
  if (group !== "attraction") return fetchPlaces(buildPlacesUrl(latitude, longitude, apiKey, group), signal);
  const results = await Promise.allSettled(ATTRACTION_CATEGORY_BATCHES.map(({ categories, limit }) => fetchPlaces(buildPlacesUrl(latitude, longitude, apiKey, group, categories, limit), signal)));
  const successful = results.flatMap((result) => result.status === "fulfilled" ? [result.value] : []);
  if (!successful.length) {
    const failure = results.find((result) => result.status === "rejected");
    throw failure && failure.status === "rejected" ? failure.reason : new Error("Unable to load tourist places.");
  }
  return mergePlaces(successful);
}