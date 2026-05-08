import { Field } from "@/components/ControlSection";
import { Input } from "@/components/ui/input";

interface OriginInputsProps {
  x: number;
  y: number;
  onXChange: (v: number) => void;
  onYChange: (v: number) => void;
}

export function OriginInputs({ x, y, onXChange, onYChange }: OriginInputsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label="Origem X" unit="%">
        <Input
          type="number"
          value={x.toFixed(0)}
          onChange={(e) => onXChange(Number(e.target.value))}
        />
      </Field>
      <Field label="Origem Y" unit="%">
        <Input
          type="number"
          value={y.toFixed(0)}
          onChange={(e) => onYChange(Number(e.target.value))}
        />
      </Field>
    </div>
  );
}
