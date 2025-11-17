import { useState, useEffect, useCallback } from "react";
import type { GeoJSONFeature } from "@shared/schema";
import { MapCanvas } from "@/components/MapCanvas";
import { CodeEditor } from "@/components/CodeEditor";
import { DrawingToolbar } from "@/components/DrawingToolbar";
import { FeatureTable } from "@/components/FeatureTable";
import { PropertyEditor } from "@/components/PropertyEditor";
import { TopToolbar } from "@/components/TopToolbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { formatGeoJSON, csvToGeoJSON, geoJSONToCSV } from "@/lib/geojson-utils";
import { useToast } from "@/hooks/use-toast";
import { useGeoData } from "@/hooks/useGeoData";
import { Z_INDEX } from "@/lib/constants";

export default function Editor() {
  const {
    geoData,
    codeValue,
    codeError,
    selectedFeature,
    setCodeValue,
    setSelectedFeature,
    addFeature,
    removeFeature,
    updateFeatureProperties,
    replaceData,
    reset
  } = useGeoData();

  const [drawMode, setDrawMode] = useState<"none" | "point" | "line" | "polygon">("none");
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const { toast } = useToast();

  // ⭐ NEW: Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Escape: Cancel drawing / Deselect
      if (e.key === 'Escape') {
        setDrawMode('none');
        setSelectedFeature(null);
        toast({
          title: "Cancelled",
          description: "Drawing cancelled and selection cleared.",
        });
      }

      // Delete/Backspace: Delete selected feature
      if ((e.key === 'Delete' || (e.key === 'Backspace' && !e.metaKey && !e.ctrlKey)) && selectedFeature) {
        e.preventDefault();
        handleFeatureDelete(selectedFeature);
      }

      // Number keys: Switch tools (1=Pan, 2=Point, 3=Line, 4=Polygon)
      if (!e.metaKey && !e.ctrlKey && !e.shiftKey) {
        if (e.key === '1') {
          setDrawMode('none');
          toast({ title: "Pan tool selected" });
        } else if (e.key === '2') {
          setDrawMode('point');
          toast({ title: "Point tool selected" });
        } else if (e.key === '3') {
          setDrawMode('line');
          toast({ title: "Line tool selected" });
        } else if (e.key === '4') {
          setDrawMode('polygon');
          toast({ title: "Polygon tool selected" });
        }
      }

      // Plus/Equals: Zoom in
      if (e.key === '+' || e.key === '=') {
        // MapCanvas will handle this via prop
      }

      // Minus: Zoom out
      if (e.key === '-' || e.key === '_') {
        // MapCanvas will handle this via prop
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFeature, drawMode]); // Dependencies for the handlers

  // ⭐ NEW: Drag and drop file handler
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];

    if (!file) return;

    try {
      const text = await file.text();

      if (file.name.endsWith('.csv')) {
        const data = csvToGeoJSON(text);
        replaceData(data);
        toast({
          title: "CSV imported",
          description: `Imported ${data.features.length} features from ${file.name}`,
        });
      } else if (file.name.endsWith('.json') || file.name.endsWith('.geojson')) {
        const { validateGeoJSON } = await import("@/lib/geojson-utils");
        const result = validateGeoJSON(text);
        if (result.valid && result.data) {
          replaceData(result.data);
          toast({
            title: "GeoJSON imported",
            description: `Imported ${result.data.features.length} features from ${file.name}`,
          });
        } else {
          toast({
            variant: "destructive",
            title: "Import failed",
            description: result.error || "Invalid file format",
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Unsupported format",
          description: "Please drop a .geojson, .json, or .csv file",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to read file",
      });
    }
  }, [replaceData, toast]);

  const handleFeatureAdd = (feature: GeoJSONFeature) => {
    addFeature(feature);
    setDrawMode("none");
    toast({
      title: "Feature added",
      description: `${feature.geometry.type} feature has been added to the map.`,
    });
  };

  const handleFeatureDelete = (feature: GeoJSONFeature) => {
    removeFeature(feature);
    setSelectedFeature(null);
    toast({
      title: "Feature deleted",
      description: "The feature has been removed from the map.",
    });
  };

  const handlePropertyChange = (properties: Record<string, any>) => {
    if (!selectedFeature) return;
    updateFeatureProperties(selectedFeature.id!, properties);
  };

  const handleNew = () => {
    reset();
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
      replaceData(data);
      toast({
        title: "CSV imported",
        description: `Imported ${data.features.length} features from CSV.`,
      });
    } else {
      const { validateGeoJSON } = await import("@/lib/geojson-utils");
      const result = validateGeoJSON(text);
      if (result.valid && result.data) {
        replaceData(result.data);
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
    <div 
      className="flex flex-col h-screen bg-background"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <TopToolbar
        onNew={handleNew}
        onImport={handleImport}
        onExport={handleExport}
        onClear={handleClear}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Map Container */}
        <div className={`relative transition-all duration-300 ${isPanelCollapsed ? 'w-full' : 'w-1/2'}`}>
          <div className="absolute top-4 left-4 z-[1000]">
            <DrawingToolbar activeTool={drawMode} onToolChange={setDrawMode} />
          </div>
          <MapCanvas
            data={geoData}
            onFeatureAdd={handleFeatureAdd}
            onFeatureSelect={setSelectedFeature}
            selectedFeature={selectedFeature}
            drawMode={drawMode}
            isExpanded={isPanelCollapsed}
          />
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
          className="absolute top-1/2 -translate-y-1/2 w-6 h-20 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white shadow-xl rounded-l-lg transition-all duration-300 cursor-pointer border-2 border-blue-700"
          style={{ 
            zIndex: Z_INDEX.TOGGLE_BUTTON,
            right: isPanelCollapsed ? '0px' : 'calc(50% - 3px)',
          }}
          data-testid="button-toggle-panel"
          aria-label={isPanelCollapsed ? "Expand panel" : "Collapse panel"}
        >
          {isPanelCollapsed ? (
            <ChevronLeft className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </button>

        {/* Right Panel */}
        <div 
          className={`flex flex-col bg-background transition-all duration-300 ${
            isPanelCollapsed ? 'w-0 opacity-0' : 'w-1/2 opacity-100'
          }`}
          style={{
            overflow: isPanelCollapsed ? 'hidden' : 'visible'
          }}
        >
          {!isPanelCollapsed && (
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
                  onChange={setCodeValue}
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
          )}
        </div>
      </div>

      {/* ⭐ NEW: Keyboard shortcuts hint */}
      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded pointer-events-none" style={{ zIndex: Z_INDEX.DRAWING_HINT }}>
        <div className="flex gap-3">
          <span><kbd className="bg-white/20 px-1 rounded">Esc</kbd> Cancel</span>
          <span><kbd className="bg-white/20 px-1 rounded">Del</kbd> Delete</span>
          <span><kbd className="bg-white/20 px-1 rounded">1-4</kbd> Tools</span>
        </div>
      </div>
    </div>
  );
}