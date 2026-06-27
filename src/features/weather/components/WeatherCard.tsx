import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  Sun,
  ThermometerSun,
  Wind,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { LucideIcon } from "lucide-react";
import type { CurrentWeather, WeatherConditionKey } from "../types";
import styles from "./Weather.module.scss";

type WeatherCardProps = {
  current: CurrentWeather;
};

const weatherIcons: Record<WeatherConditionKey, LucideIcon> = {
  clearSky: Sun,
  mainlyClear: CloudSun,
  partlyCloudy: CloudSun,
  overcast: Cloud,
  fog: CloudFog,
  drizzle: Droplets,
  rain: CloudRain,
  snow: CloudSnow,
  rainShowers: CloudRain,
  thunderstorm: CloudLightning,
  unknown: CloudSun,
};


export function WeatherCard({ current }: WeatherCardProps) {
  const weather = useTranslations("Weather");
  const Icon = weatherIcons[current.conditionKey];

  return (
    <article className={styles.currentCard}>
      <div className={styles.currentHero}>
        <span className={styles.weatherOrb} aria-hidden="true">
          <Icon size={30} />
        </span>
        <div>
          <span>{weather("current")}</span>
          <strong>{weather("temperatureValue", { value: Math.round(current.temperature) })}</strong>
          <p>{weather(`conditions.${current.conditionKey}`)}</p>
        </div>
      </div>

      <dl className={styles.metricGrid}>
        <div>
          <dt>
            <ThermometerSun size={15} aria-hidden="true" />
            {weather("feelsLike")}
          </dt>
          <dd>{weather("temperatureValue", { value: Math.round(current.feelsLike) })}</dd>
        </div>
        <div>
          <dt>
            <Droplets size={15} aria-hidden="true" />
            {weather("humidity")}
          </dt>
          <dd>{weather("percentValue", { value: Math.round(current.humidity) })}</dd>
        </div>
        <div>
          <dt>
            <Wind size={15} aria-hidden="true" />
            {weather("wind")}
          </dt>
          <dd>{weather("windSpeedValue", { value: Math.round(current.windSpeed) })}</dd>
        </div>
      </dl>
    </article>
  );
}

