import type { WeatherConditionKey } from "../types";

const weatherCodeGroups: Array<{
  codes: number[];
  conditionKey: WeatherConditionKey;
}> = [
  { codes: [0], conditionKey: "clearSky" },
  { codes: [1], conditionKey: "mainlyClear" },
  { codes: [2], conditionKey: "partlyCloudy" },
  { codes: [3], conditionKey: "overcast" },
  { codes: [45, 48], conditionKey: "fog" },
  { codes: [51, 53, 55, 56, 57], conditionKey: "drizzle" },
  { codes: [61, 63, 65, 66, 67, 80, 81, 82], conditionKey: "rain" },
  { codes: [71, 73, 75, 77, 85, 86], conditionKey: "snow" },
  { codes: [95, 96, 99], conditionKey: "thunderstorm" },
];

export function getWeatherConditionKey(code: number): WeatherConditionKey {
  return (
    weatherCodeGroups.find((group) => group.codes.includes(code))?.conditionKey ??
    "unknown"
  );
}
