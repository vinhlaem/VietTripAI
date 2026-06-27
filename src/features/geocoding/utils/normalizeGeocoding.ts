import type { GeocodingResult, NominatimSearchResult } from "../types";

function toCoordinate(value: string) {
  const coordinate = Number.parseFloat(value);

  return Number.isFinite(coordinate) ? coordinate : null;
}

export function normalizeGeocoding(result: NominatimSearchResult): GeocodingResult {
  const latitude = toCoordinate(result.lat);
  const longitude = toCoordinate(result.lon);

  if (latitude === null || longitude === null) {
    throw new Error("Unable to resolve location: invalid coordinates.");
  }

  return {
    latitude,
    longitude,
    displayName: result.display_name,
  };
}
