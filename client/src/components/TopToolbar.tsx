import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileJson, Download, Upload, FileText, Trash2 } from "lucide-react";
import { useRef } from "react";

interface TopToolbarProps {
  onNew?: () => void;
  onImport?: (file: File) => void;
  onExport?: (format: "geojson" | "csv") => void;
  onClear?: () => void;
}

export function TopToolbar({ onNew, onImport, onExport, onClear }: TopToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport?.(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex items-center justify-between h-12 px-4 border-b border-border bg-background">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <FileJson className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-semibold">GeoJSON Editor</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onNew}
          data-testid="button-new"
        >
          <FileText className="w-4 h-4 mr-2" />
          New
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" data-testid="button-open">
              <Upload className="w-4 h-4 mr-2" />
              Open
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => fileInputRef.current?.click()} data-testid="menu-item-import-geojson">
              Import GeoJSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => fileInputRef.current?.click()} data-testid="menu-item-import-csv">
              Import CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" data-testid="button-save">
              <Download className="w-4 h-4 mr-2" />
              Save
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onExport?.("geojson")} data-testid="menu-item-export-geojson">
              Export as GeoJSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport?.("csv")} data-testid="menu-item-export-csv">
              Export as CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-6 bg-border" />

        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          data-testid="button-clear"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.geojson,.csv"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}
