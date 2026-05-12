---
title: "Legacy API"
description: "Reference for the backward-compatible flat configuration path exported by Godlights."
---

Import path: `godlights`  
Source file: `packages/godlights/src/godrays.ts`

The legacy API exists for backward compatibility. It is centered on `GodRaysConfig`, a flat configuration object that describes one background, one halo, and one ray fan. Internally, the engine now converts that format into `SceneConfig`.

## Legacy Type

```ts
export interface GodRaysConfig {
  width: number;
  height: number;
  rayCount: number;
  rayWidth: number;
  divergence: number;
  rayLength: number;
  opacity: number;
  blendMode: BlendMode;
  haloBlendMode: BlendMode;
  direction: number;
  spread: number;
  originX: number;
  originY: number;
  haloOriginX: number;
  haloOriginY: number;
  colorStart: string;
  colorEnd: string;
  fadeToTransparent: boolean;
  bgType: BackgroundType;
  bgColor: string;
  bgColor2: string;
  bgGradientAngle: number;
  halo: number;
  haloSize: number;
  haloColor: string;
  blur: number;
  noise: number;
  grainSize: number;
  randomness: number;
  randomnessWidth: number;
  randomnessLength: number;
  randomnessAngle: number;
  seed: number;
}
```

## Related Exports

```ts
export function drawGodRays(
  canvas: HTMLCanvasElement,
  config: GodRaysConfig
): void

export async function exportImage(
  config: GodRaysConfig,
  type: "image/png" | "image/jpeg",
  quality = 0.95
): Promise<Blob>

export async function exportDataURL(
  config: GodRaysConfig,
  type: "image/png" | "image/jpeg",
  quality = 0.95
): Promise<string>

export async function buildCssSnippet(
  config: GodRaysConfig
): Promise<string>
```

## Example

```ts
import { DEFAULT_CONFIG, drawGodRays, exportImage } from "godlights";

canvas.width = DEFAULT_CONFIG.width;
canvas.height = DEFAULT_CONFIG.height;

drawGodRays(canvas, DEFAULT_CONFIG);

const blob = await exportImage(DEFAULT_CONFIG, "image/png");
```

## Migration Pattern

```ts
import type { GodRaysConfig, SceneConfig } from "godlights";

function toScene(config: GodRaysConfig): SceneConfig {
  return {
    width: config.width,
    height: config.height,
    noise: config.noise,
    grainSize: config.grainSize,
    layers: [
      {
        id: "background",
        type: "background",
        bgType: config.bgType,
        bgColor: config.bgColor,
        bgColor2: config.bgColor2,
        bgGradientAngle: config.bgGradientAngle,
      },
      {
        id: "halo-legacy",
        type: "halo",
        name: "Halo",
        originX: config.haloOriginX,
        originY: config.haloOriginY,
        intensity: config.halo,
        size: config.haloSize,
        color: config.haloColor,
        blendMode: config.haloBlendMode,
      },
      {
        id: "rays-legacy",
        type: "rays",
        name: "Rays",
        direction: config.direction,
        spread: config.spread,
        originX: config.originX,
        originY: config.originY,
        rayCount: config.rayCount,
        rayWidth: config.rayWidth,
        divergence: config.divergence,
        rayLength: config.rayLength,
        opacity: config.opacity,
        blendMode: config.blendMode,
        colorStart: config.colorStart,
        colorEnd: config.colorEnd,
        fadeToTransparent: config.fadeToTransparent,
        blur: config.blur,
        randomness: config.randomness,
        randomnessWidth: config.randomnessWidth,
        randomnessLength: config.randomnessLength,
        randomnessAngle: config.randomnessAngle,
        seed: config.seed,
      },
    ],
  };
}
```

<Callout type="info">The legacy API is still useful for old stored payloads, but it is not the architectural center of the package anymore. The moment you need multiple ray or halo layers, move to `SceneConfig`.</Callout>
