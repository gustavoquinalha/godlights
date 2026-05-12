# AGENTS.md

Context for AI agents working on this codebase.

## What this is

A monorepo with two parts:

- `packages/godlights` — the npm library (React canvas component for god ray effects)
- `src/` — the website/editor (React + Vite + Tailwind + shadcn/ui)

## Running locally

```bash
npm install
npm run dev          # website at localhost:5173
npm run build:pkg    # build the godlights package
```

## Routing

Client-side, handled in `src/App.tsx` via `window.location.pathname`. No router library. Adding a page = add a branch in the path switch and create `src/pages/NewPage.tsx`.

Current routes: `/` → LandingPage, `/editor` → GodRaysGenerator, `/presets` → PresetsPage, `/docs` → DocsPage, `/og-export` → OgExportPage (internal tool).

## UI rules

- **Always use shadcn/ui components** — `Button`, `Input`, `Select`, `Slider`, `Popover`, etc. from `src/components/ui/`. Never use raw `<button>`, `<input>`, or `<select>`.
- shadcn components live in `src/components/ui/`. Add new ones with `npx shadcn@latest add <name>`.
- Tailwind v4. Use `cn()` from `src/lib/utils.ts` for conditional classes.
- Theme via `useTheme()` from `src/components/theme-provider.tsx`. Dark mode is default.

## GodLights usage pattern

```tsx
import { GodLights } from "godlights";
import { DEFAULT_RAY_LAYER, DEFAULT_HALO_LAYER } from "godlights";
import type { SceneConfig, RayLayer, HaloLayer, BackgroundLayer } from "godlights";

// Background must always be the first layer with id "background"
const scene: SceneConfig = {
  width: 1920, height: 1080, noise: 8, grainSize: 1,
  layers: [bgLayer, ...rayOrHaloLayers],
};

<GodLights scene={scene} animate animParams={{ speed: 1, angleAmp: 20 }} style={{ ... }} />
```

- Use `"transparent"` as `bgColor` when the canvas should sit over a page background.
- Presets live in `src/lib/presets.ts` as shape-only layers. Always spread `DEFAULT_RAY_LAYER` / `DEFAULT_HALO_LAYER` before applying preset layers, then override `colorStart`/`colorEnd`/`color`.
- `blendMode: "screen"` / `"lighter"` are additive — invisible on white. Swap to `"multiply"` in light mode.

## Page backgrounds

LandingPage, PresetsPage, and DocsPage all have a `<GodLights>` canvas as a `fixed inset-0 pointer-events-none z-0` background. Content sits at `relative z-10`. Use slow `animParams` (speed ≤ 1, low amps) so it doesn't compete with content.

## Editor (`GodRaysGenerator.tsx`)

The main editor is one large component (~3000 lines). Key derived state:

- `bgLayer` — the background layer (always `id: "background"`)
- `nonBgLayers` — all ray/halo layers
- `selectedLayerId` — `null` = show layer list, `"background"` = show bg controls, any other id = show that layer's controls

Preset key is tracked in `activeRaysPreset` state and also read from `?preset=` URL param on init.

## Publishing the npm package

Triggered by creating a GitHub Release. The workflow at `.github/workflows/publish.yml` builds and publishes with `--provenance`. Requires `NPM_TOKEN` secret in the repo.

## Commit style

``` txt
feat: short description
fix: short description
chore: short description
docs: short description
ci: short description
```
