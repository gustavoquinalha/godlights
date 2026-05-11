import { ArrowUpRight } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { GodLights } from "godlights";
import { RAYS_PRESETS, type RaysPreset } from "@/lib/presets";
import {
  DEFAULT_RAY_LAYER,
  DEFAULT_HALO_LAYER,
  type SceneConfig,
  type RayLayer,
  type HaloLayer,
  type BackgroundLayer,
  type AnimParams,
} from "godlights";

const CARD_ANIM: AnimParams = {
  speed: 2,
  angleAmp: 60,
  lengthAmp: 60,
  widthAmp: 60,
  haloAmp: 60,
};

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
      {/* Canvas */}
      <div className="aspect-video w-full overflow-hidden">
        <GodLights
          scene={scene}
          animate
          animParams={CARD_ANIM}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 border-t border-border/60 bg-background/80 px-3 py-2.5 backdrop-blur-sm">
        <span className="text-sm font-medium text-foreground">
          {preset.label}
        </span>
        <ArrowUpRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </a>
  );
}

export default function PresetsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Navbar ── */}
      <SiteNav
        activePath="/presets"
        className="sticky top-0 border-b border-border bg-background/80 backdrop-blur-sm"
      />

      {/* ── Content ── */}
      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Presets
          </h1>
          <p className="text-muted-foreground">
            {RAYS_PRESETS.length} light effect presets — click any to open in the editor.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {RAYS_PRESETS.map((preset) => (
            <PresetCard key={preset.key} preset={preset} />
          ))}
        </div>
      </main>
    </div>
  );
}
