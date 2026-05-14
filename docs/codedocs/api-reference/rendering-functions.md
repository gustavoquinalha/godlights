---
title: "Rendering Functions"
description: "Reference for the core canvas rendering entrypoints in the Godlights engine."
---

Import path: `godlights`  
Source file: `packages/godlights/src/godrays.ts`

## `drawScene`

### Signature

```ts
export function drawScene(
  canvas: HTMLCanvasElement,
  scene: SceneConfig,
  time = 0,
  anim?: AnimParams,
  skipGrain = false
): void
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `canvas` | `HTMLCanvasElement` | — | Target canvas with a 2D context. |
| `scene` | `SceneConfig` | — | Layered scene to render. |
| `time` | `number` | `0` | Elapsed animation time in seconds. |
| `anim` | `AnimParams` | `undefined` | Optional animation controls used when `time !== 0`. |
| `skipGrain` | `boolean` | `false` | Skips the final grain pass. |

### Returns

`void`

### Example

```ts
import { drawScene } from "godlights";

canvas.width = scene.width;
canvas.height = scene.height;
drawScene(canvas, scene);
```

### Animated Example

```ts
import { drawScene, type AnimParams } from "godlights";

const anim: AnimParams = {
  speed: 1,
  angleAmp: 50,
  lengthAmp: 50,
  widthAmp: 50,
  haloAmp: 50,
};

let time = 0;
let last: number | null = null;

function frame(ts: number) {
  if (last !== null) time += ((ts - last) / 1000) * anim.speed;
  last = ts;
  drawScene(canvas, scene, time, anim);
  requestAnimationFrame(frame);
}
```

<Callout type="warn">`drawScene` reads the current `canvas.width` and `canvas.height`. It does not force those values to match `scene.width` and `scene.height`, so a mismatch can distort percentages, diagonal-based lengths, blur appearance, and grain density.</Callout>

Related pages: [Export Helpers](/docs/api-reference/export-helpers), [Scene Config](/docs/scene-config)
