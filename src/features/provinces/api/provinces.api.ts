import type { ProvinceOption, VietnamProvince } from "../types";

const PROVINCE_API_BASE_URL = "https://provinces.open-api.vn/api/v2";

function isProvinceResponseItem(value: unknown): value is VietnamProvince {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  const hasValidCode =
    typeof candidate.code === "string" || typeof candidate.code === "number";

  return hasValidCode && typeof candidate.name === "string";
}

function normalizeProvince(province: VietnamProvince): ProvinceOption {
  return {
    code: String(province.code),
    name: province.name,
    displayName: province.full_name || province.name,
  };
}

export async function getVietnamProvinces(signal?: AbortSignal): Promise<ProvinceOption[]> {
  const response = await fetch(`${PROVINCE_API_BASE_URL}/`, { signal });

  if (!response.ok) {
    throw new Error(
      `Failed to load Vietnam provinces: ${response.status} ${response.statusText}`,
    );
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("Failed to load Vietnam provinces: unexpected response format.");
  }

  return data.filter(isProvinceResponseItem).map(normalizeProvince);
}
