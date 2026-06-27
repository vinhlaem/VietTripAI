import type {
  GeoapifyPlaceFeature,
  GeoapifyPlacesResponse,
  NormalizedPlace,
  PlaceCategory,
} from "../types";

const MAX_PLACES = 30;
const excludedCategoryFragments = [
  "accommodation",
  "catering",
  "commercial",
  "education",
  "healthcare",
  "hospital",
  "hotel",
  "office",
  "restaurant",
  "school",
  "shop",
];

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
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  const properties = candidate.properties;

  return Boolean(properties && typeof properties === "object");
}

function hasGeoapifyResponseShape(value: unknown): value is GeoapifyPlacesResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return Array.isArray(candidate.features);
}

function includesFragment(categories: string[], fragment: string) {
  return categories.some((category) => category.toLowerCase().includes(fragment));
}

function getPlaceCategory(categories: string[]): PlaceCategory | null {
  if (excludedCategoryFragments.some((fragment) => includesFragment(categories, fragment))) {
    return null;
  }

  if (includesFragment(categories, "museum")) {
    return "museum";
  }

  if (includesFragment(categories, "beach")) {
    return "beach";
  }

  if (includesFragment(categories, "park")) {
    return "park";
  }

  if (includesFragment(categories, "viewpoint") || includesFragment(categories, "view_point")) {
    return "viewpoint";
  }

  if (
    includesFragment(categories, "historic") ||
    includesFragment(categories, "heritage") ||
    includesFragment(categories, "monument") ||
    includesFragment(categories, "memorial")
  ) {
    return "historicSite";
  }

  if (includesFragment(categories, "natural") || includesFragment(categories, "nature")) {
    return "nature";
  }

  if (
    includesFragment(categories, "tourism.sights") ||
    includesFragment(categories, "tourism.attraction") ||
    includesFragment(categories, "tourism.information") ||
    includesFragment(categories, "tourism")
  ) {
    return "touristAttraction";
  }

  return null;
}

function getFeatureCoordinates(feature: GeoapifyPlaceFeature) {
  const { properties } = feature;

  if (isNumber(properties.lat) && isNumber(properties.lon)) {
    return {
      latitude: properties.lat,
      longitude: properties.lon,
    };
  }

  const coordinates = feature.geometry?.coordinates;

  if (Array.isArray(coordinates) && isNumber(coordinates[0]) && isNumber(coordinates[1])) {
    return {
      latitude: coordinates[1],
      longitude: coordinates[0],
    };
  }

  return null;
}

function normalizeFeature(feature: GeoapifyPlaceFeature): NormalizedPlace | null {
  const { properties } = feature;
  const categories = isStringArray(properties.categories) ? properties.categories : [];
  const category = getPlaceCategory(categories);
  const coordinates = getFeatureCoordinates(feature);
  const name = isString(properties.name) ? properties.name.trim() : null;

  if (!category || !coordinates || !name) {
    return null;
  }

  const fallbackId = `${coordinates.latitude.toFixed(5)}:${coordinates.longitude.toFixed(5)}:${name}`;

  return {
    id: isString(properties.place_id) ? properties.place_id : fallbackId,
    name,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    address: isString(properties.formatted)
      ? properties.formatted
      : isString(properties.address_line2)
        ? properties.address_line2
        : undefined,
    category,
    distance: isNumber(properties.distance) ? properties.distance : undefined,
    source: "geoapify",
  };
}

export function normalizePlaces(response: unknown): NormalizedPlace[] {
  if (!hasGeoapifyResponseShape(response)) {
    throw new Error("Unable to load places: unexpected response format.");
  }

  return response.features
    .filter(hasGeoapifyFeatureShape)
    .map(normalizeFeature)
    .filter((place): place is NormalizedPlace => place !== null)
    .sort(
      (first, second) =>
        (first.distance ?? Number.MAX_SAFE_INTEGER) -
        (second.distance ?? Number.MAX_SAFE_INTEGER),
    )
    .slice(0, MAX_PLACES);
}
