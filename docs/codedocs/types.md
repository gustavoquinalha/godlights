---
title: "Types"
description: "Reference for every exported TypeScript type and interface in the Godlights package."
---

Godlights exports its full type surface from [`packages/godlights/src/index.ts`](../../../../godlights/packages/godlights/src/index.ts). The definitions below are taken from [`packages/godlights/src/GodLights.tsx`](../../../../godlights/packages/godlights/src/GodLights.tsx) and [`packages/godlights/src/godrays.ts`](../../../../godlights/packages/godlights/src/godrays.ts), then grouped by the role they play in the API.

## Import Path

All public types are imported from the package root:

```ts
import type {
  GodLightsProps,
  SceneConfig,
  AnimParams,
  RayLayer,
  HaloLayer,
  BackgroundLayer,
  Layer,
  BlendMode,
  BackgroundType,
} from "godlights";
```

## Component Types

### `GodLightsProps`

Defined in `packages/godlights/src/GodLights.tsx`.

```ts
export interface GodLightsProps {
  scene: SceneConfig;
  animate?: boolean;
  animParams?: AnimParams;
  showFps?: boolean;
  className?: string;
  style?: React.CSSProperties;
}
```

Use this interface when you want to wrap or re-export the component from your own design system. `scene` is the only required field. `style` is especially important because the component's wrapper starts with `position: "relative"`, so full-bleed usage is typically done through inline styles.

## Scene and Layer Types

### `BlendMode`

```ts
export type BlendMode =
  | "source-over"
  | "lighter"
  | "screen"
  | "overlay"
  | "soft-light"
  | "hard-light";
```

This is the typed subset of canvas composite operations that Godlights currently exposes. It is used by both `RayLayer` and `HaloLayer`.

### `BackgroundType`

```ts
export type BackgroundType = "transparent" | "solid" | "gradient";
```

`transparent` skips backdrop painting, `solid` fills with one color, and `gradient` creates a linear gradient between `bgColor` and `bgColor2`.

### `RayLayer`

```ts
export interface RayLayer {
  id: string;
  type: "rays";
  name: string;
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
  colorStart: string;
  colorEnd: string;
  fadeToTransparent: boolean;
  blur: number;
  randomnessWidth: number;
  randomnessLength: number;
  randomnessAngle: number;
  seed: number;
}
```

### `HaloLayer`

```ts
export interface HaloLayer {
  id: string;
  type: "halo";
  name: string;
  originX: number;
  originY: number;
  intensity: number;
  size: number;
  color: string;
  blendMode: BlendMode;
}
```

Halo layers render radial gradients centered at a percentage-based origin. `size` is relative to the canvas diagonal rather than raw pixels, which makes the effect scale cleanly across resolutions.

### `BackgroundLayer`

```ts
export interface BackgroundLayer {
  id: "background";
  type: "background";
  bgType: BackgroundType;
  bgColor: string;
  bgColor2: string;
  bgGradientAngle: number;
}
```

The literal `id: "background"` is part of the type. This is not decorative; it reflects the package's assumption that one canonical background layer sits at index `0`.

### `Layer`

```ts
export type Layer = RayLayer | HaloLayer | BackgroundLayer;
```

This discriminated union is what makes the `drawScene` loop simple. Runtime rendering branches entirely on `layer.type`.

### `SceneConfig`

```ts
export interface SceneConfig {
  width: number;
  height: number;
  noise: number;
  grainSize: number;
  layers: Layer[];
}
```

This is the main package-level content model. It is serializable, editor-friendly, and reusable across React rendering, offscreen export, and CSS generation.

## Animation Type

### `AnimParams`

```ts
export interface AnimParams {
  speed: number;
  angleAmp: number;
  lengthAmp: number;
  widthAmp: number;
  haloAmp: number;
}
```

This interface controls animation intensity. The engine does not store it inside `SceneConfig`, which allows static and animated renders to share the same scene data. There is intentionally no `opacityAmp`.

## Typical Import Pattern

```ts
import {
  DEFAULT_ANIM_PARAMS,
  DEFAULT_BACKGROUND_LAYER,
  DEFAULT_HALO_LAYER,
  DEFAULT_RAY_LAYER,
} from "godlights";
import type { AnimParams, RayLayer, SceneConfig } from "godlights";
```

<Callout type="warn">The type definitions are the safest source of truth when prose examples disagree. For example, the comments mention `"multiply"` as a useful light-background blend mode, but `BlendMode` does not currently include it. If you need compile-time safety, follow the exported type union.</Callout>
