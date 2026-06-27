"use client";

import { CloudSun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useWeather } from "../hooks/useWeather";
import type { NormalizedWeather } from "../types";
import { ForecastDay } from "./ForecastDay";
import { WeatherCard } from "./WeatherCard";
import styles from "./Weather.module.scss";

type WeatherForecastProps = {
  hasLocationError?: boolean;
  isLocationLoading?: boolean;
  isWeatherError?: boolean;
  isWeatherLoading?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  weather?: NormalizedWeather | null;
};

function WeatherSkeleton() {
  const weather = useTranslations("Weather");

  return (
    <div className={styles.skeletonWrap} aria-label={weather("loading")} role="status">
      <span className={styles.skeletonHero} />
      <div className={styles.skeletonGrid}>
        {[0, 1, 2].map((item) => (
          <span className={styles.skeletonCard} key={item} />
        ))}
      </div>
    </div>
  );
}

export function WeatherForecast({
  hasLocationError = false,
  isLocationLoading = false,
  isWeatherError,
  isWeatherLoading,
  latitude,
  longitude,
  weather: providedWeather,
}: WeatherForecastProps) {
  const weatherT = useTranslations("Weather");
  const shouldUseProvidedWeather = providedWeather !== undefined;
  const fetchedWeather = useWeather(latitude, longitude, {
    enabled: !shouldUseProvidedWeather,
  });
  const weather = providedWeather ?? fetchedWeather.weather;
  const loading = isWeatherLoading ?? fetchedWeather.isLoading;
  const error = isWeatherError ?? fetchedWeather.isError;

  const shouldShowLoading =
    isLocationLoading || loading || (!weather && !hasLocationError && !error);
  const shouldShowError = hasLocationError || error;

  return (
    <section className={styles.weatherPanel} aria-labelledby="weather-forecast-title">
      <div className={styles.panelHeading}>
        <span className={styles.panelIcon} aria-hidden="true">
          <CloudSun size={18} />
        </span>
        <div>
          <h2 id="weather-forecast-title">{weatherT("title")}</h2>
          <p>{weatherT("description")}</p>
        </div>
      </div>

      {shouldShowError ? (
        <div className={styles.errorState} role="status">
          {weatherT("error")}
        </div>
      ) : null}

      {!shouldShowError && shouldShowLoading ? <WeatherSkeleton /> : null}

      {!shouldShowError && !shouldShowLoading && weather ? (
        <div className={styles.weatherContent}>
          <WeatherCard current={weather.current} />
          <div className={styles.forecastSection}>
            <h3>{weatherT("forecast")}</h3>
            <div className={styles.forecastGrid}>
              {weather.forecast.map((forecast) => (
                <ForecastDay forecast={forecast} key={forecast.date} />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
