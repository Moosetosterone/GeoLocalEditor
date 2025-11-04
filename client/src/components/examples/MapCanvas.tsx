import { useState } from "react";
import { MapCanvas } from "../MapCanvas";
import type { GeoJSONFeature, GeoJSONFeatureCollection } from "@shared/schema";

export default function MapCanvasExample() {
  const [data] = useState<GeoJSONFeatureCollection>({
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [-122.4194, 37.7749] },
        properties: { name: "San Francisco" },
        id: 1
      },
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [-74.006, 40.7128] },
        properties: { name: "New York" },
        id: 2
      }
    ]
  });

  return (
    <MapCanvas 
      data={data}
      onFeatureAdd={(feature) => console.log("Feature added:", feature)}
      drawMode="none"
    />
  );
}
