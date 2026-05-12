# godlights

Animated god-ray / light-beam effects for React. Render stunning volumetric light scenes on a `<canvas>`, fully configurable and animatable. Zero runtime dependencies beyond React.

[![npm](https://img.shields.io/npm/v/godlights?style=flat-square&color=black)](https://www.npmjs.com/package/godlights)
[![License: MIT](https://img.shields.io/badge/license-MIT-black?style=flat-square)](#license)
[![Live editor](https://img.shields.io/badge/Live%20editor-godlights.vercel.app-black?style=flat-square)](https://godlights.vercel.app)
[![Context7](https://img.shields.io/badge/Context7-docs-black?style=flat-square)](https://context7.com/gustavoquinalha/godlights)

---

## Installation

```bash
npm install godlights
```

---

## Quick start

```tsx
import { GodLights } from "godlights";
import type { SceneConfig } from "godlights";

// "Corner haze" preset — rays from both top corners
const scene: SceneConfig = {
  width: 1920,
  height: 1080,
  noise: 8,
  grainSize: 1,
  layers: [
    // ⚠️ layers[0] MUST be a BackgroundLayer — it clears the canvas each frame
    {
      id: "background",
      type: "background",
      bgType: "solid",
      bgColor: "#000000",
      bgColor2: "#000000",
      bgGradientAngle: 180,
    },
    {
      id: "rays-1",
      name: "Rays 1",
      type: "rays",
      direction: 158,
      spread: 70,
      originX: 12,
      originY: -25,
      rayCount: 28,
      rayWidth: 90,
      divergence: 1.5,
      rayLength: 0.6,
      colorStart: "#ffffff",
      colorEnd: "#ffffff",
      opacity: 0.24,
      blendMode: "screen",
      fadeToTransparent: true,
      blur: 17.5,
      randomnessWidth: 100,
      randomnessLength: 24,
      randomnessAngle: 0,
      seed: 554433,
    },
    {
      id: "halo-1",
      name: "Halo 1",
      type: "halo",
      originX: 16,
      originY: 2,
      color: "#ffffff",
      intensity: 0.16,
      size: 0.47,
      blendMode: "lighter",
    },
  ],
};

export default function App() {
  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <GodLights
        scene={scene}
        animate
        animParams={{ speed: 1.5, angleAmp: 40, lengthAmp: 30, widthAmp: 20, haloAmp: 50 }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
    </div>
  );
}
```

> **Tip:** Use the [visual editor](https://godlights.vercel.app/editor) to design your scene, then export it as a ready-to-paste JSX component.

---

## `<GodLights>` props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `scene` | `SceneConfig` | **required** | Full scene configuration |
| `animate` | `boolean` | `false` | Enable the animation loop |
| `animParams` | `AnimParams` | `DEFAULT_ANIM_PARAMS` | Animation speed and amplitudes |
| `showFps` | `boolean` | `false` | Show FPS counter overlay |
| `className` | `string` | — | CSS class on the wrapper `<div>` |
| `style` | `CSSProperties` | — | Inline style on the wrapper `<div>` |

> **Positioning note:** The wrapper defaults to `position: relative`. For full-bleed use, pass `style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}` as an inline style — this takes precedence over any `className` you add.

---

## `SceneConfig`

```ts
interface SceneConfig {
  width: number;      // Canvas width in px — used for ray/halo proportion math
  height: number;     // Canvas height in px
  noise: number;      // Film grain intensity (0–100). 0 = no grain.
  grainSize: number;  // Grain pixel size (1–4). 1 = per-pixel noise.
  layers: Layer[];    // Ordered back-to-front. layers[0] MUST be a BackgroundLayer.
}
```

---

## Layer types

### `BackgroundLayer`

The first layer in every scene. Responsible for clearing the canvas each frame — without it you'll see smearing artifacts in animated mode.

```ts
{
  id: string;
  type: "background";
  bgType: "solid" | "gradient" | "transparent";
  bgColor: string;           // Primary color (hex, e.g. "#0b1024")
  bgColor2: string;          // Gradient end color
  bgGradientAngle: number;   // Gradient angle in degrees (0–360)
}
```

### `RayLayer`

A fan of volumetric light beams emanating from a single origin point.

```ts
{
  id: string;
  name: string;
  type: "rays";
  direction: number;          // Direction rays point (degrees, 0 = right, 180 = down)
  spread: number;             // Angular spread of the fan (degrees, 0–360)
  originX: number;            // Origin X as % of canvas width (can be < 0 or > 100)
  originY: number;            // Origin Y as % of canvas height (can be < 0 or > 100)
  rayCount: number;           // Number of rays (1–200)
  rayWidth: number;           // Ray width at origin (1–200)
  divergence: number;         // How much rays splay outward (0.1–5)
  rayLength: number;          // Length as fraction of canvas diagonal (0.1–3)
  colorStart: string;         // Hex color at the origin
  colorEnd: string;           // Hex color at the tip
  opacity: number;            // Overall opacity (0–1)
  blendMode: BlendMode;       // CSS composite operation (see blend mode guide below)
  fadeToTransparent: boolean; // Fade ray tips to alpha 0
  blur: number;               // Gaussian blur in px (0–100)
  randomnessWidth: number;    // Per-ray width variance (0–100)
  randomnessLength: number;   // Per-ray length variance (0–100)
  randomnessAngle: number;    // Per-ray angle jitter (0–100)
  seed: number;               // RNG seed — same seed = same ray layout
}
```

### `HaloLayer`

A soft radial glow, typically placed at the ray origin to simulate a light source.

```ts
{
  id: string;
  name: string;
  type: "halo";
  originX: number;      // Center X as % of canvas width
  originY: number;      // Center Y as % of canvas height
  color: string;        // Hex color
  intensity: number;    // Peak brightness (0–1)
  size: number;         // Radius as fraction of canvas diagonal (0.01–2)
  blendMode: BlendMode;
}
```

---

## Blend mode guide

| Mode | Use on | Effect |
|------|--------|--------|
| `"screen"` | Dark backgrounds | Additive brightening — most natural for light on black |
| `"lighter"` | Dark backgrounds | Stronger additive — good for intense halos |
| `"multiply"` | Light / white backgrounds | Darkening blend — keeps rays visible without blowout |
| `"overlay"` | Any | Contrast-boosting blend |
| `"source-over"` | Any | Plain alpha compositing |

> Use `"multiply"` when placing rays on a white or light background. `"screen"` and `"lighter"` produce invisible results on white.

---

## `AnimParams`

Controls the oscillation of ray properties over time.

```ts
interface AnimParams {
  speed: number;      // Global time multiplier (0–10). 1 = real-time. 0 = frozen.
  angleAmp: number;   // Ray angle oscillation amplitude (0–100)
  lengthAmp: number;  // Ray length oscillation amplitude (0–100)
  widthAmp: number;   // Ray width oscillation amplitude (0–100)
  haloAmp: number;    // Halo intensity oscillation amplitude (0–100)
}
```

> ⚠️ **`opacityAmp` does not exist.** Only `speed`, `angleAmp`, `lengthAmp`, `widthAmp`, and `haloAmp` are valid keys.

---

## Default values

All defaults are exported so you can spread them into your layers:

```ts
import {
  DEFAULT_SCENE,            // SceneConfig
  DEFAULT_RAY_LAYER,        // RayLayer
  DEFAULT_HALO_LAYER,       // HaloLayer
  DEFAULT_BACKGROUND_LAYER, // BackgroundLayer
  DEFAULT_ANIM_PARAMS,      // AnimParams
} from "godlights";

// Example: spread defaults then override only what you need
const myRay: RayLayer = {
  ...DEFAULT_RAY_LAYER,
  id: "my-rays",
  name: "My Rays",
  direction: 270,
  colorStart: "#a855f7",
  colorEnd: "#a855f7",
};
```

---

## Utility exports

```ts
import {
  drawScene,      // (canvas: HTMLCanvasElement, scene: SceneConfig, time?: number) => void
  exportScene,    // (scene: SceneConfig, type: "image/png" | "image/jpeg") => Promise<Blob>
  exportDataURL,  // (config: GodRaysConfig, type: string) => Promise<string>
  BLEND_MODES,    // { value: BlendMode; label: string }[]
} from "godlights";
```

### Static render (no React)

```ts
import { drawScene } from "godlights";

const canvas = document.createElement("canvas");
canvas.width = 1920;
canvas.height = 1080;
drawScene(canvas, scene);
document.body.appendChild(canvas);
```

### Export to PNG

```ts
import { exportScene } from "godlights";

const blob = await exportScene(scene, "image/png");
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = "light-effect.png";
a.click();
```

---

## Recipes

### Hero section background

Full-bleed animated light effect behind page content. Note the `style` prop — a Tailwind `absolute` class won't override the wrapper's default `position: relative`.

```tsx
import { GodLights } from "godlights";
import type { SceneConfig } from "godlights";

const scene: SceneConfig = {
  width: 1920,
  height: 1080,
  noise: 6,
  grainSize: 1,
  layers: [
    { id: "background", type: "background", bgType: "solid", bgColor: "#06060f", bgColor2: "#06060f", bgGradientAngle: 180 },
    { id: "halo-1", name: "Glow", type: "halo", originX: 50, originY: -5, color: "#a78bfa", intensity: 0.3, size: 0.6, blendMode: "lighter" },
    {
      id: "rays-1", name: "Rays", type: "rays",
      direction: 180, spread: 90,
      originX: 50, originY: -5,
      rayCount: 30, rayWidth: 80, divergence: 2, rayLength: 1.2,
      colorStart: "#a78bfa", colorEnd: "#a78bfa",
      opacity: 0.18, blendMode: "screen", fadeToTransparent: true, blur: 14,
      randomnessWidth: 80, randomnessLength: 30, randomnessAngle: 20, seed: 42,
    },
  ],
};

export default function HeroSection() {
  return (
    <section style={{ position: "relative", minHeight: "100vh" }}>
      <GodLights
        scene={scene}
        animate
        animParams={{ speed: 0.8, angleAmp: 40, lengthAmp: 25, widthAmp: 15, haloAmp: 40 }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>
        <h1>Your content here</h1>
      </div>
    </section>
  );
}
```

---

### Next.js App Router

Add `"use client"` — the component uses `useRef`, `useEffect`, and `requestAnimationFrame`, which are client-only.

```tsx
"use client";

import { GodLights } from "godlights";
import type { SceneConfig } from "godlights";

const scene: SceneConfig = {
  width: 1920,
  height: 1080,
  noise: 8,
  grainSize: 1,
  layers: [
    { id: "background", type: "background", bgType: "gradient", bgColor: "#0b1024", bgColor2: "#1a1340", bgGradientAngle: 180 },
    { id: "halo-1", name: "Halo", type: "halo", originX: 20, originY: 10, color: "#ffd28a", intensity: 0.25, size: 0.4, blendMode: "lighter" },
    {
      id: "rays-1", name: "Rays", type: "rays",
      direction: 160, spread: 70,
      originX: 20, originY: 10,
      rayCount: 24, rayWidth: 70, divergence: 1.8, rayLength: 1.0,
      colorStart: "#ffd28a", colorEnd: "#ffd28a",
      opacity: 0.2, blendMode: "screen", fadeToTransparent: true, blur: 10,
      randomnessWidth: 60, randomnessLength: 20, randomnessAngle: 15, seed: 99,
    },
  ],
};

export default function Page() {
  return (
    <main style={{ position: "relative", minHeight: "100svh" }}>
      <GodLights
        scene={scene}
        animate
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* page content */}
      </div>
    </main>
  );
}
```

---

### Light / white background

Use `"multiply"` blend mode — `"screen"` and `"lighter"` are invisible on light backgrounds.

```tsx
const scene: SceneConfig = {
  width: 1920,
  height: 1080,
  noise: 4,
  grainSize: 1,
  layers: [
    { id: "background", type: "background", bgType: "solid", bgColor: "#ffffff", bgColor2: "#ffffff", bgGradientAngle: 180 },
    {
      id: "rays-1", name: "Rays", type: "rays",
      direction: 200, spread: 80,
      originX: 70, originY: -10,
      rayCount: 20, rayWidth: 100, divergence: 2, rayLength: 1.1,
      colorStart: "#c4b5fd", colorEnd: "#c4b5fd",
      opacity: 0.35,
      blendMode: "multiply",   // ← required on light backgrounds
      fadeToTransparent: true, blur: 20,
      randomnessWidth: 70, randomnessLength: 25, randomnessAngle: 10, seed: 7,
    },
  ],
};
```

---

### Multi-layer scene (warm + cool)

Stack multiple ray and halo layers for richer lighting. Layers render back-to-front.

```tsx
const scene: SceneConfig = {
  width: 1920,
  height: 1080,
  noise: 10,
  grainSize: 1,
  layers: [
    { id: "background", type: "background", bgType: "solid", bgColor: "#050510", bgColor2: "#050510", bgGradientAngle: 180 },
    // warm glow — top-left
    { id: "halo-warm", name: "Warm glow", type: "halo", originX: 15, originY: 5, color: "#ff9a3c", intensity: 0.2, size: 0.5, blendMode: "lighter" },
    {
      id: "rays-warm", name: "Warm rays", type: "rays",
      direction: 155, spread: 60,
      originX: 15, originY: 5,
      rayCount: 22, rayWidth: 60, divergence: 1.6, rayLength: 1.0,
      colorStart: "#ff9a3c", colorEnd: "#ff9a3c",
      opacity: 0.15, blendMode: "screen", fadeToTransparent: true, blur: 12,
      randomnessWidth: 70, randomnessLength: 20, randomnessAngle: 15, seed: 11,
    },
    // cool accent — top-right
    { id: "halo-cool", name: "Cool glow", type: "halo", originX: 85, originY: 0, color: "#60a5fa", intensity: 0.18, size: 0.4, blendMode: "lighter" },
    {
      id: "rays-cool", name: "Cool rays", type: "rays",
      direction: 205, spread: 55,
      originX: 85, originY: 0,
      rayCount: 18, rayWidth: 50, divergence: 1.5, rayLength: 0.9,
      colorStart: "#60a5fa", colorEnd: "#60a5fa",
      opacity: 0.12, blendMode: "screen", fadeToTransparent: true, blur: 10,
      randomnessWidth: 60, randomnessLength: 15, randomnessAngle: 10, seed: 22,
    },
  ],
};
```

---

### Overlay on existing content (transparent background)

Use `bgType: "transparent"` to render only the light effect without covering the page background. Add `pointerEvents: "none"` so clicks pass through.

```tsx
const scene: SceneConfig = {
  width: 1920,
  height: 1080,
  noise: 0,
  grainSize: 1,
  layers: [
    // transparent — does not clear the canvas, just composites the lights on top
    { id: "background", type: "background", bgType: "transparent", bgColor: "#000000", bgColor2: "#000000", bgGradientAngle: 180 },
    { id: "halo-1", name: "Halo", type: "halo", originX: 50, originY: 0, color: "#ffffff", intensity: 0.15, size: 0.5, blendMode: "lighter" },
    {
      id: "rays-1", name: "Rays", type: "rays",
      direction: 180, spread: 100,
      originX: 50, originY: 0,
      rayCount: 20, rayWidth: 60, divergence: 2, rayLength: 1.2,
      colorStart: "#ffffff", colorEnd: "#ffffff",
      opacity: 0.1, blendMode: "screen", fadeToTransparent: true, blur: 16,
      randomnessWidth: 80, randomnessLength: 30, randomnessAngle: 20, seed: 55,
    },
  ],
};

export default function Overlay() {
  return (
    <GodLights
      scene={scene}
      animate
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
```

---

## Common mistakes

**Missing `BackgroundLayer`**
`layers[0]` must be `type: "background"`. Without it the canvas is never cleared and animated rays smear across frames.

**Wrong blend mode on light backgrounds**
`"screen"` and `"lighter"` are additive — they're invisible on white. Use `"multiply"` for light backgrounds with dark rays.

**`opacityAmp` in `AnimParams`**
This field doesn't exist. The valid keys are `speed`, `angleAmp`, `lengthAmp`, `widthAmp`, `haloAmp`. TypeScript will catch this at compile time.

**`className="absolute"` not working**
The wrapper div uses `position: relative` as an inline style default. A Tailwind class won't override it. Pass `style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}` instead.

**Scene looks wrong at different sizes**
`originX` / `originY` are percentages of `scene.width` / `scene.height`. If you change `width`/`height`, origins scale automatically — but `blur` is in absolute pixels and may need adjustment.

---

## AI / LLM usage

If you're using an AI coding assistant (Cursor, Copilot, Claude, etc.) to generate scenes, point it at the machine-readable docs:

- **[context7.com/gustavoquinalha/godlights](https://context7.com/gustavoquinalha/godlights)** — use with the [Context7 MCP](https://context7.com) so Claude, Cursor, and Copilot can pull up-to-date docs automatically
- **[godlights.vercel.app/llms.txt](https://godlights.vercel.app/llms.txt)** — quick start, common mistakes, key constraints
- **[godlights.vercel.app/llms-full.txt](https://godlights.vercel.app/llms-full.txt)** — complete type reference, all field ranges, full Next.js example

These files follow the [llms.txt standard](https://llmstxt.org/) and are designed to fit in a context window alongside your code. Providing them to the model avoids the most common generation errors.

**With Context7 MCP installed**, you can just ask your assistant: _"use context7 — how do I add a godlights hero background in Next.js?"_ and it will fetch the right docs automatically.

---

## License

MIT
