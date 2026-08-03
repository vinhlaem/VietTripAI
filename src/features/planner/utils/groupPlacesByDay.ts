import type { Place } from "@/features/places/types";
import { getMaxPlacesPerDay, sortPlacesForPlanner } from "../engine/planner.rules";

function distance(first: Place, second: Place) {
  const lat = first.latitude - second.latitude;
  const lon = first.longitude - second.longitude;
  return lat * lat + lon * lon;
}

function nearestNeighbor(places: Place[]) {
  if (places.length < 2) return places;
  const remaining = [...places];
  const route = [remaining.shift()!];
  while (remaining.length) {
    const previous = route[route.length - 1];
    remaining.sort((a, b) => distance(previous, a) - distance(previous, b));
    route.push(remaining.shift()!);
  }
  return route;
}

export function groupPlacesByDay(places: Place[], days: number, interests: string[], pace: "relaxed" | "balanced" | "active" = "balanced") {
  const limit = days * (pace === "relaxed" ? 2 : pace === "active" ? 4 : getMaxPlacesPerDay(days));
  const selected = sortPlacesForPlanner(places, interests).slice(0, limit);
  const routed = nearestNeighbor(selected);
  const grouped: Place[][] = Array.from({ length: days }, () => []);
  const perDay = Math.ceil(routed.length / days);
  for (let day = 0; day < days; day += 1) grouped[day] = routed.slice(day * perDay, (day + 1) * perDay);
  return grouped;
}