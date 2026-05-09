import { Sparkles, Github, ArrowRight } from "lucide-react";
import { GodLights } from "@/components/GodLights";
import { type SceneConfig, type AnimParams } from "@/lib/godrays";

const HERO_SCENE: SceneConfig = {
  width: 1920,
  height: 1080,
  noise: 8,
  grainSize: 1,
  layers: [
    {
      id: "background",
      type: "background",
      bgType: "solid",
      bgColor: "#0d0200",
      bgColor2: "#00131f",
      bgGradientAngle: 180,
    },
    {
      id: "rays-1",
      type: "rays",
      name: "Rays",
      direction: 161,
      spread: 48,
      originX: 15.2001953125,
      originY: -32.14930555555553,
      rayCount: 13,
      rayWidth: 85,
      divergence: 2.65,
      rayLength: 0.6,
      opacity: 0.39,
      blendMode: "screen",
      colorStart: "#ffe58a",
      colorEnd: "#ffd28a",
      fadeToTransparent: true,
      blur: 33,
      randomnessWidth: 50,
      randomnessLength: 50,
      randomnessAngle: 50,
      seed: 869010,
    },
    {
      id: "rays-1778354563457",
      type: "rays",
      name: "Rays 2",
      direction: 198,
      spread: 0,
      originX: 91.21036305147057,
      originY: -35.2829861111111,
      rayCount: 7,
      rayWidth: 26,
      divergence: 2.65,
      rayLength: 0.55,
      opacity: 0.45,
      blendMode: "screen",
      colorStart: "#ffe58a",
      colorEnd: "#ffd28a",
      fadeToTransparent: true,
      blur: 33,
      randomnessWidth: 50,
      randomnessLength: 50,
      randomnessAngle: 50,
      seed: 765135,
    },
    {
      id: "halo-1",
      type: "halo",
      name: "Halo",
      originX: 30,
      originY: -20,
      intensity: 0.39,
      size: 0.43,
      color: "#ffd28a",
      blendMode: "lighter",
    },
    {
      id: "halo-1778355696832",
      type: "halo",
      name: "Halo 2",
      originX: 85.16544117647057,
      originY: -2.1359272875816977,
      intensity: 0.16,
      size: 0.19,
      color: "#ffd28a",
      blendMode: "lighter",
    },
  ],
};

const HERO_ANIM: AnimParams = {
  speed: 3,
  angleAmp: 100,
  lengthAmp: 100,
  widthAmp: 100,
  haloAmp: 100,
};

export default function LandingPage() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      {/* ── Navbar ── */}
      <header className="absolute inset-x-0 top-0 z-20 h-16">
        <div className="container mx-auto px-4 flex h-full items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="size-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Godlights
            </span>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6">
            {[
              { label: "Home", href: "/" },
              { label: "Editor", href: "/editor" },
              { label: "Presets", href: "/presets" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/gustavoquinalha/godlights"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <Github className="size-3.5" />
              GitHub
            </a>
            <button
              onClick={() => (window.location.href = "/editor")}
              className="flex items-center gap-1.5 rounded-full bg-foreground px-4 py-1.5 text-xs font-semibold text-background transition-all hover:scale-105 active:scale-100"
            >
              Open Editor
              <ArrowRight className="size-3" />
            </button>
          </div>
        </div>
      </header>

      {/* Animated background */}
      <GodLights
        scene={HERO_SCENE}
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
            <span className="rounded-full border border-border bg-muted/40 px-4 py-1.5 text-xs font-medium tracking-widest text-muted-foreground uppercase backdrop-blur-sm">
              God Lights Generator
            </span>

            <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-foreground sm:text-6xl md:text-8xl text-balance">
              Create stunning light rays
            </h1>

            <p className="max-w-xl text-base text-muted-foreground sm:text-lg text-balance">
              Generate animated, fully customizable god ray effects. Export as
              image or as a ready-to-use React component.
            </p>
          </div>

          <button
            onClick={() => (window.location.href = "/editor")}
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-foreground px-8 py-4 text-sm font-semibold text-background shadow-2xl transition-all hover:scale-105 active:scale-100"
          >
            <span className="relative z-10">Get started</span>
            <svg
              className="relative z-10 size-4 transition-transform group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
            {/* shimmer */}
            <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-foreground/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </button>
        </div>
      </div>
    </div>
  );
}
