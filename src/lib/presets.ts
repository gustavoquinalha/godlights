import type { GodRaysConfig } from "./godrays";
import type { BlendMode } from "./godrays";

export type PresetCategory = "color" | "rays";

// ── Color presets ─────────────────────────────────────────────────────────────

export interface ColorPreset {
  key: string;
  label: string;
  thumb: string;
  category: "color";
  config: Partial<GodRaysConfig>;
}

// ── Layer-based rays presets ──────────────────────────────────────────────────

// Shape-only ray layer (no id, name, colorStart, colorEnd)
export interface PresetRayLayer {
  type: "rays";
  direction: number;
  spread: number;
  originX: number;
  originY: number;
  rayCount: number;
  rayWidth: number;
  divergence: number;
  rayLength: number;
  opacity: number;
  blendMode: BlendMode;
  fadeToTransparent: boolean;
  blur: number;
  randomnessWidth: number;
  randomnessLength: number;
  randomnessAngle: number;
  seed: number;
}

// Shape-only halo layer (no id, name, color)
export interface PresetHaloLayer {
  type: "halo";
  originX: number;
  originY: number;
  intensity: number;
  size: number;
  blendMode: BlendMode;
}

export type PresetLayer = PresetRayLayer | PresetHaloLayer;

export interface RaysPreset {
  key: string;
  label: string;
  thumb: string;
  category: "rays";
  layers: PresetLayer[];
}

// ── Color-only presets ────────────────────────────────────────────────────────
// Only affect background + ray colors, never shape

