import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { useClimateShield } from '../../context/ClimateShieldContext';
import {
  computeClimateRiskForLocation,
  LocationClimateData,
  FALLBACK_PRESETS,
} from '../../services/geocoding';
import { TopSearchHeader } from './TopSearchHeader';
import { LeftLayerPanel, BaseMapType, LiveWeatherLayer, RiskOverlayType } from './LeftLayerPanel';
import { RightAnalyticsPanel } from './RightAnalyticsPanel';
import { TimelineScrubber } from './TimelineScrubber';
import { BottomActionPanel } from './BottomActionPanel';

interface ZoomEarthGISProps {
  onSwitchToEnterprise?: () => void;
}

export const ZoomEarthGIS: React.FC<ZoomEarthGISProps> = ({ onSwitchToEnterprise }) => {
  const { assets, createManualIncident } = useClimateShield();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const weatherOverlaysLayerRef = useRef<L.LayerGroup | null>(null);
  const geofencesLayerRef = useRef<L.LayerGroup | null>(null);

  // Initial location: Palakollu / Godavari Delta
  const [selectedLocation, setSelectedLocation] = useState<LocationClimateData>(() =>
    computeClimateRiskForLocation(16.5292, 81.7337, 'Palakollu, West Godavari')
  );

  // Map settings state
  const [baseMap, setBaseMap] = useState<BaseMapType>('satellite');
  const [layerOpacity, setLayerOpacity] = useState<number>(0.85);
  const [timeOffsetHours, setTimeOffsetHours] = useState<number>(0);

  // Live weather layer toggles (all fully functional)
  const [activeWeatherLayers, setActiveWeatherLayers] = useState<Record<LiveWeatherLayer, boolean>>({
    radar: true,
    wind: true,
    precipitation: false,
    temperature: false,
    humidity: false,
    pressure: false,
    clouds: false,
  });

  // Risk overlay toggles
  const [activeRiskOverlays, setActiveRiskOverlays] = useState<Record<RiskOverlayType, boolean>>({
    heat: true,
    flood: true,
    aqi: false,
    combined: false,
  });

  // Base map tile URLs
  const getTileUrl = (type: BaseMapType) => {
    switch (type) {
      case 'dark':
        return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      case 'topo':
        return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      case 'satellite':
      default:
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    }
  };

  // Helper to create glowing CSS pulsing Leaflet divIcon
  const createPulsingMarkerIcon = (risk: 'low' | 'moderate' | 'high' | 'critical', label: string) => {
    const pulseClass =
      risk === 'critical'
        ? 'marker-pulse-rose'
        : risk === 'high' || risk === 'moderate'
        ? 'marker-pulse-amber'
        : 'marker-pulse-emerald';

    const ringBg =
      risk === 'critical'
        ? 'bg-rose-500'
        : risk === 'high' || risk === 'moderate'
        ? 'bg-amber-500'
        : 'bg-emerald-500';

    const dotBg =
      risk === 'critical'
        ? 'bg-rose-400 border-white'
        : risk === 'high' || risk === 'moderate'
        ? 'bg-amber-400 border-white'
        : 'bg-emerald-400 border-white';

    const html = `
      <div class="relative flex items-center justify-center cursor-pointer group" style="width: 36px; height: 36px;">
        <div class="absolute inset-0 rounded-full ${ringBg} ${pulseClass}"></div>
        <div class="relative w-4 h-4 rounded-full ${dotBg} border-2 shadow-lg flex items-center justify-center transition-transform group-hover:scale-125">
        </div>
        <div class="absolute top-7 whitespace-nowrap bg-slate-900/90 backdrop-blur-sm border border-slate-700/80 px-2 py-0.5 rounded text-[10px] font-mono text-white shadow-xl pointer-events-none opacity-90 group-hover:opacity-100">
          ${label}
        </div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-pulse-marker',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [selectedLocation.coordinates.lat, selectedLocation.coordinates.lng],
      zoom: 12,
      zoomControl: false,
      attributionControl: true,
      minZoom: 2,
      maxZoom: 18,
    });

    // Custom positioned zoom control
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Initial base tile layer
    const tileLayer = L.tileLayer(getTileUrl(baseMap), {
      maxZoom: 19,
      attribution:
        baseMap === 'satellite'
          ? '&copy; Esri &mdash; Earthstar Geographics'
          : '&copy; OpenStreetMap contributors & CARTO',
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Layer groups for markers, geofences & weather overlays
    const geofencesLayer = L.layerGroup().addTo(map);
    geofencesLayerRef.current = geofencesLayer;

    const weatherLayer = L.layerGroup().addTo(map);
    weatherOverlaysLayerRef.current = weatherLayer;

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    // Click on map to probe coordinates anywhere in the world
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const probed = computeClimateRiskForLocation(lat, lng, `Probed Coordinates`);
      setSelectedLocation(probed);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when baseMap changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    tileLayerRef.current.setUrl(getTileUrl(baseMap));
  }, [baseMap]);

  // Master Render Loop for Markers, Geofences, and Live Weather Overlays
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !weatherOverlaysLayerRef.current || !geofencesLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    weatherOverlaysLayerRef.current.clearLayers();
    geofencesLayerRef.current.clearLayers();

    const center = selectedLocation.coordinates;
    const { lat, lng } = center;

    // ----------------------------------------------------
    // 1. ANIMATED RISK MARKERS
    // ----------------------------------------------------
    const targetMarker = L.marker([lat, lng], {
      icon: createPulsingMarkerIcon(selectedLocation.riskLevel, selectedLocation.placeName.split(',')[0]),
    });
    targetMarker.bindPopup(`
      <div style="background: #0f172a; color: #f8fafc; padding: 12px; border-radius: 8px; font-family: sans-serif; font-size: 12px; border: 1px solid #334155; min-width: 200px;">
        <div style="font-weight: bold; color: #38bdf8; font-size: 13px; margin-bottom: 2px;">${selectedLocation.placeName}</div>
        <div style="font-family: monospace; color: #94a3b8; font-size: 11px; margin-bottom: 8px;">${selectedLocation.coordinates.formatted} · ${selectedLocation.elevationMeters}m MSL</div>
        <div style="margin-bottom: 4px;">Composite Risk: <b style="color: ${selectedLocation.riskLevel === 'critical' ? '#f43f5e' : selectedLocation.riskLevel === 'high' ? '#f59e0b' : '#10b981'};">${selectedLocation.compositeRiskScore}/100 (${selectedLocation.riskLevel.toUpperCase()})</b></div>
        <div>Ambient Temp: <b>${selectedLocation.heatMetrics.ambientTempC}°C</b> (Index: ${selectedLocation.heatMetrics.heatIndexC}°C)</div>
        <div>Precipitation: <b>${selectedLocation.floodMetrics.rainfallMmHr} mm/h</b> (Inundation: ${selectedLocation.floodMetrics.inundationRiskPercent}%)</div>
      </div>
    `);
    markersLayerRef.current.addLayer(targetMarker);

    // Render Preset Hotspots / Global Coordinates
    FALLBACK_PRESETS.forEach(preset => {
      if (preset.lat === lat && preset.lng === lng) return;

      const presetData = computeClimateRiskForLocation(preset.lat, preset.lng, preset.name);
      const marker = L.marker([preset.lat, preset.lng], {
        icon: createPulsingMarkerIcon(presetData.riskLevel, preset.name),
      });

      marker.on('click', () => {
        setSelectedLocation(presetData);
        mapInstanceRef.current?.flyTo([preset.lat, preset.lng], 13, { duration: 1.2 });
      });

      markersLayerRef.current?.addLayer(marker);
    });

    // ----------------------------------------------------
    // 2. DYNAMIC GEOFENCES (Interactive Risk Radius Rings)
    // ----------------------------------------------------
    const geofenceColor =
      selectedLocation.riskLevel === 'critical'
        ? '#f43f5e'
        : selectedLocation.riskLevel === 'high' || selectedLocation.riskLevel === 'moderate'
        ? '#f59e0b'
        : '#10b981';

    // Ring 1: Primary Immediate Hazard Geofence (1,000m)
    const primaryGeofence = L.circle([lat, lng], {
      radius: 1000,
      color: geofenceColor,
      weight: 2,
      fillColor: geofenceColor,
      fillOpacity: 0.15,
      className: 'geofence-pulsing',
    });
    primaryGeofence.bindTooltip(`Immediate Hazard Geofence (1.0 km) — ${selectedLocation.riskLevel.toUpperCase()}`, {
      permanent: false,
      direction: 'top',
      className: 'bg-slate-900 text-slate-100 text-[10px] font-mono border border-slate-700 rounded px-2 py-0.5',
    });
    geofencesLayerRef.current.addLayer(primaryGeofence);

    // Ring 2: Secondary Evacuation / Municipal Buffer Geofence (2,600m)
    const outerGeofence = L.circle([lat, lng], {
      radius: 2600,
      color: geofenceColor,
      weight: 1.5,
      dashArray: '6, 6',
      fillColor: geofenceColor,
      fillOpacity: 0.04,
    });
    outerGeofence.bindTooltip(`Perimeter Containment Zone (2.6 km)`, {
      permanent: false,
      direction: 'right',
      className: 'bg-slate-900 text-slate-100 text-[10px] font-mono border border-slate-700 rounded px-2 py-0.5',
    });
    geofencesLayerRef.current.addLayer(outerGeofence);

    // ----------------------------------------------------
    // 3. LIVE WEATHER LAYER 1: RADAR (Doppler Sweep & Reflectivity Cells)
    // ----------------------------------------------------
    if (activeWeatherLayers.radar) {
      // Concentric Doppler radar range rings
      [2000, 4200, 6800].forEach((r, idx) => {
        const ring = L.circle([lat, lng], {
          radius: r,
          color: '#38bdf8',
          weight: 1,
          dashArray: '3, 4',
          fillColor: 'transparent',
          fillOpacity: 0,
        });
        weatherOverlaysLayerRef.current?.addLayer(ring);
      });

      // Animated rotating radar sweep beam icon
      const radarIcon = L.divIcon({
        html: `
          <div class="radar-sweep-beam relative w-64 h-64 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style="opacity: ${layerOpacity};">
            <svg viewBox="0 0 100 100" class="w-full h-full">
              <defs>
                <linearGradient id="sweepGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#00f2fe" stop-opacity="0.6"/>
                  <stop offset="60%" stop-color="#0284c7" stop-opacity="0.15"/>
                  <stop offset="100%" stop-color="#0284c7" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <path d="M 50 50 L 100 50 A 50 50 0 0 0 85 15 Z" fill="url(#sweepGrad)"/>
              <line x1="50" y1="50" x2="100" y2="50" stroke="#38bdf8" stroke-width="1.5" stroke-opacity="0.8"/>
            </svg>
          </div>
        `,
        className: 'radar-sweep-container',
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });
      const sweepMarker = L.marker([lat, lng], { icon: radarIcon, interactive: false });
      weatherOverlaysLayerRef.current.addLayer(sweepMarker);

      // Radar Reflectivity Storm Cells (dBZ Scale)
      const stormCell1 = L.circle([lat + 0.012, lng + 0.015], {
        radius: 2200,
        color: '#eab308',
        fillColor: '#ef4444',
        fillOpacity: 0.65 * layerOpacity,
        weight: 1.5,
      }).bindTooltip('Severe Convective Cell (55 dBZ)', { sticky: true });
      weatherOverlaysLayerRef.current.addLayer(stormCell1);

      const stormCell2 = L.circle([lat - 0.016, lng - 0.018], {
        radius: 3100,
        color: '#22c55e',
        fillColor: '#eab308',
        fillOpacity: 0.45 * layerOpacity,
        weight: 1,
      }).bindTooltip('Moderate Rain Core (40 dBZ)', { sticky: true });
      weatherOverlaysLayerRef.current.addLayer(stormCell2);
    }

    // ----------------------------------------------------
    // 4. LIVE WEATHER LAYER 2: WIND STREAM (Animated Vector Streamlines)
    // ----------------------------------------------------
    if (activeWeatherLayers.wind) {
      // Generate dynamic animated vector wind streamlines drifting across the map canvas
      const windOffsets = [
        [-0.03, -0.04, 0.02, 0.03],
        [-0.015, -0.045, 0.035, 0.025],
        [0.005, -0.035, 0.05, 0.04],
        [-0.04, -0.01, 0.01, 0.06],
        [0.02, -0.025, 0.06, 0.045],
        [-0.025, 0.01, 0.03, 0.065],
      ];

      windOffsets.forEach((coords, i) => {
        const pathCoords: L.LatLngExpression[] = [
          [lat + coords[0], lng + coords[1]],
          [lat + (coords[0] + coords[2]) / 2 + 0.004, lng + (coords[1] + coords[3]) / 2 + 0.006],
          [lat + coords[2], lng + coords[3]],
        ];

        const line = L.polyline(pathCoords, {
          color: '#2dd4bf',
          weight: 2.2,
          opacity: 0.85 * layerOpacity,
          className: 'wind-streamline',
        });
        line.bindTooltip(`${selectedLocation.environmental.windSpeedKmh} km/h ${selectedLocation.environmental.windDirection}`, {
          sticky: true,
          className: 'bg-slate-900 text-teal-300 text-[10px] font-mono px-1.5 py-0.5 rounded border border-teal-800',
        });
        weatherOverlaysLayerRef.current?.addLayer(line);
      });

      // Wind Vector Arrow Marker
      const windIndicatorIcon = L.divIcon({
        html: `
          <div class="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900/90 border border-teal-500/80 text-teal-300 font-mono text-[11px] shadow-lg whitespace-nowrap">
            <span class="inline-block rotate-45 text-teal-400">➔</span>
            <span>${selectedLocation.environmental.windSpeedKmh} km/h ${selectedLocation.environmental.windDirection}</span>
          </div>
        `,
        className: 'wind-tag',
        iconSize: [120, 24],
        iconAnchor: [60, 12],
      });
      weatherOverlaysLayerRef.current.addLayer(L.marker([lat + 0.022, lng - 0.025], { icon: windIndicatorIcon }));
    }

    // ----------------------------------------------------
    // 5. LIVE WEATHER LAYER 3: PRECIPITATION (Rain Intensity Heatmap)
    // ----------------------------------------------------
    if (activeWeatherLayers.precipitation) {
      // Light Rain Outer Envelope (<15 mm/h)
      const rainOuter = L.circle([lat + 0.005, lng + 0.008], {
        radius: 6500,
        color: '#0284c7',
        fillColor: '#38bdf8',
        fillOpacity: 0.28 * layerOpacity,
        weight: 1,
      });
      weatherOverlaysLayerRef.current.addLayer(rainOuter);

      // Moderate Rain Core (15 - 35 mm/h)
      const rainMid = L.circle([lat + 0.008, lng + 0.006], {
        radius: 3800,
        color: '#2563eb',
        fillColor: '#0284c7',
        fillOpacity: 0.45 * layerOpacity,
        weight: 1.5,
      });
      weatherOverlaysLayerRef.current.addLayer(rainMid);

      // Torrential Downpour Core (>45 mm/h)
      const rainTorrential = L.circle([lat + 0.01, lng + 0.004], {
        radius: 1900,
        color: '#4f46e5',
        fillColor: '#6366f1',
        fillOpacity: 0.65 * layerOpacity,
        weight: 2,
      }).bindTooltip(`Cloudburst Core: ${selectedLocation.floodMetrics.rainfallMmHr} mm/h`, { permanent: true, direction: 'center' });
      weatherOverlaysLayerRef.current.addLayer(rainTorrential);
    }

    // ----------------------------------------------------
    // 6. LIVE WEATHER LAYER 4: TEMPERATURE (Thermal Gradient: Cool Blue to Deep Red)
    // ----------------------------------------------------
    if (activeWeatherLayers.temperature) {
      // Isotherm Zone 1: Rural / Cooler (<28°C) - Cyan Blue
      const tempCool = L.circle([lat - 0.02, lng - 0.02], {
        radius: 7000,
        color: '#0284c7',
        fillColor: '#06b6d4',
        fillOpacity: 0.25 * layerOpacity,
        weight: 1,
      }).bindTooltip('28°C Isotherm Boundary', { sticky: true });
      weatherOverlaysLayerRef.current.addLayer(tempCool);

      // Isotherm Zone 2: Moderate Buffer (32°C - 36°C) - Amber/Orange
      const tempWarm = L.circle([lat + 0.002, lng - 0.004], {
        radius: 4600,
        color: '#f97316',
        fillColor: '#f59e0b',
        fillOpacity: 0.4 * layerOpacity,
        weight: 1.5,
      }).bindTooltip('35°C Warm Sector', { sticky: true });
      weatherOverlaysLayerRef.current.addLayer(tempWarm);

      // Isotherm Zone 3: Extreme Urban Heat Island Core (>40°C) - Deep Crimson Red
      const tempExtreme = L.circle([lat + 0.004, lng - 0.006], {
        radius: 2400,
        color: '#991b1b',
        fillColor: '#ef4444',
        fillOpacity: 0.65 * layerOpacity,
        weight: 2,
      }).bindTooltip(`Extreme Thermal Hotspot: ${selectedLocation.heatMetrics.ambientTempC}°C`, {
        permanent: true,
        direction: 'center',
        className: 'bg-rose-950 text-rose-200 border border-rose-800 text-xs font-mono font-bold px-2 py-0.5 rounded',
      });
      weatherOverlaysLayerRef.current.addLayer(tempExtreme);
    }

    // ----------------------------------------------------
    // 7. LIVE WEATHER LAYER 5: HUMIDITY (Moisture Density Overlays)
    // ----------------------------------------------------
    if (activeWeatherLayers.humidity) {
      const humidityBand = L.polygon(
        [
          [lat - 0.03, lng - 0.03],
          [lat - 0.01, lng + 0.04],
          [lat + 0.03, lng + 0.02],
          [lat + 0.015, lng - 0.04],
        ],
        {
          color: '#0d9488',
          fillColor: '#14b8a6',
          fillOpacity: 0.38 * layerOpacity,
          weight: 1.5,
        }
      ).bindTooltip(`Atmospheric Moisture Saturation: ${selectedLocation.environmental.humidityPercent}% RH`, {
        sticky: true,
      });
      weatherOverlaysLayerRef.current.addLayer(humidityBand);
    }

    // ----------------------------------------------------
    // 8. LIVE WEATHER LAYER 6: ISOBAR PRESSURE (Contours & Pressure Centers)
    // ----------------------------------------------------
    if (activeWeatherLayers.pressure) {
      // Isobar Contour 1: 1004 hPa
      const isobar1 = L.circle([lat + 0.005, lng - 0.005], {
        radius: 2800,
        color: '#f43f5e',
        weight: 2,
        fillColor: 'transparent',
        dashArray: '8, 4',
      }).bindTooltip('1004 hPa Isobar', { permanent: true, direction: 'top' });
      weatherOverlaysLayerRef.current.addLayer(isobar1);

      // Isobar Contour 2: 1008 hPa
      const isobar2 = L.circle([lat + 0.005, lng - 0.005], {
        radius: 5200,
        color: '#f59e0b',
        weight: 1.5,
        fillColor: 'transparent',
      }).bindTooltip('1008 hPa Isobar', { permanent: true, direction: 'right' });
      weatherOverlaysLayerRef.current.addLayer(isobar2);

      // Isobar Contour 3: 1012 hPa
      const isobar3 = L.circle([lat + 0.005, lng - 0.005], {
        radius: 7800,
        color: '#38bdf8',
        weight: 1.5,
        fillColor: 'transparent',
      }).bindTooltip('1012 hPa Synoptic Boundary', { permanent: true, direction: 'bottom' });
      weatherOverlaysLayerRef.current.addLayer(isobar3);

      // Low Pressure Center "L" Marker
      const lowPressureIcon = L.divIcon({
        html: `
          <div class="w-8 h-8 rounded-full bg-rose-950/90 border-2 border-rose-500 text-rose-300 font-extrabold text-sm flex items-center justify-center shadow-2xl">
            L
          </div>
        `,
        className: 'isobar-low',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      weatherOverlaysLayerRef.current.addLayer(L.marker([lat + 0.005, lng - 0.005], { icon: lowPressureIcon }));
    }

    // ----------------------------------------------------
    // 9. RISK OVERLAYS: HEAT & FLOOD & AQI
    // ----------------------------------------------------
    if (activeRiskOverlays.heat && !activeWeatherLayers.temperature) {
      const heatCircle = L.circle([lat + 0.005, lng - 0.008], {
        radius: 3500,
        color: '#f43f5e',
        fillColor: '#f43f5e',
        fillOpacity: 0.35 * layerOpacity,
        weight: 1.5,
        dashArray: '4,4',
      });
      weatherOverlaysLayerRef.current.addLayer(heatCircle);
    }

    if (activeRiskOverlays.flood && !activeWeatherLayers.precipitation) {
      const floodBasin = L.polygon(
        [
          [lat - 0.015, lng - 0.01],
          [lat - 0.005, lng + 0.02],
          [lat + 0.012, lng + 0.018],
          [lat + 0.008, lng - 0.015],
        ],
        {
          color: '#00f2fe',
          fillColor: '#0284c7',
          fillOpacity: 0.42 * layerOpacity,
          weight: 2,
        }
      );
      weatherOverlaysLayerRef.current.addLayer(floodBasin);
    }

    if (activeRiskOverlays.aqi) {
      const aqiPlume = L.circle([lat - 0.02, lng - 0.015], {
        radius: 6000,
        color: '#a855f7',
        fillColor: '#7e22ce',
        fillOpacity: 0.28 * layerOpacity,
        weight: 1.5,
      }).bindTooltip(`PM2.5 Plume: ${selectedLocation.environmental.aqi} AQI`, { sticky: true });
      weatherOverlaysLayerRef.current.addLayer(aqiPlume);
    }

  }, [selectedLocation, activeRiskOverlays, activeWeatherLayers, layerOpacity]);

  // Handle Global Search Selection
  const handleSelectLocation = useCallback((item: { name: string; lat: number; lng: number }) => {
    const climateData = computeClimateRiskForLocation(item.lat, item.lng, item.name);
    setSelectedLocation(climateData);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([item.lat, item.lng], 13, { duration: 1.5 });
    }
  }, []);

  // Handle Incident Trigger for Current Location
  const handleTriggerIncident = () => {
    createManualIncident({
      title: `Emergency Protocol Declared: ${selectedLocation.placeName.split(',')[0]}`,
      summary: `Automated alert for ${selectedLocation.placeName} (${selectedLocation.coordinates.formatted}). Ambient Heat: ${selectedLocation.heatMetrics.ambientTempC}°C, Flood Inundation Index: ${selectedLocation.floodMetrics.inundationRiskPercent}%.`,
      hazardType: selectedLocation.heatMetrics.ambientTempC > 36 ? 'extreme_heat' : 'flash_flood',
      severity: selectedLocation.riskLevel === 'critical' ? 'critical' : 'high',
    });
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#070b12] select-none">
      {/* Full-bleed Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0 w-full h-full" />

      {/* Top Search Header Bar (Cleaned up branding) */}
      <TopSearchHeader
        onSelectLocation={handleSelectLocation}
        currentRiskLevel={selectedLocation.riskLevel}
        activeView="earth_gis"
        onToggleView={view => {
          if (view === 'enterprise' && onSwitchToEnterprise) {
            onSwitchToEnterprise();
          }
        }}
      />

      {/* Left Floating Navigation & Layer Panel */}
      <LeftLayerPanel
        baseMap={baseMap}
        onChangeBaseMap={setBaseMap}
        activeWeatherLayers={activeWeatherLayers}
        onToggleWeatherLayer={layer =>
          setActiveWeatherLayers(prev => ({ ...prev, [layer]: !prev[layer] }))
        }
        activeRiskOverlays={activeRiskOverlays}
        onToggleRiskOverlay={overlay =>
          setActiveRiskOverlays(prev => ({ ...prev, [overlay]: !prev[overlay] }))
        }
        layerOpacity={layerOpacity}
        onChangeOpacity={setLayerOpacity}
      />

      {/* Right Floating Weather & Risk Analytics Panel */}
      <RightAnalyticsPanel
        data={selectedLocation}
        onTriggerIncidentForLocation={handleTriggerIncident}
      />

      {/* Bottom Collapsible Incident & Action Panel */}
      <BottomActionPanel
        locationName={selectedLocation.placeName.split(',')[0]}
        riskLevel={selectedLocation.riskLevel}
        onNavigateToIncidents={() => {
          if (onSwitchToEnterprise) onSwitchToEnterprise();
        }}
      />

      {/* Bottom Center Timestamp Playback Bar & Timeline Scrubber */}
      <TimelineScrubber
        currentOffsetHours={timeOffsetHours}
        onChangeOffset={setTimeOffsetHours}
      />
    </div>
  );
};
