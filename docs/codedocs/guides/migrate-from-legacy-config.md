---
title: "Migrate from Legacy Config"
description: "Move from the flat `GodRaysConfig` API to the layered `SceneConfig` model without changing your visuals."
---

Godlights still exports the legacy `GodRaysConfig` shape and its helper functions, but the engine itself now works in terms of `SceneConfig`. This guide shows how to migrate existing configs so you can use multiple ray and halo layers, modern defaults, and the React component without an adapter step.

## Problem

Older integrations often store one big flat object with fields like `rayCount`, `halo`, `bgColor`, and `haloOriginX`. That schema still works with `drawGodRays`, but it cannot represent a full layered scene.

## Solution

Wrap the flat fields into a background layer, one halo layer, and one ray layer. This mirrors exactly what `drawGodRays` does in [`packages/godlights/src/godrays.ts`](../../../../godlights/packages/godlights/src/godrays.ts), so migration is mostly data reshaping.

<Steps>
  <Step>
### Start from the legacy object

```ts
import type { GodRaysConfig } from "godlights";

const legacyConfig: GodRaysConfig = {
  width: 1920,
  height: 1080,
  rayCount: 24,
  rayWidth: 60,
  divergence: 1.6,
  rayLength: 1.4,
  opacity: 0.6,
  blendMode: "lighter",
  haloBlendMode: "lighter",
  direction: 200,
  spread: 60,
  originX: 50,
  originY: 0,
  haloOriginX: 50,
  haloOriginY: 0,
  colorStart: "#ffd28a",
  colorEnd: "#ffd28a",
  fadeToTransparent: true,
  bgType: "gradient",
  bgColor: "#0b1024",
  bgColor2: "#1a1340",
  bgGradientAngle: 180,
  halo: 0.5,
  haloSize: 0.25,
  haloColor: "#ffd28a",
  blur: 8,
  noise: 8,
  grainSize: 1,
  randomness: 30,
  randomnessWidth: 30,
  randomnessLength: 18,
  randomnessAngle: 30,
  seed: 1337,
};
```

  </Step>
  <Step>
### Convert it to `SceneConfig`

```ts
import type { GodRaysConfig, SceneConfig } from "godlights";

export function toSceneConfig(config: GodRaysConfig): SceneConfig {
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

  </Step>
  <Step>
### Replace legacy helpers incrementally

```ts
import { drawScene, exportScene } from "godlights";

const scene = toSceneConfig(legacyConfig);

drawScene(canvas, scene);
const blob = await exportScene(scene, "image/png");
```

Once your data is layered, you can switch one entrypoint at a time.

  </Step>
</Steps>

## Complete Migration Example

```ts
import { drawScene, exportScene } from "godlights";
import type { GodRaysConfig, SceneConfig } from "godlights";

function toSceneConfig(config: GodRaysConfig): SceneConfig {
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

async function migrateAndExport(config: GodRaysConfig, canvas: HTMLCanvasElement) {
  const scene = toSceneConfig(config);
  canvas.width = scene.width;
  canvas.height = scene.height;

  drawScene(canvas, scene);
  return exportScene(scene, "image/png");
}
```

<Callout type="info">The migration function above is effectively the public documentation version of `drawGodRays`. Once you adopt it in your own codebase, you can start adding additional halos or ray layers that the flat schema could never represent.</Callout>
