import type { MapCenter, TripMapLocation } from "../types";

export const daNangMapCenter: MapCenter = {
  latitude: 16.0544,
  longitude: 108.2022,
};

export const mockLocations: TripMapLocation[] = [
  {
    id: "my-khe-beach",
    name: "Mỹ Khê Beach",
    latitude: 16.0617,
    longitude: 108.2469,
    category: "beach",
  },
  {
    id: "son-tra-peninsula",
    name: "Sơn Trà Peninsula",
    latitude: 16.1152,
    longitude: 108.2734,
    category: "viewpoint",
  },
  {
    id: "dragon-bridge",
    name: "Dragon Bridge",
    latitude: 16.0611,
    longitude: 108.2278,
    category: "touristAttraction",
  },
];