export const COLOR_PRESETS: ColorPreset[] = [
  {
    key: "c_contentnow",
    label: "ContentNow",
    thumb: "linear-gradient(160deg,#0d0200,#D1DD10)",
    category: "color",
    config: {
      colorStart: "#D1DD10",
      colorEnd: "#54580a",
      haloColor: "#D1DD10",
      bgType: "solid",
      bgColor: "#121212",
    },
  },
  {
    key: "c_ember",
    label: "Ember",
    thumb: "linear-gradient(160deg,#0d0200,#ff4400)",
    category: "color",
    config: {
      colorStart: "#ff6a00",
      colorEnd: "#ff2200",
      haloColor: "#ff4400",
      bgType: "solid",
      bgColor: "#0d0200",
    },
  },
  {
    key: "c_golden",
    label: "Golden hour",
    thumb: "linear-gradient(160deg,#0b1024,#ffd28a)",
    category: "color",
    config: {
      colorStart: "#ffe58a",
      colorEnd: "#ffd28a",
      haloColor: "#ffd28a",
      bgType: "gradient",
      bgColor: "#0b1024",
      bgColor2: "#1a1340",
      bgGradientAngle: 180,
    },
  },
  {
    key: "c_sunset",
    label: "Sunset",
    thumb: "linear-gradient(160deg,#3a1a4f,#ff7b3a)",
    category: "color",
    config: {
      colorStart: "#ffb46a",
      colorEnd: "#ff5b7f",
      haloColor: "#ffb46a",
      bgType: "gradient",
      bgColor: "#3a1a4f",
      bgColor2: "#ff7b3a",
      bgGradientAngle: 180,
    },
  },
  {
    key: "c_cyber",
    label: "Cyber",
    thumb: "linear-gradient(160deg,#070025,#ff2bd6)",
    category: "color",
    config: {
      colorStart: "#ff2bd6",
      colorEnd: "#3a8bff",
      haloColor: "#ff2bd6",
      bgType: "gradient",
      bgColor: "#070025",
      bgColor2: "#1d0050",
      bgGradientAngle: 200,
    },
  },
  {
    key: "c_forest",
    label: "Forest",
    thumb: "linear-gradient(160deg,#06190f,#a3d977)",
    category: "color",
    config: {
      colorStart: "#cfe88a",
      colorEnd: "#cfe88a",
      haloColor: "#cfe88a",
      bgType: "gradient",
      bgColor: "#06190f",
      bgColor2: "#1c4a26",
      bgGradientAngle: 180,
    },
  },
  {
    key: "c_ocean",
    label: "Ocean",
    thumb: "linear-gradient(160deg,#000d1a,#00a8c8)",
    category: "color",
    config: {
      colorStart: "#00d4ff",
      colorEnd: "#80c8ff",
      haloColor: "#00d4ff",
      bgType: "gradient",
      bgColor: "#000d1a",
      bgColor2: "#00131f",
      bgGradientAngle: 180,
    },
  },

  {
    key: "c_dawn",
    label: "Dawn",
    thumb: "linear-gradient(160deg,#1a0a2e,#f7b5d5)",
    category: "color",
    config: {
      colorStart: "#ffd6ec",
      colorEnd: "#c084fc",
      haloColor: "#ffd6ec",
      bgType: "gradient",
      bgColor: "#1a0a2e",
      bgColor2: "#4a1a5e",
      bgGradientAngle: 180,
    },
  },
  {
    key: "c_ice",
    label: "Ice",
    thumb: "linear-gradient(160deg,#0a1628,#a8d8f0)",
    category: "color",
    config: {
      colorStart: "#c8eaff",
      colorEnd: "#80c8ff",
      haloColor: "#c8eaff",
      bgType: "gradient",
      bgColor: "#0a1628",
      bgColor2: "#0d2a44",
      bgGradientAngle: 200,
    },
  },
  {
    key: "c_neon",
    label: "Neon",
    thumb: "linear-gradient(160deg,#001028,#00f5d4)",
    category: "color",
    config: {
      colorStart: "#00f5d4",
      colorEnd: "#7b61ff",
      haloColor: "#00f5d4",
      bgType: "solid",
      bgColor: "#001028",
    },
  },
  {
    key: "c_synthwave",
    label: "Synthwave",
    thumb: "linear-gradient(160deg,#0a0018,#ff00cc)",
    category: "color",
    config: {
      colorStart: "#ff00cc",
      colorEnd: "#3300ff",
      haloColor: "#ff00cc",
      bgType: "gradient",
      bgColor: "#0a0018",
      bgColor2: "#1a003a",
      bgGradientAngle: 180,
    },
  },
  {
    key: "c_stage",
    label: "Stage",
    thumb: "linear-gradient(160deg,#000,#5b3aff)",
    category: "color",
    config: {
      colorStart: "#a17bff",
      colorEnd: "#a17bff",
      haloColor: "#a17bff",
      bgType: "gradient",
      bgColor: "#000000",
      bgColor2: "#1a0040",
      bgGradientAngle: 180,
    },
  },
  {
    key: "c_soft",
    label: "Mist",
    thumb: "linear-gradient(160deg,#9aa9c9,#dde8ff)",
    category: "color",
    config: {
      colorStart: "#ffffff",
      colorEnd: "#ffffff",
      haloColor: "#e0eaff",
      bgType: "gradient",
      bgColor: "#9aa9c9",
      bgColor2: "#dde8ff",
      bgGradientAngle: 180,
    },
  },
  {
    key: "c_crimson",
    label: "Crimson",
    thumb: "linear-gradient(160deg,#1a0008,#e8003d)",
    category: "color",
    config: {
      colorStart: "#ff2255",
      colorEnd: "#cc0033",
      haloColor: "#ff2255",
      bgType: "gradient",
      bgColor: "#1a0008",
      bgColor2: "#3a0015",
      bgGradientAngle: 180,
    },
  },
  {
    key: "c_volcanic",
    label: "Volcanic",
    thumb: "linear-gradient(160deg,#0d0500,#ff6600)",
    category: "color",
    config: {
      colorStart: "#ff8800",
      colorEnd: "#ff3300",
      haloColor: "#ff5500",
      bgType: "gradient",
      bgColor: "#0d0500",
      bgColor2: "#1a0a00",
      bgGradientAngle: 180,
    },
  },
  {
    key: "c_midnight",
    label: "Midnight",
    thumb: "linear-gradient(160deg,#00020f,#1a3aff)",
    category: "color",
    config: {
      colorStart: "#4466ff",
      colorEnd: "#aabbff",
      haloColor: "#4466ff",
      bgType: "gradient",
      bgColor: "#00020f",
      bgColor2: "#000828",
      bgGradientAngle: 200,
    },
  },
  {
    key: "c_rosegold",
    label: "Rose Gold",
    thumb: "linear-gradient(160deg,#1a0810,#ffb3c6)",
    category: "color",
    config: {
      colorStart: "#ffccd5",
      colorEnd: "#e8a090",
      haloColor: "#ffb3c6",
      bgType: "gradient",
      bgColor: "#1a0810",
      bgColor2: "#3a1020",
      bgGradientAngle: 180,
    },
  },
  {
    key: "c_toxic",
    label: "Toxic",
    thumb: "linear-gradient(160deg,#030d00,#7fff00)",
    category: "color",
    config: {
      colorStart: "#aaff00",
      colorEnd: "#55cc00",
      haloColor: "#aaff00",
      bgType: "gradient",
      bgColor: "#030d00",
      bgColor2: "#0a1f00",
      bgGradientAngle: 180,
    },
  },
  {
    key: "c_copper",
    label: "Copper",
    thumb: "linear-gradient(160deg,#0f0800,#c87941)",
    category: "color",
    config: {
      colorStart: "#e8a060",
      colorEnd: "#c87941",
      haloColor: "#d48840",
      bgType: "gradient",
      bgColor: "#0f0800",
      bgColor2: "#1e1000",
      bgGradientAngle: 180,
    },
  },
  {
    key: "c_violet",
    label: "Violet Storm",
    thumb: "linear-gradient(160deg,#08001a,#9900ff)",
    category: "color",
    config: {
      colorStart: "#cc44ff",
      colorEnd: "#6600cc",
      haloColor: "#aa22ff",
      bgType: "gradient",
      bgColor: "#08001a",
      bgColor2: "#180033",
      bgGradientAngle: 180,
    },
  },
  {
    key: "c_sakura",
    label: "Sakura",
    thumb: "linear-gradient(160deg,#1a0a12,#ffaad4)",
    category: "color",
    config: {
      colorStart: "#ffd6e8",
      colorEnd: "#ff88bb",
      haloColor: "#ffaad4",
      bgType: "gradient",
      bgColor: "#1a0a12",
      bgColor2: "#2a1020",
      bgGradientAngle: 180,
    },
  },
  {
    key: "c_desert",
    label: "Desert",
    thumb: "linear-gradient(160deg,#120900,#e8b560)",
    category: "color",
    config: {
      colorStart: "#f5d080",
      colorEnd: "#e8a040",
      haloColor: "#f0c060",
      bgType: "gradient",
      bgColor: "#120900",
      bgColor2: "#241500",
      bgGradientAngle: 160,
    },
  },
  {
    key: "c_deepsea",
    label: "Deep Sea",
    thumb: "linear-gradient(160deg,#000810,#006680)",
    category: "color",
    config: {
      colorStart: "#00cccc",
      colorEnd: "#0088aa",
      haloColor: "#00bbbb",
      bgType: "gradient",
      bgColor: "#000810",
      bgColor2: "#001520",
      bgGradientAngle: 190,
    },
  },
  {
    key: "c_aurora",
    label: "Aurora",
    thumb: "linear-gradient(160deg,#000d0a,#00ffaa)",
    category: "color",
    config: {
      colorStart: "#00ffcc",
      colorEnd: "#aa44ff",
      haloColor: "#00ddaa",
      bgType: "gradient",
      bgColor: "#000d0a",
      bgColor2: "#001a14",
      bgGradientAngle: 180,
    },
  },
  {
    key: "c_blood",
    label: "Blood Moon",
    thumb: "linear-gradient(160deg,#0a0000,#aa2200)",
    category: "color",
    config: {
      colorStart: "#cc3300",
      colorEnd: "#880000",
      haloColor: "#aa2200",
      bgType: "solid",
      bgColor: "#0a0000",
    },
  },
  {
    key: "c_plasma",
    label: "Plasma",
    thumb: "linear-gradient(160deg,#050010,#ff44aa)",
    category: "color",
    config: {
      colorStart: "#ff66cc",
      colorEnd: "#4400ff",
      haloColor: "#ff44aa",
      bgType: "gradient",
      bgColor: "#050010",
      bgColor2: "#0f0028",
      bgGradientAngle: 220,
    },
  },
  {
    key: "c_arctic",
    label: "Arctic",
    thumb: "linear-gradient(160deg,#030810,#88ccff)",
    category: "color",
    config: {
      colorStart: "#cceeff",
      colorEnd: "#88ccff",
      haloColor: "#aaddff",
      bgType: "gradient",
      bgColor: "#030810",
      bgColor2: "#081828",
      bgGradientAngle: 200,
    },
  },
  {
    key: "c_citrus",
    label: "Citrus",
    thumb: "linear-gradient(160deg,#0d0900,#ffdd00)",
    category: "color",
    config: {
      colorStart: "#ffee44",
      colorEnd: "#ff9900",
      haloColor: "#ffdd00",
      bgType: "gradient",
      bgColor: "#0d0900",
      bgColor2: "#1a1100",
      bgGradientAngle: 170,
    },
  },
  {
    key: "c_champagne",
    label: "Champagne",
    thumb: "linear-gradient(160deg,#100e08,#e8d5a0)",
    category: "color",
    config: {
      colorStart: "#f5e8c0",
      colorEnd: "#d4b870",
      haloColor: "#e8d5a0",
      bgType: "gradient",
      bgColor: "#100e08",
      bgColor2: "#201c10",
      bgGradientAngle: 180,
    },
  },
  {
    key: "c_infrared",
    label: "Infrared",
    thumb: "linear-gradient(160deg,#050000,#ff0066)",
    category: "color",
    config: {
      colorStart: "#ff0044",
      colorEnd: "#ff6600",
      haloColor: "#ff0055",
      bgType: "solid",
      bgColor: "#050000",
    },
  },
];

