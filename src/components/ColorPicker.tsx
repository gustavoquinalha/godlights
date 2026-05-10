import { HexColorPicker } from "react-colorful";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size={"icon-sm"}
          type="button"
          className={cn(
            "transition-transform p-0 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer ring-1 ring-border",
            className
          )}
          style={{ background: value }}
          title={value}
        />
      </PopoverTrigger>
      <PopoverContent className="w-58 p-3" align="start">
        <HexColorPicker
          color={value}
          onChange={onChange}
          style={{ width: "100%" }}
        />
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
