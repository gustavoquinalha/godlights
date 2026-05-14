---
title: "Performance Optimization"
description: "Tips for rendering multiple Godlights scenes simultaneously without frame drops."
---

Each animated `<GodLights animParams={...}>` runs its own `requestAnimationFrame` loop. The heaviest operations per frame are:

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
| animated | no `animParams` (static) | `animParams={...}` (60fps loop) |

## Reduce cost per instance

```tsx
const lightweightScene: SceneConfig = {
  width: 1920,
  height: 1080,
  noise: 0,          // disable grain — saves a full pixel-buffer pass per frame
  grainSize: 1,
  layers: [
    { type: "background", bgType: "solid", bgColor: "#06060f", bgColor2: "#06060f", bgGradientAngle: 180 },
    { type: "halo", originX: 50, originY: 0, color: "#a78bfa", intensity: 0.2, size: 0.4, blendMode: "lighter" },
    {
      type: "rays",
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
| animated | `animParams={...}` always on | omit `animParams` for static sections |

## Pause off-screen instances

Use `IntersectionObserver` to stop the RAF loop when the element scrolls out of the viewport.

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { GodLights, DEFAULT_ANIM_PARAMS } from "godlights";
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
        animParams={visible ? DEFAULT_ANIM_PARAMS : undefined}
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

## Canvas size trade-offs across multiple instances

Every instance allocates its own canvas at `scene.width × scene.height`. With four instances at 1920×1080, the GPU holds four separate textures totaling ~32 MB of RGBA pixel data. Reduce resolution on secondary instances to cut memory and blur cost proportionally:

```tsx
const heroScene: SceneConfig = { width: 1920, height: 1080, ... };    // primary — full quality
const sectionScene: SceneConfig = { width: 960, height: 540, ... };   // 4× cheaper blur/grain
const decorScene: SceneConfig = { width: 480, height: 270, ... };     // 16× cheaper — fine for small cards
```

`originX`/`originY` are percentages so they scale automatically. Only `blur` (absolute pixels) needs to be scaled down proportionally:

```tsx
// blur: 12 at 1920px → blur: 6 at 960px → blur: 3 at 480px
const blur = Math.round(12 * (targetWidth / 1920));
```

## Shared static background

If multiple sections use the same scene and animation isn't required, export it once and use CSS `background-image` — zero per-frame cost, works for any number of instances.

```tsx
"use client";
import { useEffect, useState } from "react";
import { buildSceneCssSnippet } from "godlights";
import type { SceneConfig } from "godlights";

function useSceneBackground(scene: SceneConfig) {
  const [css, setCss] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    buildSceneCssSnippet(scene)
      .then((snippet) => { if (!cancelled) setCss(snippet); })
      .catch((err) => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; };
  }, [scene]);

  return { css, error };
}
```

## Edge cases

### Rapid scrolling

When the user scrolls quickly, `IntersectionObserver` fires multiple times in rapid succession. Add a short delay before stopping to avoid flickering:

```tsx
function LazyAnimatedBackground({ scene }: { scene: SceneConfig }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (timerRef.current) clearTimeout(timerRef.current);
          setVisible(true);
        } else {
          timerRef.current = setTimeout(() => setVisible(false), 300);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => { observer.disconnect(); if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", height: 400 }}>
      <GodLights
        scene={scene}
        animParams={visible ? DEFAULT_ANIM_PARAMS : undefined}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
    </div>
  );
}
```

## Memory profiling

To measure canvas memory usage in Chrome DevTools:

1. Open **Memory** tab → take a **Heap Snapshot**
2. Filter by `HTMLCanvasElement` — each Godlights instance appears as one canvas
3. Check `_pixelData` size: a 1920×1080 canvas is `1920 × 1080 × 4 bytes = ~8 MB`
4. With `blur > 0`, an `OffscreenCanvas` of the same size is also allocated — so `blur > 0` doubles the canvas memory per instance

## Checklist

- [ ] Hero/primary section: full `rayCount`, blur, grain, `animParams={...}`
- [ ] Secondary sections: `rayCount` ≤ 16, `blur: 0`, `noise: 0`, reduced canvas resolution
- [ ] Decorative/background sections: no `animParams` (static) or CSS export via `buildSceneCssSnippet`
- [ ] Multiple animated sections: wrap each in `LazyAnimatedBackground` with scroll debounce
- [ ] Dynamic lists: cap animated instances at 3–4; render the rest as static
- [ ] Memory check: each `blur > 0` instance = ~16 MB canvas memory at 1920×1080
