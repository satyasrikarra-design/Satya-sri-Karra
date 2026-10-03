export interface GeocodingResult {
  placeId: string;
  name: string;
  displayName: string;
  lat: number;
  lng: number;
  type?: string;
}

export interface LocationClimateData {
  placeName: string;
  coordinates: {
    lat: number;
    lng: number;
    formatted: string;
  };
  elevationMeters: number;
  compositeRiskScore: number; // 0 - 100
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  heatMetrics: {
    ambientTempC: number;
    wetBulbTempC: number;
    heatIndexC: number;
    uhiRating: 'Low' | 'Moderate' | 'Severe' | 'Extreme';
    feelsLikeC: number;
  };
  floodMetrics: {
    rainfallMmHr: number;
    accumulated24hMm: number;
    waterloggingCm: number;
    inundationRiskPercent: number;
    drainageCapacityRating: 'Adequate' | 'Strained' | 'Overwhelmed';
  };
  environmental: {
    humidityPercent: number;
    windSpeedKmh: number;
    windDirection: string;
    pressureHpa: number;
    aqi: number;
    uvIndex: number;
  };
  forecast5Day: Array<{
    day: string;
    condition: 'Sunny' | 'Partly Cloudy' | 'Rain' | 'Heavy Rain' | 'Thunderstorm';
    tempMax: number;
    tempMin: number;
    precipChance: number;
    heatRisk: 'low' | 'moderate' | 'high';
  }>;
}

// Convert decimal degrees to standard GPS format: 19° 14' N, 84° 25' E
export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';

  const absLat = Math.abs(lat);
  const absLng = Math.abs(lng);

  const latDeg = Math.floor(absLat);
  const latMin = Math.round((absLat - latDeg) * 60);

  const lngDeg = Math.floor(absLng);
  const lngMin = Math.round((absLng - lngDeg) * 60);

  return `${latDeg}° ${latMin}' ${latDir}, ${lngDeg}° ${lngMin}' ${lngDir}`;
}