// ── Rays/halo structure presets ───────────────────────────────────────────────
// Only affect shape, count, spread, direction, effects.
// Colors are inherited from the current scene.

export const RAYS_PRESETS: RaysPreset[] = [
  {
    key: "r_corner_flare",
    label: "Corner flare",
    thumb:
      "conic-gradient(from 137deg at 15% 0%, transparent 0deg, #aaa 48deg, transparent 48deg), conic-gradient(from 174deg at 91% 0%, transparent 0deg, #888 10deg, transparent 10deg)",
    category: "rays",
    layers: [
      { type: "rays", direction: 161, spread: 48,  originX: 15.2,   originY: -32.15,  rayCount: 13, rayWidth: 85, divergence: 2.65, rayLength: 0.6,  opacity: 0.39, blendMode: "screen", fadeToTransparent: true, blur: 33, randomnessWidth: 50, randomnessLength: 50, randomnessAngle: 50, seed: 869010 },
      { type: "rays", direction: 198, spread: 0,   originX: 91.21,  originY: -35.28,  rayCount: 7,  rayWidth: 26, divergence: 2.65, rayLength: 0.55, opacity: 0.45, blendMode: "screen", fadeToTransparent: true, blur: 33, randomnessWidth: 50, randomnessLength: 50, randomnessAngle: 50, seed: 765135 },
      { type: "halo", originX: 30,    originY: -20,   intensity: 0.39, size: 0.43, blendMode: "lighter" },
      { type: "halo", originX: 85.17, originY: -2.14, intensity: 0.16, size: 0.19, blendMode: "lighter" },
    ],
  },
  {
    key: "r_warm_haze",
    label: "Warm haze",
    thumb:
      "conic-gradient(from 137deg at 20% 0%, transparent 0deg, #aaa 48deg, transparent 48deg)",
    category: "rays",
    layers: [
      { type: "rays", direction: 161, spread: 48, originX: 20, originY: -23, rayCount: 15, rayWidth: 85, divergence: 2.65, rayLength: 0.6, opacity: 0.39, blendMode: "screen", fadeToTransparent: true, blur: 26, randomnessWidth: 50, randomnessLength: 50, randomnessAngle: 50, seed: 869010 },
      { type: "halo", originX: 30, originY: -20, intensity: 0.39, size: 0.43, blendMode: "lighter" },
    ],
  },
  {
    key: "r_canopy",
    label: "Canopy",
    thumb:
      "conic-gradient(from 178deg at 80% 0%, transparent 0deg, #aaa 35deg, transparent 35deg)",
    category: "rays",
    layers: [
      { type: "rays", direction: 195, spread: 35, originX: 77.8, originY: -132.757, rayCount: 22, rayWidth: 50, divergence: 1.8, rayLength: 1.5, opacity: 0.5, blendMode: "screen", fadeToTransparent: true, blur: 28, randomnessWidth: 40, randomnessLength: 40, randomnessAngle: 40, seed: 1337 },
    ],
  },
  {
    key: "r_aurora",
    label: "Aurora",
    thumb:
      "conic-gradient(from 120deg at 50% 0%, transparent 0deg, #aaa 120deg, transparent 120deg)",
    category: "rays",
    layers: [
      { type: "rays", direction: 180, spread: 120, originX: 50, originY: -20, rayCount: 40, rayWidth: 120, divergence: 1.6, rayLength: 1.3, opacity: 0.35, blendMode: "screen", fadeToTransparent: true, blur: 22, randomnessWidth: 50, randomnessLength: 50, randomnessAngle: 50, seed: 1337 },
      { type: "halo", originX: 50, originY: 0, intensity: 0.25, size: 0.5, blendMode: "lighter" },
    ],
  },
  {
    key: "r_side_glow",
    label: "Side glow",
    thumb:
      "conic-gradient(from 174deg at 100% 0%, transparent 0deg, #aaa 87deg, transparent 87deg)",
    category: "rays",
    layers: [
      { type: "rays", direction: 217, spread: 87, originX: 100.3, originY: -21.56, rayCount: 16, rayWidth: 85, divergence: 2.15, rayLength: 0.75, opacity: 0.37, blendMode: "screen", fadeToTransparent: true, blur: 26, randomnessWidth: 53, randomnessLength: 53, randomnessAngle: 53, seed: 612616 },
      { type: "halo", originX: 57.95, originY: 62.17, intensity: 0.29, size: 0.26, blendMode: "lighter" },
    ],
  },
  {
    key: "r_mist",
    label: "Dense mist",
    thumb:
      "conic-gradient(from 115deg at 50% 0%, transparent 0deg, #aaa 140deg, transparent 140deg)",
    category: "rays",
    layers: [
      { type: "rays", direction: 185, spread: 140, originX: 50, originY: -10, rayCount: 60, rayWidth: 120, divergence: 1.4, rayLength: 1.5, opacity: 0.3, blendMode: "screen", fadeToTransparent: true, blur: 35, randomnessWidth: 50, randomnessLength: 50, randomnessAngle: 50, seed: 1337 },
      { type: "halo", originX: 50, originY: 0, intensity: 0.25, size: 0.55, blendMode: "lighter" },
    ],
  },
  {
    key: "r_fan",
    label: "Fan",
    thumb:
      "conic-gradient(from 94deg at 0% 20%, transparent 0deg, #aaa 12deg, transparent 12deg)",
    category: "rays",
    layers: [
      { type: "rays", direction: 100, spread: 12, originX: -13.809, originY: 19.398, rayCount: 27, rayWidth: 144, divergence: 3.25, rayLength: 1.6, opacity: 0.51, blendMode: "lighter", fadeToTransparent: true, blur: 21.5, randomnessWidth: 100, randomnessLength: 100, randomnessAngle: 100, seed: 722896 },
      { type: "halo", originX: 47.45, originY: 56.637, intensity: 0.64, size: 0.44, blendMode: "lighter" },
    ],
  },
  {
    key: "r_burst",
    label: "Burst",
    thumb:
      "conic-gradient(from 0deg at 50% 50%, #aaa 0deg, transparent 20deg, #aaa 40deg, transparent 60deg, #aaa 80deg, transparent 100deg, #aaa 120deg, transparent 140deg, #aaa 160deg, transparent 180deg, #aaa 200deg, transparent 220deg, #aaa 240deg, transparent 260deg, #aaa 280deg, transparent 300deg, #aaa 320deg, transparent 340deg, #aaa 360deg)",
    category: "rays",
    layers: [
      { type: "rays", direction: 90, spread: 360, originX: 50, originY: 50, rayCount: 80, rayWidth: 14, divergence: 5, rayLength: 0.4, opacity: 0.5, blendMode: "lighter", fadeToTransparent: true, blur: 21.5, randomnessWidth: 20, randomnessLength: 20, randomnessAngle: 20, seed: 1337 },
    ],
  },
  {
    key: "r_sidelight",
    label: "Side light",
    thumb:
      "conic-gradient(from 76deg at 0% 40%, transparent 0deg, #aaa 50deg, transparent 50deg)",
    category: "rays",
    layers: [
      { type: "rays", direction: 101, spread: 50, originX: -69.121, originY: 21.873, rayCount: 18, rayWidth: 80, divergence: 1.5, rayLength: 1.6, opacity: 0.82, blendMode: "lighter", fadeToTransparent: true, blur: 14, randomnessWidth: 30, randomnessLength: 30, randomnessAngle: 30, seed: 1337 },
      { type: "halo", originX: 37.239, originY: 36.782, intensity: 0.5, size: 0.35, blendMode: "lighter" },
    ],
  },
  {
    key: "r_rim_light",
    label: "Rim Light",
    thumb:
      "conic-gradient(from 100deg at 0% 0%, transparent 0deg, #aaa 80deg, transparent 80deg)",
    category: "rays",
    layers: [
      { type: "rays", direction: 140, spread: 80, originX: -8, originY: -18, rayCount: 16, rayWidth: 85, divergence: 2.15, rayLength: 0.75, opacity: 0.37, blendMode: "screen", fadeToTransparent: true, blur: 16, randomnessWidth: 53, randomnessLength: 53, randomnessAngle: 53, seed: 515151 },
      { type: "halo", originX: 6.43, originY: 7.63, intensity: 0.39, size: 0.43, blendMode: "lighter" },
    ],
  },
  {
    key: "r_rising",
    label: "Rising",
    thumb:
      "conic-gradient(from 330deg at 50% 100%, transparent 0deg, #aaa 60deg, transparent 60deg)",
    category: "rays",
    layers: [
      { type: "rays", direction: 0, spread: 60, originX: 50, originY: 115, rayCount: 22, rayWidth: 90, divergence: 2.0, rayLength: 1.6, opacity: 0.5, blendMode: "lighter", fadeToTransparent: true, blur: 20, randomnessWidth: 35, randomnessLength: 35, randomnessAngle: 35, seed: 202020 },
      { type: "halo", originX: 50, originY: 88, intensity: 0.6, size: 0.32, blendMode: "lighter" },
    ],
  },
  {
    key: "r_sunburst",
    label: "Sunburst",
    thumb:
      "conic-gradient(from 105deg at 50% 0%, transparent 0deg, #aaa 150deg, transparent 150deg)",
    category: "rays",
    layers: [
      { type: "rays", direction: 180, spread: 150, originX: 50, originY: -8, rayCount: 40, rayWidth: 22, divergence: 4.0, rayLength: 1.8, opacity: 0.55, blendMode: "lighter", fadeToTransparent: true, blur: 22, randomnessWidth: 30, randomnessLength: 30, randomnessAngle: 30, seed: 111222 },
      { type: "halo", originX: 50, originY: 0, intensity: 0.7, size: 0.22, blendMode: "lighter" },
    ],
  },
  {
    key: "r_rake",
    label: "Rake",
    thumb:
      "conic-gradient(from 25deg at 0% 100%, transparent 0deg, #aaa 40deg, transparent 40deg)",
    category: "rays",
    layers: [
      { type: "rays", direction: 45, spread: 40, originX: -10, originY: 115, rayCount: 16, rayWidth: 80, divergence: 1.8, rayLength: 1.7, opacity: 0.6, blendMode: "lighter", fadeToTransparent: true, blur: 18, randomnessWidth: 30, randomnessLength: 30, randomnessAngle: 30, seed: 303030 },
      { type: "halo", originX: 25, originY: 70, intensity: 0.5, size: 0.28, blendMode: "lighter" },
    ],
  },
  {
    key: "r_twilight",
    label: "Twilight",
    thumb:
      "conic-gradient(from 243deg at 100% 55%, transparent 0deg, #aaa 45deg, transparent 45deg)",
    category: "rays",
    layers: [
      { type: "rays", direction: 265, spread: 45, originX: 118, originY: 55, rayCount: 18, rayWidth: 90, divergence: 2.0, rayLength: 1.4, opacity: 0.48, blendMode: "lighter", fadeToTransparent: true, blur: 20, randomnessWidth: 40, randomnessLength: 40, randomnessAngle: 40, seed: 741852 },
      { type: "halo", originX: 82, originY: 50, intensity: 0.5, size: 0.38, blendMode: "lighter" },
    ],
  },
  {
    key: "r_eclipse",
    label: "Eclipse",
    thumb:
      "conic-gradient(from 171deg at 50% 0%, transparent 0deg, #aaa 28deg, transparent 28deg)",
    category: "rays",
    layers: [
      { type: "rays", direction: 185, spread: 28, originX: 52, originY: -90, rayCount: 25, rayWidth: 60, divergence: 1.4, rayLength: 2.0, opacity: 0.55, blendMode: "lighter", fadeToTransparent: true, blur: 16, randomnessWidth: 20, randomnessLength: 20, randomnessAngle: 20, seed: 999111 },
      { type: "halo", originX: 52, originY: 10, intensity: 0.75, size: 0.25, blendMode: "lighter" },
    ],
  },
  {
    key: "r_torch",
    label: "Torch",
    thumb:
      "conic-gradient(from 307deg at 100% 100%, transparent 0deg, #aaa 30deg, transparent 30deg)",
    category: "rays",
    layers: [
      { type: "rays", direction: 322, spread: 30, originX: 115, originY: 115, rayCount: 16, rayWidth: 85, divergence: 1.8, rayLength: 1.6, opacity: 0.55, blendMode: "lighter", fadeToTransparent: true, blur: 18, randomnessWidth: 35, randomnessLength: 35, randomnessAngle: 35, seed: 852963 },
      { type: "halo", originX: 75, originY: 75, intensity: 0.5, size: 0.3, blendMode: "lighter" },
    ],
  },
  {
    key: "r_veil",
    label: "Veil",
    thumb:
      "conic-gradient(from 130deg at 50% 0%, transparent 0deg, #aaa 90deg, transparent 90deg)",
    category: "rays",
    layers: [
      { type: "rays", direction: 175, spread: 90, originX: 50, originY: -5, rayCount: 30, rayWidth: 150, divergence: 1.02, rayLength: 1.2, opacity: 0.2, blendMode: "screen", fadeToTransparent: true, blur: 40, randomnessWidth: 60, randomnessLength: 60, randomnessAngle: 60, seed: 147258 },
    ],
  },
  {
    key: "r_radiance",
    label: "Radiance",
    thumb:
      "conic-gradient(from 0deg at 50% 50%, #777 0deg, transparent 30deg, #777 60deg, transparent 90deg, #777 120deg, transparent 150deg, #777 180deg, transparent 210deg, #777 240deg, transparent 270deg, #777 300deg, transparent 330deg, #777 360deg)",
    category: "rays",
    layers: [
      { type: "rays", direction: 90, spread: 360, originX: 50, originY: 50, rayCount: 20, rayWidth: 30, divergence: 3.5, rayLength: 1.0, opacity: 0.4, blendMode: "lighter", fadeToTransparent: true, blur: 28, randomnessWidth: 50, randomnessLength: 50, randomnessAngle: 50, seed: 369258 },
      { type: "halo", originX: 50, originY: 50, intensity: 0.85, size: 0.45, blendMode: "lighter" },
    ],
  },
];

export const PRESETS: (ColorPreset | RaysPreset)[] = [
  ...COLOR_PRESETS,
  ...RAYS_PRESETS,
];
