import { useEffect, useRef, useState } from "react";
import type { GeoJSONFeature, GeoJSONFeatureCollection } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { MAP_COLORS, MAP_DEFAULTS, DRAWING_CONFIG, Z_INDEX } from "@/lib/constants";

declare global {
  interface Window {
    L: any;
  }
}

interface MapCanvasProps {
  data: GeoJSONFeatureCollection;
  onFeatureAdd?: (feature: GeoJSONFeature) => void;
  onFeatureSelect?: (feature: GeoJSONFeature | null) => void;
  selectedFeature?: GeoJSONFeature | null;
  drawMode?: "none" | "point" | "line" | "polygon";
  isExpanded?: boolean;
}

type BaseMap = "standard" | "satellite" | "light" | "dark" | "terrain";

const baseMaps = {
  standard: {
    name: "Standard",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  satellite: {
    name: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: 'Tiles &copy; Esri'
  },
  light: {
    name: "Light",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  dark: {
    name: "Dark",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  terrain: {
    name: "Terrain",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, SRTM | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
  }
};

export function MapCanvas({ data, onFeatureAdd, onFeatureSelect, selectedFeature, drawMode = "none", isExpanded }: MapCanvasProps) {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<any[]>([]);
  const drawingLayerRef = useRef<any>(null);
  const currentDrawingRef = useRef<number[][]>([]);
  const tileLayerRef = useRef<any>(null);
  const [baseMap, setBaseMap] = useState<BaseMap>("standard");

  // ⭐ NEW: Use refs to store latest values for event handlers
  const drawModeRef = useRef(drawMode);
  const onFeatureAddRef = useRef(onFeatureAdd);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null); // ⭐ Track click timing

  // ⭐ NEW: Keep refs updated with latest values
  useEffect(() => {
    drawModeRef.current = drawMode;
  }, [drawMode]);

  useEffect(() => {
    onFeatureAddRef.current = onFeatureAdd;
  }, [onFeatureAdd]);

  // Initialize Leaflet map with proper cleanup
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let mounted = true;
    let map: any = null;

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';

    script.onload = () => {
      if (!mounted || !containerRef.current || !window.L) return;

      const L = window.L;

      map = L.map(containerRef.current, {
        zoomControl: false,
        doubleClickZoom: false, // ⭐ Disable double-click zoom so we can use it for drawing
      }).setView(MAP_DEFAULTS.CENTER, MAP_DEFAULTS.ZOOM);

      const tileLayer = L.tileLayer(baseMaps.standard.url, {
        attribution: baseMaps.standard.attribution,
        maxZoom: MAP_DEFAULTS.MAX_ZOOM,
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      mapRef.current = map;

      // ⭐ FIXED: Use refs in event handlers to get current values
      map.on('click', (e: any) => {
        const currentDrawMode = drawModeRef.current;
        const currentOnFeatureAdd = onFeatureAddRef.current;

        // ⭐ For line/polygon, delay processing to detect double-click
        if (currentDrawMode === 'line' || currentDrawMode === 'polygon') {
          // Clear any existing timer
          if (clickTimerRef.current) {
            clearTimeout(clickTimerRef.current);
          }

          // Wait a bit to see if it's a double-click
          clickTimerRef.current = setTimeout(() => {
            currentDrawingRef.current.push([e.latlng.lng, e.latlng.lat]);

            if (drawingLayerRef.current) {
              map.removeLayer(drawingLayerRef.current);
            }

            if (currentDrawingRef.current.length === 1) {
              drawingLayerRef.current = L.circleMarker([e.latlng.lat, e.latlng.lng], {
                radius: DRAWING_CONFIG.POINT_RADIUS,
                color: MAP_COLORS.DRAWING,
                fillColor: MAP_COLORS.DRAWING,
                fillOpacity: 1
              }).addTo(map);
            } else {
              const latLngs = currentDrawingRef.current.map(coord => [coord[1], coord[0]]);
              drawingLayerRef.current = L.polyline(latLngs, {
                color: MAP_COLORS.DRAWING,
                weight: DRAWING_CONFIG.LINE_WEIGHT,
                dashArray: DRAWING_CONFIG.DASH_ARRAY
              }).addTo(map);
            }
          }, 250); // 250ms delay to detect double-click
        } else if (currentDrawMode === 'point') {
          // Point mode: add immediately (no double-click needed)
          const feature: GeoJSONFeature = {
            type: "Feature",
            geometry: { type: "Point", coordinates: [e.latlng.lng, e.latlng.lat] },
            properties: {},
            id: Date.now()
          };
          currentOnFeatureAdd?.(feature);
        }
      });

      map.on('dblclick', (e: any) => {
        const currentDrawMode = drawModeRef.current;
        const currentOnFeatureAdd = onFeatureAddRef.current;

        // ⭐ Cancel any pending click timer
        if (clickTimerRef.current) {
          clearTimeout(clickTimerRef.current);
          clickTimerRef.current = null;
        }

        if (currentDrawMode === 'line' && currentDrawingRef.current.length >= 2) {
          const feature: GeoJSONFeature = {
            type: "Feature",
            geometry: { type: "LineString", coordinates: currentDrawingRef.current },
            properties: {},
            id: Date.now()
          };
          currentOnFeatureAdd?.(feature);
          currentDrawingRef.current = [];
          if (drawingLayerRef.current) {
            map.removeLayer(drawingLayerRef.current);
            drawingLayerRef.current = null;
          }
        } else if (currentDrawMode === 'polygon' && currentDrawingRef.current.length >= 3) {
          const feature: GeoJSONFeature = {
            type: "Feature",
            geometry: { type: "Polygon", coordinates: [[...currentDrawingRef.current, currentDrawingRef.current[0]]] },
            properties: {},
            id: Date.now()
          };
          currentOnFeatureAdd?.(feature);
          currentDrawingRef.current = [];
          if (drawingLayerRef.current) {
            map.removeLayer(drawingLayerRef.current);
            drawingLayerRef.current = null;
          }
        }
      });
    };

    script.onerror = () => {
      console.error('Failed to load Leaflet library');
    };

    document.head.appendChild(script);

    return () => {
      mounted = false;
      if (map) {
        map.remove();
        map = null;
      }
      mapRef.current = null;
    };
  }, []); // Only run once on mount

  // Resize when isExpanded prop changes
  useEffect(() => {
    if (!mapRef.current) return;

    const timeoutId = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [isExpanded]);

  // ResizeObserver as backup
  useEffect(() => {
    if (!containerRef.current || !mapRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Render features
  useEffect(() => {
    if (!mapRef.current || !window.L) return;

    const L = window.L;
    const map = mapRef.current;

    layersRef.current.forEach(layer => map.removeLayer(layer));
    layersRef.current = [];

    data.features.forEach((feature) => {
      const isSelected = selectedFeature?.id === feature.id;
      let layer: any;

      if (feature.geometry.type === "Point") {
        const [lon, lat] = feature.geometry.coordinates;
        layer = L.circleMarker([lat, lon], {
          radius: isSelected ? DRAWING_CONFIG.POINT_RADIUS_SELECTED : DRAWING_CONFIG.POINT_RADIUS,
          color: isSelected ? MAP_COLORS.FEATURE_SELECTED : MAP_COLORS.FEATURE_DEFAULT,
          fillColor: isSelected ? MAP_COLORS.FEATURE_SELECTED : MAP_COLORS.FEATURE_DEFAULT,
          fillOpacity: 1,
          weight: isSelected ? 2 : 1
        });
      } else if (feature.geometry.type === "LineString") {
        const coords = feature.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
        layer = L.polyline(coords, {
          color: isSelected ? MAP_COLORS.FEATURE_SELECTED : MAP_COLORS.FEATURE_DEFAULT,
          weight: isSelected ? DRAWING_CONFIG.LINE_WEIGHT_SELECTED : DRAWING_CONFIG.LINE_WEIGHT
        });
      } else if (feature.geometry.type === "Polygon") {
        const rings = feature.geometry.coordinates.map((ring: number[][]) =>
          ring.map((coord: number[]) => [coord[1], coord[0]])
        );
        layer = L.polygon(rings, {
          color: isSelected ? MAP_COLORS.FEATURE_SELECTED : MAP_COLORS.FEATURE_DEFAULT,
          fillColor: isSelected ? MAP_COLORS.FEATURE_SELECTED : MAP_COLORS.FEATURE_DEFAULT,
          fillOpacity: DRAWING_CONFIG.POLYGON_FILL_OPACITY,
          weight: isSelected ? DRAWING_CONFIG.LINE_WEIGHT_SELECTED : DRAWING_CONFIG.LINE_WEIGHT
        });
      }

      if (layer) {
        layer.on('click', (e: any) => {
          L.DomEvent.stopPropagation(e);
          onFeatureSelect?.(feature);
        });
        layer.addTo(map);
        layersRef.current.push(layer);
      }
    });
  }, [data, selectedFeature, onFeatureSelect]);

  // Clear drawing when drawMode changes to none
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    if (drawMode === 'none') {
      currentDrawingRef.current = [];
      if (drawingLayerRef.current) {
        map.removeLayer(drawingLayerRef.current);
        drawingLayerRef.current = null;
      }
    }
  }, [drawMode]);

  // ⭐ NEW: Change cursor based on draw mode
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    if (drawMode === 'point' || drawMode === 'line' || drawMode === 'polygon') {
      container.style.cursor = 'crosshair';
    } else {
      container.style.cursor = '';
    }

    return () => {
      container.style.cursor = '';
    };
  }, [drawMode]);

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.setView(MAP_DEFAULTS.CENTER, MAP_DEFAULTS.ZOOM);
    }
  };

  const handleBaseMapChange = (newBaseMap: BaseMap) => {
    if (!mapRef.current || !tileLayerRef.current || !window.L) return;

    const L = window.L;
    const map = mapRef.current;

    map.removeLayer(tileLayerRef.current);

    const baseMapConfig = baseMaps[newBaseMap];
    const newTileLayer = L.tileLayer(baseMapConfig.url, {
      attribution: baseMapConfig.attribution,
      maxZoom: MAP_DEFAULTS.MAX_ZOOM,
    }).addTo(map);

    tileLayerRef.current = newTileLayer;
    setBaseMap(newBaseMap);
  };

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" data-testid="map-canvas" />

      <div className="absolute bottom-4 left-4 flex gap-1" style={{ zIndex: Z_INDEX.MAP_CONTROLS }}>
        {(Object.keys(baseMaps) as BaseMap[]).map((key) => (
          <Button
            key={key}
            size="sm"
            variant={baseMap === key ? "default" : "secondary"}
            onClick={() => handleBaseMapChange(key)}
            data-testid={`button-basemap-${key}`}
            className="h-8 text-xs"
          >
            {baseMaps[key].name}
          </Button>
        ))}
      </div>

      <div className="absolute bottom-4 right-4 flex flex-col gap-1" style={{ zIndex: Z_INDEX.MAP_CONTROLS }}>
        <Button
          size="icon"
          variant="secondary"
          onClick={handleZoomIn}
          data-testid="button-zoom-in"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          onClick={handleZoomOut}
          data-testid="button-zoom-out"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          onClick={handleResetView}
          data-testid="button-reset-view"
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>

      {drawMode !== "none" && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium" style={{ zIndex: Z_INDEX.DRAWING_HINT }}>
          {drawMode === "point" && "Click to add a point"}
          {drawMode === "line" && "Click to add points, double-click to finish"}
          {drawMode === "polygon" && "Click to add vertices, double-click to finish"}
        </div>
      )}
    </div>
  );
}