---
title: "Cycling Presets with Transitions"
description: "Swap between multiple SceneConfig presets with smooth cross-fade transitions."
---

Swapping the `scene` prop switches presets immediately. The running animation loop continues seamlessly — there is no flash or hard cut because the canvas keeps redrawing. For a visible cross-fade, layer two `<GodLights>` instances and animate CSS `opacity` between them.

## Simple preset swap (no transition)

```tsx
"use client";
import { useState } from "react";
import { GodLights } from "godlights";
import type { SceneConfig } from "godlights";

const presets: SceneConfig[] = [
  {
    width: 1920, height: 1080, noise: 8, grainSize: 1,
    layers: [
      { id: "background", type: "background", bgType: "solid", bgColor: "#06060f", bgColor2: "#06060f", bgGradientAngle: 180 },
      { id: "halo-1", name: "Halo", type: "halo", originX: 20, originY: 5, color: "#a78bfa", intensity: 0.3, size: 0.5, blendMode: "lighter" },
      { id: "rays-1", name: "Rays", type: "rays", direction: 160, spread: 70, originX: 20, originY: 5, rayCount: 24, rayWidth: 70, divergence: 1.8, rayLength: 1.0, colorStart: "#a78bfa", colorEnd: "#a78bfa", opacity: 0.18, blendMode: "screen", fadeToTransparent: true, blur: 12, randomnessWidth: 60, randomnessLength: 20, randomnessAngle: 15, seed: 1 },
    ],
  },
  {
    width: 1920, height: 1080, noise: 8, grainSize: 1,
    layers: [
      { id: "background", type: "background", bgType: "solid", bgColor: "#060f08", bgColor2: "#060f08", bgGradientAngle: 180 },
      { id: "halo-1", name: "Halo", type: "halo", originX: 80, originY: 5, color: "#34d399", intensity: 0.3, size: 0.5, blendMode: "lighter" },
      { id: "rays-1", name: "Rays", type: "rays", direction: 200, spread: 70, originX: 80, originY: 5, rayCount: 24, rayWidth: 70, divergence: 1.8, rayLength: 1.0, colorStart: "#34d399", colorEnd: "#34d399", opacity: 0.18, blendMode: "screen", fadeToTransparent: true, blur: 12, randomnessWidth: 60, randomnessLength: 20, randomnessAngle: 15, seed: 2 },
    ],
  },
];

export function PresetSwitcher() {
  const [index, setIndex] = useState(0);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <GodLights
        scene={presets[index]}
        animate
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>
        <button onClick={() => setIndex((i) => (i + 1) % presets.length)}>
          Next preset
        </button>
      </div>
    </div>
  );
}
```

## Cross-fade between presets

Layer two `<GodLights>` instances. The top one fades in over the bottom one, then the bottom updates and the cycle repeats.

```tsx
"use client";
import { useState, useEffect } from "react";
import { GodLights } from "godlights";
import type { SceneConfig } from "godlights";

// ... (same presets array as above)

const INTERVAL_MS = 4000;
const FADE_MS = 800;

export function CyclingPresets() {
  const [current, setCurrent] = useState(0);
  const [next, setNext] = useState(1);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      const nextIndex = (current + 1) % presets.length;
      setNext(nextIndex);
      setFading(true);

      setTimeout(() => {
        setCurrent(nextIndex);
        setFading(false);
      }, FADE_MS);
    }, INTERVAL_MS);

    return () => clearInterval(id);
  }, [current]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      {/* bottom layer — current preset */}
      <GodLights
        scene={presets[current]}
        animate
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
      {/* top layer — next preset, fades in */}
      <GodLights
        scene={presets[next]}
        animate
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: fading ? 1 : 0,
          transition: `opacity ${FADE_MS}ms ease`,
        }}
      />
    </div>
  );
}
```

## Notes

- Both instances run independent `requestAnimationFrame` loops. For performance, keep `rayCount` low on secondary/decorative presets.
- The `animate` prop can be set to `false` on the hidden instance to save resources — enable it only while it's fading in.
- Use the [visual editor](https://godlights.vercel.app) to design each preset and export as JSX, then drop the configs into your `presets` array.
