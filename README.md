# Godlights

**Animated god ray / light beam effects for React.** A visual editor to design volumetric light scenes and export them as PNG, CSS, or a ready-to-use React component.

[![Live demo](https://img.shields.io/badge/Live%20demo-godlights.vercel.app-black?style=flat-square)](https://godlights.vercel.app)
[![npm](https://img.shields.io/npm/v/godlights?style=flat-square&color=black)](https://www.npmjs.com/package/godlights)
[![License: MIT](https://img.shields.io/badge/license-MIT-black?style=flat-square)](./packages/godlights/README.md)

![Godlights editor](https://godlights.vercel.app/app.png)

---

## npm package

The rendering engine is available as a standalone React package:

```bash
npm install godlights
```

```tsx
import { GodLights } from "godlights";

<GodLights
  scene={scene}
  animate
  animParams={{ speed: 1.5, angleAmp: 40, lengthAmp: 30, widthAmp: 20, haloAmp: 50 }}
  style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
/>
```

→ [Package docs](./packages/godlights/README.md) · [Full API reference](https://godlights.vercel.app/docs)

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
├── public/                     # Static assets
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
