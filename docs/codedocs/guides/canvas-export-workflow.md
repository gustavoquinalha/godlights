---
title: "Canvas Export Workflow"
description: "Render Godlights scenes without React and export them as image blobs or CSS snippets."
---

This guide covers the non-React path: drawing scenes into an existing canvas, exporting them to PNG or JPEG, and generating CSS that embeds the rendered image as a background.

## Problem

You need the rendered output, not necessarily the React component. Typical examples are OG images, CMS asset generation, a design tool export button, or a plain canvas app.

## Solution

Use the `drawScene`, `exportScene`, and `buildSceneCssSnippet` exports from `godlights`. They all share `SceneConfig`, so you can preview, export, and embed the same artwork without translating your data.

<Steps>
  <Step>
### Define the scene once

```ts
import type { SceneConfig } from "godlights";

export const scene: SceneConfig = {
  width: 1200,
  height: 630,
  noise: 6,
  grainSize: 1,
  layers: [
    {
      id: "background",
      type: "background",
      bgType: "gradient",
      bgColor: "#0b1024",
      bgColor2: "#050816",
      bgGradientAngle: 180,
    },
    {
      id: "halo-og",
      name: "Glow",
      type: "halo",
      originX: 22,
      originY: 12,
      color: "#93c5fd",
      intensity: 0.18,
      size: 0.32,
      blendMode: "lighter",
    },
    {
      id: "rays-og",
      name: "Rays",
      type: "rays",
      direction: 165,
      spread: 58,
      originX: 16,
      originY: -10,
      rayCount: 18,
      rayWidth: 54,
      divergence: 1.8,
      rayLength: 0.8,
      opacity: 0.22,
      blendMode: "screen",
      colorStart: "#93c5fd",
      colorEnd: "#93c5fd",
      fadeToTransparent: true,
      blur: 12,
      randomnessWidth: 40,
      randomnessLength: 20,
      randomnessAngle: 8,
      seed: 404,
    },
  ],
};
```

  </Step>
  <Step>
### Draw to an existing canvas

```ts
import { drawScene } from "godlights";
import { scene } from "./scene";

const canvas = document.querySelector("canvas") as HTMLCanvasElement;
canvas.width = scene.width;
canvas.height = scene.height;

drawScene(canvas, scene);
```

This is the direct path used under the React wrapper as well.

  </Step>
  <Step>
### Export a file or CSS snippet

```ts
import { buildSceneCssSnippet, exportScene } from "godlights";
import { scene } from "./scene";

const pngBlob = await exportScene(scene, "image/png");
const cssSnippet = await buildSceneCssSnippet(scene);

console.log(pngBlob.type);
console.log(cssSnippet);
```

  </Step>
</Steps>

## Complete Example

```ts
import { buildSceneCssSnippet, drawScene, exportScene } from "godlights";
import type { SceneConfig } from "godlights";

const scene: SceneConfig = {
  width: 1200,
  height: 630,
  noise: 6,
  grainSize: 1,
  layers: [
    {
      id: "background",
      type: "background",
      bgType: "gradient",
      bgColor: "#0b1024",
      bgColor2: "#050816",
      bgGradientAngle: 180,
    },
    {
      id: "halo-og",
      name: "Glow",
      type: "halo",
      originX: 22,
      originY: 12,
      color: "#93c5fd",
      intensity: 0.18,
      size: 0.32,
      blendMode: "lighter",
    },
    {
      id: "rays-og",
      name: "Rays",
      type: "rays",
      direction: 165,
      spread: 58,
      originX: 16,
      originY: -10,
      rayCount: 18,
      rayWidth: 54,
      divergence: 1.8,
      rayLength: 0.8,
      opacity: 0.22,
      blendMode: "screen",
      colorStart: "#93c5fd",
      colorEnd: "#93c5fd",
      fadeToTransparent: true,
      blur: 12,
      randomnessWidth: 40,
      randomnessLength: 20,
      randomnessAngle: 8,
      seed: 404,
    },
  ],
};

async function run() {
  const canvas = document.querySelector("canvas") as HTMLCanvasElement;
  canvas.width = scene.width;
  canvas.height = scene.height;

  drawScene(canvas, scene);

  const blob = await exportScene(scene, "image/png");
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "godlights-og.png";
  link.click();
  URL.revokeObjectURL(url);

  const css = await buildSceneCssSnippet(scene);
  console.log(css);
}

run();
```

" "CSS snippet"]}>
  <Tab value="PNG export">

```ts
const blob = await exportScene(scene, "image/png");
```

  </Tab>
  <Tab value="JPEG export">

```ts
const blob = await exportScene(scene, "image/jpeg", 0.92);
```

  </Tab>
  <Tab value="CSS snippet">

```ts
const css = await buildSceneCssSnippet(scene);
```

  </Tab>
</Tabs>

<Callout type="warn">`drawScene` does not resize the canvas for you. The source explicitly reads `const { width, height } = canvas` and uses those dimensions for rendering, so set `canvas.width` and `canvas.height` to match the scene before drawing.</Callout>
