---
title: "Reactive Scene Updates"
description: "Update a Godlights scene in response to user interactions like mouse movement, scroll position, or state changes."
---

The `<GodLights>` component re-renders whenever the `scene` prop reference changes. This means you can drive any layer property — `originX`, `originY`, `opacity`, `direction`, `color` — from React state, and the canvas updates automatically.

## Key principle

Never construct `SceneConfig` inline in JSX. Instead, derive it with `useMemo` so it only recomputes when the values it depends on actually change.

```tsx
// ❌ reconstructs on every render, causes unnecessary redraws
<GodLights scene={{ width: 1920, height: 1080, layers: [...] }} />

// ✅ recomputes only when mouse changes
const scene = useMemo(() => ({ ... }), [mouse]);
<GodLights scene={scene} />
```

## Example: follow mouse position

```tsx
"use client";
import { useState, useCallback, useMemo } from "react";
import { GodLights, DEFAULT_BACKGROUND_LAYER, DEFAULT_HALO_LAYER, DEFAULT_RAY_LAYER } from "godlights";
import type { SceneConfig } from "godlights";

export function MouseTrackingBackground() {
  const [mouse, setMouse] = useState({ x: 50, y: 10 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMouse({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  const scene: SceneConfig = useMemo(() => ({
    width: 1920,
    height: 1080,
    noise: 6,
    grainSize: 1,
    layers: [
      { ...DEFAULT_BACKGROUND_LAYER, bgColor: "#06060f" },
      {
        ...DEFAULT_HALO_LAYER,
        id: "halo-1",
        name: "Halo",
        originX: mouse.x,
        originY: mouse.y,
        color: "#a78bfa",
        intensity: 0.28,
        size: 0.45,
      },
      {
        ...DEFAULT_RAY_LAYER,
        id: "rays-1",
        name: "Rays",
        originX: mouse.x,
        originY: mouse.y,
        direction: 180,
        spread: 80,
        colorStart: "#a78bfa",
        colorEnd: "#a78bfa",
        opacity: 0.18,
      },
    ],
  }), [mouse]);

  return (
    <div
      style={{ position: "relative", width: "100%", height: "100vh" }}
      onMouseMove={handleMouseMove}
    >
      <GodLights
        scene={scene}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* page content */}
      </div>
    </div>
  );
}
```

## Example: react to scroll position

```tsx
"use client";
import { useState, useEffect, useMemo } from "react";
import { GodLights, DEFAULT_BACKGROUND_LAYER, DEFAULT_RAY_LAYER } from "godlights";
import type { SceneConfig } from "godlights";

export function ScrollReactiveBackground() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Map scroll 0–500px to direction 160–200deg
  const direction = 160 + (Math.min(scrollY, 500) / 500) * 40;

  const scene: SceneConfig = useMemo(() => ({
    width: 1920,
    height: 1080,
    noise: 6,
    grainSize: 1,
    layers: [
      { ...DEFAULT_BACKGROUND_LAYER, bgColor: "#06060f" },
      {
        ...DEFAULT_RAY_LAYER,
        id: "rays-1",
        name: "Rays",
        direction,
        colorStart: "#ffd28a",
        colorEnd: "#ffd28a",
        opacity: 0.2,
      },
    ],
  }), [direction]);

  return (
    <GodLights
      scene={scene}
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: -1 }}
    />
  );
}
```

## Notes

- `originX` / `originY` are percentages of `scene.width` / `scene.height` (0–100), not pixel coordinates.
- Throttle high-frequency events (mousemove, scroll) with `requestAnimationFrame` or a debounce if you notice frame drops.
- Combine with `animate={true}` for layered motion — the scene prop drives the base position while `animParams` adds organic oscillation on top.
