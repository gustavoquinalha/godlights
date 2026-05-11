import type { BlendMode } from "./godrays";

// ── Rays/halo structure presets ───────────────────────────────────────────────

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

// ── Rays/halo structure presets ───────────────────────────────────────────────
// Only affect shape, count, spread, direction, effects.
// Colors are inherited from the current scene.

export const RAYS_PRESETS: RaysPreset[] = [
  {
    key: "r_corner_haze",
    label: "Corner haze",
    thumb:
      "conic-gradient(from 130deg at 12% 0%, transparent 0deg, #bbb 70deg, transparent 70deg), conic-gradient(from 168deg at 88% 0%, transparent 0deg, #777 18deg, transparent 18deg)",
    category: "rays",
    layers: [
      {
        type: "rays",
        direction: 158,
        spread: 70,
        originX: 12,
        originY: -25,
        rayCount: 28,
        rayWidth: 90,
        divergence: 1.5,
        rayLength: 0.6,
        opacity: 0.24,
        blendMode: "screen",
        fadeToTransparent: true,
        blur: 12.5,
        randomnessWidth: 65,
        randomnessLength: 65,
        randomnessAngle: 65,
        seed: 554433,
      },
      {
        type: "rays",
        direction: 201,
        spread: 20,
        originX: 96.042,
        originY: -23.67,
        rayCount: 7,
        rayWidth: 26,
        divergence: 3.1,
        rayLength: 0.5,
        opacity: 0.35,
        blendMode: "screen",
        fadeToTransparent: true,
        blur: 6.5,
        randomnessWidth: 45,
        randomnessLength: 45,
        randomnessAngle: 45,
        seed: 221199,
      },
      {
        type: "halo",
        originX: 47.3,
        originY: 103.109,
        intensity: 0.16,
        size: 0.62,
        blendMode: "lighter",
      },
      {
        type: "halo",
        originX: 90.644,
        originY: 2.852,
        intensity: 0.14,
        size: 0.22,
        blendMode: "lighter",
      },
    ],
  },
  {
    key: "r_corner_flare",
    label: "Corner flare",
    thumb:
      "conic-gradient(from 137deg at 15% 0%, transparent 0deg, #aaa 48deg, transparent 48deg), conic-gradient(from 174deg at 91% 0%, transparent 0deg, #888 10deg, transparent 10deg)",
    category: "rays",
    layers: [
      {
        type: "rays",
        direction: 161,
        spread: 48,
        originX: 15.2,
        originY: -32.15,
        rayCount: 13,
        rayWidth: 85,
        divergence: 2.65,
        rayLength: 0.6,
        opacity: 0.39,
        blendMode: "screen",
        fadeToTransparent: true,
        blur: 33,
        randomnessWidth: 50,
        randomnessLength: 50,
        randomnessAngle: 50,
        seed: 869010,
      },
      {
        type: "rays",
        direction: 198,
        spread: 0,
        originX: 91.21,
        originY: -35.28,
        rayCount: 7,
        rayWidth: 26,
        divergence: 2.65,
        rayLength: 0.55,
        opacity: 0.45,
        blendMode: "screen",
        fadeToTransparent: true,
        blur: 33,
        randomnessWidth: 50,
        randomnessLength: 50,
        randomnessAngle: 50,
        seed: 765135,
      },
      {
        type: "halo",
        originX: 30,
        originY: -20,
        intensity: 0.39,
        size: 0.43,
        blendMode: "lighter",
      },
      {
        type: "halo",
        originX: 85.17,
        originY: -2.14,
        intensity: 0.16,
        size: 0.19,
        blendMode: "lighter",
      },
    ],
  },
  {
    key: "r_warm_haze",
    label: "Warm haze",
    thumb:
      "conic-gradient(from 137deg at 20% 0%, transparent 0deg, #aaa 48deg, transparent 48deg)",
    category: "rays",
    layers: [
      {
        type: "rays",
        direction: 161,
        spread: 48,
        originX: 20,
        originY: -23,
        rayCount: 15,
        rayWidth: 85,
        divergence: 2.65,
        rayLength: 0.6,
        opacity: 0.39,
        blendMode: "screen",
        fadeToTransparent: true,
        blur: 26,
        randomnessWidth: 50,
        randomnessLength: 50,
        randomnessAngle: 50,
        seed: 869010,
      },
      {
        type: "halo",
        originX: 30,
        originY: -20,
        intensity: 0.39,
        size: 0.43,
        blendMode: "lighter",
      },
    ],
  },
  {
    key: "r_canopy",
    label: "Canopy",
    thumb:
      "conic-gradient(from 178deg at 80% 0%, transparent 0deg, #aaa 35deg, transparent 35deg)",
    category: "rays",
    layers: [
      {
        type: "rays",
        direction: 195,
        spread: 48,
        originX: 77.8,
        originY: -132.757,
        rayCount: 72,
        rayWidth: 50,
        divergence: 0.5,
        rayLength: 1.2,
        opacity: 0.5,
        blendMode: "screen",
        fadeToTransparent: true,
        blur: 28,
        randomnessWidth: 40,
        randomnessLength: 40,
        randomnessAngle: 40,
        seed: 1337,
      },
    ],
  },
  {
    key: "r_aurora",
    label: "Aurora",
    thumb:
      "conic-gradient(from 120deg at 50% 0%, transparent 0deg, #aaa 120deg, transparent 120deg)",
    category: "rays",
    layers: [
      {
        type: "rays",
        direction: 180,
        spread: 120,
        originX: 50,
        originY: -20,
        rayCount: 40,
        rayWidth: 120,
        divergence: 1.6,
        rayLength: 0.5,
        opacity: 0.35,
        blendMode: "screen",
        fadeToTransparent: true,
        blur: 22,
        randomnessWidth: 50,
        randomnessLength: 50,
        randomnessAngle: 50,
        seed: 1337,
      },
      {
        type: "halo",
        originX: 50,
        originY: 0,
        intensity: 0.25,
        size: 0.5,
        blendMode: "lighter",
      },
    ],
  },
  {
    key: "r_twin_beam",
    label: "Twin beam",
    thumb:
      "conic-gradient(from 168deg at 85% 0%, transparent 0deg, #aaa 12deg, transparent 12deg)",
    category: "rays",
    layers: [
      {
        type: "rays",
        direction: 198,
        spread: 0,
        originX: 91.21,
        originY: -35.28,
        rayCount: 7,
        rayWidth: 26,
        divergence: 2.65,
        rayLength: 0.55,
        opacity: 0.45,
        blendMode: "screen",
        fadeToTransparent: true,
        blur: 33,
        randomnessWidth: 50,
        randomnessLength: 50,
        randomnessAngle: 50,
        seed: 765135,
      },
      {
        type: "rays",
        direction: 198,
        spread: 0,
        originX: 78.72,
        originY: -17.64,
        rayCount: 7,
        rayWidth: 59,
        divergence: 3.3,
        rayLength: 0.55,
        opacity: 0.45,
        blendMode: "screen",
        fadeToTransparent: true,
        blur: 33,
        randomnessWidth: 50,
        randomnessLength: 50,
        randomnessAngle: 50,
        seed: 992956,
      },
      {
        type: "halo",
        originX: 61.76,
        originY: -19.95,
        intensity: 0.39,
        size: 0.43,
        blendMode: "lighter",
      },
      {
        type: "halo",
        originX: 85.17,
        originY: -2.14,
        intensity: 0.16,
        size: 0.19,
        blendMode: "lighter",
      },
    ],
  },
  {
    key: "r_side_glow",
    label: "Side glow",
    thumb:
      "conic-gradient(from 174deg at 100% 0%, transparent 0deg, #aaa 87deg, transparent 87deg)",
    category: "rays",
    layers: [
      {
        type: "rays",
        direction: 217,
        spread: 87,
        originX: 100.3,
        originY: -21.56,
        rayCount: 28,
        rayWidth: 85,
        divergence: 2.15,
        rayLength: 0.6,
        opacity: 0.28,
        blendMode: "screen",
        fadeToTransparent: true,
        blur: 15,
        randomnessWidth: 82,
        randomnessLength: 51,
        randomnessAngle: 33,
        seed: 612616,
      },
      {
        type: "halo",
        originX: 72.381,
        originY: 54.324,
        intensity: 0.25,
        size: 0.26,
        blendMode: "lighter",
      },
    ],
  },
  {
    key: "r_fan",
    label: "Fan",
    thumb:
      "conic-gradient(from 94deg at 0% 20%, transparent 0deg, #aaa 12deg, transparent 12deg)",
    category: "rays",
    layers: [
      {
        type: "rays",
        direction: 100,
        spread: 12,
        originX: -13.809,
        originY: 19.398,
        rayCount: 27,
        rayWidth: 144,
        divergence: 3.25,
        rayLength: 1.6,
        opacity: 0.51,
        blendMode: "lighter",
        fadeToTransparent: true,
        blur: 21.5,
        randomnessWidth: 100,
        randomnessLength: 100,
        randomnessAngle: 100,
        seed: 722896,
      },
      {
        type: "halo",
        originX: 47.45,
        originY: 56.637,
        intensity: 0.64,
        size: 0.44,
        blendMode: "lighter",
      },
    ],
  },
  {
    key: "r_sidelight",
    label: "Side light",
    thumb:
      "conic-gradient(from 76deg at 0% 40%, transparent 0deg, #aaa 50deg, transparent 50deg)",
    category: "rays",
    layers: [
      {
        type: "rays",
        direction: 101,
        spread: 50,
        originX: -69.121,
        originY: 21.873,
        rayCount: 18,
        rayWidth: 80,
        divergence: 1.5,
        rayLength: 1.6,
        opacity: 0.82,
        blendMode: "lighter",
        fadeToTransparent: true,
        blur: 14,
        randomnessWidth: 30,
        randomnessLength: 30,
        randomnessAngle: 30,
        seed: 1337,
      },
      {
        type: "halo",
        originX: 37.239,
        originY: 36.782,
        intensity: 0.5,
        size: 0.35,
        blendMode: "lighter",
      },
    ],
  },
  {
    key: "r_rim_light",
    label: "Rim Light",
    thumb:
      "conic-gradient(from 100deg at 0% 0%, transparent 0deg, #aaa 80deg, transparent 80deg)",
    category: "rays",
    layers: [
      {
        type: "rays",
        direction: 140,
        spread: 80,
        originX: -8,
        originY: -18,
        rayCount: 16,
        rayWidth: 85,
        divergence: 2.15,
        rayLength: 0.75,
        opacity: 0.37,
        blendMode: "screen",
        fadeToTransparent: true,
        blur: 16,
        randomnessWidth: 53,
        randomnessLength: 53,
        randomnessAngle: 53,
        seed: 515151,
      },
      {
        type: "halo",
        originX: 6.43,
        originY: 7.63,
        intensity: 0.39,
        size: 0.43,
        blendMode: "lighter",
      },
    ],
  },
  {
    key: "r_twilight",
    label: "Twilight",
    thumb:
      "conic-gradient(from 243deg at 100% 55%, transparent 0deg, #aaa 45deg, transparent 45deg)",
    category: "rays",
    layers: [
      {
        type: "rays",
        direction: 265,
        spread: 45,
        originX: 118,
        originY: 55,
        rayCount: 18,
        rayWidth: 90,
        divergence: 2.0,
        rayLength: 1.4,
        opacity: 0.48,
        blendMode: "lighter",
        fadeToTransparent: true,
        blur: 20,
        randomnessWidth: 40,
        randomnessLength: 40,
        randomnessAngle: 40,
        seed: 741852,
      },
      {
        type: "halo",
        originX: 82,
        originY: 50,
        intensity: 0.5,
        size: 0.38,
        blendMode: "lighter",
      },
    ],
  },
];

