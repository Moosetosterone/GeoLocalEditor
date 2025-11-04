import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { useEffect, useState } from "react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
}

export function CodeEditor({ value, onChange, error }: CodeEditorProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (val: string) => {
    setLocalValue(val);
    onChange(val);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <CodeMirror
          value={localValue}
          height="100%"
          extensions={[json()]}
          onChange={handleChange}
          theme="light"
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            highlightActiveLineGutter: true,
            highlightActiveLine: true,
          }}
          className="h-full text-sm font-mono"
          data-testid="code-editor"
        />
      </div>
      {error && (
        <div className="border-t border-destructive bg-destructive/10 text-destructive px-4 py-2 text-sm" data-testid="text-editor-error">
          {error}
        </div>
      )}
    </div>
  );
}
