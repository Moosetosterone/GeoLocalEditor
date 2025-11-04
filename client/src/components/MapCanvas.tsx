import { useEffect, useRef, useState } from "react";
import type { GeoJSONFeature, GeoJSONFeatureCollection } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface MapCanvasProps {
  data: GeoJSONFeatureCollection;
  onFeatureAdd?: (feature: GeoJSONFeature) => void;
  onFeatureSelect?: (feature: GeoJSONFeature | null) => void;
  selectedFeature?: GeoJSONFeature | null;
  drawMode?: "none" | "point" | "line" | "polygon";
}

export function MapCanvas({ data, onFeatureAdd, onFeatureSelect, selectedFeature, drawMode = "none" }: MapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(2);
  const [center, setCenter] = useState<[number, number]>([0, 20]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [currentDrawing, setCurrentDrawing] = useState<number[][]>([]);

  const lonLatToPixel = (lon: number, lat: number, width: number, height: number): [number, number] => {
    const scale = Math.pow(2, zoom);
    const x = ((lon + 180) / 360) * width * scale - (center[0] + 180) / 360 * width * scale + width / 2;
    const latRad = (lat * Math.PI) / 180;
    const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
    const y = height / 2 - (mercN * height * scale) / (2 * Math.PI) + ((center[1] * Math.PI) / 180 * height * scale) / (2 * Math.PI);
    return [x, y];
  };

  const pixelToLonLat = (x: number, y: number, width: number, height: number): [number, number] => {
    const scale = Math.pow(2, zoom);
    const lon = ((x - width / 2) / (width * scale)) * 360 + center[0];
    const mercN = ((height / 2 - y) * 2 * Math.PI) / (height * scale) - (center[1] * Math.PI) / 180;
    const lat = (2 * Math.atan(Math.exp(mercN)) - Math.PI / 2) * 180 / Math.PI;
    return [lon, lat];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;

    ctx.fillStyle = "#e5e7eb";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "#d1d5db";
    ctx.lineWidth = 1;
    for (let i = -180; i <= 180; i += 30) {
      const [x] = lonLatToPixel(i, 0, width, height);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let i = -90; i <= 90; i += 30) {
      const [, y] = lonLatToPixel(0, i, width, height);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    data.features.forEach((feature) => {
      const isSelected = selectedFeature?.id === feature.id;
      
      if (feature.geometry.type === "Point") {
        const [lon, lat] = feature.geometry.coordinates;
        const [x, y] = lonLatToPixel(lon, lat, width, height);
        
        ctx.fillStyle = isSelected ? "#ef4444" : "#3b82f6";
        ctx.beginPath();
        ctx.arc(x, y, isSelected ? 8 : 6, 0, 2 * Math.PI);
        ctx.fill();
        
        if (isSelected) {
          ctx.strokeStyle = "#dc2626";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      } else if (feature.geometry.type === "LineString") {
        const coords = feature.geometry.coordinates;
        if (coords.length > 0) {
          ctx.strokeStyle = isSelected ? "#ef4444" : "#3b82f6";
          ctx.lineWidth = isSelected ? 3 : 2;
          ctx.beginPath();
          const [x0, y0] = lonLatToPixel(coords[0][0], coords[0][1], width, height);
          ctx.moveTo(x0, y0);
          for (let i = 1; i < coords.length; i++) {
            const [x, y] = lonLatToPixel(coords[i][0], coords[i][1], width, height);
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      } else if (feature.geometry.type === "Polygon") {
        const rings = feature.geometry.coordinates;
        if (rings.length > 0 && rings[0].length > 0) {
          ctx.fillStyle = isSelected ? "rgba(239, 68, 68, 0.2)" : "rgba(59, 130, 246, 0.2)";
          ctx.strokeStyle = isSelected ? "#ef4444" : "#3b82f6";
          ctx.lineWidth = isSelected ? 3 : 2;
          
          rings.forEach((ring: number[][]) => {
            ctx.beginPath();
            const [x0, y0] = lonLatToPixel(ring[0][0], ring[0][1], width, height);
            ctx.moveTo(x0, y0);
            for (let i = 1; i < ring.length; i++) {
              const [x, y] = lonLatToPixel(ring[i][0], ring[i][1], width, height);
              ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          });
        }
      }
    });

    if (currentDrawing.length > 0) {
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      const [x0, y0] = lonLatToPixel(currentDrawing[0][0], currentDrawing[0][1], width, height);
      ctx.moveTo(x0, y0);
      for (let i = 1; i < currentDrawing.length; i++) {
        const [x, y] = lonLatToPixel(currentDrawing[i][0], currentDrawing[i][1], width, height);
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      currentDrawing.forEach(coord => {
        const [x, y] = lonLatToPixel(coord[0], coord[1], width, height);
        ctx.fillStyle = "#10b981";
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
      });
    }
  }, [data, zoom, center, selectedFeature, currentDrawing]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (drawMode === "point") {
      const [lon, lat] = pixelToLonLat(x, y, canvas.width, canvas.height);
      const feature: GeoJSONFeature = {
        type: "Feature",
        geometry: { type: "Point", coordinates: [lon, lat] },
        properties: {},
        id: Date.now()
      };
      onFeatureAdd?.(feature);
      return;
    }

    if (drawMode === "line" || drawMode === "polygon") {
      const [lon, lat] = pixelToLonLat(x, y, canvas.width, canvas.height);
      setCurrentDrawing(prev => [...prev, [lon, lat]]);
      return;
    }

    setIsDragging(true);
    setDragStart({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !dragStart || drawMode !== "none") return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dx = x - dragStart.x;
    const dy = y - dragStart.y;

    const scale = Math.pow(2, zoom);
    const lonShift = (dx / canvas.width) * 360 / scale;
    const latShift = -(dy / canvas.height) * 180 / scale;

    setCenter([center[0] - lonShift, center[1] - latShift]);
    setDragStart({ x, y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  const handleDoubleClick = () => {
    if (drawMode === "line" && currentDrawing.length >= 2) {
      const feature: GeoJSONFeature = {
        type: "Feature",
        geometry: { type: "LineString", coordinates: currentDrawing },
        properties: {},
        id: Date.now()
      };
      onFeatureAdd?.(feature);
      setCurrentDrawing([]);
    } else if (drawMode === "polygon" && currentDrawing.length >= 3) {
      const feature: GeoJSONFeature = {
        type: "Feature",
        geometry: { type: "Polygon", coordinates: [[...currentDrawing, currentDrawing[0]]] },
        properties: {},
        id: Date.now()
      };
      onFeatureAdd?.(feature);
      setCurrentDrawing([]);
    }
  };

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-full cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        data-testid="map-canvas"
      />
      <div className="absolute bottom-4 right-4 flex flex-col gap-1">
        <Button
          size="icon"
          variant="secondary"
          onClick={() => setZoom(z => Math.min(z + 1, 10))}
          data-testid="button-zoom-in"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          onClick={() => setZoom(z => Math.max(z - 1, 1))}
          data-testid="button-zoom-out"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          onClick={() => { setZoom(2); setCenter([0, 20]); }}
          data-testid="button-reset-view"
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>
      {drawMode !== "none" && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium">
          {drawMode === "point" && "Click to add a point"}
          {drawMode === "line" && "Click to add points, double-click to finish"}
          {drawMode === "polygon" && "Click to add vertices, double-click to finish"}
        </div>
      )}
    </div>
  );
}
