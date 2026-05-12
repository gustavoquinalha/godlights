# Godlights

**Design animated light beam scenes in React. Export as PNG, CSS, or component.**

[![Live demo](https://img.shields.io/badge/Live%20demo-godlights.vercel.app-black?style=flat-square)](https://godlights.vercel.app)
[![npm](https://img.shields.io/npm/v/godlights?style=flat-square&color=black)](https://www.npmjs.com/package/godlights)
[![License: MIT](https://img.shields.io/badge/license-MIT-black?style=flat-square)](./packages/godlights/README.md)
[![Context7](https://img.shields.io/badge/Context7-docs-black?style=flat-square)](https://context7.com/gustavoquinalha/godlights)

![Godlights editor](https://godlights.vercel.app/app.gif)

---

## npm package

The rendering engine is available as a standalone React package with zero runtime dependencies.

```bash
npm install godlights
```

```tsx
import { GodLights } from "godlights";
import type { SceneConfig } from "godlights";

// "Corner haze" — first preset from the editor
const scene: SceneConfig = {
  width: 1920,
  height: 1080,
  noise: 8,
  grainSize: 1,
  layers: [
    {
      id: "background",
      type: "background",
      bgType: "solid",
      bgColor: "#000000",
      bgColor2: "#000000",
      bgGradientAngle: 180,
    },
    {
      id: "rays-1",
      name: "Rays 1",
      type: "rays",
      direction: 158,
      spread: 70,
      originX: 12,
      originY: -25,
      rayCount: 28,
      rayWidth: 90,
      divergence: 1.5,
      rayLength: 0.6,
      colorStart: "#ffffff",
      colorEnd: "#ffffff",
      opacity: 0.24,
      blendMode: "screen",
      fadeToTransparent: true,
      blur: 17.5,
      randomnessWidth: 100,
      randomnessLength: 24,
      randomnessAngle: 0,
      seed: 554433,
    },
    {
      id: "halo-1",
      name: "Halo 1",
      type: "halo",
      originX: 16,
      originY: 2,
      color: "#ffffff",
      intensity: 0.16,
      size: 0.47,
      blendMode: "lighter",
    },
  ],
};

export default function App() {
  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <GodLights
        scene={scene}
        animate
        animParams={{ speed: 1.5, angleAmp: 40, lengthAmp: 30, widthAmp: 20, haloAmp: 50 }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
    </div>
  );
}
```

→ [Full package docs & API reference](./packages/godlights/README.md) · [Interactive docs](https://godlights.vercel.app/docs)

---

## Editor features

- **Multi-layer scenes** — stack rays, halos and backgrounds in any order
- **Live preview** — animated canvas with pan & zoom
- **14+ presets** — searchable and filterable by style
- **Export** — PNG, JPG, CSS `background-image`, JSON config, JSX component
- **Share** — encode the full scene into a URL (`/editor?scene=...`)
- **Save slots** — persist scenes in localStorage
- **Light / dark mode**

---

## AI / LLM usage

Godlights ships machine-readable documentation designed for LLM consumption:

| Resource | Purpose |
|----------|---------|
| [context7.com/gustavoquinalha/godlights](https://context7.com/gustavoquinalha/godlights) | Auto-loaded by Claude, Cursor, Copilot via Context7 MCP |
| [`/llms.txt`](https://godlights.vercel.app/llms.txt) | Quick start, common mistakes, key constraints |
| [`/llms-full.txt`](https://godlights.vercel.app/llms-full.txt) | Complete API reference, all types with ranges, full examples |

If you're asking an AI assistant (Cursor, Copilot, Claude, etc.) to generate a scene, point it at one of these files for accurate results. The most common LLM mistakes are documented there: missing `BackgroundLayer`, wrong blend mode on light backgrounds, and using `opacityAmp` (which doesn't exist).

**With Context7 MCP installed**, just ask: _"use context7 — add a godlights animated background to my Next.js hero section"_ and the assistant fetches the right docs automatically.

---

## Monorepo structure

```
/
├── src/                        # Editor app (React + Vite + Tailwind + shadcn/ui)
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── PresetsPage.tsx
│   │   ├── DocsPage.tsx
│   │   └── PreviewPage.tsx
│   ├── components/
│   │   ├── GodRaysGenerator.tsx  # main editor UI
│   │   └── ui/                   # shadcn components
│   └── lib/
│       ├── presets.ts
│       ├── share.ts              # URL encode/decode
│       └── utils.ts
├── packages/
│   └── godlights/              # npm package
│       ├── src/
│       │   ├── GodLights.tsx   # React component
│       │   ├── godrays.ts      # Canvas 2D rendering engine
│       │   └── index.ts
│       └── package.json
├── public/
│   ├── llms.txt                # AI-friendly quick start
│   └── llms-full.txt           # Full API reference for LLMs
└── index.html
```

---

## Running locally

```bash
npm install
npm run dev        # editor app → http://localhost:5173
npm run build      # production build
npm run build:pkg  # build the godlights npm package
```

---

## Stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** + **shadcn/ui** + **Radix UI**
- **Canvas 2D** rendering engine (zero runtime deps in the package)
- **lucide-react** icons · **react-colorful** color picker
