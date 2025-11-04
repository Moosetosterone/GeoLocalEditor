import { useState } from "react";
import { DrawingToolbar } from "../DrawingToolbar";

export default function DrawingToolbarExample() {
  const [activeTool, setActiveTool] = useState<"none" | "point" | "line" | "polygon">("none");

  return (
    <div className="p-4">
      <DrawingToolbar 
        activeTool={activeTool}
        onToolChange={(tool) => {
          setActiveTool(tool);
          console.log("Tool changed to:", tool);
        }}
      />
    </div>
  );
}
