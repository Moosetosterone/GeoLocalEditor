import { useState, useEffect } from "react";
import type { GeoJSONFeature, GeoJSONFeatureCollection } from "@shared/schema";
import { MapCanvas } from "@/components/MapCanvas";
import { CodeEditor } from "@/components/CodeEditor";
import { DrawingToolbar } from "@/components/DrawingToolbar";
import { FeatureTable } from "@/components/FeatureTable";
import { PropertyEditor } from "@/components/PropertyEditor";
import { TopToolbar } from "@/components/TopToolbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createEmptyFeatureCollection, validateGeoJSON, formatGeoJSON, csvToGeoJSON, geoJSONToCSV } from "@/lib/geojson-utils";
import { useToast } from "@/hooks/use-toast";

export default function Editor() {
  const [geoData, setGeoData] = useState<GeoJSONFeatureCollection>(createEmptyFeatureCollection);
  const [codeValue, setCodeValue] = useState(formatGeoJSON(geoData));
  const [codeError, setCodeError] = useState<string | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<GeoJSONFeature | null>(null);
  const [drawMode, setDrawMode] = useState<"none" | "point" | "line" | "polygon">("none");
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem("geojson-data");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setGeoData(parsed);
        setCodeValue(formatGeoJSON(parsed));
      } catch (e) {
        console.error("Failed to load stored data", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("geojson-data", JSON.stringify(geoData));
  }, [geoData]);

  const handleCodeChange = (value: string) => {
    setCodeValue(value);
    const result = validateGeoJSON(value);
    
    if (result.valid && result.data) {
      setCodeError(null);
      setGeoData(result.data);
    } else {
      setCodeError(result.error || "Invalid GeoJSON");
    }
  };

  const handleFeatureAdd = (feature: GeoJSONFeature) => {
    const newData = {
      ...geoData,
      features: [...geoData.features, feature]
    };
    setGeoData(newData);
    setCodeValue(formatGeoJSON(newData));
    setDrawMode("none");
    toast({
      title: "Feature added",
      description: `${feature.geometry.type} feature has been added to the map.`,
    });
  };

  const handleFeatureDelete = (feature: GeoJSONFeature) => {
    const newData = {
      ...geoData,
      features: geoData.features.filter(f => f.id !== feature.id)
    };
    setGeoData(newData);
    setCodeValue(formatGeoJSON(newData));
    if (selectedFeature?.id === feature.id) {
      setSelectedFeature(null);
    }
    toast({
      title: "Feature deleted",
      description: "The feature has been removed from the map.",
    });
  };

  const handlePropertyChange = (properties: Record<string, any>) => {
    if (!selectedFeature) return;
    
    const newData = {
      ...geoData,
      features: geoData.features.map(f => 
        f.id === selectedFeature.id ? { ...f, properties } : f
      )
    };
    setGeoData(newData);
    setCodeValue(formatGeoJSON(newData));
    setSelectedFeature({ ...selectedFeature, properties });
  };

  const handleNew = () => {
    const empty = createEmptyFeatureCollection();
    setGeoData(empty);
    setCodeValue(formatGeoJSON(empty));
    setSelectedFeature(null);
    setDrawMode("none");
    toast({
      title: "New document",
      description: "Started with a fresh GeoJSON document.",
    });
  };

  const handleImport = async (file: File) => {
    const text = await file.text();
    
    if (file.name.endsWith('.csv')) {
      const data = csvToGeoJSON(text);
      setGeoData(data);
      setCodeValue(formatGeoJSON(data));
      toast({
        title: "CSV imported",
        description: `Imported ${data.features.length} features from CSV.`,
      });
    } else {
      const result = validateGeoJSON(text);
      if (result.valid && result.data) {
        setGeoData(result.data);
        setCodeValue(formatGeoJSON(result.data));
        toast({
          title: "GeoJSON imported",
          description: `Imported ${result.data.features.length} features.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Import failed",
          description: result.error || "Invalid file format",
        });
      }
    }
  };

  const handleExport = (format: "geojson" | "csv") => {
    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === "geojson") {
      content = formatGeoJSON(geoData);
      filename = "data.geojson";
      mimeType = "application/geo+json";
    } else {
      content = geoJSONToCSV(geoData);
      filename = "data.csv";
      mimeType = "text/csv";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: `Data exported as ${format.toUpperCase()}.`,
    });
  };

  const handleClear = () => {
    handleNew();
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopToolbar
        onNew={handleNew}
        onImport={handleImport}
        onExport={handleExport}
        onClear={handleClear}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative border-r border-border">
          <div className="absolute top-4 left-4 z-[1000]">
            <DrawingToolbar activeTool={drawMode} onToolChange={setDrawMode} />
          </div>
          <MapCanvas
            data={geoData}
            onFeatureAdd={handleFeatureAdd}
            onFeatureSelect={setSelectedFeature}
            selectedFeature={selectedFeature}
            drawMode={drawMode}
          />
        </div>

        <div className="flex-1 flex flex-col">
          <Tabs defaultValue="code" className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b h-10 bg-background">
              <TabsTrigger value="code" className="data-[state=active]:bg-accent" data-testid="tab-code">
                JSON
              </TabsTrigger>
              <TabsTrigger value="table" className="data-[state=active]:bg-accent" data-testid="tab-table">
                Table
              </TabsTrigger>
              <TabsTrigger value="properties" className="data-[state=active]:bg-accent" data-testid="tab-properties">
                Properties
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="code" className="flex-1 m-0 overflow-hidden">
              <CodeEditor
                value={codeValue}
                onChange={handleCodeChange}
                error={codeError}
              />
            </TabsContent>
            
            <TabsContent value="table" className="flex-1 m-0 overflow-hidden">
              <FeatureTable
                features={geoData.features}
                selectedFeature={selectedFeature}
                onFeatureSelect={setSelectedFeature}
                onFeatureDelete={handleFeatureDelete}
              />
            </TabsContent>
            
            <TabsContent value="properties" className="flex-1 m-0 overflow-hidden">
              <PropertyEditor
                feature={selectedFeature}
                onPropertyChange={handlePropertyChange}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
