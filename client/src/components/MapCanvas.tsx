import { useEffect, useRef, useState } from "react";
import type { GeoJSONFeature, GeoJSONFeatureCollection } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

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
  isPanelCollapsed?: boolean;
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

export function MapCanvas({ data, onFeatureAdd, onFeatureSelect, selectedFeature, drawMode = "none", isPanelCollapsed = false }: MapCanvasProps) {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<any[]>([]);
  const drawingLayerRef = useRef<any>(null);
  const currentDrawingRef = useRef<number[][]>([]);
  const tileLayerRef = useRef<any>(null);
  const [baseMap, setBaseMap] = useState<BaseMap>("standard");

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    
    script.onload = () => {
      if (!containerRef.current || !window.L) return;

      const L = window.L;
      
      const map = L.map(containerRef.current, {
        zoomControl: false,
      }).setView([20, 0], 2);

      const tileLayer = L.tileLayer(baseMaps.standard.url, {
        attribution: baseMaps.standard.attribution,
        maxZoom: 19,
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      mapRef.current = map;

      map.on('click', (e: any) => {
        if (drawMode === 'point') {
          const feature: GeoJSONFeature = {
            type: "Feature",
            geometry: { type: "Point", coordinates: [e.latlng.lng, e.latlng.lat] },
            properties: {},
            id: Date.now()
          };
          onFeatureAdd?.(feature);
        } else if (drawMode === 'line' || drawMode === 'polygon') {
          currentDrawingRef.current.push([e.latlng.lng, e.latlng.lat]);
          
          if (drawingLayerRef.current) {
            map.removeLayer(drawingLayerRef.current);
          }

          if (currentDrawingRef.current.length === 1) {
            drawingLayerRef.current = L.circleMarker([e.latlng.lat, e.latlng.lng], {
              radius: 5,
              color: '#10b981',
              fillColor: '#10b981',
              fillOpacity: 1
            }).addTo(map);
          } else {
            const latLngs = currentDrawingRef.current.map(coord => [coord[1], coord[0]]);
            drawingLayerRef.current = L.polyline(latLngs, {
              color: '#10b981',
              weight: 2,
              dashArray: '5, 5'
            }).addTo(map);
          }
        }
      });

      map.on('dblclick', () => {
        if (drawMode === 'line' && currentDrawingRef.current.length >= 2) {
          const feature: GeoJSONFeature = {
            type: "Feature",
            geometry: { type: "LineString", coordinates: currentDrawingRef.current },
            properties: {},
            id: Date.now()
          };
          onFeatureAdd?.(feature);
          currentDrawingRef.current = [];
          if (drawingLayerRef.current) {
            map.removeLayer(drawingLayerRef.current);
            drawingLayerRef.current = null;
          }
        } else if (drawMode === 'polygon' && currentDrawingRef.current.length >= 3) {
          const feature: GeoJSONFeature = {
            type: "Feature",
            geometry: { type: "Polygon", coordinates: [[...currentDrawingRef.current, currentDrawingRef.current[0]]] },
            properties: {},
            id: Date.now()
          };
          onFeatureAdd?.(feature);
          currentDrawingRef.current = [];
          if (drawingLayerRef.current) {
            map.removeLayer(drawingLayerRef.current);
            drawingLayerRef.current = null;
          }
        }
      });
    };

    document.head.appendChild(script);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

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
          radius: isSelected ? 8 : 6,
          color: isSelected ? '#ef4444' : '#3b82f6',
          fillColor: isSelected ? '#ef4444' : '#3b82f6',
          fillOpacity: 1,
          weight: isSelected ? 2 : 1
        });
      } else if (feature.geometry.type === "LineString") {
        const coords = feature.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
        layer = L.polyline(coords, {
          color: isSelected ? '#ef4444' : '#3b82f6',
          weight: isSelected ? 3 : 2
        });
      } else if (feature.geometry.type === "Polygon") {
        const rings = feature.geometry.coordinates.map((ring: number[][]) => 
          ring.map((coord: number[]) => [coord[1], coord[0]])
        );
        layer = L.polygon(rings, {
          color: isSelected ? '#ef4444' : '#3b82f6',
          fillColor: isSelected ? '#ef4444' : '#3b82f6',
          fillOpacity: 0.2,
          weight: isSelected ? 3 : 2
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
      mapRef.current.setView([20, 0], 2);
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
      maxZoom: 19,
    }).addTo(map);
    
    tileLayerRef.current = newTileLayer;
    setBaseMap(newBaseMap);
  };

  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 300);
    }
  }, [isPanelCollapsed]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" data-testid="map-canvas" />
      
      <div className="absolute bottom-4 left-4 flex gap-1 z-[1000]">
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

      <div className="absolute bottom-4 right-4 flex flex-col gap-1 z-[1000]">
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
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium z-[1000]">
          {drawMode === "point" && "Click to add a point"}
          {drawMode === "line" && "Click to add points, double-click to finish"}
          {drawMode === "polygon" && "Click to add vertices, double-click to finish"}
        </div>
      )}
    </div>
  );
}
