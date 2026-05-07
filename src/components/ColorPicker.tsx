import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-9 w-full items-center gap-2 rounded-md border border-input bg-background px-2 text-sm shadow-sm transition-colors hover:bg-accent",
            className
          )}
        >
          <span
            className="h-5 w-5 shrink-0 rounded border border-border"
            style={{ background: value }}
          />
          <span className="font-mono uppercase tracking-wider">{value}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[232px] p-3" align="start">
        <HexColorPicker color={value} onChange={onChange} />
        <Input
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            if (/^#?[0-9a-fA-F]{0,6}$/.test(v)) {
              onChange(v.startsWith("#") ? v : `#${v}`);
            }
          }}
          className="mt-3 font-mono uppercase"
          spellCheck={false}
        />
      </PopoverContent>
    </Popover>
  );
}
