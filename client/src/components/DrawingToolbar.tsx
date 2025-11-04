import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MapPin, Minus, Pentagon, Hand } from "lucide-react";

interface DrawingToolbarProps {
  activeTool: "none" | "point" | "line" | "polygon";
  onToolChange: (tool: "none" | "point" | "line" | "polygon") => void;
}

export function DrawingToolbar({ activeTool, onToolChange }: DrawingToolbarProps) {
  const tools = [
    { id: "none" as const, icon: Hand, label: "Pan" },
    { id: "point" as const, icon: MapPin, label: "Add Point" },
    { id: "line" as const, icon: Minus, label: "Draw Line" },
    { id: "polygon" as const, icon: Pentagon, label: "Draw Polygon" },
  ];

  return (
    <div className="flex gap-1 p-2 bg-card border border-card-border rounded-md">
      {tools.map((tool) => (
        <Tooltip key={tool.id}>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant={activeTool === tool.id ? "default" : "ghost"}
              onClick={() => onToolChange(tool.id)}
              data-testid={`button-tool-${tool.id}`}
              className={activeTool === tool.id ? "toggle-elevate toggle-elevated" : ""}
            >
              <tool.icon className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{tool.label}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
