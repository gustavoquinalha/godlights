---
title: "GodLights Component"
description: "API reference for the exported React component and its props."
---

Import path: `godlights`  
Source file: `packages/godlights/src/GodLights.tsx`

## Signature

```tsx
export function GodLights({
  scene,
  animParams,
  showFps = false,
  className,
  style,
}: GodLightsProps)
```

`GodLights` renders a wrapper `<div>` plus one or two `<canvas>` elements. When `animParams` is provided it creates a second grain overlay canvas and drives rendering with `requestAnimationFrame`. Without `animParams` it draws a single static frame.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `scene` | `SceneConfig` | — | Required layered scene description. |
| `animParams` | `AnimParams` | `undefined` | When present, starts the animation loop. Omit for a static render. |
| `showFps` | `boolean` | `false` | Renders a small FPS badge in animated mode. |
| `className` | `string` | — | CSS class for the outer wrapper. |
| `style` | `React.CSSProperties` | — | Inline style merged onto the outer wrapper. |

## Import

```tsx
import { GodLights } from "godlights";
import type { GodLightsProps } from "godlights";
```

## Usage Example

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
      type: "background",
      bgType: "solid",
      bgColor: "#000000",
      bgColor2: "#000000",
      bgGradientAngle: 180,
    },
  ],
};

export function Background() {
  return <GodLights scene={scene} className="w-full h-[360px]" />;
}
```

## Animated Usage

```tsx
<GodLights
  scene={scene}
  animParams={{ speed: 1.2, angleAmp: 30, lengthAmp: 20, widthAmp: 8, haloAmp: 25 }}
  showFps
  style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
/>
```

## Behavioral Notes

- Static mode (no `animParams`) schedules a single `requestAnimationFrame` to size the canvas and draw once.
- Animated mode keeps the latest `scene` and `animParams` in refs so prop updates do not require rebuilding the loop.
- Grain is rendered to a second canvas only when `animParams` is present and `scene.noise > 0`.
- The wrapper starts with `position: "relative"` and `overflow: "hidden"`.

## Common Patterns

```tsx
function FullBleedBackground({ scene }: { scene: SceneConfig }) {
  return (
    <div style={{ position: "relative", minHeight: 600 }}>
      <GodLights
        scene={scene}
        animParams={{ speed: 1, angleAmp: 40, lengthAmp: 25, widthAmp: 15, haloAmp: 40 }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>Content</div>
    </div>
  );
}
```

Related pages: [Rendering Functions](/docs/api-reference/rendering-functions), [Animation System](/docs/animation-system), [Types](/docs/types)
