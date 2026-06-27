import { vietnamTouristAreas } from "../data/vietnamTouristAreas";
import type { TouristArea } from "../types";

function normalizeProvinceName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/\b(tinh|thanh pho|tp|city|province)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getAreaProvinceNames(area: TouristArea) {
  return [area.provinceName, ...(area.provinceAliases ?? [])];
}

function matchesProvince(area: TouristArea, provinceName: string) {
  const selectedProvince = normalizeProvinceName(provinceName);

  if (!selectedProvince) {
    return false;
  }

  return getAreaProvinceNames(area).some((name) => {
    const areaProvince = normalizeProvinceName(name);

    return (
      areaProvince === selectedProvince ||
      areaProvince.includes(selectedProvince) ||
      selectedProvince.includes(areaProvince)
    );
  });
}

export function getTouristAreasByProvince(provinceName: string): TouristArea[] {
  return vietnamTouristAreas.filter((area) => matchesProvince(area, provinceName));
}

export function getDefaultTouristArea(areas: TouristArea[]) {
  return areas.find((area) => area.isPopular) ?? areas[0] ?? null;
}

export function createProvinceTouristAreaFallback(provinceName: string): TouristArea | null {
  const resolvedProvinceName = provinceName.trim();

  if (!resolvedProvinceName) {
    return null;
  }

  return {
    id: `province-${normalizeProvinceName(resolvedProvinceName).replace(/\s+/g, "-")}`,
    provinceName: resolvedProvinceName,
    name: resolvedProvinceName,
    searchQuery: `${resolvedProvinceName}, Vietnam`,
    tags: [],
  };
}
