import React from "react";
import { Check, Copy } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { GodLights, DEFAULT_RAY_LAYER, DEFAULT_HALO_LAYER } from "godlights";
import type {
  SceneConfig,
  RayLayer,
  HaloLayer,
  BackgroundLayer,
  Layer,
} from "godlights";
import { RAYS_PRESETS, type RaysPreset } from "@/lib/presets";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="bg-muted text-foreground/90 px-1.5 py-0.5 rounded text-[12px] font-mono">
      {children}
    </code>
  );
}

function CodeBlock({
  filename,
  children,
}: {
  filename?: string;
  children: string;
}) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children.trim()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="rounded-lg border border-border bg-card/90 backdrop-blur-md overflow-hidden text-sm">
      <div className="flex items-center justify-between border-b border-border bg-background/20 backdrop-blur-md pl-4 pr-2 py-1.5">
        <span className="text-[11px] font-mono text-muted-foreground">
          {filename ?? ""}
        </span>
        <Button
          size={"xs"}
          variant={"ghost"}
          onClick={handleCopy}
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="size-3 text-foreground" />
              <span className="text-foreground">Copied</span>
            </>
          ) : (
            <>
              <Copy className="size-3" />
              <span>Copy</span>
            </>
          )}
        </Button>
      </div>
      <pre className="overflow-auto max-h-96 p-4 text-[12.5px] leading-relaxed font-mono text-foreground/85">
        <code>{children.trim()}</code>
      </pre>
    </div>
  );
}

// ── Live preview helpers ──────────────────────────────────────────────────────

const PREVIEW_ANIM = {
  speed: 1.5,
  angleAmp: 40,
  lengthAmp: 30,
  widthAmp: 20,
  haloAmp: 50,
};

function presetToScene(preset: RaysPreset, bgColor = "#000000"): SceneConfig {
  const bg: BackgroundLayer = {
    id: "background",
    type: "background",
    bgType: "solid",
    bgColor,
    bgColor2: bgColor,
    bgGradientAngle: 180,
  };
  const layers = preset.layers.map((l, i) =>
    l.type === "rays"
      ? ({
          ...DEFAULT_RAY_LAYER,
          ...l,
          id: `rays-${i + 1}`,
          name: `Rays ${i + 1}`,
          colorStart: "#ffffff",
          colorEnd: "#ffffff",
        } as RayLayer)
      : ({
          ...DEFAULT_HALO_LAYER,
          ...l,
          id: `halo-${i + 1}`,
          name: `Halo ${i + 1}`,
          color: "#ffffff",
        } as HaloLayer)
  );
  return {
    width: 1920,
    height: 1080,
    noise: 8,
    grainSize: 1,
    layers: [bg, ...layers],
  };
}

function fmtVal(v: unknown): string {
  if (typeof v === "string") return `"${v}"`;
  return String(v);
}

function layerToCode(layer: Layer, i: number): string {
  const pad = "      ";
  const entries = (Object.entries(layer) as [string, unknown][])
    .map(([k, v]) => `${pad}${k}: ${fmtVal(v)},`)
    .join("\n");
  return `    { // layer ${i}\n${entries}\n    }`;
}

function sceneToCode(preset: RaysPreset): string {
  const scene = presetToScene(preset);
  const layersCode = scene.layers.map(layerToCode).join(",\n");
  return `import { GodLights } from "godlights";
import type { SceneConfig } from "godlights";

// "${preset.label}" preset
const scene: SceneConfig = {
  width: 1920,
  height: 1080,
  noise: 8,
  grainSize: 1,
  layers: [
${layersCode},
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
}`;
}

