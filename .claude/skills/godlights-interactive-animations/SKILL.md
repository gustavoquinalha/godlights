---
name: godlights-interactive-animations
description: Godlights scene composition and animation for interactive responsive light effects. Use when setting up layered god-ray scenes, optimizing blend modes for background colors, balancing render performance vs quality, or creating animated light backgrounds in React.
---

# Godlights Interactive Animations

Interactive responsive light effects with layered god-ray scenes and optimized rendering.

## When to Apply

- Building animated light backgrounds with multiple ray origins  
- Optimizing performance for interactive scenes with quality trade-offs
- Setting up responsive light effects that react to user activity
- Creating layered compositions with proper blend mode decisions

## Critical Rules

**Background Layer Required**: layers[0] must be BackgroundLayer with `type: "background"` and `id: "background"`

```tsx
// WRONG - canvas never clears, rays smear
const scene = { layers: [{ id: "rays-1", type: "rays", ... }] };

// RIGHT - background clears canvas each frame  
const scene = { 
  layers: [
    { id: "background", type: "background", bgType: "solid", bgColor: "#000" },
    { id: "rays-1", type: "rays", ... }
  ]
};
```

**Blend Mode Selection**: Never use "screen" or "lighter" on light backgrounds

```tsx
// WRONG - rays invisible on white/light backgrounds
{ blendMode: "screen", colorStart: "#fff" } // on light background

// RIGHT - use multiply for light backgrounds
{ blendMode: "multiply", colorStart: "#000" } // on light background
{ blendMode: "screen", colorStart: "#fff" }   // on dark background
```

**Animation Parameters**: No `opacityAmp` field exists

```tsx
// WRONG - opacityAmp doesn't exist
animParams={{ speed: 1, opacityAmp: 50 }}

// RIGHT - valid animation keys only
animParams={{ speed: 1, angleAmp: 50, lengthAmp: 40, widthAmp: 20, haloAmp: 50 }}
```

## Key Patterns

### Multi-Layer Scene Composition

```tsx
const scene: SceneConfig = {
  width: 1920, height: 1080, noise: 8, grainSize: 1,
  layers: [
    { id: "background", type: "background", bgType: "solid", bgColor: "#050510" },
    // Warm glow - top-left
    { id: "halo-warm", type: "halo", originX: 15, originY: 5, color: "#ff9a3c", 
      intensity: 0.2, size: 0.5, blendMode: "lighter" },
    { id: "rays-warm", type: "rays", direction: 155, spread: 60, 
      originX: 15, originY: 5, rayCount: 22, rayWidth: 60,
      colorStart: "#ff9a3c", opacity: 0.15, blendMode: "screen", seed: 11 },
    // Cool accent - top-right  
    { id: "halo-cool", type: "halo", originX: 85, originY: 0, color: "#60a5fa",
      intensity: 0.18, size: 0.4, blendMode: "lighter" },
    { id: "rays-cool", type: "rays", direction: 205, spread: 55,
      originX: 85, originY: 0, rayCount: 18, rayWidth: 50, 
      colorStart: "#60a5fa", opacity: 0.12, blendMode: "screen", seed: 22 }
  ]
};
```

### Performance-Optimized Scene

```tsx
const lightweightScene: SceneConfig = {
  width: 1920, height: 1080,
  noise: 0,          // disable grain - saves full pixel pass
  grainSize: 1,
  layers: [
    { id: "background", type: "background", bgType: "solid", bgColor: "#06060f" },
    { id: "halo-1", type: "halo", originX: 50, originY: 0, color: "#a78bfa",
      intensity: 0.2, size: 0.4, blendMode: "lighter" },
    { id: "rays-1", type: "rays", direction: 180, spread: 80,
      originX: 50, originY: 0, rayCount: 12,   // keep low for secondary instances
      rayWidth: 60, rayLength: 1.0, blur: 0,   // skip blur pass entirely
      colorStart: "#a78bfa", opacity: 0.15, blendMode: "screen", seed: 1 }
  ]
};
```

### Responsive Interactive Animation

```tsx
"use client";
import { useMemo } from "react";

function useActivityMetric() {
  const [value, setValue] = useState(50);
  // ... activity tracking logic
  return value; // 0-100
}

export function ActivityDrivenBackground() {
  const activity = useActivityMetric();
  
  const animParams: AnimParams = useMemo(() => ({
    speed: 0.5 + (activity / 100) * 2,      // 0.5 → 2.5 based on activity
    angleAmp: 20 + (activity / 100) * 60,   // 20 → 80 swing intensity
    lengthAmp: 10 + (activity / 100) * 50,
    widthAmp: 10 + (activity / 100) * 40,
    haloAmp: 20 + (activity / 100) * 60
  }), [activity]);

  return (
    <GodLights 
      scene={scene} 
      animate 
      animParams={animParams}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}
```

### Intersection Observer Optimization

```tsx
function LazyAnimatedBackground({ scene }: { scene: SceneConfig }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", height: 400 }}>
      <GodLights
        scene={scene}
        animate={visible}   // RAF only runs while visible
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
    </div>
  );
}
```

## Performance Trade-offs

**Quality vs Speed Settings**:
- Hero sections: `rayCount: 24-40`, `blur: 12-20`, `noise: 8`
- Secondary sections: `rayCount: 12-16`, `blur: 0-6`, `noise: 0-4`  
- Background decorative: `rayCount: 8-12`, `blur: 0`, `noise: 0`

**Blend Mode Performance**:
- Dark backgrounds: `"lighter"` (fast) or `"screen"` (medium)
- Light backgrounds: `"multiply"` (medium) 
- Universal: `"source-over"` (fastest, no blending)

## Common Mistakes

- **Scene config in render**: Define outside component or use `useMemo` to prevent re-renders
- **Missing position styles**: Use `style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}`
- **Absolute blur values**: `blur` is in pixels - adjust when scene dimensions change
- **Multiple animated instances**: Use IntersectionObserver to pause off-screen animations