// OpenStreetMap Nominatim search
export async function searchNominatim(query: string): Promise<GeocodingResult[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const endpoint = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query.trim()
    )}&limit=6&addressdetails=1`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(endpoint, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'en',
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error('Geocoding request failed');
    const data = await res.json();

    return data.map((item: any) => ({
      placeId: String(item.place_id),
      name: item.name || item.display_name.split(',')[0],
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      type: item.type || item.class,
    }));
  } catch (err) {
    console.warn('Nominatim lookup error or fallback:', err);
    // Return curated presets if offline or rate limited
    return FALLBACK_PRESETS.filter(p =>
      p.displayName.toLowerCase().includes(query.toLowerCase())
    );
  }
}

export const FALLBACK_PRESETS: GeocodingResult[] = [
  {
    placeId: 'palakollu-in',
    name: 'Palakollu',
    displayName: 'Palakollu, West Godavari District, Andhra Pradesh, India',
    lat: 16.5292,
    lng: 81.7337,
  },
  {
    placeId: 'narsapuram-in',
    name: 'Narsapuram',
    displayName: 'Narsapuram, Godavari Delta Coast, Andhra Pradesh, India',
    lat: 16.4385,
    lng: 81.7011,
  },
  {
    placeId: 'visakhapatnam-in',
    name: 'Visakhapatnam',
    displayName: 'Visakhapatnam Coastal Harbor, Andhra Pradesh, India',
    lat: 17.6868,
    lng: 83.2185,
  },
  {
    placeId: 'sf-us',
    name: 'San Francisco',
    displayName: 'San Francisco Bay Area, California, United States',
    lat: 37.7749,
    lng: -122.4194,
  },
  {
    placeId: 'tokyo-jp',
    name: 'Tokyo',
    displayName: 'Tokyo Metropolis, Kanto Region, Japan',
    lat: 35.6762,
    lng: 139.6503,
  },
  {
    placeId: 'venice-it',
    name: 'Venice',
    displayName: 'Venice Lagoon Coastal Basin, Veneto, Italy',
    lat: 45.4408,
    lng: 12.3155,
  },
  {
    placeId: 'new-orleans-us',
    name: 'New Orleans',
    displayName: 'New Orleans Mississippi Delta, Louisiana, United States',
    lat: 29.9511,
    lng: -90.0715,
  },
];

// Generate physically realistic climate & risk simulation for any lat/long coordinates
export function computeClimateRiskForLocation(
  lat: number,
  lng: number,
  placeName: string = 'Target Coordinates'
): LocationClimateData {
  // Deterministic seed based on lat/lng coordinates
  const absLat = Math.abs(lat);
  const isTropical = absLat < 23.5;
  const isTemperate = absLat >= 23.5 && absLat < 50;

  // Base temperatures
  const baseTemp = isTropical ? 34 + (Math.sin(lat * 3) * 5) : isTemperate ? 24 + (Math.sin(lat * 2) * 8) : 12;
  const ambientTempC = parseFloat(baseTemp.toFixed(1));
  const humidityPercent = Math.min(98, Math.max(30, Math.round(55 + Math.cos(lng * 4) * 35)));
  
  // Wet bulb approximation (Stull formula simplified)
  const wetBulbTempC = parseFloat(
    (ambientTempC * Math.atan(0.151977 * Math.pow(humidityPercent + 8.313659, 0.5)) +
      Math.atan(ambientTempC + humidityPercent) -
      Math.atan(humidityPercent - 1.676331) +
      0.00391838 * Math.pow(humidityPercent, 1.5) * Math.atan(0.023101 * humidityPercent) -
      4.686035).toFixed(1)
  );

  const heatIndexC = parseFloat((ambientTempC + (humidityPercent > 60 ? (humidityPercent - 60) * 0.18 : -1)).toFixed(1));

  // Rainfall & hydrology
  const isCoastalOrRiver = Math.abs(Math.sin(lng * 5)) > 0.4;
  const rainfallMmHr = parseFloat(Math.max(0, Math.min(95, Math.abs(Math.sin(lat * 7)) * (isCoastalOrRiver ? 65 : 25))).toFixed(1));
  const accumulated24hMm = parseFloat((rainfallMmHr * 3.4).toFixed(1));
  const waterloggingCm = parseFloat((rainfallMmHr > 20 ? (rainfallMmHr - 20) * 0.42 : 0).toFixed(1));
  const inundationRiskPercent = Math.min(98, Math.max(5, Math.round(accumulated24hMm * 0.95 + (isCoastalOrRiver ? 25 : 5))));

  // Composite risk score calculation (0 - 100)
  let riskScore = 20;
  if (ambientTempC > 38 || wetBulbTempC > 31) riskScore += 35;
  else if (ambientTempC > 34 || wetBulbTempC > 28) riskScore += 20;

  if (inundationRiskPercent > 70) riskScore += 40;
  else if (inundationRiskPercent > 40) riskScore += 22;

  if (waterloggingCm > 10) riskScore += 15;
  riskScore = Math.min(100, Math.max(8, Math.round(riskScore)));

  const riskLevel: LocationClimateData['riskLevel'] =
    riskScore >= 75 ? 'critical' : riskScore >= 50 ? 'high' : riskScore >= 30 ? 'moderate' : 'low';

  const uhiRating: LocationClimateData['heatMetrics']['uhiRating'] =
    ambientTempC > 40 ? 'Extreme' : ambientTempC > 36 ? 'Severe' : ambientTempC > 30 ? 'Moderate' : 'Low';

  const drainageCapacityRating: LocationClimateData['floodMetrics']['drainageCapacityRating'] =
    waterloggingCm > 15 ? 'Overwhelmed' : waterloggingCm > 5 ? 'Strained' : 'Adequate';

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayIdx = new Date().getDay();

  const forecast5Day = Array.from({ length: 5 }).map((_, i) => {
    const dayName = daysOfWeek[(todayIdx + i) % 7];
    const precipChance = Math.min(100, Math.round(rainfallMmHr * 1.5 + (i * 12) % 40));
    const dayMax = Math.round(ambientTempC + (Math.sin(i) * 3));
    const dayMin = Math.round(dayMax - 8);

    let condition: 'Sunny' | 'Partly Cloudy' | 'Rain' | 'Heavy Rain' | 'Thunderstorm' = 'Sunny';
    if (precipChance > 75) condition = 'Thunderstorm';
    else if (precipChance > 50) condition = 'Heavy Rain';
    else if (precipChance > 30) condition = 'Rain';
    else if (dayMax > 34) condition = 'Sunny';
    else condition = 'Partly Cloudy';

    const heatRisk: 'low' | 'moderate' | 'high' = dayMax > 38 ? 'high' : dayMax > 33 ? 'moderate' : 'low';

    return {
      day: dayName,
      condition,
      tempMax: dayMax,
      tempMin: dayMin,
      precipChance,
      heatRisk,
    };
  });

  return {
    placeName,
    coordinates: {
      lat,
      lng,
      formatted: formatCoordinates(lat, lng),
    },
    elevationMeters: Math.max(1, Math.round(25 + Math.abs(Math.sin(lat * 10)) * 180)),
    compositeRiskScore: riskScore,
    riskLevel,
    heatMetrics: {
      ambientTempC,
      wetBulbTempC,
      heatIndexC,
      uhiRating,
      feelsLikeC: heatIndexC,
    },
    floodMetrics: {
      rainfallMmHr,
      accumulated24hMm,
      waterloggingCm,
      inundationRiskPercent,
      drainageCapacityRating,
    },
    environmental: {
      humidityPercent,
      windSpeedKmh: parseFloat((14 + Math.abs(Math.cos(lat)) * 26).toFixed(1)),
      windDirection: ['NE', 'ENE', 'E', 'SE', 'SSE', 'SW', 'WNW', 'NNW'][Math.floor(Math.abs(lng) % 8)],
      pressureHpa: Math.round(1008 + Math.sin(lat) * 12),
      aqi: Math.round(45 + Math.abs(Math.sin(lng * 3)) * 120),
      uvIndex: Math.round(5 + Math.abs(Math.cos(lat * 2)) * 6),
    },
    forecast5Day,
  };
}
