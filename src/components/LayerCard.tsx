import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const layerCardVariants = cva(
  "group flex w-full items-center gap-3 rounded-xl border border-border/60 bg-card p-3 text-left shadow-sm transition-all hover:shadow-md",
  {
    variants: {
      accent: {
        blue: "hover:border-blue-400/40",
        amber: "hover:border-amber-400/40",
        default: "",
      },
    },
    defaultVariants: { accent: "default" },
  }
);

const iconVariants = cva(
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
  {
    variants: {
      accent: {
        blue: "bg-blue-500/10 text-blue-400",
        amber: "bg-amber-500/10 text-amber-400",
        default: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { accent: "default" },
  }
);

interface LayerCardProps extends VariantProps<typeof layerCardVariants> {
  icon: React.ReactNode;
  label: string;
  description: React.ReactNode;
  preview: React.ReactNode;
  onClick: () => void;
}

export function LayerCard({ icon, label, description, preview, accent, onClick }: LayerCardProps) {
  return (
    <button onClick={onClick} className={cn(layerCardVariants({ accent }))}>
      <div className={cn(iconVariants({ accent }))}>{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <div className="flex items-center gap-2">
        {preview}
        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
    </button>
  );
}
