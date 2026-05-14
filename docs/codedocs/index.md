---
title: "Getting Started"
description: "Start using Godlights to build animated layered light scenes in React or on a raw canvas."
---

Godlights renders layered god-ray scenes in React and exposes the same rendering engine for direct canvas drawing and image export.

## The Problem

- Building convincing light beams usually means hand-authoring canvas math, gradients, blur passes, and layer ordering.
- Animation gets expensive fast when noise, blur, and redraw logic all run inside the same frame loop.
- Exporting a designed scene to PNG, CSS, or reusable React code is usually a separate toolchain problem.
- Keeping a scene deterministic across reloads is awkward when randomness is not seeded.

## The Solution

Godlights packages the rendering model into a small React-friendly API: you define a `SceneConfig`, stack a required background layer plus any number of halo and ray layers, then either mount `<GodLights>` for live rendering or call `drawScene` and `exportScene` directly from the same package.

```tsx
import { GodLights } from "godlights";
import type { SceneConfig } from "godlights";

const scene: SceneConfig = {
  width: 1920,
  height: 1080,
  noise: 8,
  grainSize: 1,
  layers: [
    {
      type: "background",
      bgType: "solid",
      bgColor: "#050816",
      bgColor2: "#050816",
      bgGradientAngle: 180,
    },
    {
      type: "halo",
      originX: 20,
      originY: 4,
      color: "#ffffff",
      intensity: 0.2,
      size: 0.42,
      blendMode: "lighter",
    },
    {
      type: "rays",
      direction: 160,
      spread: 60,
      originX: 14,
      originY: -18,
      rayCount: 24,
      rayWidth: 72,
      divergence: 1.8,
      rayLength: 0.8,
      colorStart: "#ffffff",
      colorEnd: "#ffffff",
      opacity: 0.22,
      blendMode: "screen",
      fadeToTransparent: true,
      blur: 16,
      randomnessWidth: 70,
      randomnessLength: 30,
      randomnessAngle: 10,
      seed: 42,
    },
  ],
};

export default function HeroBackground() {
  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <GodLights
        scene={scene}
        animParams={{ speed: 1.2, angleAmp: 35, lengthAmp: 25, widthAmp: 10, haloAmp: 40 }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
    </div>
  );
}
```

## Installation

" "bun"]}>
  <Tab value="npm">

```bash
npm install godlights
```

  </Tab>
  <Tab value="pnpm">

```bash
pnpm add godlights
```

  </Tab>
  <Tab value="yarn">

```bash
yarn add godlights
```

  </Tab>
  <Tab value="bun">

```bash
bun add godlights
```

  </Tab>
</Tabs>

Godlights ships as an ESM/CJS library from [`packages/godlights/package.json`](../../../../godlights/packages/godlights/package.json) with `react` and `react-dom` as peer dependencies. The library itself has no runtime dependency beyond React.

## Quick Start

This is the smallest useful scene: a required background layer, one ray fan, and one halo. It uses the exported React component, but the exact same `scene` object also works with `drawScene` and `exportScene`.

```tsx
import { GodLights } from "godlights";
import type { SceneConfig } from "godlights";

const scene: SceneConfig = {
  width: 1280,
  height: 720,
  noise: 6,
  grainSize: 1,
  layers: [
    {
      type: "background",
      bgType: "solid",
      bgColor: "#000000",
      bgColor2: "#000000",
      bgGradientAngle: 180,
    },
    {
      type: "rays",
      direction: 180,
      spread: 90,
      originX: 50,
      originY: -12,
      rayCount: 20,
      rayWidth: 60,
      divergence: 1.4,
      rayLength: 0.9,
      colorStart: "#ffffff",
      colorEnd: "#ffffff",
      opacity: 0.28,
      blendMode: "screen",
      fadeToTransparent: true,
      blur: 14,
      randomnessWidth: 40,
      randomnessLength: 25,
      randomnessAngle: 0,
      seed: 1337,
    },
    {
      type: "halo",
      originX: 50,
      originY: 0,
      color: "#ffffff",
      intensity: 0.24,
      size: 0.35,
      blendMode: "lighter",
    },
  ],
};

export function Background() {
  return <GodLights scene={scene} className="w-full h-[480px]" ></GodLights>;
}
```

Expected result: a static black scene with a centered glow at the top edge and a soft fan of white beams fading toward the bottom of the canvas.

<Callout type="info">`scene.layers[0]` must always be the background layer. `drawScene` clears the canvas, then renders each layer in array order. If the background layer is missing or moved later in the stack, animated scenes smear between frames.</Callout>

## Key Features

- React component API in [`packages/godlights/src/GodLights.tsx`](../../../../godlights/packages/godlights/src/GodLights.tsx) for static and animated rendering.
- Layer-based scene model in [`packages/godlights/src/godrays.ts`](../../../../godlights/packages/godlights/src/godrays.ts) with background, halo, and ray layers.
- Deterministic seeded randomness so a scene stays visually stable across reloads.
- Direct canvas utilities for one-off drawing, image export, and CSS background generation.
- Exported defaults such as `DEFAULT_SCENE`, `DEFAULT_RAY_LAYER`, and `DEFAULT_ANIM_PARAMS` to bootstrap authoring.

## Next

<Cards>
  <Card title="Architecture" href="/docs/architecture">See how the React wrapper, render engine, and export helpers fit together.</Card>
  <Card title="Core Concepts" href="/docs/scene-config">Learn the scene model, layer ordering rules, and animation semantics.</Card>
  <Card title="API Reference" href="/docs/api-reference/godlights-component">Inspect every exported function, constant, and public type.</Card>
</Cards>
