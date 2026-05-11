import React from "react";
import { Dices } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { HexColorPicker } from "react-colorful";
import { GodLights } from "@/components/GodLights";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  type SceneConfig,
  type AnimParams,
  DEFAULT_RAY_LAYER,
  DEFAULT_HALO_LAYER,
  type RayLayer,
  type HaloLayer,
  type BackgroundLayer,
} from "@/lib/godrays";
import { RAYS_PRESETS, type RaysPreset } from "@/lib/presets";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowRight, Pipette } from "lucide-react";

const HERO_ANIM: AnimParams = {
  speed: 3,
  angleAmp: 100,
  lengthAmp: 100,
  widthAmp: 100,
  haloAmp: 100,
};

function presetToScene(preset: RaysPreset, color: string): SceneConfig {
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
        colorStart: color,
        colorEnd: color,
      } as RayLayer;
    } else {
      return {
        ...DEFAULT_HALO_LAYER,
        ...l,
        id: `halo-${i}`,
        name: `Halo ${i + 1}`,
        color,
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

function hexLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export default function LandingPage() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [color, setColor] = React.useState("#ffffff");

  const activePreset = RAYS_PRESETS[activeIndex];
  const scene = presetToScene(activePreset, color);

  const handleNext = () => {
    setActiveIndex((i) => (i + 1) % RAYS_PRESETS.length);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      {/* ── Navbar ── */}
      <SiteNav activePath="/" className="absolute inset-x-0 top-0" />

      {/* Animated background */}
      <GodLights
        key={activeIndex}
        scene={scene}
        animate
        animParams={HERO_ANIM}
        className="absolute inset-0 h-full w-full"
      />

      {/* Gradient fade at bottom */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-background to-transparent" />

      {/* Content */}
      <div className="w-full relative z-10 flex h-full flex-col items-center justify-center gap-8 px-6 text-center">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center gap-8">
          <div className="flex flex-col items-center gap-4">
            {/* Controls */}

            <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-foreground sm:text-6xl md:text-8xl text-balance">
              Create stunning light rays
            </h1>

            <p className="max-w-xl text-base text-muted-foreground sm:text-lg text-balance">
              Generate animated, fully customizable god ray effects. Export as
              image or as a ready-to-use React component.
            </p>
          </div>

          <div className="flex gap-2 items-center justify-center flex-wrap">
            {/* Color picker */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  title="Color"
                  className="size-8 rounded-full border cursor-pointer flex items-center justify-center"
                  style={{ background: color }}
                >
                  <Pipette className="size-4" style={{ color: hexLuminance(color) > 0.4 ? "#000" : "#fff" }} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3" align="center" side="top">
                <HexColorPicker color={color} onChange={setColor} />
              </PopoverContent>
            </Popover>

            {/* Preset cycle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={"outline"}
                  size={"icon-xs"}
                  onClick={handleNext}
                  className="rounded-full"
                >
                  <Dices className="size-4.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">{activePreset.label}</TooltipContent>
            </Tooltip>

            <Button className="rounded-full" asChild>
              <a href="/editor">
                Get started
                <ArrowRight className="4.5" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
