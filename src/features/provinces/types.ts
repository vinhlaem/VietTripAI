// Province options represent administrative travel areas only.
// Tourist places and map markers are loaded separately from Geoapify Places.
export interface VietnamProvince {
  code: string | number;
  name: string;
  name_en?: string;
  full_name?: string;
  full_name_en?: string;
  code_name?: string;
}

export interface ProvinceOption {
  code: string;
  name: string;
  displayName: string;
}
