export interface TouristArea {
  id: string;
  provinceName: string;
  provinceAliases?: string[];
  name: string;
  searchQuery: string;
  description?: string;
  tags: string[];
  isPopular?: boolean;
}
