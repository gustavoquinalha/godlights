import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ControlSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function ControlSection({
  title,
  defaultOpen = true,
  children,
}: ControlSectionProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="px-3 py-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group flex w-full items-center gap-2 py-2.5"
      >
        <div className="h-px flex-1 bg-border" />
        <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground transition-colors group-hover:text-foreground">
          {title}
          <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
        </span>
        <div className="h-px flex-1 bg-border" />
      </button>
      {open && (
        <div className="mb-3 space-y-5 rounded-xl border border-border/60 bg-card p-4 shadow-sm">
          {children}
        </div>
      )}
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
        <label className="text-sm font-medium text-foreground/90">{label}</label>
        {value !== undefined && (
          <span className="font-mono text-xs text-muted-foreground">
            {value}{unit ?? ""}
          </span>
        )}
      </div>
      {children}
      {hint && (
        <p className="text-[11px] leading-snug text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
