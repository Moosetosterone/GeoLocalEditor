import { useState } from "react";
import { FeatureTable } from "../FeatureTable";
import type { GeoJSONFeature } from "@shared/schema";

export default function FeatureTableExample() {
  const features: GeoJSONFeature[] = [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-122.4194, 37.7749] },
      properties: { name: "San Francisco", population: "884363" },
      id: 1
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-74.006, 40.7128] },
      properties: { name: "New York", population: "8336817" },
      id: 2
    },
    {
      type: "Feature",
      geometry: { type: "Polygon", coordinates: [[[-122.5, 37.8], [-122.4, 37.8], [-122.4, 37.7], [-122.5, 37.7], [-122.5, 37.8]]] },
      properties: { name: "Bay Area" },
      id: 3
    }
  ];

  const [selected, setSelected] = useState<GeoJSONFeature | null>(null);

  return (
    <FeatureTable 
      features={features}
      selectedFeature={selected}
      onFeatureSelect={(feature) => {
        setSelected(feature);
        console.log("Selected:", feature);
      }}
      onFeatureDelete={(feature) => console.log("Delete:", feature)}
    />
  );
}
