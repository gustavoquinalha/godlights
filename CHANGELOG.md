# Changelog

All notable changes to the `godlights` npm package are documented here.

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
