import { useState } from "react";
import { PropertyEditor } from "../PropertyEditor";
import type { GeoJSONFeature } from "@shared/schema";

export default function PropertyEditorExample() {
  const [feature] = useState<GeoJSONFeature>({
    type: "Feature",
    geometry: { type: "Point", coordinates: [-122.4194, 37.7749] },
    properties: { name: "San Francisco", population: "884363" },
    id: 1
  });

  return (
    <PropertyEditor 
      feature={feature}
      onPropertyChange={(props) => console.log("Properties updated:", props)}
    />
  );
}
