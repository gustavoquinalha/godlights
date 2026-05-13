---
title: "SSR and Next.js"
description: "How to use Godlights with Next.js App Router, Pages Router, and any SSR framework without hydration errors."
---

`<GodLights>` uses `useRef`, `useEffect`, and `requestAnimationFrame` — all browser-only APIs. Server-side rendering will throw if you try to render the component on the server.

## Next.js App Router

Add `"use client"` at the top of any file that imports from `godlights`. This marks the file as a Client Component and prevents Next.js from rendering it on the server.

```tsx
"use client";

import { GodLights } from "godlights";
import type { SceneConfig } from "godlights";

const scene: SceneConfig = { ... };

export function HeroBackground() {
  return (
    <div style={{ position: "relative", height: "100vh" }}>
      <GodLights
        scene={scene}
        animate
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
    </div>
  );
}
```

Then import and use the component normally in a Server Component:

```tsx
// app/page.tsx — Server Component, no "use client" needed here
import { HeroBackground } from "./HeroBackground";

export default function Page() {
  return (
    <main>
      <HeroBackground />
    </main>
  );
}
```

## Next.js Pages Router

Use `next/dynamic` with `ssr: false` to disable server-side rendering for the component.

```tsx
import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { GodLightsProps } from "godlights";

const GodLights = dynamic(
  () => import("godlights").then((m) => m.GodLights),
  { ssr: false }
);

export default function HomePage() {
  return (
    <div style={{ position: "relative", height: "100vh" }}>
      <GodLights
        scene={scene}
        animate
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
    </div>
  );
}
```

## Remix

Use the `ClientOnly` pattern or a lazy import inside a `useEffect`:

```tsx
import { useEffect, useState } from "react";
import type { SceneConfig } from "godlights";

const scene: SceneConfig = { ... };

export function HeroBackground() {
  const [GodLights, setGodLights] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    import("godlights").then((m) => setGodLights(() => m.GodLights));
  }, []);

  if (!GodLights) return null;

  return (
    <div style={{ position: "relative", height: "100vh" }}>
      <GodLights
        scene={scene}
        animate
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
    </div>
  );
}
```

## Vite / plain React

No special setup needed. `useEffect` and `requestAnimationFrame` are always available in browser environments.

## Common error messages

**`Error: useEffect is not defined`** or **`ReferenceError: window is not defined`**
→ The component is rendering on the server. Add `"use client"` (App Router) or use `dynamic(..., { ssr: false })` (Pages Router).

**`Hydration failed because the initial UI does not match`**
→ The component rendered different HTML on server vs client. Same fix as above — prevent server rendering entirely.

**`Cannot read properties of null (reading 'getContext')`**
→ The canvas ref is not attached yet. This should not happen in normal usage — if you see it, ensure you are not calling `drawScene` before the component mounts.
