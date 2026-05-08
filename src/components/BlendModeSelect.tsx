import { BLEND_MODES, type BlendMode } from "@/lib/godrays";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BlendModeSelectProps {
  value: BlendMode;
  onChange: (value: BlendMode) => void;
}

export function BlendModeSelect({ value, onChange }: BlendModeSelectProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as BlendMode)}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {BLEND_MODES.map((b) => (
          <SelectItem key={b.value} value={b.value}>
            {b.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
