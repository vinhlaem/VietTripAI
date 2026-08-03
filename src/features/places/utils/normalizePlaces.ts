import type {
  GeoapifyPlaceFeature,
  GeoapifyPlacesResponse,
  NormalizedPlace,
  PlaceCategory,
  PlaceGroup,
} from "../types";

const MAX_PLACES = 200;

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}
function isString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}
function hasGeoapifyFeatureShape(value: unknown): value is GeoapifyPlaceFeature {
  return Boolean(value && typeof value === "object" && (value as Record<string, unknown>).properties);
}
function hasGeoapifyResponseShape(value: unknown): value is GeoapifyPlacesResponse {
  return Boolean(value && typeof value === "object" && Array.isArray((value as Record<string, unknown>).features));
}
function includesFragment(categories: string[], fragment: string) {
  return categories.some((category) => category.toLowerCase().includes(fragment));
}
function getPlaceClassification(categories: string[]): { category: PlaceCategory; group: PlaceGroup } | null {
  if (includesFragment(categories, "accommodation.hotel")) return { category: "hotel", group: "hotel" };
  if (includesFragment(categories, "accommodation.hostel")) return { category: "hostel", group: "hotel" };
  if (includesFragment(categories, "accommodation.guest_house")) return { category: "guestHouse", group: "hotel" };
  if (includesFragment(categories, "catering.cafe")) return { category: "cafe", group: "food" };
  if (includesFragment(categories, "catering.fast_food")) return { category: "fastFood", group: "food" };
  if (includesFragment(categories, "catering.restaurant") || includesFragment(categories, "catering.food_court")) return { category: "restaurant", group: "food" };
  if (includesFragment(categories, "nightclub") || includesFragment(categories, "night_life")) return { category: "nightlife", group: "entertainment" };

  if (includesFragment(categories, "place_of_worship") || includesFragment(categories, "religion")) return { category: "historicSite", group: "attraction" };
  if (includesFragment(categories, "museum")) return { category: "museum", group: "attraction" };
  if (includesFragment(categories, "beach")) return { category: "beach", group: "attraction" };
  if (includesFragment(categories, "park")) return { category: "park", group: "attraction" };
  if (includesFragment(categories, "viewpoint") || includesFragment(categories, "view_point")) return { category: "viewpoint", group: "attraction" };
  if (["historic", "heritage", "monument", "memorial"].some((item) => includesFragment(categories, item))) return { category: "historicSite", group: "attraction" };
  if (includesFragment(categories, "natural") || includesFragment(categories, "nature")) return { category: "nature", group: "attraction" };
  if (includesFragment(categories, "tourism")) return { category: "touristAttraction", group: "attraction" };
  if (includesFragment(categories, "entertainment") || includesFragment(categories, "leisure")) return { category: "entertainment", group: "entertainment" };
  return null;
}
function getFeatureCoordinates(feature: GeoapifyPlaceFeature) {
  const { properties } = feature;
  if (isNumber(properties.lat) && isNumber(properties.lon)) return { latitude: properties.lat, longitude: properties.lon };
  const coordinates = feature.geometry?.coordinates;
  if (Array.isArray(coordinates) && isNumber(coordinates[0]) && isNumber(coordinates[1])) return { latitude: coordinates[1], longitude: coordinates[0] };
  return null;
}
function normalizeFeature(feature: GeoapifyPlaceFeature): NormalizedPlace | null {
  const { properties } = feature;
  const categories = isStringArray(properties.categories) ? properties.categories : [];
  const classification = getPlaceClassification(categories);
  const coordinates = getFeatureCoordinates(feature);
  const name = isString(properties.name) ? properties.name.trim() : null;
  if (!classification || !coordinates || !name) return null;
  return {
    id: isString(properties.place_id) ? properties.place_id : coordinates.latitude.toFixed(5) + ":" + coordinates.longitude.toFixed(5) + ":" + name,
    name,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    address: isString(properties.formatted) ? properties.formatted : isString(properties.address_line2) ? properties.address_line2 : undefined,
    ...classification,
    distance: isNumber(properties.distance) ? properties.distance : undefined,
    openingHours: isString(properties.opening_hours) ? properties.opening_hours : undefined,
    source: "geoapify",
  };
}
export function normalizePlaces(response: unknown): NormalizedPlace[] {
  if (!hasGeoapifyResponseShape(response)) throw new Error("Unable to load places: unexpected response format.");
  return response.features.filter(hasGeoapifyFeatureShape).map(normalizeFeature).filter((place): place is NormalizedPlace => place !== null).sort((a, b) => (a.distance ?? Number.MAX_SAFE_INTEGER) - (b.distance ?? Number.MAX_SAFE_INTEGER)).slice(0, MAX_PLACES);
}