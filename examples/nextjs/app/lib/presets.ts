import type { SceneConfig } from "godlights";

export interface Preset {
  key: string;
  label: string;
  scene: SceneConfig;
}

export const PRESETS: Preset[] = [
  {
    key: "corner-haze",
    label: "Corner haze",
    scene: {
      width: 1920, height: 1080, noise: 8, grainSize: 1,
      layers: [
        { type: "background", bgType: "solid", bgColor: "#050810", bgColor2: "#050810", bgGradientAngle: 180 },
        { type: "rays", direction: 158, spread: 70, originX: 12, originY: -25, rayCount: 28, rayWidth: 90, divergence: 1.5, rayLength: 0.6, colorStart: "#ffffff", colorEnd: "#ffffff", opacity: 0.24, blendMode: "screen", fadeToTransparent: true, blur: 17.5, randomnessWidth: 100, randomnessLength: 24, randomnessAngle: 0, seed: 554433 },
        { type: "rays", direction: 201, spread: 20, originX: 96, originY: -24, rayCount: 15, rayWidth: 26, divergence: 3.1, rayLength: 0.5, colorStart: "#ffffff", colorEnd: "#ffffff", opacity: 0.35, blendMode: "screen", fadeToTransparent: true, blur: 17.5, randomnessWidth: 100, randomnessLength: 25, randomnessAngle: 0, seed: 389834 },
        { type: "halo", originX: 16, originY: 2.3, color: "#ffffff", intensity: 0.16, size: 0.47, blendMode: "lighter" },
        { type: "halo", originX: 90.6, originY: 2.9, color: "#ffffff", intensity: 0.14, size: 0.22, blendMode: "lighter" },
      ],
    },
  },
  {
    key: "left-spot",
    label: "Left spot",
    scene: {
      width: 1920, height: 1080, noise: 8, grainSize: 1,
      layers: [
        { type: "background", bgType: "solid", bgColor: "#0a0800", bgColor2: "#0a0800", bgGradientAngle: 180 },
        { type: "rays", direction: 162, spread: 0, originX: 21.4, originY: -3.8, rayCount: 7, rayWidth: 59, divergence: 3.3, rayLength: 0.85, colorStart: "#fbbf24", colorEnd: "#fbbf24", opacity: 0.45, blendMode: "screen", fadeToTransparent: true, blur: 17, randomnessWidth: 50, randomnessLength: 50, randomnessAngle: 50, seed: 992956 },
        { type: "rays", direction: 162, spread: 0, originX: 25.6, originY: -35.5, rayCount: 7, rayWidth: 25, divergence: 3.3, rayLength: 0.55, colorStart: "#fbbf24", colorEnd: "#fbbf24", opacity: 0.45, blendMode: "screen", fadeToTransparent: true, blur: 17, randomnessWidth: 50, randomnessLength: 50, randomnessAngle: 50, seed: 386814 },
        { type: "halo", originX: 23.6, originY: -12.6, color: "#fbbf24", intensity: 0.39, size: 0.43, blendMode: "lighter" },
        { type: "halo", originX: 46.8, originY: 97.3, color: "#fbbf24", intensity: 0.16, size: 0.19, blendMode: "lighter" },
      ],
    },
  },
  {
    key: "corner-flare",
    label: "Corner flare",
    scene: {
      width: 1920, height: 1080, noise: 8, grainSize: 1,
      layers: [
        { type: "background", bgType: "solid", bgColor: "#06060f", bgColor2: "#06060f", bgGradientAngle: 180 },
        { type: "rays", direction: 161, spread: 48, originX: 15.2, originY: -32.2, rayCount: 13, rayWidth: 57, divergence: 1.75, rayLength: 0.6, colorStart: "#60a5fa", colorEnd: "#60a5fa", opacity: 0.35, blendMode: "screen", fadeToTransparent: true, blur: 17, randomnessWidth: 100, randomnessLength: 25, randomnessAngle: 0, seed: 869010 },
        { type: "rays", direction: 198, spread: 9, originX: 91.2, originY: -35.3, rayCount: 7, rayWidth: 26, divergence: 2.65, rayLength: 0.55, colorStart: "#60a5fa", colorEnd: "#60a5fa", opacity: 0.45, blendMode: "screen", fadeToTransparent: true, blur: 17, randomnessWidth: 100, randomnessLength: 25, randomnessAngle: 0, seed: 765135 },
        { type: "halo", originX: 15.7, originY: -23.2, color: "#60a5fa", intensity: 0.26, size: 0.28, blendMode: "lighter" },
        { type: "halo", originX: 85.2, originY: -2.1, color: "#60a5fa", intensity: 0.16, size: 0.19, blendMode: "lighter" },
      ],
    },
  },
  {
    key: "soft-corner",
    label: "Soft corner",
    scene: {
      width: 1920, height: 1080, noise: 8, grainSize: 1,
      layers: [
        { type: "background", bgType: "solid", bgColor: "#06060f", bgColor2: "#06060f", bgGradientAngle: 180 },
        { type: "rays", direction: 161, spread: 48, originX: 20, originY: -23, rayCount: 15, rayWidth: 85, divergence: 2.65, rayLength: 0.6, colorStart: "#a78bfa", colorEnd: "#a78bfa", opacity: 0.39, blendMode: "screen", fadeToTransparent: true, blur: 26, randomnessWidth: 50, randomnessLength: 50, randomnessAngle: 50, seed: 869010 },
        { type: "halo", originX: 30, originY: -20, color: "#a78bfa", intensity: 0.39, size: 0.43, blendMode: "lighter" },
      ],
    },
  },
  {
    key: "canopy",
    label: "Canopy",
    scene: {
      width: 1920, height: 1080, noise: 8, grainSize: 1,
      layers: [
        { type: "background", bgType: "solid", bgColor: "#060f08", bgColor2: "#060f08", bgGradientAngle: 180 },
        { type: "rays", direction: 195, spread: 48, originX: 77.8, originY: -132.8, rayCount: 72, rayWidth: 50, divergence: 0.5, rayLength: 1.2, colorStart: "#34d399", colorEnd: "#34d399", opacity: 0.5, blendMode: "screen", fadeToTransparent: true, blur: 28, randomnessWidth: 40, randomnessLength: 40, randomnessAngle: 40, seed: 1337 },
      ],
    },
  },
  {
    key: "aurora",
    label: "Aurora",
    scene: {
      width: 1920, height: 1080, noise: 8, grainSize: 1,
      layers: [
        { type: "background", bgType: "solid", bgColor: "#06060a", bgColor2: "#06060a", bgGradientAngle: 180 },
        { type: "rays", direction: 180, spread: 120, originX: 50, originY: -20, rayCount: 40, rayWidth: 87, divergence: 0.4, rayLength: 0.55, colorStart: "#ffffff", colorEnd: "#ffffff", opacity: 0.42, blendMode: "screen", fadeToTransparent: true, blur: 17.5, randomnessWidth: 100, randomnessLength: 24, randomnessAngle: 0, seed: 1337 },
        { type: "halo", originX: 50, originY: 0, color: "#ffffff", intensity: 0.25, size: 0.5, blendMode: "lighter" },
      ],
    },
  },
  {
    key: "beam-array",
    label: "Beam array",
    scene: {
      width: 1920, height: 1080, noise: 8, grainSize: 1,
      layers: [
        { type: "background", bgType: "solid", bgColor: "#0a0800", bgColor2: "#0a0800", bgGradientAngle: 180 },
        { type: "rays", direction: 198, spread: 0, originX: 91.4, originY: -41.1, rayCount: 7, rayWidth: 26, divergence: 2.65, rayLength: 0.55, colorStart: "#f59e0b", colorEnd: "#f59e0b", opacity: 0.45, blendMode: "screen", fadeToTransparent: true, blur: 17, randomnessWidth: 50, randomnessLength: 50, randomnessAngle: 50, seed: 765135 },
        { type: "rays", direction: 197, spread: 0, originX: 84.3, originY: -50.8, rayCount: 11, rayWidth: 8, divergence: 2.25, rayLength: 0.55, colorStart: "#f59e0b", colorEnd: "#f59e0b", opacity: 0.42, blendMode: "screen", fadeToTransparent: true, blur: 17, randomnessWidth: 50, randomnessLength: 50, randomnessAngle: 50, seed: 992956 },
        { type: "rays", direction: 193, spread: 0, originX: 41.9, originY: -15.3, rayCount: 6, rayWidth: 44, divergence: 3.1, rayLength: 0.48, colorStart: "#f59e0b", colorEnd: "#f59e0b", opacity: 0.30, blendMode: "screen", fadeToTransparent: true, blur: 17, randomnessWidth: 60, randomnessLength: 60, randomnessAngle: 60, seed: 445566 },
        { type: "rays", direction: 191, spread: 0, originX: 19, originY: -10.2, rayCount: 5, rayWidth: 27, divergence: 3.2, rayLength: 0.35, colorStart: "#f59e0b", colorEnd: "#f59e0b", opacity: 0.22, blendMode: "screen", fadeToTransparent: true, blur: 17, randomnessWidth: 65, randomnessLength: 65, randomnessAngle: 65, seed: 778899 },
        { type: "rays", direction: 191, spread: 0, originX: 34, originY: -6.1, rayCount: 5, rayWidth: 8, divergence: 2.15, rayLength: 0.35, colorStart: "#f59e0b", colorEnd: "#f59e0b", opacity: 0.22, blendMode: "screen", fadeToTransparent: true, blur: 17, randomnessWidth: 65, randomnessLength: 65, randomnessAngle: 65, seed: 643075 },
        { type: "halo", originX: 85.2, originY: -2.1, color: "#f59e0b", intensity: 0.22, size: 0.19, blendMode: "lighter" },
        { type: "halo", originX: 63, originY: -5, color: "#f59e0b", intensity: 0.16, size: 0.22, blendMode: "lighter" },
        { type: "halo", originX: 38, originY: -3, color: "#f59e0b", intensity: 0.10, size: 0.18, blendMode: "lighter" },
      ],
    },
  },
  {
    key: "twin-beam",
    label: "Twin beam",
    scene: {
      width: 1920, height: 1080, noise: 8, grainSize: 1,
      layers: [
        { type: "background", bgType: "solid", bgColor: "#06080f", bgColor2: "#06080f", bgGradientAngle: 180 },
        { type: "rays", direction: 198, spread: 0, originX: 91.2, originY: -35.3, rayCount: 7, rayWidth: 26, divergence: 2.65, rayLength: 0.55, colorStart: "#22d3ee", colorEnd: "#22d3ee", opacity: 0.45, blendMode: "screen", fadeToTransparent: true, blur: 17, randomnessWidth: 50, randomnessLength: 50, randomnessAngle: 50, seed: 765135 },
        { type: "rays", direction: 198, spread: 0, originX: 78.7, originY: -17.6, rayCount: 7, rayWidth: 59, divergence: 3.3, rayLength: 0.55, colorStart: "#22d3ee", colorEnd: "#22d3ee", opacity: 0.45, blendMode: "screen", fadeToTransparent: true, blur: 17, randomnessWidth: 50, randomnessLength: 50, randomnessAngle: 50, seed: 992956 },
        { type: "halo", originX: 61.8, originY: -20, color: "#22d3ee", intensity: 0.39, size: 0.43, blendMode: "lighter" },
        { type: "halo", originX: 85.2, originY: -2.1, color: "#22d3ee", intensity: 0.16, size: 0.19, blendMode: "lighter" },
      ],
    },
  },
  {
    key: "right-wash",
    label: "Right wash",
    scene: {
      width: 1920, height: 1080, noise: 8, grainSize: 1,
      layers: [
        { type: "background", bgType: "solid", bgColor: "#0f060a", bgColor2: "#0f060a", bgGradientAngle: 180 },
        { type: "rays", direction: 217, spread: 87, originX: 100.3, originY: -21.6, rayCount: 28, rayWidth: 85, divergence: 2.15, rayLength: 0.6, colorStart: "#f472b6", colorEnd: "#f472b6", opacity: 0.28, blendMode: "screen", fadeToTransparent: true, blur: 15, randomnessWidth: 82, randomnessLength: 51, randomnessAngle: 33, seed: 612616 },
        { type: "halo", originX: 72.4, originY: 54.3, color: "#f472b6", intensity: 0.25, size: 0.26, blendMode: "lighter" },
      ],
    },
  },
  {
    key: "projector",
    label: "Projector",
    scene: {
      width: 1920, height: 1080, noise: 8, grainSize: 1,
      layers: [
        { type: "background", bgType: "solid", bgColor: "#0a0600", bgColor2: "#0a0600", bgGradientAngle: 180 },
        { type: "rays", direction: 80, spread: 6, originX: -32.6, originY: 78.8, rayCount: 27, rayWidth: 76, divergence: 3.25, rayLength: 1.95, colorStart: "#fb923c", colorEnd: "#fb923c", opacity: 0.32, blendMode: "lighter", fadeToTransparent: true, blur: 21.5, randomnessWidth: 100, randomnessLength: 25, randomnessAngle: 0, seed: 722896 },
        { type: "halo", originX: -4.4, originY: 77.2, color: "#fb923c", intensity: 0.64, size: 0.41, blendMode: "lighter" },
      ],
    },
  },
  {
    key: "fan",
    label: "Fan",
    scene: {
      width: 1920, height: 1080, noise: 8, grainSize: 1,
      layers: [
        { type: "background", bgType: "solid", bgColor: "#06100f", bgColor2: "#06100f", bgGradientAngle: 180 },
        { type: "rays", direction: 100, spread: 12, originX: -13.8, originY: 19.4, rayCount: 27, rayWidth: 144, divergence: 3.25, rayLength: 1.6, colorStart: "#2dd4bf", colorEnd: "#2dd4bf", opacity: 0.51, blendMode: "lighter", fadeToTransparent: true, blur: 21.5, randomnessWidth: 100, randomnessLength: 100, randomnessAngle: 100, seed: 722896 },
        { type: "halo", originX: 47.5, originY: 56.6, color: "#2dd4bf", intensity: 0.64, size: 0.44, blendMode: "lighter" },
      ],
    },
  },
  {
    key: "left-light",
    label: "Left light",
    scene: {
      width: 1920, height: 1080, noise: 8, grainSize: 1,
      layers: [
        { type: "background", bgType: "solid", bgColor: "#0a0900", bgColor2: "#0a0900", bgGradientAngle: 180 },
        { type: "rays", direction: 101, spread: 50, originX: -69.1, originY: 21.9, rayCount: 18, rayWidth: 80, divergence: 1.5, rayLength: 1.6, colorStart: "#fde047", colorEnd: "#fde047", opacity: 0.82, blendMode: "lighter", fadeToTransparent: true, blur: 14, randomnessWidth: 30, randomnessLength: 30, randomnessAngle: 30, seed: 1337 },
        { type: "halo", originX: 37.2, originY: 36.8, color: "#fde047", intensity: 0.5, size: 0.35, blendMode: "lighter" },
      ],
    },
  },
  {
    key: "rim-light",
    label: "Rim light",
    scene: {
      width: 1920, height: 1080, noise: 8, grainSize: 1,
      layers: [
        { type: "background", bgType: "solid", bgColor: "#06060f", bgColor2: "#06060f", bgGradientAngle: 180 },
        { type: "rays", direction: 140, spread: 80, originX: -8, originY: -18, rayCount: 16, rayWidth: 85, divergence: 2.15, rayLength: 0.75, colorStart: "#818cf8", colorEnd: "#818cf8", opacity: 0.37, blendMode: "screen", fadeToTransparent: true, blur: 16, randomnessWidth: 53, randomnessLength: 53, randomnessAngle: 53, seed: 515151 },
        { type: "halo", originX: 6.4, originY: 7.6, color: "#818cf8", intensity: 0.39, size: 0.43, blendMode: "lighter" },
      ],
    },
  },
  {
    key: "dusk",
    label: "Dusk",
    scene: {
      width: 1920, height: 1080, noise: 8, grainSize: 1,
      layers: [
        { type: "background", bgType: "solid", bgColor: "#0f0606", bgColor2: "#0f0606", bgGradientAngle: 180 },
        { type: "rays", direction: 265, spread: 45, originX: 118, originY: 55, rayCount: 18, rayWidth: 90, divergence: 2.0, rayLength: 1.4, colorStart: "#f87171", colorEnd: "#f87171", opacity: 0.48, blendMode: "lighter", fadeToTransparent: true, blur: 17, randomnessWidth: 40, randomnessLength: 40, randomnessAngle: 40, seed: 741852 },
        { type: "halo", originX: 82, originY: 50, color: "#f87171", intensity: 0.5, size: 0.38, blendMode: "lighter" },
      ],
    },
  },
];
