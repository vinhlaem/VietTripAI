export interface GeocodingResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

export interface NominatimSearchResult {
  lat: string;
  lon: string;
  display_name: string;
  type?: string;
}
