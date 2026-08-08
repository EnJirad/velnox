'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';

export type GeoPoint = { lat: number; lng: number };

type Props = {
  value: GeoPoint | null;
  onChange: (point: GeoPoint | null) => void;
  /** เมื่อ reverse geocode ได้ข้อความที่อยู่ */
  onAddressHint?: (hint: {
    displayName?: string;
    road?: string;
    suburb?: string;
    city?: string;
    province?: string;
    postcode?: string;
  }) => void;
};

declare global {
  // Leaflet โหลดจาก CDN — ไม่ผูก dependency ใน package.json
  interface Window {
    L?: any;
  }
}

let leafletLoading: Promise<void> | null = null;

function loadLeaflet(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.L) return Promise.resolve();
  if (leafletLoading) return leafletLoading;

  leafletLoading = new Promise((resolve, reject) => {
    const cssId = 'leaflet-css-cdn';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('โหลดแผนที่ไม่สำเร็จ'));
    document.body.appendChild(script);
  });
  return leafletLoading;
}

async function reverseGeocode(lat: number, lng: number) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=th`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      display_name?: string;
      address?: Record<string, string>;
    };
    const a = data.address ?? {};
    return {
      displayName: data.display_name,
      road: [a.road, a.house_number].filter(Boolean).join(' '),
      suburb: a.suburb || a.neighbourhood || a.village || a.town,
      city: a.city || a.town || a.municipality || a.county,
      province: a.state || a.province || a.region,
      postcode: a.postcode,
    };
  } catch {
    return null;
  }
}

export function AddressLocationPicker({ value, onChange, onAddressHint }: Props) {
  const mapId = useId().replace(/:/g, '');
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<{ map: any; marker: any } | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoBusy, setGeoBusy] = useState(false);
  const [showMap, setShowMap] = useState(!!value);

  const applyPoint = useCallback(
    async (lat: number, lng: number, withReverse = true) => {
      onChange({ lat, lng });
      if (!withReverse || !onAddressHint) return;
      const hint = await reverseGeocode(lat, lng);
      if (hint) onAddressHint(hint);
    },
    [onChange, onAddressHint],
  );

  // init / update map
  useEffect(() => {
    if (!showMap || !mapRef.current) return;
    let cancelled = false;

    (async () => {
      try {
        await loadLeaflet();
        if (cancelled || !window.L || !mapRef.current) return;
        const L = window.L;

        if (!mapInstance.current) {
          const center: [number, number] = value
            ? [value.lat, value.lng]
            : [13.7563, 100.5018]; // Bangkok
          const map = L.map(mapRef.current).setView(center, value ? 16 : 12);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap',
            maxZoom: 19,
          }).addTo(map);
          const marker = L.marker(center, { draggable: true }).addTo(map);
          marker.on('dragend', () => {
            const pos = marker.getLatLng();
            void applyPoint(pos.lat, pos.lng, true);
          });
          map.on('click', (e: { latlng: { lat: number; lng: number } }) => {
            marker.setLatLng(e.latlng);
            void applyPoint(e.latlng.lat, e.latlng.lng, true);
          });
          mapInstance.current = { map, marker };
          setMapReady(true);
          setTimeout(() => map.invalidateSize(), 100);
        }
      } catch (e) {
        setGeoError(e instanceof Error ? e.message : 'เปิดแผนที่ไม่สำเร็จ');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [showMap, applyPoint, value]);

  // sync marker when value changes externally
  useEffect(() => {
    if (!mapInstance.current || !value) return;
    const { map, marker } = mapInstance.current;
    marker.setLatLng([value.lat, value.lng]);
    map.setView([value.lat, value.lng], Math.max(map.getZoom(), 15));
  }, [value?.lat, value?.lng]);

  // cleanup map on unmount
  useEffect(() => {
    return () => {
      if (mapInstance.current) {
        mapInstance.current.map.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  function useCurrentLocation() {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError('เบราว์เซอร์ไม่รองรับการระบุตำแหน่ง');
      return;
    }
    setGeoBusy(true);
    setShowMap(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        void applyPoint(lat, lng, true);
        setGeoBusy(false);
      },
      (err) => {
        setGeoBusy(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError('ไม่อนุญาตเข้าถึงตำแหน่ง — กรุณาเปิด GPS หรือเลือกบนแผนที่');
        } else {
          setGeoError('ระบุตำแหน่งไม่สำเร็จ ลองเลือกบนแผนที่แทน');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-teal-100 bg-teal-50/40 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold text-teal-900">พิกัดจัดส่ง (ช่วยให้ส่งของแม่นขึ้น)</p>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-[11px] text-slate-500 hover:text-red-600"
          >
            ล้างพิกัด
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={geoBusy}
          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          </svg>
          {geoBusy ? 'กำลังหาตำแหน่ง...' : 'ใช้พิกัดปัจจุบัน'}
        </button>
        <button
          type="button"
          onClick={() => setShowMap((v) => !v)}
          className="rounded-lg border border-teal-200 bg-white px-3 py-2 text-xs font-medium text-teal-800 hover:bg-teal-50"
        >
          {showMap ? 'ซ่อนแผนที่' : 'เลือกบนแผนที่'}
        </button>
      </div>

      {geoError && <p className="text-xs text-red-600">{geoError}</p>}

      {value && (
        <p className="font-mono text-[11px] text-slate-600">
          lat {value.lat.toFixed(6)}, lng {value.lng.toFixed(6)}
        </p>
      )}

      {showMap && (
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <div
            ref={mapRef}
            id={`map-${mapId}`}
            className="h-56 w-full bg-slate-100"
            style={{ zIndex: 0 }}
          />
          <p className="bg-white px-2 py-1.5 text-[10px] text-slate-500">
            {mapReady
              ? 'ลากหมุดหรือแตะแผนที่เพื่อปรับตำแหน่ง'
              : 'กำลังโหลดแผนที่...'}
          </p>
        </div>
      )}
    </div>
  );
}

/** แนบพิกัดเข้า addressLine สำหรับส่งให้ backend (ยังไม่มีคอลัมน์ lat/lng) */
export function withGeoInAddressLine(line: string, geo: GeoPoint | null): string {
  const base = line.replace(/\s*\|\s*GPS:[-\d.]+,[-\d.]+\s*$/i, '').trim();
  if (!geo) return base;
  return `${base} | GPS:${geo.lat.toFixed(6)},${geo.lng.toFixed(6)}`;
}

export function parseGeoFromAddressLine(line: string): GeoPoint | null {
  const m = line.match(/\|\s*GPS:([-\d.]+),([-\d.]+)\s*$/i);
  if (!m) return null;
  const lat = Number(m[1]);
  const lng = Number(m[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}
