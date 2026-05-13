# Godlights — Examples

Live, runnable examples for the [godlights](https://www.npmjs.com/package/godlights) npm package.  
Each example opens instantly on StackBlitz — no local setup needed.

---

## Basic (Vite + React)

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/gustavoquinalha/godlights/tree/main/examples/basic)

A minimal single-page app with a color switcher (Purple / Green / Red / Blue). Shows the core pattern: defining `SceneConfig` outside the component, using `useMemo` for reactive updates, and positioning the canvas as a full-bleed background.

**What it covers:**
- `SceneConfig` with `BackgroundLayer` + `HaloLayer` + `RayLayer`
- `animate` + `animParams` for the RAF loop
- Reactive color change via `useMemo`
- Full-bleed positioning with `position: absolute, inset: 0`

---

## Presets gallery (Vite + React)

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/gustavoquinalha/godlights/tree/main/examples/presets)

All 14 built-in presets in a sidebar gallery. Click any preset to switch instantly. Each preset uses a distinct color palette to show the range of available styles.

**Presets included:** Corner haze, Left spot, Corner flare, Soft corner, Canopy, Aurora, Beam array, Twin beam, Right wash, Projector, Fan, Left light, Rim light, Dusk.

**What it covers:**
- All 14 `SceneConfig` presets with complete layer definitions
- Switching scenes by swapping the `scene` prop (no flash, no remount)
- Multi-layer scenes (multiple `RayLayer` + `HaloLayer` in a single scene)
- `key` prop on `<GodLights>` to reset animation state on preset change

---

## Next.js App Router

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/gustavoquinalha/godlights/tree/main/examples/nextjs)

The same 14-preset gallery rebuilt with Next.js 15 App Router. Demonstrates the correct server/client split: a static Server Component as the page entry point, and a `"use client"` component for the interactive canvas.

**What it covers:**
- `"use client"` placement — only the interactive component needs it, not the page
- Server Component (`app/page.tsx`) importing a Client Component (`PresetGallery.tsx`)
- No `dynamic(() => import(...), { ssr: false })` needed when `"use client"` is used correctly
- Same `SceneConfig` definitions work identically in Vite and Next.js

---

## Install any preset into your project

Use the [shadcn CLI](https://ui.shadcn.com/docs/cli) to install a ready-made component directly:

```bash
# Hero section with animated rays
npx shadcn@latest add "https://www.godlights.io/r/god-lights-hero.json"

# Minimal background wrapper
npx shadcn@latest add "https://www.godlights.io/r/god-lights-background.json"

# Auto-cycling presets with cross-fade
npx shadcn@latest add "https://www.godlights.io/r/god-lights-cycling.json"
```

## Links

- [npm](https://www.npmjs.com/package/godlights)
- [Docs](https://www.godlights.io/docs)
- [Live editor](https://www.godlights.io)
- [Full API reference](https://www.godlights.io/llms-full.txt)
