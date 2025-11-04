import { useState } from "react";
import { CodeEditor } from "../CodeEditor";

export default function CodeEditorExample() {
  const [value, setValue] = useState(`{
  "type": "FeatureCollection",
  "features": []
}`);

  return (
    <CodeEditor 
      value={value}
      onChange={(val) => setValue(val)}
    />
  );
}
