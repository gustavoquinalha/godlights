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

## Example: direction angle from mouse position

`direction` is a compass bearing in degrees (0 = up, 90 = right, 180 = down, 270 = left). To point rays away from the mouse, calculate the angle from the origin to the cursor using `Math.atan2`.

```tsx
"use client";
import { useState, useCallback, useMemo } from "react";
import { GodLights, DEFAULT_BACKGROUND_LAYER, DEFAULT_HALO_LAYER, DEFAULT_RAY_LAYER } from "godlights";
import type { SceneConfig } from "godlights";

function toCompassDeg(fromX: number, fromY: number, toX: number, toY: number) {
  // Math.atan2 returns angle from +X axis; convert to compass (0 = up)
  const rad = Math.atan2(toY - fromY, toX - fromX);
  return ((rad * 180) / Math.PI + 90 + 360) % 360;
}

export function DirectionTrackingBackground() {
  const originX = 50;
  const originY = 50;
  const [mouse, setMouse] = useState({ x: 50, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMouse({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  // Rays point from center toward the mouse cursor
  const direction = toCompassDeg(originX, originY, mouse.x, mouse.y);

  const scene: SceneConfig = useMemo(() => ({
    width: 1920,
    height: 1080,
    noise: 6,
    grainSize: 1,
    layers: [
      { ...DEFAULT_BACKGROUND_LAYER, bgColor: "#06060f" },
      { ...DEFAULT_HALO_LAYER, id: "halo-1", name: "Halo", originX, originY, color: "#a78bfa", intensity: 0.28, size: 0.4 },
      { ...DEFAULT_RAY_LAYER, id: "rays-1", name: "Rays", originX, originY, direction, spread: 60, colorStart: "#a78bfa", colorEnd: "#a78bfa", opacity: 0.2 },
    ],
  }), [direction]);

  return (
    <div
      style={{ position: "relative", width: "100%", height: "100vh" }}
      onMouseMove={handleMouseMove}
    >
      <GodLights
        scene={scene}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>{/* content */}</div>
    </div>
  );
}
```

## Example: dynamically updating animParams

`animParams` is read on every frame via an internal ref, so changing it drives the animation immediately without remounting the component. Use this to respond to real-time data like activity metrics or audio levels.

```tsx
"use client";
import { useState, useEffect, useMemo } from "react";
import { GodLights, DEFAULT_SCENE } from "godlights";
import type { AnimParams } from "godlights";

// Simulate a real-time activity metric (0–100)
function useActivityMetric() {
  const [value, setValue] = useState(50);
  useEffect(() => {
    const id = setInterval(() => setValue(Math.random() * 100), 2000);
    return () => clearInterval(id);
  }, []);
  return value;
}

export function ActivityDrivenBackground() {
  const activity = useActivityMetric(); // 0–100

  // Map activity level to animation intensity
  const animParams: AnimParams = useMemo(() => ({
    speed: 0.5 + (activity / 100) * 2,      // 0.5 (quiet) → 2.5 (busy)
    angleAmp: 20 + (activity / 100) * 60,   // 20 (subtle) → 80 (dramatic)
    lengthAmp: 10 + (activity / 100) * 50,
    widthAmp: 10 + (activity / 100) * 40,
    haloAmp: 20 + (activity / 100) * 60,
  }), [activity]);

  return (
    <GodLights
      scene={DEFAULT_SCENE}
      animate
      animParams={animParams}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}
```

## Notes

- `originX` / `originY` are percentages of `scene.width` / `scene.height` (0–100), not pixel coordinates.
- `direction` is a compass bearing: 0 = up, 90 = right, 180 = down, 270 = left. Use `Math.atan2` to calculate it from coordinates.
- `animParams` changes take effect on the next animation frame — no remount, no flicker.
- Throttle high-frequency events (mousemove, scroll) with `requestAnimationFrame` or a debounce if you notice frame drops.
- Combine reactive `scene` updates with `animate={true}` for layered motion — the scene prop drives the base values while `animParams` adds organic oscillation on top.
