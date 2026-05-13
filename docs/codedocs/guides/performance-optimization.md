---
title: "Performance Optimization"
description: "Tips for rendering multiple Godlights scenes simultaneously without frame drops."
---

Each `<GodLights animate>` runs its own `requestAnimationFrame` loop. The heaviest operations per frame are:

1. **Gaussian blur** — implemented via `OffscreenCanvas` + `ctx.filter`. At 1920×1080, `blur: 20` adds roughly 4–8 ms per frame depending on GPU/browser. Setting `blur: 0` skips the OffscreenCanvas entirely and saves the most time of any single change.
2. **Film grain** — scans every pixel in the canvas buffer each frame. At 1920×1080 with `noise: 10`, this costs ~2–4 ms. In animated mode `<GodLights>` moves grain to a static overlay canvas drawn once, so this cost is already avoided — but at `scene.width × scene.height` values much larger than 1920×1080, it can still be significant.
3. **Ray count** — each ray is a filled trapezoid polygon with a linear gradient. A single ray costs ~0.05–0.1 ms. At `rayCount: 30` that's ~2–3 ms; at `rayCount: 200` it's ~10–20 ms. Keep secondary instances at 8–16.
4. **Canvas resolution** — all costs above scale with `scene.width × scene.height`. A 3840×2160 canvas is 4× more expensive than 1920×1080 for blur and grain. Use a lower internal resolution for decorative instances.

### Cost summary

| Parameter | Cheap | Expensive |
|-----------|-------|-----------|
| `blur` | `0` (no OffscreenCanvas) | `> 10` (~4–8 ms at 1080p) |
| `rayCount` | `8–16` (~0.5–1.5 ms) | `60+` (~6–20 ms) |
| `noise` | `0` (disabled) | `> 0` (~2–4 ms at 1080p, static overlay in animated mode) |
| `scene.width/height` | `960×540` | `3840×2160` (4× blur/grain cost) |
| `animate` | `false` (no RAF) | `true` (60fps loop) |

## Reduce cost per instance

```tsx
const lightweightScene: SceneConfig = {
  width: 1920,
  height: 1080,
  noise: 0,          // disable grain — saves a full pixel-buffer pass per frame
  grainSize: 1,
  layers: [
    { id: "background", type: "background", bgType: "solid", bgColor: "#06060f", bgColor2: "#06060f", bgGradientAngle: 180 },
    { id: "halo-1", name: "Halo", type: "halo", originX: 50, originY: 0, color: "#a78bfa", intensity: 0.2, size: 0.4, blendMode: "lighter" },
    {
      id: "rays-1", name: "Rays", type: "rays",
      direction: 180, spread: 80,
      originX: 50, originY: 0,
      rayCount: 12,   // ← 12–16 is plenty for decorative use; avoid 30+ in secondary sections
      rayWidth: 60, divergence: 2, rayLength: 1.0,
      colorStart: "#a78bfa", colorEnd: "#a78bfa",
      opacity: 0.15, blendMode: "screen", fadeToTransparent: true,
      blur: 0,        // ← set to 0 to skip the OffscreenCanvas blur pass entirely
      randomnessWidth: 60, randomnessLength: 20, randomnessAngle: 15, seed: 1,
    },
  ],
};
```

**Quick reference:**

| Setting | Expensive | Cheap alternative |
|---------|-----------|-------------------|
| `blur` | > 0 (OffscreenCanvas pass) | `blur: 0` |
| `rayCount` | > 30 | 8–16 for decorative |
| `noise` | > 0 (pixel buffer scan) | `noise: 0` |
| `animate` | Always on | `animate={false}` for static sections |

## Pause off-screen instances

Use `IntersectionObserver` to stop the RAF loop when the element scrolls out of the viewport.

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { GodLights } from "godlights";
import type { SceneConfig } from "godlights";

function LazyAnimatedBackground({ scene }: { scene: SceneConfig }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", height: 400 }}>
      <GodLights
        scene={scene}
        animate={visible}   // RAF loop only runs while the element is on screen
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
    </div>
  );
}

export function MultiSectionPage({ scene }: { scene: SceneConfig }) {
  return (
    <>
      <LazyAnimatedBackground scene={scene} />
      <LazyAnimatedBackground scene={scene} />
      <LazyAnimatedBackground scene={scene} />
    </>
  );
}
```

## Shared static background

If multiple sections use the same scene and animation isn't required, render it once with `animate={false}` and use CSS `background-image` with the exported data URL instead.

```tsx
import { useEffect, useState } from "react";
import { exportDataURL } from "godlights";
import type { SceneConfig } from "godlights";

function useSceneBackground(scene: SceneConfig) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    exportDataURL(scene, "image/png").then(setDataUrl);
  }, [scene]);

  return dataUrl;
}

export function StaticSection({ scene }: { scene: SceneConfig }) {
  const bg = useSceneBackground(scene);

  return (
    <div
      style={{
        backgroundImage: bg ? `url(${bg})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: 400,
      }}
    />
  );
}
```

This renders the canvas once and paints it as a CSS image — zero per-frame cost, works for any number of instances.

## Checklist

- [ ] Hero/primary section: full `rayCount`, blur, grain, `animate={true}`
- [ ] Secondary sections: `rayCount` ≤ 16, `blur: 0`, `noise: 0`
- [ ] Decorative/background sections: `animate={false}` or CSS export
- [ ] Multiple animated sections: wrap each in `LazyAnimatedBackground`
