import { ColorPicker } from "@/components/ColorPicker";
import { HexInput } from "@/components/HexInput";
import { cn } from "@/lib/utils";

interface ColorFieldProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ColorField({ value, onChange, className }: ColorFieldProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <ColorPicker value={value} onChange={onChange} />
      <HexInput value={value} onChange={onChange} />
    </div>
  );
}
