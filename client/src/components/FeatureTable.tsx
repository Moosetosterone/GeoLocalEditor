import type { GeoJSONFeature } from "@shared/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface FeatureTableProps {
  features: GeoJSONFeature[];
  onFeatureSelect?: (feature: GeoJSONFeature) => void;
  onFeatureDelete?: (feature: GeoJSONFeature) => void;
  selectedFeature?: GeoJSONFeature | null;
}

export function FeatureTable({ features, onFeatureSelect, onFeatureDelete, selectedFeature }: FeatureTableProps) {
  if (features.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground" data-testid="text-no-features">
        No features yet. Draw on the map or edit the GeoJSON code to add features.
      </div>
    );
  }

  const allPropertyKeys = new Set<string>();
  features.forEach(feature => {
    Object.keys(feature.properties || {}).forEach(key => allPropertyKeys.add(key));
  });
  const propertyColumns = Array.from(allPropertyKeys);

  return (
    <div className="w-full h-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Type</TableHead>
            {propertyColumns.map(col => (
              <TableHead key={col}>{col}</TableHead>
            ))}
            <TableHead className="w-12">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {features.map((feature, idx) => (
            <TableRow
              key={feature.id || idx}
              className={selectedFeature?.id === feature.id ? "bg-accent" : "hover-elevate cursor-pointer"}
              onClick={() => onFeatureSelect?.(feature)}
              data-testid={`row-feature-${idx}`}
            >
              <TableCell className="font-medium">{idx + 1}</TableCell>
              <TableCell>{feature.geometry.type}</TableCell>
              {propertyColumns.map(col => (
                <TableCell key={col}>{feature.properties?.[col] || ""}</TableCell>
              ))}
              <TableCell>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFeatureDelete?.(feature);
                  }}
                  data-testid={`button-delete-feature-${idx}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
