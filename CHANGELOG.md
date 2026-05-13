# Changelog

All notable changes to the `godlights` npm package are documented here.

## [0.1.2] — 2026-05-13

### Added
- **shadcn registry** — three ready-made components installable via `npx shadcn@latest add`:
  - `god-lights-hero` — animated hero section with `color` prop
  - `god-lights-background` — minimal wrapper with `color`, `bgColor`, `animate` props
  - `god-lights-cycling` — auto-cycling presets with smooth cross-fade
- **Cursor rules templates** — `godlights.mdc` (`.cursor/rules/` format) and `godlights.cursorrules` (legacy), downloadable from `godlights.io`
- **StackBlitz examples** — three standalone runnable examples:
  - `examples/basic/` — Vite + React with color switcher
  - `examples/presets/` — all 14 presets in a sidebar gallery (Vite + React)
  - `examples/nextjs/` — same gallery rebuilt with Next.js 15 App Router
- **Guides** — seven new in-depth guides indexed by Context7: SSR & Next.js, reactive scene updates, preset transitions, performance optimization, reusable wrapper component, canvas export workflow, AI tools setup
- **Docs site** — Guides and AI tools sections added to godlights.io/docs

### Changed
- **npm keywords** expanded: `light-beams`, `volumetric-light`, `background`, `hero`, `glow`, `typescript`, `nextjs`, `vite`
- **package README** — StackBlitz badge, shadcn registry install block, Cursor rules links added to AI/LLM usage section; badge label fixed (`godlights.io`)
- **llms.txt** — added Cursor rules and shadcn registry sections
- **llms-full.txt** — added shadcn registry install line to header
- All URLs updated from `godlights.vercel.app` to `www.godlights.io` (26 occurrences across 9 files)

## [0.1.1] — 2025-05-13

### Added
- Context7 integration — docs indexed at `context7.com/gustavoquinalha/godlights` for automatic LLM context
- Machine-readable docs: `llms.txt` (quick start) and `llms-full.txt` (full API reference) served from the editor
- Real-world recipes in the package README: hero section, Next.js App Router, light background, multi-layer scenes, transparent overlay, reactive scenes, preset transitions, performance optimization, reusable wrapper component
- Guides in `docs/codedocs/`: SSR/Next.js, reactive updates, preset transitions, performance optimization, reusable wrapper, canvas export workflow
- CI: npm trusted publisher workflow with provenance via GitHub Actions

### Changed
- Package README expanded with JSDoc-level field descriptions, blend mode guide, common mistakes, and `AnimParams` reference
- `buildSceneCssSnippet` added to utility exports documentation (was missing)
- Corrected blend mode guidance for light backgrounds across all docs

## [0.1.0] — 2025

### Added
- `<GodLights>` React component with `requestAnimationFrame` animation loop
- Layered scene model: `BackgroundLayer`, `RayLayer`, `HaloLayer`
- `SceneConfig` and `AnimParams` TypeScript interfaces
- `drawScene` for canvas rendering without React
- `exportScene` for PNG/JPEG export
- `buildSceneCssSnippet` for CSS `background-image` export
- `DEFAULT_SCENE`, `DEFAULT_RAY_LAYER`, `DEFAULT_HALO_LAYER`, `DEFAULT_BACKGROUND_LAYER`, `DEFAULT_ANIM_PARAMS` exports
- `BLEND_MODES` constant
- Film grain overlay via a static `OffscreenCanvas` in animated mode (grain drawn once, not per frame)
- `showFps` debug prop
- Deterministic ray layout via `mulberry32` seeded RNG (`seed` field on `RayLayer`)
- Visual editor at `godlights.vercel.app` with JSX/PNG/CSS export
- 14+ built-in presets
