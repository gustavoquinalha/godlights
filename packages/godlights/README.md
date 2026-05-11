# godlights

Animated god-ray / light-beam effects for React. Render stunning volumetric light scenes on a `<canvas>`, fully configurable and animatable.

## Installation

```bash
npm install godlights
```

## Quick start

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
      id: "bg",
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
      direction: 180,
      spread: 120,
      originX: 50,
      originY: -20,
      rayCount: 40,
      rayWidth: 87,
      divergence: 0.4,
      rayLength: 0.55,
      colorStart: "#ffffff",
      colorEnd: "#ffffff",
      opacity: 0.42,
      blendMode: "screen",
      fadeToTransparent: true,
      blur: 17.5,
      randomnessWidth: 100,
      randomnessLength: 24,
      randomnessAngle: 0,
      seed: 1337,
    },
    {
      id: "halo-1",
      name: "Halo 1",
      type: "halo",
      originX: 50,
      originY: 0,
      color: "#ffffff",
      intensity: 0.25,
      size: 0.5,
      blendMode: "lighter",
    },
  ],
};

export default function App() {
  return (
    <GodLights
      scene={scene}
      animate
      className="absolute inset-0 w-full h-full"
    />
  );
}
```

## `<GodLights>` props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `scene` | `SceneConfig` | required | Full scene configuration |
| `animate` | `boolean` | `false` | Enable animation loop |
| `animParams` | `AnimParams` | `DEFAULT_ANIM_PARAMS` | Animation parameters (speed, amplitudes) |
| `showFps` | `boolean` | `false` | Show FPS counter overlay |
| `className` | `string` | — | CSS class for the wrapper `<div>` |
| `style` | `CSSProperties` | — | Inline style for the wrapper `<div>` |

## `SceneConfig`

```ts
interface SceneConfig {
  width: number;          // Canvas width in px (used for aspect ratio)
  height: number;         // Canvas height in px
  noise: number;          // Film grain intensity (0–100)
  grainSize: number;      // Film grain pixel size (1–4)
  layers: Layer[];        // Ordered list of layers (bottom to top)
}
```

## Layer types

### `BackgroundLayer`

```ts
{
  id: string;
  type: "background";
  bgType: "solid" | "linear" | "radial";
  bgColor: string;           // Hex color (primary)
  bgColor2: string;          // Hex color (secondary, for gradients)
  bgGradientAngle: number;   // Gradient angle in degrees
}
```

### `RayLayer`

```ts
{
  id: string;
  name: string;
  type: "rays";
  direction: number;          // Angle the rays point (degrees)
  spread: number;             // Angular spread of ray fan (degrees)
  originX: number;            // Origin X (% of canvas width, can be < 0 or > 100)
  originY: number;            // Origin Y (% of canvas height, can be < 0 or > 100)
  rayCount: number;           // Number of rays
  rayWidth: number;           // Ray width (1–200)
  divergence: number;         // How much rays splay out (0.1–5)
  rayLength: number;          // Ray length as fraction of canvas diagonal (0.1–3)
  colorStart: string;         // Hex color at origin
  colorEnd: string;           // Hex color at tip
  opacity: number;            // Overall opacity (0–1)
  blendMode: BlendMode;       // CSS blend mode
  fadeToTransparent: boolean; // Fade tips to transparent
  blur: number;               // Gaussian blur in px (0–100)
  randomnessWidth: number;    // Width randomness (0–100)
  randomnessLength: number;   // Length randomness (0–100)
  randomnessAngle: number;    // Angle randomness (0–100)
  seed: number;               // RNG seed for reproducible randomness
}
```

### `HaloLayer`

```ts
{
  id: string;
  name: string;
  type: "halo";
  originX: number;    // Center X (% of canvas width)
  originY: number;    // Center Y (% of canvas height)
  color: string;      // Hex color
  intensity: number;  // Brightness (0–1)
  size: number;       // Radius as fraction of canvas diagonal (0.01–2)
  blendMode: BlendMode;
}
```

## `AnimParams`

```ts
interface AnimParams {
  speed: number;      // Animation speed (0–10)
  angleAmp: number;   // Ray angle oscillation amplitude (0–100)
  lengthAmp: number;  // Ray length oscillation amplitude (0–100)
  widthAmp: number;   // Ray width oscillation amplitude (0–100)
  haloAmp: number;    // Halo intensity oscillation amplitude (0–100)
}
```

## Default values

```ts
import {
  DEFAULT_SCENE,
  DEFAULT_RAY_LAYER,
  DEFAULT_HALO_LAYER,
  DEFAULT_BACKGROUND_LAYER,
  DEFAULT_ANIM_PARAMS,
} from "godlights";
```

## Utility exports

```ts
import {
  drawScene,      // (canvas, scene, t?) => void  — draw one frame
  exportScene,    // (scene) => Promise<Blob>      — export PNG blob
  exportDataURL,  // (scene) => Promise<string>    — export PNG data URL
  BLEND_MODES,    // { value, label }[]             — available blend modes
} from "godlights";
```

## License

MIT
