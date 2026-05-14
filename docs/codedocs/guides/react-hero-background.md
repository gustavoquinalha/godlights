---
title: "React Hero Background"
description: "Build a full-bleed animated hero background with the GodLights React component."
---

This guide solves the most common production use case for Godlights: render an animated light scene behind normal page content without turning your component tree into canvas code.

## Problem

You want a decorative background that stays behind real content, fills the parent section, animates smoothly, and does not force the rest of the page to know anything about canvas rendering.

## Solution

Use `<GodLights>` as an absolutely positioned child inside a relatively positioned container. Keep your `scene` object stable, pass explicit inline styles for full bleed, and let the component manage the frame loop.

<Steps>
  <Step>
### Define a stable scene

```tsx
import { useMemo } from "react";
import type { SceneConfig } from "godlights";

export function useHeroScene(): SceneConfig {
  return useMemo(
    () => ({
      width: 1920,
      height: 1080,
      noise: 8,
      grainSize: 1,
      layers: [
        {
          type: "background",
          bgType: "gradient",
          bgColor: "#050816",
          bgColor2: "#0b1024",
          bgGradientAngle: 180,
        },
        {
          type: "halo",
          originX: 18,
          originY: 5,
          color: "#ffffff",
          intensity: 0.18,
          size: 0.46,
          blendMode: "lighter",
        },
        {
          type: "rays",
          direction: 160,
          spread: 65,
          originX: 14,
          originY: -16,
          rayCount: 24,
          rayWidth: 76,
          divergence: 1.9,
          rayLength: 0.82,
          opacity: 0.2,
          blendMode: "screen",
          colorStart: "#ffffff",
          colorEnd: "#ffffff",
          fadeToTransparent: true,
          blur: 18,
          randomnessWidth: 75,
          randomnessLength: 25,
          randomnessAngle: 8,
          seed: 42,
        },
      ],
    }),
    []
  );
}
```

  </Step>
  <Step>
### Mount `GodLights` behind your content

```tsx
import { GodLights } from "godlights";
import type { AnimParams } from "godlights";

const animParams: AnimParams = {
  speed: 1.1,
  angleAmp: 35,
  lengthAmp: 20,
  widthAmp: 8,
  haloAmp: 30,
};

export function HeroSection() {
  const scene = useHeroScene();

  return (
    <section style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      <GodLights
        scene={scene}
        animParams={animParams}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />

      <div style={{ position: "relative", zIndex: 1, padding: "8rem 2rem", color: "white" }}>
        <p>Shipping visuals without a shader pipeline</p>
        <h1>Layered light scenes in React</h1>
      </div>
    </section>
  );
}
```

  </Step>
  <Step>
### Tune the scene for the background color

```tsx
const darkScene = {
  rayBlendMode: "screen",
  haloBlendMode: "lighter",
};

const lightScene = {
  rayBlendMode: "overlay",
  haloBlendMode: "soft-light",
};
```

For dark backgrounds, the source defaults are usually correct. For light layouts, avoid additive modes that wash out.

  </Step>
</Steps>

## Complete Component

```tsx
"use client";

import { useMemo } from "react";
import { GodLights } from "godlights";
import type { AnimParams, SceneConfig } from "godlights";

const animParams: AnimParams = {
  speed: 1.1,
  angleAmp: 35,
  lengthAmp: 20,
  widthAmp: 8,
  haloAmp: 30,
};

export default function HeroSection() {
  const scene: SceneConfig = useMemo(
    () => ({
      width: 1920,
      height: 1080,
      noise: 8,
      grainSize: 1,
      layers: [
        {
          type: "background",
          bgType: "gradient",
          bgColor: "#050816",
          bgColor2: "#0b1024",
          bgGradientAngle: 180,
        },
        {
          type: "halo",
          originX: 18,
          originY: 5,
          color: "#ffffff",
          intensity: 0.18,
          size: 0.46,
          blendMode: "lighter",
        },
        {
          type: "rays",
          direction: 160,
          spread: 65,
          originX: 14,
          originY: -16,
          rayCount: 24,
          rayWidth: 76,
          divergence: 1.9,
          rayLength: 0.82,
          opacity: 0.2,
          blendMode: "screen",
          colorStart: "#ffffff",
          colorEnd: "#ffffff",
          fadeToTransparent: true,
          blur: 18,
          randomnessWidth: 75,
          randomnessLength: 25,
          randomnessAngle: 8,
          seed: 42,
        },
      ],
    }),
    []
  );

  return (
    <section style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      <GodLights
        scene={scene}
        animParams={animParams}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />

      <div style={{ position: "relative", zIndex: 1, padding: "8rem 2rem", color: "#fff" }}>
        <p>Decorative background</p>
        <h1>Godlights in a hero section</h1>
      </div>
    </section>
  );
}
```

<Callout type="warn">Do not rely on `className="absolute"` alone for full-bleed positioning. `GodLights.tsx` merges `style` on top of its wrapper defaults, so inline `style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}` is the reliable path documented in the source.</Callout>
