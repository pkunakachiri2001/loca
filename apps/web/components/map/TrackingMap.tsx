'use client';

import { useEffect, useRef, useState } from 'react';
import {
  MapPin,
  Navigation,
  Activity,
  Layers,
  Search,
  CheckCircle2,
  Maximize2,
  ShieldAlert,
  Zap,
  Car,
  Bus,
  User,
  Wrench,
  Droplets,
  ExternalLink,
} from 'lucide-react';
import { ZIMBABWE_CITIES, ZIMBABWE_MAP_CENTER, ZimbabweCity } from '@/lib/zimbabwe-locations';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export interface TrackingMarker {
  id: string;
  title: string;
  category: 'CAR_RENTAL' | 'BUS_RENTAL' | 'DRIVER' | 'MECHANIC' | 'CAR_WASH';
  cityName: string;
  lat: number;
  lng: number;
  pricePerDay: number;
  companyName: string;
  rating: number;
  image?: string;
  speedKmH?: number;
  heading?: number;
  status?: 'MOVING' | 'IDLE' | 'SERVICING';
}

const DEFAULT_MARKERS: TrackingMarker[] = [
  {
    id: 'tr-1',
    title: 'Toyota Camry 2023 Executive',
    category: 'CAR_RENTAL',
    cityName: 'Harare',
    lat: -17.8292,
    lng: 31.0522,
    pricePerDay: 50,
    companyName: 'Harare Executive Motors',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop',
    speedKmH: 62,
    heading: 45,
    status: 'MOVING',
  },
  {
    id: 'tr-2',
    title: 'Toyota Land Cruiser V8 Safari 4x4',
    category: 'CAR_RENTAL',
    cityName: 'Harare',
    lat: -17.8500,
    lng: 31.0800,
    pricePerDay: 120,
    companyName: 'Harare Executive Motors',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&h=300&fit=crop',
    speedKmH: 0,
    heading: 120,
    status: 'IDLE',
  },
  {
    id: 'tr-3',
    title: 'Luxury 54-Seater Scania Coach',
    category: 'BUS_RENTAL',
    cityName: 'Bulawayo',
    lat: -20.1569,
    lng: 28.5823,
    pricePerDay: 250,
    companyName: 'Victoria Falls Safaris',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=400&h=300&fit=crop',
    speedKmH: 78,
    heading: 210,
    status: 'MOVING',
  },
  {
    id: 'tr-4',
    title: 'Toyota Hiace 14-Seater Tour Bus',
    category: 'BUS_RENTAL',
    cityName: 'Victoria Falls',
    lat: -17.9244,
    lng: 25.8354,
    pricePerDay: 85,
    companyName: 'Victoria Falls Safaris',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&h=300&fit=crop',
    speedKmH: 40,
    heading: 90,
    status: 'MOVING',
  },
  {
    id: 'tr-5',
    title: 'Mobile Mechanic & Tow Truck',
    category: 'MECHANIC',
    cityName: 'Mutare',
    lat: -18.9707,
    lng: 32.6709,
    pricePerDay: 30,
    companyName: 'Mutare Auto Masters',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=300&fit=crop',
    speedKmH: 0,
    status: 'SERVICING',
  },
  {
    id: 'tr-6',
    title: 'Auto Spa Detailing Van',
    category: 'CAR_WASH',
    cityName: 'Gweru',
    lat: -19.4500,
    lng: 29.8167,
    pricePerDay: 35,
    companyName: 'Bulawayo Express Auto Spa',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    speedKmH: 0,
    status: 'IDLE',
  },
];

interface TrackingMapProps {
  markers?: TrackingMarker[];
  selectedCity?: string;
  height?: string;
  showControls?: boolean;
}

