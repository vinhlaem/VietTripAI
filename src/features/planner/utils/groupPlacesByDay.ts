import type { Place } from "@/features/places/types";
import { getMaxPlacesPerDay, sortPlacesForPlanner } from "../engine/planner.rules";

export function groupPlacesByDay(places: Place[], days: number, interests: string[]) {
  const sortedPlaces = sortPlacesForPlanner(places, interests);
  const maxPlacesPerDay = getMaxPlacesPerDay(days);
  const groupedPlaces: Place[][] = Array.from({ length: days }, () => []);

  sortedPlaces.slice(0, days * maxPlacesPerDay).forEach((place, index) => {
    const dayIndex = index % days;
    groupedPlaces[dayIndex].push(place);
  });

  return groupedPlaces;
}
