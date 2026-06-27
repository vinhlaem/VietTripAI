export type PlaceCategory =
  | "touristAttraction"
  | "museum"
  | "beach"
  | "park"
  | "viewpoint"
  | "historicSite"
  | "nature";

export type PlaceSource = "geoapify";

export interface Place {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  category: PlaceCategory;
  distance?: number;
  image?: string;
  source: PlaceSource;
}

export type NormalizedPlace = Place;

export interface GeoapifyPlaceProperties {
  place_id?: string;
  name?: string;
  lat?: number;
  lon?: number;
  formatted?: string;
  address_line1?: string;
  address_line2?: string;
  categories?: string[];
  distance?: number;
}

export interface GeoapifyPlaceFeature {
  type: "Feature";
  properties: GeoapifyPlaceProperties;
  geometry?: {
    type: string;
    coordinates: number[];
  };
}

export interface GeoapifyPlacesResponse {
  type?: string;
  features: GeoapifyPlaceFeature[];
}
