import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface HexInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function HexInput({ value, onChange, className }: HexInputProps) {
  const [draft, setDraft] = React.useState(value);

  // Keep draft in sync when value changes externally (e.g. from the colour wheel)
  React.useEffect(() => {
    setDraft(value);
  }, [value]);

  const commit = (raw: string) => {
    const clean = raw.startsWith("#") ? raw : `#${raw}`;
    if (/^#[0-9a-fA-F]{6}$/.test(clean)) {
      onChange(clean.toUpperCase());
    } else {
      setDraft(value);
    }
  };

  return (
    <Input
      spellCheck={false}
      value={draft}
      onChange={(e) => {
        const raw = e.target.value;
        setDraft(raw);
        const clean = raw.startsWith("#") ? raw : `#${raw}`;
        if (/^#[0-9a-fA-F]{6}$/.test(clean)) {
          onChange(clean.toUpperCase());
        }
      }}
      onBlur={(e) => commit(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      className={cn("uppercase", className)}
    />
  );
}
