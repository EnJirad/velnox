import { useLanguage } from "@/lib/i18n";
import { Button } from "@velnox/shared/components/ui/button";
import { Input } from "@velnox/shared/components/ui/input";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Check, LocateFixed, Map as MapIcon, Search, Satellite } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * GPS map picker — rebuilt for production.
 *
 * Architecture:
 *   FIXED CENTER PIN  +  MOVABLE MAP
 *
 * The pin is a CSS-overlaid element at the visual center of the map.
 * The user pans the map underneath; `map.getCenter()` is the chosen
 * coordinate.  No draggable marker is involved.
 *
 * Satellite imagery is the default view (Esri World Imagery — no API key).
 * If satellite tiles fail to load, a user-visible fallback message is shown
 * and the standard OpenStreetMap layer is offered.
 *
 * All geolocation failures degrade gracefully — manual map selection always
 * works.
 */
interface MapPickerProps {
  latitude: number | null;
  longitude: number | null;
  /** Fires whenever the picked position changes (parent sets confirmed=false). */
  onChange: (lat: number, lng: number) => void;
  confirmed: boolean;
  /** Marks the current coordinates as the confirmed location. */
  onConfirm: () => void;
  /** Auto-request the browser's current location on mount (new addresses). */
  autoLocate?: boolean;
  height?: string;
}

interface PlaceResult {
  lat: string;
  lon: string;
  display_name: string;
}

const DEFAULT_CENTER: [number, number] = [13.7563, 100.5018]; // Bangkok

/** Esri World Imagery — publicly available, no key needed. */
const SATELLITE_TILES =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

const STANDARD_TILES = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

/** Max zoom level Esri supports natively for imagery. */
const ESRI_MAX_NATIVE_ZOOM = 19;

/* -------------------------------------------------------------------------- */
/*  Center-pin overlay                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Pure-CSS center pin — absolutely positioned at the visual center of the
 * map container.  `pointer-events: none` so it never blocks map gestures.
 */
