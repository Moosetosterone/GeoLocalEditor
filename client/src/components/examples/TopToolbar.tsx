import { TopToolbar } from "../TopToolbar";

export default function TopToolbarExample() {
  return (
    <TopToolbar 
      onNew={() => console.log("New clicked")}
      onImport={(file) => console.log("Import file:", file.name)}
      onExport={(format) => console.log("Export as:", format)}
      onClear={() => console.log("Clear clicked")}
    />
  );
}
