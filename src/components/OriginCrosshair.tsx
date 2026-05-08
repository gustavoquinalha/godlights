import { cn } from "@/lib/utils";

const COLORS = {
  blue: {
    line: "bg-blue-400",
    border: "border-blue-400",
    dot: "bg-blue-950/80",
  },
  amber: {
    line: "bg-amber-400",
    border: "border-amber-400",
    dot: "bg-amber-950/80",
  },
} as const;

interface OriginCrosshairProps {
  color: keyof typeof COLORS;
  className?: string;
  style?: React.CSSProperties;
}

export function OriginCrosshair({ color, className, style }: OriginCrosshairProps) {
  const c = COLORS[color];
  return (
    <div
      className={cn("pointer-events-none absolute -translate-x-1/2 -translate-y-1/2", className)}
      style={style}
    >
      <div className="relative h-6 w-6">
        <div className={cn("absolute left-1/2 top-0 h-full w-px -translate-x-1/2", c.line)} />
        <div className={cn("absolute left-0 top-1/2 h-px w-full -translate-y-1/2", c.line)} />
        <div
          className={cn(
            "absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2",
            c.border,
            c.dot
          )}
        />
      </div>
    </div>
  );
}
