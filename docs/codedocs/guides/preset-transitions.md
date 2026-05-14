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
      { type: "background", bgType: "solid", bgColor: "#06060f", bgColor2: "#06060f", bgGradientAngle: 180 },
      { type: "halo", originX: 20, originY: 5, color: "#a78bfa", intensity: 0.3, size: 0.5, blendMode: "lighter" },
      { type: "rays", direction: 160, spread: 70, originX: 20, originY: 5, rayCount: 24, rayWidth: 70, divergence: 1.8, rayLength: 1.0, colorStart: "#a78bfa", colorEnd: "#a78bfa", opacity: 0.18, blendMode: "screen", fadeToTransparent: true, blur: 12, randomnessWidth: 60, randomnessLength: 20, randomnessAngle: 15, seed: 1 },
    ],
  },
  {
    width: 1920, height: 1080, noise: 8, grainSize: 1,
    layers: [
      { type: "background", bgType: "solid", bgColor: "#060f08", bgColor2: "#060f08", bgGradientAngle: 180 },
      { type: "halo", originX: 80, originY: 5, color: "#34d399", intensity: 0.3, size: 0.5, blendMode: "lighter" },
      { type: "rays", direction: 200, spread: 70, originX: 80, originY: 5, rayCount: 24, rayWidth: 70, divergence: 1.8, rayLength: 1.0, colorStart: "#34d399", colorEnd: "#34d399", opacity: 0.18, blendMode: "screen", fadeToTransparent: true, blur: 12, randomnessWidth: 60, randomnessLength: 20, randomnessAngle: 15, seed: 2 },
    ],
  },
];

const animParams = { speed: 1, angleAmp: 40, lengthAmp: 25, widthAmp: 15, haloAmp: 40 };

export function PresetSwitcher() {
  const [index, setIndex] = useState(0);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <GodLights
        scene={presets[index]}
        animParams={animParams}
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
import { GodLights, DEFAULT_ANIM_PARAMS } from "godlights";
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
      {/* bottom layer — current preset, always animating */}
      <GodLights
        scene={presets[current]}
        animParams={DEFAULT_ANIM_PARAMS}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
      {/* top layer — next preset, RAF only runs during the fade window */}
      <GodLights
        scene={presets[next]}
        animParams={fading ? DEFAULT_ANIM_PARAMS : undefined}
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

## Responsive scene dimensions

`scene.width` and `scene.height` control internal canvas resolution, not CSS layout. The component fills whatever space CSS gives it. For most cases `1920 × 1080` works at any viewport size. If you need the canvas resolution to match the container exactly (e.g. for pixel-perfect exports), use a `ResizeObserver`:

```tsx
"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { GodLights } from "godlights";
import type { SceneConfig } from "godlights";

const animParams = { speed: 1, angleAmp: 40, lengthAmp: 25, widthAmp: 15, haloAmp: 40 };

export function ResponsivePresets({ presets }: { presets: SceneConfig[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 1920, height: 1080 });
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width: Math.round(width), height: Math.round(height) });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Inject the observed size into the active preset
  const scene: SceneConfig = useMemo(() => ({
    ...presets[index],
    width: size.width,
    height: size.height,
  }), [presets, index, size]);

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", height: "100vh" }}>
      <GodLights
        scene={scene}
        animParams={animParams}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
      <button
        style={{ position: "relative", zIndex: 1 }}
        onClick={() => setIndex((i) => (i + 1) % presets.length)}
      >
        Next preset
      </button>
    </div>
  );
}
```

> **Note:** `originX`/`originY` are percentages, so they scale automatically with any `width`/`height`. Only `blur` (in absolute pixels) may need adjustment when the canvas resolution changes significantly.

## Performance note for production

Two simultaneous animated `<GodLights>` instances run two independent RAF loops. Pass `animParams={undefined}` to the hidden instance to pause its loop and halve the per-frame cost:

```tsx
<GodLights scene={presets[current]} animParams={DEFAULT_ANIM_PARAMS} style={fillStyle} />
<GodLights
  scene={presets[next]}
  animParams={fading ? DEFAULT_ANIM_PARAMS : undefined}
  style={{ ...fillStyle, opacity: fading ? 1 : 0, transition: "opacity 0.8s ease" }}
/>
```

## Notes

- Both instances run independent `requestAnimationFrame` loops when `animParams` is set. For performance, keep `rayCount` low on secondary/decorative presets.
- Omit `animParams` on the hidden instance to save resources — pass it only while it's fading in.
- Use the [visual editor](https://www.godlights.io) to design each preset and export as JSX, then drop the configs into your `presets` array.