export function TrackingMap({
  markers = DEFAULT_MARKERS,
  selectedCity,
  height = '600px',
  showControls = true,
}: TrackingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const [activeCity, setActiveCity] = useState<string>(selectedCity || 'Harare');
  const [liveSimulation, setLiveSimulation] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [currentMarkers, setCurrentMarkers] = useState<TrackingMarker[]>(markers);

  // Load Leaflet CSS and JS dynamically
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }

    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(cssLink);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => setLeafletLoaded(true);
    document.body.appendChild(script);
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current || mapInstanceRef.current) return;

    const L = (window as any).L;
    const map = L.map(mapContainerRef.current, {
      center: [ZIMBABWE_MAP_CENTER.lat, ZIMBABWE_MAP_CENTER.lng],
      zoom: ZIMBABWE_MAP_CENTER.zoom,
      zoomControl: false,
    });

    // Dark Mode Tiles (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [leafletLoaded]);

  // Render & Update Markers on Map
  useEffect(() => {
    if (!leafletLoaded || !mapInstanceRef.current) return;

    const L = (window as any).L;
    const map = mapInstanceRef.current;

    // Filter markers
    const filtered = currentMarkers.filter((m) => {
      if (activeFilter === 'ALL') return true;
      return m.category === activeFilter;
    });

    // Clear old markers
    Object.values(markersRef.current).forEach((marker: any) => map.removeLayer(marker));
    markersRef.current = {};

    // Add new markers
    filtered.forEach((item) => {
      const getCategoryColor = (cat: string) => {
        if (cat === 'CAR_RENTAL') return '#E8A547'; // Warm Amber
        if (cat === 'BUS_RENTAL') return '#3B82F6'; // Blue
        if (cat === 'MECHANIC') return '#EF4444'; // Red
        if (cat === 'CAR_WASH') return '#10B981'; // Emerald
        return '#8B5CF6';
      };

      const color = getCategoryColor(item.category);

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            position: relative;
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(15, 23, 42, 0.92);
            border: 2px solid ${color};
            border-radius: 50%;
            box-shadow: 0 0 16px ${color}80;
            cursor: pointer;
            transition: transform 0.2s ease;
          ">
            <div style="
              width: 10px;
              height: 10px;
              border-radius: 50%;
              background: ${color};
              box-shadow: 0 0 8px ${color};
            "></div>
            ${
              item.status === 'MOVING'
                ? `<div style="
                    position: absolute;
                    inset: -4px;
                    border-radius: 50%;
                    border: 2px solid ${color};
                    opacity: 0.6;
                    animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                  "></div>`
                : ''
            }
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      const popupContent = `
        <div style="
          background: #0f172a;
          color: #f8fafc;
          border: 1px solid rgba(232, 165, 71, 0.3);
          border-radius: 12px;
          padding: 12px;
          min-width: 220px;
          font-family: inherit;
        ">
          ${
            item.image
              ? `<img src="${item.image}" alt="${item.title}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />`
              : ''
          }
          <div style="font-size: 11px; font-weight: 700; color: #E8A547; text-transform: uppercase; margin-bottom: 2px;">
            ${item.cityName} • ${item.companyName}
          </div>
          <div style="font-size: 14px; font-weight: 700; margin-bottom: 6px; color: #ffffff;">
            ${item.title}
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-size: 16px; font-weight: 800; color: #E8A547;">
              $${item.pricePerDay}<span style="font-size: 11px; font-weight: 400; color: #94a3b8;">/day</span>
            </span>
            <span style="font-size: 12px; color: #fbbf24; display: flex; align-items: center; gap: 3px;">
              ★ ${item.rating}
            </span>
          </div>
          ${
            item.speedKmH !== undefined
              ? `<div style="font-size: 11px; color: #38bdf8; background: rgba(56, 189, 248, 0.1); padding: 4px 8px; border-radius: 6px; margin-bottom: 8px; display: inline-block;">
                  ⚡ Live Speed: ${item.speedKmH} km/h (${item.status})
                </div>`
              : ''
          }
          <a href="/search?q=${encodeURIComponent(item.title)}" style="
            display: block;
            text-align: center;
            background: linear-gradient(135deg, #E8A547, #C68227);
            color: #000;
            font-weight: 700;
            font-size: 12px;
            padding: 8px 12px;
            border-radius: 8px;
            text-decoration: none;
            margin-top: 4px;
          ">
            View Listing
          </a>
        </div>
      `;

      const marker = L.marker([item.lat, item.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(popupContent, {
          className: 'dark-leaflet-popup',
          closeButton: false,
        });

      markersRef.current[item.id] = marker;
    });
  }, [leafletLoaded, currentMarkers, activeFilter]);

  // Live GPS Simulation Timer
  useEffect(() => {
    if (!liveSimulation) return;

    const interval = setInterval(() => {
      setCurrentMarkers((prev) =>
        prev.map((m) => {
          if (m.status !== 'MOVING') return m;
          // Micro-movement jitter simulation for live GPS tracking
          const latDelta = (Math.random() - 0.5) * 0.003;
          const lngDelta = (Math.random() - 0.5) * 0.003;
          const newSpeed = Math.floor(55 + Math.random() * 25);
          return {
            ...m,
            lat: m.lat + latDelta,
            lng: m.lng + lngDelta,
            speedKmH: newSpeed,
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [liveSimulation]);

  // Center Map on selected City
  const handleSelectCity = (cityName: string) => {
    setActiveCity(cityName);
    const city = ZIMBABWE_CITIES.find((c) => c.name === cityName);
    if (city && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([city.lat, city.lng], 12, { duration: 1.5 });
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-950">
      {/* Top Filter Bar */}
      {showControls && (
        <div className="absolute top-4 left-4 right-4 z-[500] flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/90 backdrop-blur-md border border-white/10 shadow-lg">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'ALL', label: 'All Fleet' },
              { id: 'CAR_RENTAL', label: 'Cars' },
              { id: 'BUS_RENTAL', label: 'Buses' },
              { id: 'MECHANIC', label: 'Mechanics' },
              { id: 'CAR_WASH', label: 'Wash' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  activeFilter === tab.id
                    ? 'bg-[#E8A547] text-slate-950 shadow-md shadow-[#E8A547]/20'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* City Selector */}
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#E8A547]" />
            <select
              value={activeCity}
              onChange={(e) => handleSelectCity(e.target.value)}
              className="bg-slate-800 text-slate-200 text-xs font-medium px-3 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#E8A547]"
            >
              {ZIMBABWE_CITIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.province})
                </option>
              ))}
            </select>

            {/* Live Tracking Indicator */}
            <button
              onClick={() => setLiveSimulation(!liveSimulation)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                liveSimulation
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-800 border-white/10 text-slate-400'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  liveSimulation ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                }`}
              />
              {liveSimulation ? 'Live GPS Active' : 'GPS Paused'}
            </button>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div ref={mapContainerRef} style={{ height }} className="w-full z-10" />

      {/* Map Footer Legend */}
      <div className="absolute bottom-3 left-4 z-[500] hidden sm:flex items-center gap-4 px-3 py-2 rounded-lg bg-slate-900/85 backdrop-blur-md border border-white/10 text-[11px] text-slate-300">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#E8A547]" /> Cars
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Buses
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Towing/Mechanics
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Car Wash
        </div>
        <div className="text-slate-400 border-l border-white/10 pl-3">
          Covering all 10 Zimbabwe Provinces
        </div>
      </div>
    </div>
  );
}