function LivePreview() {
  const [active, setActive] = React.useState(RAYS_PRESETS[0]);
  const scene = React.useMemo(() => presetToScene(active), [active]);
  const code = React.useMemo(() => sceneToCode(active), [active]);

  return (
    <div className="flex flex-col gap-3">
      {/* Canvas preview */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-background">
        <GodLights
          scene={scene}
          animate
          animParams={PREVIEW_ANIM}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
          }}
        />
      </div>

      {/* Preset thumbnails */}
      <div className="flex flex-wrap gap-1 items-center justify-center">
        {RAYS_PRESETS.map((p) => (
          <Button
            key={p.key}
            variant="outline"
            onClick={() => setActive(p)}
            title={p.label}
            className={cn(
              "relative size-8 p-0 rounded-md aspect-square overflow-hidden transition-all border border-border",
              active.key === p.key
                ? "border-primary"
                : "border-border hover:border-foreground/40"
            )}
          >
            <div
              className="absolute inset-0 scale-150"
              style={{ background: p.thumb, filter: "blur(3px)" }}
            />
          </Button>
        ))}
      </div>

      {/* Dynamic code */}
      <CodeBlock filename="MyComponent.tsx">{code}</CodeBlock>
    </div>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="flex flex-col gap-4 scroll-mt-24">
      <h2 className="text-xl font-bold tracking-tight border-b border-border pb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}

const NAV_ITEMS = [
  { id: "installation", label: "Installation" },
  { id: "quickstart", label: "Quick start" },
  { id: "props", label: "GodLights props" },
  { id: "scene-config", label: "SceneConfig" },
  { id: "layers", label: "Layer types" },
  { id: "anim-params", label: "AnimParams" },
  { id: "defaults", label: "Default values" },
  { id: "utilities", label: "Utilities" },
  { id: "guides", label: "Guides" },
  { id: "ai-tools", label: "AI tools" },
];

const GUIDES = [
  { label: "SSR & Next.js", description: "App Router (use client), Pages Router (dynamic ssr:false), Remix.", file: "ssr-and-nextjs.md" },
  { label: "Reactive scene updates", description: "Mouse tracking, direction from cursor, dynamic animParams.", file: "reactive-scene-updates.md" },
  { label: "Preset transitions", description: "Swap presets instantly or cross-fade with two canvas layers.", file: "preset-transitions.md" },
  { label: "Performance optimization", description: "Cost table, blur trade-offs, IntersectionObserver pause pattern.", file: "performance-optimization.md" },
  { label: "Reusable wrapper component", description: "A drop-in GodLightsBackground wrapper accepting simple props.", file: "reusable-wrapper.md" },
  { label: "Canvas export workflow", description: "Export PNG, JPEG, or CSS background-image data URLs.", file: "canvas-export-workflow.md" },
  { label: "AI tools setup", description: "Cursor rules, shadcn registry, Context7 — make AI use Godlights automatically.", file: "ai-tools-setup.md" },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <SiteNav
        activePath="/docs"
        className="sticky top-0 border-b border-border bg-background/80 backdrop-blur-md z-100"
      />

      <div className="relative z-10 container mx-auto px-4 py-12 flex gap-12 max-w-6xl">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col gap-1 w-48 shrink-0 sticky top-28 self-start">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-2">
            On this page
          </p>
          {NAV_ITEMS.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className="text-sm text-muted-foreground hover:text-foreground px-2 py-1 rounded transition-colors"
            >
              {label}
            </a>
          ))}
        </aside>

        {/* Content */}
        <main className="flex-1 flex flex-col gap-12 min-w-0">
          {/* Hero */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-muted px-2 py-1 rounded text-muted-foreground">
                godlights
              </span>
              <span className="text-xs text-muted-foreground">v0.1.1</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Documentation</h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Animated god ray/light beam effects for React. Render volumetric
              light scenes on a canvas — fully configurable and animatable.
            </p>
          </div>

          {/* Installation */}
          <Section id="installation" title="Installation">
            <CodeBlock filename="Terminal">npm install godlights</CodeBlock>
            <p className="text-sm text-muted-foreground">
              Requires React 18+. No other runtime dependencies.
            </p>
          </Section>

          {/* Quick start */}
          <Section id="quickstart" title="Quick start">
            <p className="text-sm text-muted-foreground">
              Import <Code>GodLights</Code> and pass a <Code>scene</Code>{" "}
              configuration. Select a preset below to preview it live and see
              the generated code — or use the{" "}
              <a
                href="/editor"
                className="underline underline-offset-2 hover:text-foreground transition-colors"
              >
                editor
              </a>{" "}
              to build your own.
            </p>
            <LivePreview />
          </Section>

          {/* GodLights props */}
          <Section id="props" title="GodLights props">
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left bg-card/90 backdrop-blur-md">
                <thead>
                  <tr className="border-b border-border bg-background/20 backdrop-blur-md">
                    <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Prop
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Type
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Default
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="px-4">
                  {[
                    {
                      name: "scene",
                      type: "SceneConfig",
                      description:
                        "Full scene configuration. Use the editor to build this.",
                    },
                    {
                      name: "animate",
                      type: "boolean",
                      defaultVal: "false",
                      description: "Enable animation loop.",
                    },
                    {
                      name: "animParams",
                      type: "AnimParams",
                      defaultVal: "DEFAULT_ANIM_PARAMS",
                      description:
                        "Animation speed and amplitudes. Only used when animate=true.",
                    },
                    {
                      name: "showFps",
                      type: "boolean",
                      defaultVal: "false",
                      description:
                        "Show FPS counter overlay. Only visible when animate=true.",
                    },
                    {
                      name: "className",
                      type: "string",
                      description: "CSS class applied to the wrapper div.",
                    },
                    {
                      name: "style",
                      type: "CSSProperties",
                      description:
                        "Inline style for the wrapper div. Use to set position.",
                    },
                  ].map((p) => (
                    <tr
                      key={p.name}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-4 py-2.5 font-mono text-[12px] text-foreground/90 whitespace-nowrap">
                        {p.name}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[12px] text-muted-foreground whitespace-nowrap">
                        {p.type}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[12px] text-muted-foreground whitespace-nowrap">
                        {p.defaultVal ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-muted-foreground">
                        {p.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
              <strong className="text-foreground">Positioning tip:</strong> The
              wrapper div defaults to <Code>position: relative</Code>. To use it
              as a full-screen background, pass{" "}
              <Code>
                {
                  "style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}"
                }
              </Code>{" "}
              — inline style overrides the default.
            </div>
          </Section>

          {/* SceneConfig */}
          <Section id="scene-config" title="SceneConfig">
            <CodeBlock filename="types">{`interface SceneConfig {
  width: number;       // Canvas width in px (used for aspect ratio)
  height: number;      // Canvas height in px
  noise: number;       // Film grain intensity (0–100)
  grainSize: number;   // Film grain pixel size (1–4)
  layers: Layer[];     // Ordered list of layers, bottom to top
}`}</CodeBlock>
          </Section>

          {/* Layer types */}
          <Section id="layers" title="Layer types">
            <p className="text-sm text-muted-foreground">
              Every scene has a <Code>layers</Code> array. The first layer
              should always be a <Code>background</Code>, followed by any number
              of <Code>rays</Code> and <Code>halo</Code> layers.
            </p>

            <h3 className="text-base font-semibold mt-2">BackgroundLayer</h3>
            <CodeBlock>{`{
  id: string;
  type: "background";
  bgType: "solid" | "linear" | "radial";
  bgColor: string;          // Hex — primary color
  bgColor2: string;         // Hex — secondary color (gradients)
  bgGradientAngle: number;  // Gradient angle in degrees
}`}</CodeBlock>

            <h3 className="text-base font-semibold mt-2">RayLayer</h3>
            <CodeBlock>{`{
  id: string;
  name: string;
  type: "rays";
  direction: number;           // Angle the rays point (degrees)
  spread: number;              // Angular spread of the ray fan (degrees)
  originX: number;             // Origin X — % of canvas width (can be < 0 or > 100)
  originY: number;             // Origin Y — % of canvas height (can be < 0 or > 100)
  rayCount: number;            // Number of rays
  rayWidth: number;            // Ray width (1–200)
  divergence: number;          // How much rays splay out (0.1–5)
  rayLength: number;           // Length as fraction of canvas diagonal (0.1–3)
  colorStart: string;          // Hex color at origin
  colorEnd: string;            // Hex color at tip
  opacity: number;             // Overall opacity (0–1)
  blendMode: BlendMode;        // CSS blend mode
  fadeToTransparent: boolean;  // Fade tips to transparent
  blur: number;                // Gaussian blur in px (0–100)
  randomnessWidth: number;     // Width randomness (0–100)
  randomnessLength: number;    // Length randomness (0–100)
  randomnessAngle: number;     // Angle randomness (0–100)
  seed: number;                // RNG seed for reproducible randomness
}`}</CodeBlock>

            <h3 className="text-base font-semibold mt-2">HaloLayer</h3>
            <CodeBlock>{`{
  id: string;
  name: string;
  type: "halo";
  originX: number;       // Center X — % of canvas width
  originY: number;       // Center Y — % of canvas height
  color: string;         // Hex color
  intensity: number;     // Brightness (0–1)
  size: number;          // Radius as fraction of canvas diagonal (0.01–2)
  blendMode: BlendMode;
}`}</CodeBlock>

            <h3 className="text-base font-semibold mt-2">BlendMode</h3>
            <CodeBlock>{`type BlendMode =
  | "source-over"
  | "lighter"
  | "screen"
  | "overlay"
  | "soft-light"
  | "hard-light"
  | "color-dodge"
  | "multiply"`}</CodeBlock>
          </Section>

          {/* AnimParams */}
          <Section id="anim-params" title="AnimParams">
            <CodeBlock filename="types">{`interface AnimParams {
  speed: number;      // Animation speed (0–10)
  angleAmp: number;   // Ray angle oscillation amplitude (0–100)
  lengthAmp: number;  // Ray length oscillation amplitude (0–100)
  widthAmp: number;   // Ray width oscillation amplitude (0–100)
  haloAmp: number;    // Halo intensity oscillation amplitude (0–100)
}`}</CodeBlock>
            <CodeBlock filename="example">{`<GodLights
  scene={scene}
  animate
  animParams={{ speed: 2, angleAmp: 40, lengthAmp: 30, widthAmp: 20, haloAmp: 50 }}
/>`}</CodeBlock>
          </Section>

          {/* Default values */}
          <Section id="defaults" title="Default values">
            <p className="text-sm text-muted-foreground">
              Use these to build layers with sensible starting values:
            </p>
            <CodeBlock filename="example">{`import {
  DEFAULT_SCENE,
  DEFAULT_RAY_LAYER,
  DEFAULT_HALO_LAYER,
  DEFAULT_BACKGROUND_LAYER,
  DEFAULT_ANIM_PARAMS,
} from "godlights";

const myRayLayer = {
  ...DEFAULT_RAY_LAYER,
  id: "rays-1",
  name: "My rays",
  colorStart: "#ff6600",
  colorEnd: "#ff6600",
};`}</CodeBlock>
          </Section>

          {/* Utilities */}
          <Section id="utilities" title="Utilities">
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left bg-card/90 backdrop-blur-md">
                <thead>
                  <tr className="border-b border-border bg-background/20 backdrop-blur-md">
                    <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Export
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Signature
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      name: "drawScene",
                      sig: "(canvas, scene, time?, anim?, skipGrain?) => void",
                      desc: "Draw one static frame onto a canvas element.",
                    },
                    {
                      name: "exportScene",
                      sig: "(scene, type, quality?) => Promise<Blob>",
                      desc: 'Export as PNG or JPEG Blob. type: "image/png" | "image/jpeg".',
                    },
                    {
                      name: "buildSceneCssSnippet",
                      sig: "(scene) => Promise<string>",
                      desc: "Export as CSS background-image lines (data URL embedded).",
                    },
                    {
                      name: "BLEND_MODES",
                      sig: "{ value, label }[]",
                      desc: "Array of all available blend modes with display labels.",
                    },
                  ].map((u) => (
                    <tr
                      key={u.name}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-4 py-2.5 font-mono text-[12px] text-foreground/90 whitespace-nowrap">
                        {u.name}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[12px] text-muted-foreground whitespace-nowrap">
                        {u.sig}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-muted-foreground">
                        {u.desc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
          {/* Guides */}
          <Section id="guides" title="Guides">
            <p className="text-sm text-muted-foreground">
              In-depth guides for common patterns. Each guide is also indexed by{" "}
              <a href="https://context7.com/gustavoquinalha/godlights" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground transition-colors">Context7</a>{" "}
              for AI-assisted development.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GUIDES.map((g) => (
                <a
                  key={g.file}
                  href={`https://github.com/gustavoquinalha/godlights/blob/main/docs/codedocs/guides/${g.file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col gap-1 rounded-lg border border-border bg-card/60 px-4 py-3 hover:border-foreground/30 hover:bg-card transition-all"
                >
                  <span className="text-sm font-medium text-foreground group-hover:text-foreground transition-colors">
                    {g.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{g.description}</span>
                </a>
              ))}
            </div>
          </Section>

          {/* AI tools */}
          <Section id="ai-tools" title="AI tools">
            <p className="text-sm text-muted-foreground">
              Resources for using Godlights with AI coding assistants — Cursor, v0, Bolt, Claude, Copilot.
            </p>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left bg-card/90 backdrop-blur-md">
                <thead>
                  <tr className="border-b border-border bg-background/20 backdrop-blur-md">
                    <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Resource</th>
                    <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "Context7", href: "https://context7.com/gustavoquinalha/godlights", desc: "Auto-loaded by Claude, Cursor, Copilot via Context7 MCP" },
                    { label: "llms.txt", href: "https://www.godlights.io/llms.txt", desc: "Quick start, common mistakes, key constraints" },
                    { label: "llms-full.txt", href: "https://www.godlights.io/llms-full.txt", desc: "Complete API reference for LLM consumption" },
                    { label: "Cursor rules (.mdc)", href: "https://www.godlights.io/godlights.mdc", desc: "Drop into .cursor/rules/ — teaches Cursor to use Godlights for light effects" },
                    { label: "shadcn registry", href: "https://www.godlights.io/registry.json", desc: "Install components via npx shadcn@latest add — works with v0, Bolt, Lovable" },
                  ].map((r) => (
                    <tr key={r.label} className="border-b border-border last:border-0">
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <a href={r.href} target="_blank" rel="noopener noreferrer" className="text-sm font-mono text-foreground/90 underline underline-offset-2 hover:text-foreground transition-colors">
                          {r.label}
                        </a>
                      </td>
                      <td className="px-4 py-2.5 text-sm text-muted-foreground">{r.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
              <strong className="text-foreground">Cursor setup:</strong>{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded text-[12px] font-mono">
                curl -o .cursor/rules/godlights.mdc https://www.godlights.io/godlights.mdc
              </code>
            </div>
          </Section>
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}
