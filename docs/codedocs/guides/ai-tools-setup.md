---
title: "Using Godlights with AI Tools"
description: "Set up Cursor, v0, Bolt, Lovable, and Claude to generate accurate Godlights scenes automatically."
---

AI coding tools work best with Godlights when they have the right context. This guide covers three complementary approaches: Cursor rules (passive, always-on), the shadcn registry (instant component install), and Context7 (on-demand docs for any AI).

## Cursor rules

Cursor rules teach the editor to use Godlights whenever you ask for light effects, animated backgrounds, or hero sections — without you having to paste docs manually.

### New Cursor format (`.cursor/rules/`)

```bash
curl -o .cursor/rules/godlights.mdc https://www.godlights.io/godlights.mdc
```

### Legacy format (`.cursorrules`)

```bash
curl -o .cursorrules https://www.godlights.io/godlights.cursorrules
```

Once added, Cursor will automatically apply the rules when you ask for things like:

- "add an animated background to this hero section"
- "create a god ray effect behind the navbar"
- "make this section have a glowing light background"

The rules file includes the critical constraints (BackgroundLayer, blend modes, AnimParams, `"use client"`) so Cursor doesn't generate broken scenes.

---

## shadcn registry (v0, Bolt, Lovable, Cursor)

Install a ready-made component directly into your project — no manual configuration needed:

```bash
# Hero section with animated rays and color prop
npx shadcn@latest add "https://www.godlights.io/r/god-lights-hero.json"

# Minimal background wrapper (color, bgColor, animate props)
npx shadcn@latest add "https://www.godlights.io/r/god-lights-background.json"

# Auto-cycling presets with smooth cross-fade
npx shadcn@latest add "https://www.godlights.io/r/god-lights-cycling.json"
```

The CLI installs the `.tsx` file and adds `godlights` as a dependency automatically.

### Usage after install

```tsx
import { GodLightsHero } from "@/components/god-lights-hero";

export function HeroSection() {
  return (
    <GodLightsHero color="#a78bfa">
      <h1>Your content here</h1>
    </GodLightsHero>
  );
}
```

```tsx
import { GodLightsBackground } from "@/components/god-lights-background";

export function Section() {
  return (
    <GodLightsBackground color="#34d399" bgColor="#060f08" style={{ minHeight: "100vh" }}>
      <p>Content over animated rays</p>
    </GodLightsBackground>
  );
}
```

### In v0

Ask v0 to use the registry directly:

> "Use the component at `https://www.godlights.io/r/god-lights-hero.json` to add an animated background to this hero section."

---

## Context7 (Claude, Cursor, Copilot)

[Context7](https://context7.com/gustavoquinalha/godlights) indexes the full Godlights documentation and makes it available to any AI that has the Context7 MCP installed.

With Context7 MCP active, just ask:

> "use context7 — add a godlights animated hero background in Next.js"

The assistant fetches accurate, up-to-date docs automatically — no copy-pasting needed.

### Paste docs manually (any AI)

If your tool doesn't have Context7 MCP, paste the docs directly:

```
https://context7.com/gustavoquinalha/godlights/llms.txt?tokens=10000
```

Or use the static files:
- Quick start: `https://www.godlights.io/llms.txt`
- Full API reference: `https://www.godlights.io/llms-full.txt`

---

## Which approach to use

| Goal | Approach |
|------|----------|
| Cursor generates correct scenes automatically | Add `.cursor/rules/godlights.mdc` |
| Install a component in seconds via CLI or v0 | shadcn registry (`npx shadcn@latest add ...`) |
| Ask any AI assistant to build a scene | Paste `llms-full.txt` or use Context7 MCP |
| Generate a custom preset visually | [godlights.io/editor](https://www.godlights.io/editor) → export as JSX |

---

## Common AI mistakes to watch for

Regardless of the tool, verify these when reviewing AI-generated Godlights code:

1. **Missing `BackgroundLayer`** — `layers[0]` must be `type: "background"`. Without it, rays smear in animated mode.
2. **Wrong blend mode** — `"screen"` and `"lighter"` are invisible on light/white backgrounds. Use `"overlay"` or `"soft-light"` instead.
3. **`opacityAmp` in `animParams`** — this field does not exist. Remove it.
4. **Missing `"use client"`** — required in Next.js App Router. Without it you get a hydration error.
5. **`scene` constructed inline** — causes unnecessary redraws. Wrap in `useMemo` or define outside the component.
