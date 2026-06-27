import type { PlaceCategory } from "@/features/places/types";

export type MapCenter = {
  latitude: number;
  longitude: number;
};

export type TripMapLocation = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  category: PlaceCategory;
  address?: string;
  distance?: number;
};
