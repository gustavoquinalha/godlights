---
title: "Reusable Wrapper Component"
description: "Build a GodLightsBackground wrapper that accepts high-level props like color, spread, and speed for easy reuse across multiple UI sections."
---

Instead of repeating a full `SceneConfig` in every section, create a wrapper component that accepts simple, high-level props and builds the config internally. This makes it easy to apply consistent lighting across multiple sections with minor variations.

## The wrapper

```tsx
import { useMemo } from "react";
import { GodLights, DEFAULT_BACKGROUND_LAYER, DEFAULT_HALO_LAYER, DEFAULT_RAY_LAYER } from "godlights";
import type { SceneConfig, AnimParams } from "godlights";

interface GodLightsBackgroundProps {
  /** Hex color for rays and halo. Default: "#a78bfa" */
  color?: string;
  /** Origin X as % of canvas width (0–100). Default: 50 */
  originX?: number;
  /** Origin Y as % of canvas height (0–100). Default: 0 */
  originY?: number;
  /** Direction rays point in degrees (0=up, 90=right, 180=down). Default: 180 */
  direction?: number;
  /** Angular spread of the ray fan in degrees. Default: 80 */
  spread?: number;
  /** Ray opacity 0–1. Default: 0.18 */
  opacity?: number;
  /** Animation speed multiplier. Default: 1 */
  speed?: number;
  /** Enable animation loop. Default: true */
  animate?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function GodLightsBackground({
  color = "#a78bfa",
  originX = 50,
  originY = 0,
  direction = 180,
  spread = 80,
  opacity = 0.18,
  speed = 1,
  animate = true,
  className,
  style,
}: GodLightsBackgroundProps) {
  const scene: SceneConfig = useMemo(() => ({
    width: 1920,
    height: 1080,
    noise: 6,
    grainSize: 1,
    layers: [
      { ...DEFAULT_BACKGROUND_LAYER },
      {
        ...DEFAULT_HALO_LAYER,
        id: "halo-1",
        name: "Halo",
        originX,
        originY,
        color,
        intensity: opacity * 1.5,
        size: 0.45,
      },
      {
        ...DEFAULT_RAY_LAYER,
        id: "rays-1",
        name: "Rays",
        originX,
        originY,
        direction,
        spread,
        colorStart: color,
        colorEnd: color,
        opacity,
      },
    ],
  }), [color, originX, originY, direction, spread, opacity]);

  const animParams: AnimParams = useMemo(() => ({
    speed,
    angleAmp: 40,
    lengthAmp: 25,
    widthAmp: 15,
    haloAmp: 40,
  }), [speed]);

  return (
    <GodLights
      scene={scene}
      animate={animate}
      animParams={animParams}
      className={className}
      style={style}
    />
  );
}
```

## Usage across multiple sections

```tsx
// Purple — top-left origin, default speed
<div style={{ position: "relative", minHeight: "100vh" }}>
  <GodLightsBackground
    color="#a78bfa"
    originX={20}
    originY={5}
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
  />
  <div style={{ position: "relative", zIndex: 1 }}>Hero content</div>
</div>

// Warm amber — top-right, slower animation
<div style={{ position: "relative", height: 400 }}>
  <GodLightsBackground
    color="#ffd28a"
    originX={80}
    originY={0}
    direction={200}
    speed={0.5}
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
  />
</div>

// Teal — static, no animation loop
<div style={{ position: "relative", height: 400 }}>
  <GodLightsBackground
    color="#34d399"
    animate={false}
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
  />
</div>
```

## Extending the wrapper

Add more props as your design system needs them:

```tsx
interface GodLightsBackgroundProps {
  // ... base props above ...
  /** Number of rays. Lower values are cheaper. Default: 24 */
  rayCount?: number;
  /** Blur in pixels. Set to 0 to skip the OffscreenCanvas pass. Default: 8 */
  blur?: number;
  /** Film grain intensity 0–100. Default: 6 */
  noise?: number;
  /** Background color. Default: "#000000" */
  bgColor?: string;
}
```

Then spread the new values into the relevant layer inside `useMemo`:

```tsx
const scene: SceneConfig = useMemo(() => ({
  width: 1920,
  height: 1080,
  noise,
  grainSize: 1,
  layers: [
    { ...DEFAULT_BACKGROUND_LAYER, bgColor },
    { ...DEFAULT_HALO_LAYER, id: "halo-1", name: "Halo", originX, originY, color, intensity: opacity * 1.5, size: 0.45 },
    { ...DEFAULT_RAY_LAYER, id: "rays-1", name: "Rays", originX, originY, direction, spread, colorStart: color, colorEnd: color, opacity, rayCount, blur },
  ],
}), [color, originX, originY, direction, spread, opacity, rayCount, blur, noise, bgColor]);
```

## Notes

- Always wrap `SceneConfig` and `AnimParams` in `useMemo` — constructing them inline causes unnecessary canvas redraws on every parent render.
- The `DEFAULT_*` exports contain safe baseline values for all required fields, so you only need to override what your props control.
- For performance across multiple instances on the same page, pass `animate={false}` to static sections and keep `rayCount` low (8–16) for decorative use. See the [performance guide](./performance-optimization.md).
