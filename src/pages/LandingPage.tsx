import React from "react";
import { Dices, Copy, Check, BookCopyIcon } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { useTheme } from "@/components/theme-provider";
import { HexColorPicker } from "react-colorful";
import { GodLights } from "godlights";
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
} from "godlights";
import { RAYS_PRESETS, type RaysPreset } from "@/lib/presets";
import { Button } from "@/components/ui/button";
import { ArrowRight, Pipette } from "lucide-react";

const HERO_ANIM: AnimParams = {
  speed: 3,
  angleAmp: 100,
  lengthAmp: 100,
  widthAmp: 100,
  haloAmp: 100,
};

function presetToScene(
  preset: RaysPreset,
  color: string,
  bgColor: string,
  dark: boolean
): SceneConfig {
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
        colorStart: color,
        colorEnd: color,
        // screen/lighter are additive — invisible on white; swap to multiply in light mode
        blendMode: dark ? l.blendMode : "multiply",
      } as RayLayer;
    } else {
      return {
        ...DEFAULT_HALO_LAYER,
        ...l,
        id: `halo-${i}`,
        name: `Halo ${i + 1}`,
        color,
        blendMode: dark ? l.blendMode : "multiply",
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
  const { theme } = useTheme();
  const dark = theme !== "light";
  const defaultColor = dark ? "#ffffff" : "#000000";
  const [color, setColor] = React.useState(defaultColor);
  const [userPickedColor, setUserPickedColor] = React.useState(false);

  // Reset to theme default only if user hasn't manually picked a color
  React.useEffect(() => {
    if (!userPickedColor) setColor(dark ? "#ffffff" : "#000000");
  }, [dark, userPickedColor]);

  const handleColorChange = (c: string) => {
    setColor(c);
    setUserPickedColor(true);
  };

  const rayColor = color;
  const bgColor = dark ? "#000000" : "#ffffff";
  const activePreset = RAYS_PRESETS[activeIndex];
  const scene = presetToScene(activePreset, rayColor, bgColor, dark);

  const [copied, setCopied] = React.useState(false);
  const handleCopyInstall = async () => {
    await navigator.clipboard.writeText("npm install godlights");
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

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
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      />

      {/* Gradient fade at bottom */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-background to-transparent" />

      {/* Content */}
      <div className="w-full relative z-10 flex h-full flex-col items-center justify-center gap-8 px-6 text-center">
        <div className="container h-full mx-auto px-4 flex flex-col items-center justify-center gap-8 relative">
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={handleCopyInstall}
              className="flex md:hidden cursor-pointer items-center gap-3 rounded-full border border-border bg-background/60 backdrop-blur px-4 py-2 text-sm font-mono text-muted-foreground hover:text-foreground transition-colors group"
            >
              <span className="truncate min-w-0">npm install godlights</span>
              {copied ? (
                <Check className="size-3.5 shrink-0 text-emerald-500" />
              ) : (
                <Copy className="size-3.5 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
              )}
            </button>

            <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-foreground sm:text-6xl md:text-8xl text-balance">
              Create stunning light rays
            </h1>

            <p className="max-w-xl text-base text-muted-foreground sm:text-lg text-balance">
              Generate animated, fully customizable god ray effects. Export as
              image or as a ready-to-use React component.
            </p>
          </div>

          <div className="flex gap-2 items-center justify-center flex-wrap">
            <Button className="rounded-full" variant={"outline"} asChild>
              <a href="/editor">
                <BookCopyIcon className="4.5" />
                Docs
              </a>
            </Button>

            <Button className="rounded-full" asChild>
              <a href="/editor">
                Get started
                <ArrowRight className="4.5" />
              </a>
            </Button>
          </div>

          {/* npm install pill */}

          <div className="w-full absolute bottom-4 left-0 flex flex-wrap justify-center md:justify-between h-16 items-center gap-2 z-100">
            <button
              onClick={handleCopyInstall}
              className="hidden md:flex cursor-pointer items-center gap-3 rounded-full border border-border bg-background/60 backdrop-blur px-4 py-2 text-sm font-mono text-muted-foreground hover:text-foreground transition-colors group"
            >
              <span className="truncate min-w-0">npm install godlights</span>
              {copied ? (
                <Check className="size-3.5 shrink-0 text-green-500" />
              ) : (
                <Copy className="size-3.5 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
              )}
            </button>

            <div className="flex gap-2 justify-center items-center">
              {/* Color picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    title="Color"
                    className="size-9 rounded-full border cursor-pointer flex items-center justify-center"
                    style={{ background: color }}
                  >
                    <Pipette
                      className="size-4"
                      style={{
                        color: hexLuminance(color) > 0.4 ? "#000" : "#fff",
                      }}
                    />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-3"
                  align="center"
                  side="top"
                >
                  <HexColorPicker color={color} onChange={handleColorChange} />
                </PopoverContent>
              </Popover>

              {/* Preset cycle */}
              <Button
                variant={"outline"}
                onClick={handleNext}
                size={"sm"}
                className="rounded-full"
              >
                <Dices className="size-4.5" />
                <span className="truncate min-w-0">Randomize</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
