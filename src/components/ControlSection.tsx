import * as React from "react";
import { ChevronDown, InfoIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "./ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

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
          <ChevronDown
            className={cn("h-3 w-3 transition-transform", open && "rotate-180")}
          />
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
  label?: string;
  hint?: string;
  value?: number | string;
  unit?: string;
  children: React.ReactNode;
}

export function Field({ label, hint, value, unit, children }: FieldProps) {
  return (
    <div className="w-full flex flex-col gap-2">
      <div className="w-full flex items-baseline justify-between">
        <div className="flex gap-1 items-center">
          {label && (
            <Label className="text-sm font-medium text-foreground/90">
              {label}
            </Label>
          )}
          {hint && (
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="size-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{hint}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {value !== undefined && (
          <span className="font-mono text-xs text-muted-foreground">
            {value}
            {unit ?? ""}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
