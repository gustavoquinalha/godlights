---
title: "Defaults and Utilities"
description: "Reference for exported constants and helper functions that support scene authoring."
---

Import path: `godlights`  
Source file: `packages/godlights/src/godrays.ts`

## Constants

### `BLEND_MODES`

```ts
export const BLEND_MODES: { label: string; value: BlendMode }[]
```

This is the package's curated list of blend mode options:

```ts
[
  { label: "Normal", value: "source-over" },
  { label: "Lighter (additive)", value: "lighter" },
  { label: "Screen", value: "screen" },
  { label: "Overlay", value: "overlay" },
  { label: "Soft light", value: "soft-light" },
  { label: "Hard light", value: "hard-light" },
]
```

### `DEFAULT_ANIM_PARAMS`

```ts
export const DEFAULT_ANIM_PARAMS: AnimParams
```

Default value:

```ts
{
  speed: 1,
  angleAmp: 50,
  lengthAmp: 50,
  widthAmp: 50,
  haloAmp: 50,
}
```

### `DEFAULT_RAY_LAYER`

```ts
export const DEFAULT_RAY_LAYER: RayLayer
```

Use this as the safest starting point for a new ray layer.

### `DEFAULT_HALO_LAYER`

```ts
export const DEFAULT_HALO_LAYER: HaloLayer
```

### `DEFAULT_BACKGROUND_LAYER`

```ts
export const DEFAULT_BACKGROUND_LAYER: BackgroundLayer
```

### `DEFAULT_SCENE`

```ts
export const DEFAULT_SCENE: SceneConfig
```

## Common Pattern

```ts
import {
  DEFAULT_BACKGROUND_LAYER,
  DEFAULT_HALO_LAYER,
  DEFAULT_RAY_LAYER,
} from "godlights";
import type { SceneConfig } from "godlights";

const scene: SceneConfig = {
  width: 1600,
  height: 900,
  noise: 8,
  grainSize: 1,
  layers: [
    { ...DEFAULT_BACKGROUND_LAYER, bgColor: "#050816", bgColor2: "#050816" },
    { ...DEFAULT_HALO_LAYER, color: "#ffffff" },
    { ...DEFAULT_RAY_LAYER, direction: 180 },
  ],
};
```

<Callout type="warn">Treat the default exports as templates, not shared mutable objects. Clone them with object spread before editing nested scene data, especially `DEFAULT_SCENE`, because the source exports a real object graph rather than a factory.</Callout>

Related pages: [Types](/docs/types), [Scene Config](/docs/scene-config)
