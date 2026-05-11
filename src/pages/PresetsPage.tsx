import React from "react";
import { Search, ArrowUpRight, X } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { GodLights } from "godlights";
import { RAYS_PRESETS, type RaysPreset, type PresetTag } from "@/lib/presets";
import {
  DEFAULT_RAY_LAYER,
  DEFAULT_HALO_LAYER,
  type SceneConfig,
  type RayLayer,
  type HaloLayer,
  type BackgroundLayer,
  type AnimParams,
} from "godlights";
import { cn } from "@/lib/utils";

const CARD_ANIM: AnimParams = {
  speed: 2,
  angleAmp: 60,
  lengthAmp: 60,
  widthAmp: 60,
  haloAmp: 60,
};

const TAG_LABELS: Record<PresetTag, string> = {
  top: "Top",
  corner: "Corner",
  side: "Side",
  beam: "Beam",
  soft: "Soft",
  wide: "Wide",
  dramatic: "Dramatic",
};

const ALL_TAGS: PresetTag[] = ["top", "corner", "side", "beam", "soft", "wide", "dramatic"];

function presetToScene(preset: RaysPreset): SceneConfig {
  const bgLayer: BackgroundLayer = {
    id: "background",
    type: "background",
    bgType: "solid",
    bgColor: "#000000",
    bgColor2: "#000000",
    bgGradientAngle: 180,
  };

  const layers = preset.layers.map((l, i) => {
    if (l.type === "rays") {
      return {
        ...DEFAULT_RAY_LAYER,
        ...l,
        id: `rays-${i}`,
        name: `Rays ${i + 1}`,
        colorStart: "#ffffff",
        colorEnd: "#ffffff",
      } as RayLayer;
    } else {
      return {
        ...DEFAULT_HALO_LAYER,
        ...l,
        id: `halo-${i}`,
        name: `Halo ${i + 1}`,
        color: "#ffffff",
      } as HaloLayer;
    }
  });

  return {
    width: 1920,
    height: 1080,
    noise: 8,
    grainSize: 1,
    layers: [bgLayer, ...layers],
  };
}

function PresetCard({ preset }: { preset: RaysPreset }) {
  const scene = presetToScene(preset);

  return (
    <a
      href={`/editor?preset=${preset.key}`}
      className="group relative overflow-hidden rounded-2xl border border-border bg-black transition-all hover:border-white/30 hover:shadow-xl hover:shadow-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="aspect-video w-full overflow-hidden">
        <GodLights
          scene={scene}
          animate
          animParams={CARD_ANIM}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-border/60 bg-background/80 px-3 py-2.5 backdrop-blur-sm">
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-sm font-medium text-foreground truncate">
            {preset.label}
          </span>
          <div className="flex gap-1 flex-wrap">
            {preset.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium"
              >
                {TAG_LABELS[tag]}
              </span>
            ))}
          </div>
        </div>
        <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </a>
  );
}

export default function PresetsPage() {
  const [search, setSearch] = React.useState("");
  const [activeTag, setActiveTag] = React.useState<PresetTag | null>(null);

  const filtered = RAYS_PRESETS.filter((p) => {
    const matchesSearch = p.label.toLowerCase().includes(search.toLowerCase());
    const matchesTag = activeTag ? p.tags.includes(activeTag) : true;
    return matchesSearch && matchesTag;
  });

  const hasFilters = search !== "" || activeTag !== null;

  const clearFilters = () => {
    setSearch("");
    setActiveTag(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav
        activePath="/presets"
        className="sticky top-0 border-b border-border bg-background/80 backdrop-blur-sm"
      />

      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Presets
          </h1>
          <p className="text-muted-foreground">
            {RAYS_PRESETS.length} light effect presets — click any to open in the editor.
          </p>
        </div>

        {/* Search + filters */}
        <div className="mb-8 flex flex-col gap-4">
          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search presets…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-border bg-muted/40 pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Tag filter pills */}
          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={() => setActiveTag(null)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium border transition-colors",
                activeTag === null
                  ? "bg-foreground text-background border-foreground"
                  : "bg-transparent text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground"
              )}
            >
              All
            </button>
            {ALL_TAGS.map((tag) => {
              const count = RAYS_PRESETS.filter((p) => p.tags.includes(tag)).length;
              return (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium border transition-colors flex items-center gap-1.5",
                    activeTag === tag
                      ? "bg-foreground text-background border-foreground"
                      : "bg-transparent text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground"
                  )}
                >
                  {TAG_LABELS[tag]}
                  <span className="opacity-50">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results count + clear */}
        {hasFilters && (
          <div className="mb-5 flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "result" : "results"}
            </span>
            <button
              onClick={clearFilters}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((preset) => (
              <PresetCard key={preset.key} preset={preset} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <p className="text-muted-foreground text-sm">No presets match your search.</p>
            <button
              onClick={clearFilters}
              className="text-xs underline underline-offset-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
