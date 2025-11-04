import type { GeoJSONFeature } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface PropertyEditorProps {
  feature: GeoJSONFeature | null;
  onPropertyChange?: (properties: Record<string, any>) => void;
}

export function PropertyEditor({ feature, onPropertyChange }: PropertyEditorProps) {
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  if (!feature) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground p-4" data-testid="text-no-selection">
        Select a feature from the map or table to edit its properties
      </div>
    );
  }

  const properties = feature.properties || {};
  const propertyEntries = Object.entries(properties);

  const handleAddProperty = () => {
    if (newKey.trim()) {
      onPropertyChange?.({ ...properties, [newKey]: newValue });
      setNewKey("");
      setNewValue("");
    }
  };

  const handleDeleteProperty = (key: string) => {
    const newProps = { ...properties };
    delete newProps[key];
    onPropertyChange?.(newProps);
  };

  const handleUpdateProperty = (key: string, value: string) => {
    onPropertyChange?.({ ...properties, [key]: value });
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4 overflow-auto">
      <div>
        <h3 className="text-sm font-semibold mb-2">Feature Type</h3>
        <div className="text-sm text-muted-foreground">{feature.geometry.type}</div>
      </div>

      <div className="flex-1">
        <h3 className="text-sm font-semibold mb-2">Properties</h3>
        {propertyEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground mb-4">No properties yet</p>
        ) : (
          <div className="space-y-3 mb-4">
            {propertyEntries.map(([key, value]) => (
              <div key={key} className="flex gap-2 items-start">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">{key}</Label>
                  <Input
                    value={value}
                    onChange={(e) => handleUpdateProperty(key, e.target.value)}
                    className="h-8"
                    data-testid={`input-property-${key}`}
                  />
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDeleteProperty(key)}
                  className="mt-6 w-8 h-8"
                  data-testid={`button-delete-property-${key}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-2">Add Property</h4>
          <div className="space-y-2">
            <Input
              placeholder="Property name"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="h-8"
              data-testid="input-new-property-key"
            />
            <Input
              placeholder="Property value"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="h-8"
              data-testid="input-new-property-value"
            />
            <Button
              onClick={handleAddProperty}
              disabled={!newKey.trim()}
              className="w-full"
              size="sm"
              data-testid="button-add-property"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
