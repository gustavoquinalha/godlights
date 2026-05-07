import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ControlSectionProps {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function ControlSection({
  title,
  description,
  defaultOpen = true,
  children,
}: ControlSectionProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="border-b border-border/60 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-accent/40"
      >
        <div>
          <div className="text-sm font-semibold tracking-tight">{title}</div>
          {description && (
            <div className="text-xs text-muted-foreground">{description}</div>
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && <div className="space-y-4 px-4 pb-4">{children}</div>}
    </div>
  );
}

interface FieldProps {
  label: string;
  hint?: string;
  value?: number | string;
  unit?: string;
  children: React.ReactNode;
}

export function Field({ label, hint, value, unit, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <label className="text-xs font-medium text-foreground/80">
          {label}
        </label>
        {value !== undefined && (
          <span className="font-mono text-xs text-muted-foreground">
            {value}
            {unit ?? ""}
          </span>
        )}
      </div>
      {children}
      {hint && (
        <div className="text-[11px] leading-snug text-muted-foreground">
          {hint}
        </div>
      )}
    </div>
  );
}
