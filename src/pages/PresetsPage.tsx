import React from "react";
import { Search, ArrowUpRight, X } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { GodLights } from "godlights";
import { RAYS_PRESETS, type RaysPreset, type PresetTag } from "@/lib/presets";
import {
  DEFAULT_RAY_LAYER,
  DEFAULT_HALO_LAYER,
  type SceneConfig,
  type RayLayer,
  type HaloLayer,
  type BackgroundLayer,
} from "godlights";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TAG_LABELS: Record<PresetTag, string> = {
  top: "Top",
  corner: "Corner",
  side: "Side",
  beam: "Beam",
  soft: "Soft",
  wide: "Wide",
  dramatic: "Dramatic",
};

const ALL_TAGS: PresetTag[] = [
  "top",
  "corner",
  "side",
  "beam",
  "soft",
  "wide",
  "dramatic",
];

function presetToScene(preset: RaysPreset, bgColor = "#000000"): SceneConfig {
  const bgLayer: BackgroundLayer = {
    id: "background",
    type: "background",
    bgType: "solid",
    bgColor,
    bgColor2: bgColor,
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
      className="group relative overflow-hidden rounded-2xl border border-border bg-card/90 backdrop-blur-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="aspect-video w-full overflow-hidden">
        <GodLights scene={scene} className="h-full w-full object-cover" />
      </div>

      <div className="flex items-center justify-between gap-2 border-t bg-card/90 backdrop-blur-md px-3 py-2.5">
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
    <div className="min-h-screen bg-background relative">
      <SiteNav
        activePath="/presets"
        className="sticky top-0 border-b border-border bg-background/80 backdrop-blur-sm z-100"
      />

      <main className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Presets
          </h1>
          <p className="text-muted-foreground">
            {RAYS_PRESETS.length} light effect presets — click any to open in
            the editor.
          </p>
        </div>

        {/* Search + filters */}
        <div className="mb-8 flex flex-col gap-4">
          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none z-10" />
            <Input
              type="text"
              placeholder="Search presets…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-full pl-9 pr-9"
            />
            {search && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearch("")}
                className="absolute right-1 top-1/2 -translate-y-1/2 size-7"
              >
                <X className="size-3.5" />
              </Button>
            )}
          </div>

          {/* Tag filter pills */}
          <div className="flex flex-wrap gap-2 items-center">
            <Button
              variant={activeTag === null ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTag(null)}
              className="rounded-full h-7 px-3 text-xs"
            >
              All
            </Button>
            {ALL_TAGS.map((tag) => {
              const count = RAYS_PRESETS.filter((p) =>
                p.tags.includes(tag)
              ).length;
              return (
                <Button
                  key={tag}
                  variant={activeTag === tag ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className="rounded-full h-7 px-3 text-xs gap-1.5"
                >
                  {TAG_LABELS[tag]}
                  <span className="opacity-50">{count}</span>
                </Button>
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
            <Button
              variant="link"
              size="sm"
              onClick={clearFilters}
              className="text-xs text-muted-foreground h-auto p-0 underline-offset-2"
            >
              Clear filters
            </Button>
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
            <p className="text-muted-foreground text-sm">
              No presets match your search.
            </p>
            <Button
              variant="link"
              size="sm"
              onClick={clearFilters}
              className="text-xs text-muted-foreground h-auto p-0 underline-offset-2"
            >
              Clear filters
            </Button>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
