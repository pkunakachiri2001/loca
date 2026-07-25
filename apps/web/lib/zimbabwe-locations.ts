/**
 * FleetNest — Zimbabwe Geographic & Location Data
 * Comprehensive provinces, cities, and map center coordinates
 */

export interface ZimbabweCity {
  name: string;
  province: string;
  lat: number;
  lng: number;
  popular?: boolean;
}

export interface ZimbabweProvince {
  name: string;
  capital: string;
}

export const ZIMBABWE_PROVINCES: ZimbabweProvince[] = [
  { name: 'Harare Metropolitan', capital: 'Harare' },
  { name: 'Bulawayo Metropolitan', capital: 'Bulawayo' },
  { name: 'Manicaland', capital: 'Mutare' },
  { name: 'Mashonaland Central', capital: 'Bindura' },
  { name: 'Mashonaland East', capital: 'Marondera' },
  { name: 'Mashonaland West', capital: 'Chinhoyi' },
  { name: 'Masvingo', capital: 'Masvingo' },
  { name: 'Matabeleland North', capital: 'Lupane' },
  { name: 'Matabeleland South', capital: 'Gwanda' },
  { name: 'Midlands', capital: 'Gweru' },
];

export const ZIMBABWE_CITIES: ZimbabweCity[] = [
  { name: 'Harare', province: 'Harare Metropolitan', lat: -17.8292, lng: 31.0522, popular: true },
  { name: 'Bulawayo', province: 'Bulawayo Metropolitan', lat: -20.1569, lng: 28.5823, popular: true },
  { name: 'Victoria Falls', province: 'Matabeleland North', lat: -17.9244, lng: 25.8354, popular: true },
  { name: 'Mutare', province: 'Manicaland', lat: -18.9707, lng: 32.6709, popular: true },
  { name: 'Gweru', province: 'Midlands', lat: -19.4500, lng: 29.8167, popular: true },
  { name: 'Chitungwiza', province: 'Harare Metropolitan', lat: -18.0127, lng: 31.0756, popular: true },
  { name: 'Masvingo', province: 'Masvingo', lat: -20.0744, lng: 30.8328, popular: true },
  { name: 'Kwekwe', province: 'Midlands', lat: -18.9281, lng: 29.8149 },
  { name: 'Kadoma', province: 'Mashonaland West', lat: -18.3300, lng: 29.9150 },
  { name: 'Chinhoyi', province: 'Mashonaland West', lat: -17.3667, lng: 30.2000 },
  { name: 'Marondera', province: 'Mashonaland East', lat: -18.1853, lng: 31.5519 },
  { name: 'Hwange', province: 'Matabeleland North', lat: -18.3697, lng: 26.5019 },
  { name: 'Beitbridge', province: 'Matabeleland South', lat: -22.2167, lng: 29.9833 },
  { name: 'Bindura', province: 'Mashonaland Central', lat: -17.3019, lng: 31.3306 },
  { name: 'Zvishavane', province: 'Midlands', lat: -20.3267, lng: 30.0667 },
  { name: 'Kariba', province: 'Mashonaland West', lat: -16.5167, lng: 28.8000 },
];

/** Default map center (Harare, Zimbabwe) */
export const ZIMBABWE_MAP_CENTER = {
  lat: -17.8292,
  lng: 31.0522,
  zoom: 7,
};

/** Get city by name */
export function getZimbabweCity(cityName: string): ZimbabweCity | undefined {
  return ZIMBABWE_CITIES.find(
    (c) => c.name.toLowerCase() === cityName.toLowerCase()
  );
}