function CenterPin() {
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 z-[500] -translate-x-1/2 -translate-y-full"
      aria-hidden="true"
    >
      {/* Drop shadow */}
      <div className="absolute bottom-0 left-1/2 h-3 w-3 -translate-x-1/2 translate-y-1 rounded-full bg-black/20 blur-[3px]" />
      {/* Pin */}
      <svg
        viewBox="0 0 28 38"
        width="28"
        height="38"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-md"
      >
        <path
          d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 24 14 24s14-13.5 14-24C28 6.268 21.732 0 14 0z"
          fill="#10B981"
        />
        <circle cx="14" cy="14" r="5.5" fill="white" />
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                            */
/* -------------------------------------------------------------------------- */

export function MapPicker({
  latitude,
  longitude,
  onChange,
  confirmed,
  onConfirm,
  autoLocate = false,
  height = "h-64",
}: MapPickerProps) {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const satelliteLayerRef = useRef<L.TileLayer | null>(null);
  const standardLayerRef = useRef<L.TileLayer | null>(null);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  const [layer, setLayer] = useState<"satellite" | "standard">("satellite");
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [tileError, setTileError] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);

  const hasPos = latitude != null && longitude != null;

  /* ---- Tile error detection ----------------------------------------------- */
  const handleTileError = useCallback(() => {
    setTileError(true);
  }, []);

  /* ---- Initialize map once ------------------------------------------------ */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: DEFAULT_CENTER,
      zoom: 15,
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
      dragging: true,
      bounceAtZoomLimits: true,
    });

    // Tile error detection — count consecutive tile errors to detect broken layers
    let tileErrorCount = 0;
    const satellite = L.tileLayer(SATELLITE_TILES, {
      attribution:
        'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
      maxZoom: 19,
      maxNativeZoom: ESRI_MAX_NATIVE_ZOOM,
    }).addTo(map);

    satellite.on("tileerror", () => {
      tileErrorCount++;
      // After 5 tile errors on the satellite layer, trigger fallback
      if (tileErrorCount > 5) {
        handleTileError();
      }
    });

    const standard = L.tileLayer(STANDARD_TILES, {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
      maxZoom: 19,
    });

    satelliteLayerRef.current = satellite;
    standardLayerRef.current = standard;

    /* ----- Center-pin coordinate sync ------------------------------------
       Every time the map moves, read map.getCenter() and fire onChange.
       The pin stays fixed visually; the map moves underneath it. */
    const syncCenter = () => {
      const center = map.getCenter();
      const lat = Math.round(center.lat * 1e8) / 1e8; // preserve ~1mm precision
      const lng = Math.round(center.lng * 1e8) / 1e8;
      setSelectedCoords({ lat, lng });
      onChangeRef.current(lat, lng);
    };

    // Sync on every move (for live coordinate display) and on moveend
    map.on("move", syncCenter);
    map.on("moveend", syncCenter);

    // Initial sync
    syncCenter();

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      satelliteLayerRef.current = null;
      standardLayerRef.current = null;
    };
  }, [handleTileError]);

  /* ---- Pan map when external coords change (e.g. GPS or search result) ---- */
  useEffect(() => {
    if (!mapRef.current) return;
    if (latitude != null && longitude != null) {
      mapRef.current.setView([latitude, longitude], mapRef.current.getZoom(), {
        animate: false,
      });
    }
  }, [latitude, longitude]);

  /* ---- Layer toggle ------------------------------------------------------- */
  useEffect(() => {
    if (!mapRef.current || !satelliteLayerRef.current || !standardLayerRef.current) return;
    if (layer === "satellite") {
      if (!mapRef.current.hasLayer(satelliteLayerRef.current))
        satelliteLayerRef.current.addTo(mapRef.current);
      if (mapRef.current.hasLayer(standardLayerRef.current))
        standardLayerRef.current.remove();
    } else {
      if (!mapRef.current.hasLayer(standardLayerRef.current))
        standardLayerRef.current.addTo(mapRef.current);
      if (mapRef.current.hasLayer(satelliteLayerRef.current))
        satelliteLayerRef.current.remove();
    }
  }, [layer]);

  /* ---- If satellite tiles fail, auto-switch to standard with user notice --- */
  useEffect(() => {
    if (tileError && layer === "satellite") {
      setLayer("standard");
    }
  }, [tileError, layer]);

  /* ---- GPS: locate current position --------------------------------------- */
  const locateCurrent = useCallback(() => {
    setLocateError(null);
    if (!("geolocation" in navigator)) {
      setLocateError(t("mapPicker.unsupported"));
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (mapRef.current) {
          mapRef.current.setView(
            [pos.coords.latitude, pos.coords.longitude],
            17,
          );
        }
        setLocating(false);
      },
      () => {
        setLocating(false);
        setLocateError(t("mapPicker.denied"));
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [t]);

  /* ---- Auto-locate on mount (new-address flow) ---------------------------- */
  useEffect(() => {
    if (!autoLocate || hasPos) return;
    let alive = true;
    const timer = setTimeout(() => {
      if (!("geolocation" in navigator)) {
        if (alive) setLocateError(t("mapPicker.unsupported"));
        return;
      }
      if (alive) setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!alive || !mapRef.current) return;
          mapRef.current.setView(
            [pos.coords.latitude, pos.coords.longitude],
            17,
          );
          setLocating(false);
        },
        () => {
          if (!alive) return;
          setLocating(false);
          setLocateError(t("mapPicker.denied"));
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    }, 0);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [autoLocate, hasPos, t]);

  /* ---- Place search (Nominatim — free, no key) ---------------------------- */
  useEffect(() => {
    const term = query.trim();
    let alive = true;
    const timer = setTimeout(async () => {
      if (term.length < 3) {
        if (alive) setResults([]);
        if (alive) setSearchOpen(false);
        return;
      }
      if (alive) setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(term)}`,
          { headers: { Accept: "application/json" } },
        );
        if (!res.ok) throw new Error("search failed");
        const data = (await res.json()) as PlaceResult[];
        if (!alive) return;
        setResults(data);
        setSearchOpen(true);
      } catch {
        if (!alive) return;
        setResults([]);
        setSearchOpen(false);
      } finally {
        if (alive) setSearching(false);
      }
    }, 400);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [query]);

  const pickPlace = (place: PlaceResult) => {
    if (mapRef.current) {
      mapRef.current.setView(
        [Number(place.lat), Number(place.lon)],
        17,
      );
    }
    setResults([]);
    setSearchOpen(false);
    setQuery(place.display_name.split(",")[0] ?? "");
  };

  return (
    <div className="space-y-2">
      {/* ── Map container ─────────────────────────────────────────────── */}
      <div className="relative">
        <div
          ref={containerRef}
          className={`relative z-0 w-full overflow-hidden rounded-[12px] border border-slate-200 ${height}`}
          style={{ touchAction: "none" }}
          aria-label={t("mapPicker.ariaMap")}
        />

        {/* Fixed center pin — rendered as a DOM overlay, not a Leaflet marker */}
        <CenterPin />

        {/* Layer toggle */}
        <div className="absolute right-2 top-2 z-[600] flex overflow-hidden rounded-lg border border-slate-200 bg-white text-xs shadow-sm">
          <button
            type="button"
            onClick={() => setLayer("satellite")}
            className={`flex items-center gap-1 px-2.5 py-1.5 font-medium transition-colors ${
              layer === "satellite"
                ? "bg-[#ECFDF5] text-[#0f766e]"
                : "text-slate-500 hover:bg-slate-50"
            }`}
            aria-pressed={layer === "satellite"}
          >
            <Satellite className="size-3.5" />
            {t("mapPicker.satellite")}
          </button>
          <button
            type="button"
            onClick={() => setLayer("standard")}
            className={`flex items-center gap-1 px-2.5 py-1.5 font-medium transition-colors ${
              layer === "standard"
                ? "bg-[#ECFDF5] text-[#0f766e]"
                : "text-slate-500 hover:bg-slate-50"
            }`}
            aria-pressed={layer === "standard"}
          >
            <MapIcon className="size-3.5" />
            {t("mapPicker.map")}
          </button>
        </div>

        {/* Satellite tile fallback notice */}
        {tileError && layer === "standard" && (
          <div className="absolute left-2 top-2 z-[600] max-w-[200px] rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-5 text-amber-700 shadow-sm">
            {t("mapPicker.satelliteUnavailable")}
          </div>
        )}

        {/* Locating overlay */}
        {locating && (
          <div className="absolute inset-0 z-[550] flex items-center justify-center rounded-[12px] bg-white/70 backdrop-blur-[1px]">
            <p className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <LocateFixed className="size-4 animate-spin text-[#10B981]" />
              {t("mapPicker.locating")}
            </p>
          </div>
        )}
      </div>

      {/* ── Live coordinates display ──────────────────────────────────── */}
      {selectedCoords && (
        <p className="text-center text-[11px] tabular-nums text-slate-400">
          {t("mapPicker.coords", {
            lat: selectedCoords.lat.toFixed(6),
            lng: selectedCoords.lng.toFixed(6),
          })}
        </p>
      )}

      {/* ── Place search ──────────────────────────────────────────────── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setSearchOpen(true)}
          placeholder={t("mapPicker.searchPlaceholder")}
          className="h-10 rounded-[10px] border-slate-200 pl-9 pr-3 text-sm"
          aria-label={t("mapPicker.searchPlaceholder")}
        />
        {searching && (
          <p className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400">
            {t("common.loading")}
          </p>
        )}
        {searchOpen && results.length > 0 && (
          <ul className="absolute z-[600] mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            {results.map((r) => (
              <li key={r.lat + r.lon}>
                <button
                  type="button"
                  onClick={() => pickPlace(r)}
                  className="w-full px-3 py-2.5 text-left text-xs leading-5 text-slate-600 transition-colors hover:bg-slate-50"
                >
                  {r.display_name}
                </button>
              </li>
            ))}
          </ul>
        )}
        {searchOpen && results.length === 0 && !searching && query.trim().length >= 3 && (
          <p className="absolute z-[600] mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-400 shadow-lg">
            {t("mapPicker.noResults")}
          </p>
        )}
      </div>

      {/* ── Actions + status ──────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 border-slate-200 text-slate-600"
            onClick={locateCurrent}
            disabled={locating}
          >
            <LocateFixed className={`size-3.5 ${locating ? "animate-spin" : ""}`} />
            {t("mapPicker.useCurrent")}
          </Button>
          {hasPos && !confirmed && (
            <Button
              type="button"
              size="sm"
              className="gap-1.5 bg-[#10B981] text-white hover:bg-emerald-700"
              onClick={onConfirm}
            >
              <Check className="size-3.5" />
              {t("mapPicker.confirm")}
            </Button>
          )}
        </div>
        <p
          className={`flex items-center gap-1 text-[11px] font-medium ${
            confirmed ? "text-emerald-700" : "text-slate-400"
          }`}
        >
          {confirmed ? (
            <>
              <Check className="size-3.5" />
              {t("mapPicker.confirmed")}
            </>
          ) : (
            t("mapPicker.notConfirmed")
          )}
        </p>
      </div>

      {/* ── Inline geolocation errors ─────────────────────────────────── */}
      {locateError && (
        <p className="flex items-start gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-[11px] leading-5 text-amber-700">
          <LocateFixed className="mt-0.5 size-3.5 shrink-0" />
          {locateError}
        </p>
      )}

      {/* ── Hint ──────────────────────────────────────────────────────── */}
      {hasPos && !confirmed && (
        <p className="text-[11px] text-slate-400">{t("mapPicker.moveHint")}</p>
      )}
    </div>
  );
}
