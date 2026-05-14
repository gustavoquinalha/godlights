---
title: "Export Helpers"
description: "Reference for image export and CSS generation helpers in the Godlights package."
---

Import path: `godlights`  
Source file: `packages/godlights/src/godrays.ts`

## `exportScene`

```ts
export async function exportScene(
  scene: SceneConfig,
  type: "image/png" | "image/jpeg",
  quality = 0.95
): Promise<Blob>
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `scene` | `SceneConfig` | — | Scene rendered on a temporary offscreen canvas. |
| `type` | `"image/png"` or `"image/jpeg"` | — | Output MIME type. |
| `quality` | `number` | `0.95` | JPEG quality, ignored for PNG. |

Example:

```ts
const blob = await exportScene(scene, "image/png");
```

## `buildSceneCssSnippet`

```ts
export async function buildSceneCssSnippet(
  scene: SceneConfig
): Promise<string>
```

This renders the scene to a PNG data URL and returns CSS lines for `background-image`, `background-size`, `background-position`, and `background-repeat`.

Example:

```ts
const css = await buildSceneCssSnippet(scene);
```

## Common Workflow

```ts
import { buildSceneCssSnippet, exportScene } from "godlights";

async function exportAssets(scene: SceneConfig) {
  const png = await exportScene(scene, "image/png");
  const css = await buildSceneCssSnippet(scene);
  return { png, css };
}
```

<Callout type="info">All export helpers create a temporary canvas internally. They do not depend on the React component, and they always render a static frame with `time = 0`.</Callout>

Related pages: [Rendering Functions](/docs/api-reference/rendering-functions)
