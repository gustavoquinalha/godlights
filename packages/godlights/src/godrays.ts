/**
 * God Rays / Light Rays rendering engine.
 *
 * Renders a layered scene of light rays, halos, and backgrounds onto a
 * `HTMLCanvasElement`. Supports static one-shot rendering and a
 * `requestAnimationFrame` loop driven by an elapsed-time clock.
 *
 * **Typical layer stack (back → front)**
 * 1. `BackgroundLayer` (index 0, **required** — clears the canvas each frame)
 * 2. One or more `HaloLayer`s
 * 3. One or more `RayLayer`s
 *
 * @example
 * // Minimal static render
 * import { drawScene, DEFAULT_SCENE } from "./godrays";
 * const canvas = document.createElement("canvas");
 * canvas.width = 1920; canvas.height = 1080;
 * drawScene(canvas, DEFAULT_SCENE);
 * document.body.appendChild(canvas);
 */

/**
 * Canvas 2-D composite operation to use when blending a layer onto the scene.
 *
 * **Choosing the right mode:**
 * - `"screen"` / `"lighter"` — additive-style brightening. Only looks correct
 *   on **dark backgrounds**; on light backgrounds they blow out to white.
 * - `"multiply"` — darkening blend. Use on **light/white backgrounds** to keep
 *   the rays visible without washing them out.
 * - `"source-over"` — plain alpha compositing, background-agnostic.
 * - `"overlay"` / `"soft-light"` / `"hard-light"` — contrast-boosting blends;
 *   effect depends heavily on the underlying colors.
 *
 * @example
 * // Good for a dark background
 * const darkBgRay: Partial<RayLayer> = { blendMode: "lighter" };
 *
 * // Good for a light/white background
 * const lightBgRay: Partial<RayLayer> = { blendMode: "multiply" };
 */
export type BlendMode =
  | "source-over"
  | "lighter"
  | "screen"
  | "overlay"
  | "soft-light"
  | "hard-light";

export const BLEND_MODES: { label: string; value: BlendMode }[] = [
  { label: "Normal", value: "source-over" },
  { label: "Lighter (additive)", value: "lighter" },
  { label: "Screen", value: "screen" },
  { label: "Overlay", value: "overlay" },
  { label: "Soft light", value: "soft-light" },
  { label: "Hard light", value: "hard-light" },
];

/**
 * How the background layer fills the canvas.
 *
 * - `"transparent"` — does not paint anything; the canvas keeps its current
 *   state (or whatever the browser renders behind it). Useful when the
 *   component is overlaid on top of existing content.
 * - `"solid"` — fills the entire canvas with `bgColor`.
 * - `"gradient"` — fills with a linear gradient from `bgColor` to `bgColor2`
 *   at the angle specified by `bgGradientAngle`.
 */
export type BackgroundType = "transparent" | "solid" | "gradient";

// ── Layer types ────────────────────────────────────────────────────────────

/**
 * A layer that renders a fan of light-beam polygons radiating from an origin
 * point. All numeric positions are expressed as percentages of the canvas
 * dimensions (0–100) unless otherwise noted.
 *
 * @example
 * const rays: RayLayer = {
 *   id: "rays-1",
 *   type: "rays",
 *   name: "Sun rays",
 *   direction: 200,       // pointing downward-left (compass degrees)
 *   spread: 60,           // 60° fan
 *   originX: 50,          // centered horizontally
 *   originY: 0,           // at the top edge
 *   rayCount: 24,
 *   rayWidth: 60,         // px at the origin end
 *   divergence: 1.6,      // tip is 1.6× wider than the base
 *   rayLength: 1.4,       // 1.4× the canvas diagonal
 *   opacity: 0.6,         // 0–1
 *   blendMode: "lighter", // additive — good on dark backgrounds
 *   colorStart: "#ffffff",
 *   colorEnd: "#ffffff",
 *   fadeToTransparent: true,
 *   blur: 8,
 *   randomnessWidth: 30,
 *   randomnessLength: 18,
 *   randomnessAngle: 30,
 *   seed: 1337,
 * };
 */
export interface RayLayer {
  /** Unique identifier. Must be distinct from all other layer ids. */
  id: string;
  /** Discriminator — always `"rays"` for this layer type. */
  type: "rays";
  /** Human-readable label shown in the editor UI. */
  name: string;
  /**
   * Compass bearing the rays point toward, in degrees. 0 = North (up),
   * 90 = East (right), 180 = South (down), 270 = West (left).
   * Range: 0–360.
   */
  direction: number;
  /**
   * Total angular width of the ray fan, in degrees.
   * Range: 1–360. Typical: 30–120.
   */
  spread: number;
  /**
   * Horizontal origin as a percentage of the canvas width.
   * Range: 0–100. 50 = horizontally centered.
   */
  originX: number;
  /**
   * Vertical origin as a percentage of the canvas height.
   * Range: 0–100. 0 = top edge, 100 = bottom edge.
   */
  originY: number;
  /**
   * Number of individual ray polygons to draw.
   * Range: 1–200. Typical: 10–40.
   */
  rayCount: number;
  /**
   * Base width of each ray polygon at the origin end, in pixels.
   * Range: 1–500. Typical: 10–120.
   */
  rayWidth: number;
  /**
   * Tip-to-base width ratio — how much wider the far end is relative to the
   * near end. 1.0 = uniform beam, 2.0 = tip is twice as wide.
   * Range: 0.1–10. Typical: 1.0–3.0.
   */
  divergence: number;
  /**
   * Length of each ray as a multiplier of the canvas diagonal.
   * 1.0 = exactly fits corner-to-corner. 1.4 overshoots a bit.
   * Range: 0.1–5. Typical: 0.8–2.0.
   */
  rayLength: number;
  /**
   * Master opacity of the entire layer.
   * Range: 0–1. 0 = invisible, 1 = fully opaque.
   */
  opacity: number;
  /**
   * Canvas composite operation. Use `"lighter"` or `"screen"` for dark
   * backgrounds; use `"multiply"` for light/white backgrounds.
   */
  blendMode: BlendMode;
  /**
   * Gradient color at the origin (near) end of each ray. CSS hex string.
   * @example "#ffd28a"
   */
  colorStart: string;
  /**
   * Gradient color at the tip (far) end of each ray. CSS hex string.
   * Ignored when `fadeToTransparent` is `true` (the tip becomes fully
   * transparent instead).
   */
  colorEnd: string;
  /**
   * When `true`, rays fade from `colorStart` at the origin to fully
   * transparent at the tip, producing a natural light-beam look.
   * When `false`, the gradient goes from `colorStart` to `colorEnd`.
   */
  fadeToTransparent: boolean;
  /**
   * Gaussian blur applied to the ray shapes before compositing, in pixels.
   * Values > 0 soften hard edges and produce a glow effect.
   * Range: 0–80. Typical: 4–20.
   */
  blur: number;
  /**
   * @deprecated Replaced by the separate `randomnessWidth`, `randomnessLength`,
   * and `randomnessAngle` fields. Still accepted for backward compatibility.
   */
  randomness?: number;
  /**
   * Per-ray width variation, as a percentage of `rayWidth`.
   * Range: 0–100. 0 = all rays identical width, 100 = maximum variation.
   */
  randomnessWidth: number;
  /**
   * Per-ray length variation, as a percentage of `rayLength`.
   * Range: 0–100. 0 = uniform length.
   */
  randomnessLength: number;
  /**
   * Per-ray angle jitter, as a percentage of the per-ray angular slot.
   * Range: 0–100. Higher values break up the regular fan pattern.
   */
  randomnessAngle: number;
  /**
   * Seed for the deterministic pseudo-random number generator (mulberry32).
   * Two layers with the same parameters but different seeds will produce
   * visually different ray distributions. Change this integer to get a new
   * random layout without touching any other parameter.
   */
  seed: number;
}

/**
 * A layer that renders a soft radial glow centered on a point. Useful for
 * simulating a light source (sun, lamp, portal, etc.) at the ray origin.
 *
 * @example
 * const halo: HaloLayer = {
 *   id: "halo-1",
 *   type: "halo",
 *   name: "Sun glow",
 *   originX: 50,       // center of canvas
 *   originY: 0,        // top edge
 *   intensity: 0.5,    // 0–1 peak opacity at center
 *   size: 0.25,        // radius = 25% of canvas diagonal
 *   color: "#ffd28a",  // warm amber
 *   blendMode: "lighter",
 * };
 */
export interface HaloLayer {
  /** Unique identifier. Must be distinct from all other layer ids. */
  id: string;
  /** Discriminator — always `"halo"` for this layer type. */
  type: "halo";
  /** Human-readable label shown in the editor UI. */
  name: string;
  /**
   * Horizontal center of the halo as a percentage of canvas width.
   * Range: 0–100. 50 = horizontally centered.
   */
  originX: number;
  /**
   * Vertical center of the halo as a percentage of canvas height.
   * Range: 0–100. 0 = top edge, 100 = bottom edge.
   */
  originY: number;
  /**
   * Peak opacity at the center of the radial gradient.
   * Range: 0–1. 0 = invisible, 1 = fully opaque at center.
   */
  intensity: number;
  /**
   * Radius of the halo as a multiplier of the canvas diagonal.
   * 0.25 means the halo radius is 25% of `Math.hypot(width, height)`.
   * Range: 0.01–2. Typical: 0.1–0.5.
   */
  size: number;
  /**
   * CSS hex color of the glow.
   * @example "#ffffff"
   */
  color: string;
  /**
   * Canvas composite operation. Use `"lighter"` or `"screen"` for dark
   * backgrounds; use `"multiply"` for light/white backgrounds.
   */
  blendMode: BlendMode;
}

/**
 * The mandatory first layer in every scene. It clears the canvas and paints
 * the backdrop before any rays or halos are composited on top.
 *
 * **This must always be `layers[0]`.** If it is missing or placed at any
 * other index the canvas will not be cleared between animation frames, causing
 * ray trails and other visual artifacts.
 *
 * @example
 * const bg: BackgroundLayer = {
 *   id: "background",       // must be the literal string "background"
 *   type: "background",
 *   bgType: "gradient",
 *   bgColor: "#0b1024",     // gradient start (top by default)
 *   bgColor2: "#1a1340",    // gradient end (bottom by default)
 *   bgGradientAngle: 180,   // 180° = top-to-bottom
 * };
 */
export interface BackgroundLayer {
  /**
   * Fixed identifier — must always be the string literal `"background"`.
   * Only one BackgroundLayer per scene is supported.
   */
  id: "background";
  /** Discriminator — always `"background"` for this layer type. */
  type: "background";
  /**
   * Controls how the background is drawn.
   * - `"transparent"` — nothing is painted; the canvas keeps whatever was
   *   there before (or the browser default, usually white/transparent).
   * - `"solid"` — fills the canvas with `bgColor`.
   * - `"gradient"` — linear gradient from `bgColor` to `bgColor2`.
   */
  bgType: BackgroundType;
  /**
   * Primary background color (solid fill, or gradient start).
   * CSS hex string, e.g. `"#0b1024"`.
   */
  bgColor: string;
  /**
   * Secondary background color used as the gradient end when
   * `bgType === "gradient"`. Ignored for `"solid"` and `"transparent"`.
   */
  bgColor2: string;
  /**
   * Angle of the linear gradient in degrees. 0 = left-to-right,
   * 90 = bottom-to-top, 180 = top-to-bottom (default), 270 = top-to-bottom.
   * Range: 0–360.
   */
  bgGradientAngle: number;
}

export type Layer = RayLayer | HaloLayer | BackgroundLayer;

/**
 * Top-level description of everything that gets rendered onto a canvas.
 *
 * Layers are composited in array order, back-to-front. **`layers[0]` MUST be
 * a `BackgroundLayer`** — it performs the `clearRect` equivalent each frame.
 * Omitting it or placing it at any other index causes visual artifacts in
 * animated mode (rays will smear across frames).
 *
 * @example
 * const scene: SceneConfig = {
 *   width: 1920,
 *   height: 1080,
 *   noise: 8,        // film-grain intensity 0–100
 *   grainSize: 1,    // pixel size of grain
 *   layers: [
 *     // index 0: BackgroundLayer — REQUIRED, must come first
 *     { id: "background", type: "background", bgType: "solid", bgColor: "#000011", bgColor2: "#000011", bgGradientAngle: 180 },
 *     // index 1+: halos and rays in any order
 *     { id: "halo-1", name: "Glow", type: "halo", originX: 50, originY: 0, intensity: 0.5, size: 0.25, color: "#ffffff", blendMode: "lighter" },
 *     { ...DEFAULT_RAY_LAYER, id: "rays-1", name: "Rays" },
 *   ],
 * };
 */
export interface SceneConfig {
  /**
   * Canvas width in pixels. Should match the `HTMLCanvasElement.width` you
   * pass to `drawScene`. Typical: 1920.
   */
  width: number;
  /**
   * Canvas height in pixels. Should match `HTMLCanvasElement.height`.
   * Typical: 1080.
   */
  height: number;
  /**
   * Film-grain intensity. 0 disables grain entirely; higher values add more
   * visible noise. Range: 0–100. Typical: 4–15.
   */
  noise: number;
  /**
   * Size of each grain "pixel" in screen pixels. 1 = per-pixel noise,
   * 2+ = chunky grain. Range: 1–20. Typical: 1–3.
   */
  grainSize: number;
  /**
   * Ordered back-to-front list of layers.
   *
   * **`layers[0]` MUST be a `BackgroundLayer`** — it is the only thing that
   * clears the canvas before each frame. All subsequent entries can be
   * `HaloLayer` or `RayLayer` in any order.
   */
  layers: Layer[];
}

/**
 * Parameters that drive the animation loop. These are **not** stored inside
 * `SceneConfig` — they live separately so that the same scene can be rendered
 * statically or animated without touching the scene object.
 *
 * **Common mistake:** there is NO `opacityAmp` field. The only amplitude
 * controls are `angleAmp`, `lengthAmp`, `widthAmp`, and `haloAmp`.
 *
 * @example
 * // Gentle sway, no width variation
 * const anim: AnimParams = {
 *   speed: 0.8,
 *   angleAmp: 60,
 *   lengthAmp: 40,
 *   widthAmp: 0,   // ← set to 0 to disable an axis entirely
 *   haloAmp: 50,
 * };
 */
export interface AnimParams {
  /**
   * Global time multiplier. Scales how fast the elapsed-time clock ticks.
   * 1.0 = real-time, 2.0 = twice as fast, 0.5 = slow motion.
   * Range: 0.01–10. Default: 1.
   */
  speed: number;
  /**
   * Controls how much each ray's angle oscillates per frame.
   * 0 = rays never swing, 100 = maximum swing.
   * Range: 0–100. Default: 50.
   */
  angleAmp: number;
  /**
   * Controls how much each ray's length pulsates.
   * 0 = static length, 100 = maximum pulsation.
   * Range: 0–100. Default: 50.
   */
  lengthAmp: number;
  /**
   * Controls how much each ray's width breathes in and out.
   * 0 = static width, 100 = maximum variation.
   * Range: 0–100. Default: 50.
   */
  widthAmp: number;
  /**
   * Controls how much the halo radius pulses.
   * 0 = static halo, 100 = most pronounced pulse.
   * Range: 0–100. Default: 50.
   */
  haloAmp: number;
}

export const DEFAULT_ANIM_PARAMS: AnimParams = {
  speed: 1,
  angleAmp: 50,
  lengthAmp: 50,
  widthAmp: 50,
  haloAmp: 50,
};

// ── Defaults ───────────────────────────────────────────────────────────────

/**
 * Ready-to-use base values for a `RayLayer`. Spread this object and supply
 * the required `id` and `name` fields to create a new layer quickly.
 *
 * Produces a white, top-centered fan pointing downward with 24 rays,
 * additive `"lighter"` blending (dark backgrounds only), and a soft 8 px blur.
 *
 * @example
 * const myRays: RayLayer = { ...DEFAULT_RAY_LAYER, id: "rays-2", name: "Accent rays" };
 */
export const DEFAULT_RAY_LAYER: Omit<RayLayer, "id" | "name"> = {
  type: "rays",
  direction: 200,
  spread: 60,
  originX: 50,
  originY: 0,
  rayCount: 24,
  rayWidth: 60,
  divergence: 1.6,
  rayLength: 1.4,
  opacity: 0.6,
  blendMode: "lighter",
  colorStart: "#ffffff",
  colorEnd: "#ffffff",
  fadeToTransparent: true,
  blur: 8,
  randomnessWidth: 30,
  randomnessLength: 18,
  randomnessAngle: 30,
  seed: 1337,
};

/**
 * Ready-to-use base values for a `HaloLayer`. Spread and add `id` / `name`.
 *
 * Produces a white glow at the top-center of the canvas, with radius = 25% of
 * the canvas diagonal, peak intensity 0.5, and additive `"lighter"` blending.
 *
 * @example
 * const myHalo: HaloLayer = { ...DEFAULT_HALO_LAYER, id: "halo-2", name: "Secondary glow" };
 */
export const DEFAULT_HALO_LAYER: Omit<HaloLayer, "id" | "name"> = {
  type: "halo",
  originX: 50,
  originY: 0,
  intensity: 0.5,
  size: 0.25,
  color: "#ffffff",
  blendMode: "lighter",
};

/**
 * Ready-to-use solid black `BackgroundLayer`. Use as `layers[0]` in every
 * scene. The `id` is already set to the required literal `"background"`.
 *
 * @example
 * const scene: SceneConfig = {
 *   width: 1920, height: 1080, noise: 8, grainSize: 1,
 *   layers: [
 *     { ...DEFAULT_BACKGROUND_LAYER, bgColor: "#0b1024" },
 *     { ...DEFAULT_HALO_LAYER, id: "halo-1", name: "Halo" },
 *   ],
 * };
 */
export const DEFAULT_BACKGROUND_LAYER: BackgroundLayer = {
  id: "background",
  type: "background",
  bgType: "solid",
  bgColor: "#000000",
  bgColor2: "#000000",
  bgGradientAngle: 180,
};

/**
 * A complete, ready-to-render scene: 1920×1080, solid black background, one
 * white halo, and one 24-ray fan. Safe to pass directly to `drawScene` or
 * the `<GodLights>` component.
 *
 * Deep-clone this object before mutating it so that multiple scenes do not
 * share the same layer array reference.
 *
 * @example
 * import { drawScene, DEFAULT_SCENE } from "./godrays";
 *
 * const canvas = document.createElement("canvas");
 * canvas.width = DEFAULT_SCENE.width;
 * canvas.height = DEFAULT_SCENE.height;
 * drawScene(canvas, DEFAULT_SCENE);
 * document.body.appendChild(canvas);
 */
export const DEFAULT_SCENE: SceneConfig = {
  width: 1920,
  height: 1080,
  noise: 8,
  grainSize: 1,
  layers: [
    { ...DEFAULT_BACKGROUND_LAYER },
    { id: "halo-1", name: "Halo", ...DEFAULT_HALO_LAYER },
    { id: "rays-1", name: "Rays", ...DEFAULT_RAY_LAYER },
  ],
};

// ── Legacy flat config (kept for backward compatibility) ───────────────────

export interface GodRaysConfig {
  width: number;
  height: number;
  rayCount: number;
  rayWidth: number;
  divergence: number;
  rayLength: number;
  opacity: number;
  blendMode: BlendMode;
  haloBlendMode: BlendMode;
  direction: number;
  spread: number;
  originX: number;
  originY: number;
  haloOriginX: number;
  haloOriginY: number;
  colorStart: string;
  colorEnd: string;
  fadeToTransparent: boolean;
  bgType: BackgroundType;
  bgColor: string;
  bgColor2: string;
  bgGradientAngle: number;
  halo: number;
  haloSize: number;
  haloColor: string;
  blur: number;
  noise: number;
  grainSize: number;
  randomness: number;
  randomnessWidth: number;
  randomnessLength: number;
  randomnessAngle: number;
  seed: number;
}

export const DEFAULT_CONFIG: GodRaysConfig = {
  width: 1920,
  height: 1080,
  rayCount: 24,
  rayWidth: 60,
  divergence: 1.6,
  rayLength: 1.4,
  opacity: 0.6,
  blendMode: "lighter",
  haloBlendMode: "lighter",
  direction: 200,
  spread: 60,
  originX: 50,
  originY: 0,
  haloOriginX: 50,
  haloOriginY: 0,
  colorStart: "#ffd28a",
  colorEnd: "#ffd28a",
  fadeToTransparent: true,
  bgType: "gradient",
  bgColor: "#0b1024",
  bgColor2: "#1a1340",
  bgGradientAngle: 180,
  halo: 0.5,
  haloSize: 0.25,
  haloColor: "#ffd28a",
  blur: 8,
  noise: 8,
  grainSize: 1,
  randomness: 30,
  randomnessWidth: 30,
  randomnessLength: 18,
  randomnessAngle: 30,
  seed: 1337,
};

/* ----------------- helpers ----------------- */

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "").trim();
  const v =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h.padEnd(6, "0");
  const num = parseInt(v.substring(0, 6), 16);
  return {
    r: (num >> 16) & 0xff,
    g: (num >> 8) & 0xff,
    b: num & 0xff,
  };
}

function rgba(c: { r: number; g: number; b: number }, a: number) {
  return `rgba(${c.r},${c.g},${c.b},${a})`;
}

function compassToCanvas(deg: number) {
  return ((deg - 90) * Math.PI) / 180;
}

/* ----------------- layer renderers ----------------- */

function renderBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  layer: BackgroundLayer
) {
  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  if (layer.bgType === "solid") {
    ctx.fillStyle = layer.bgColor;
    ctx.fillRect(0, 0, width, height);
  } else if (layer.bgType === "gradient") {
    const a = (layer.bgGradientAngle * Math.PI) / 180;
    const cx = width / 2;
    const cy = height / 2;
    const half = Math.hypot(width, height) / 2;
    const dx = Math.cos(a) * half;
    const dy = Math.sin(a) * half;
    const g = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);
    g.addColorStop(0, layer.bgColor);
    g.addColorStop(1, layer.bgColor2);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.restore();
}

function renderHalo(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  layer: HaloLayer,
  time = 0,
  anim?: AnimParams
) {
  if (layer.intensity <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = layer.blendMode;
  const hox = (layer.originX / 100) * width;
  const hoy = (layer.originY / 100) * height;
  const haloAmpFactor = anim ? anim.haloAmp / 50 : 1;
  const pulse = time !== 0 ? 1 + Math.sin(time * 0.4) * 0.04 * haloAmpFactor : 1;
  const haloR = Math.hypot(width, height) * layer.size * pulse;
  const haloG = ctx.createRadialGradient(hox, hoy, 0, hox, hoy, haloR);
  const c = hexToRgb(layer.color);
  haloG.addColorStop(0, rgba(c, layer.intensity));
  haloG.addColorStop(0.5, rgba(c, layer.intensity * 0.4));
  haloG.addColorStop(1, rgba(c, 0));
  ctx.fillStyle = haloG;
  ctx.beginPath();
  ctx.arc(hox, hoy, haloR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

type AnyCtx2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

function drawRaysShapes(
  ctx: AnyCtx2D,
  width: number,
  height: number,
  layer: RayLayer,
  time = 0,
  anim?: AnimParams
) {
  const ox = (layer.originX / 100) * width;
  const oy = (layer.originY / 100) * height;
  const baseAngle = compassToCanvas(layer.direction);
  const spread = (layer.spread * Math.PI) / 180;

  const colorStart = hexToRgb(layer.colorStart);
  const colorEnd = hexToRgb(layer.colorEnd);
  const diag = Math.hypot(width, height);
  const maxLen = diag * layer.rayLength;

  const rng = mulberry32(layer.seed);

  const rndW = layer.randomnessWidth ?? layer.randomness ?? 0;
  const rndL = layer.randomnessLength ?? layer.randomness ?? 0;
  const rndA = layer.randomnessAngle ?? layer.randomness ?? 0;

  for (let i = 0; i < layer.rayCount; i++) {
    const t = layer.rayCount === 1 ? 0.5 : i / (layer.rayCount - 1);
    const widthVar = 1 - rng() * (rndW / 100);
    const lenVar = 1 - rng() * (rndL / 100) * 0.6;
    const slot = layer.rayCount > 1 ? spread / (layer.rayCount - 1) : spread;
    const jitter = (rng() - 0.5) * (rndA / 100) * slot;

    const phase = i * 2.399;
    const aAmp = anim ? anim.angleAmp / 50 : 1;
    const lAmp = anim ? anim.lengthAmp / 50 : 1;
    const wAmp = anim ? anim.widthAmp / 50 : 1;
    const animAngle = time !== 0
      ? Math.sin(time * 0.6 + phase) * (Math.max(rndA, 12) / 100) * slot * 0.55 * aAmp
      : 0;
    const animWidthVar = time !== 0
      ? 1 + Math.sin(time * 0.45 + phase + 1.2) * (rndW / 400) * wAmp
      : 1;
    const animLenVar = time !== 0
      ? 1 + Math.sin(time * 0.35 + phase + 2.5) * (rndL / 400) * lAmp
      : 1;

    const angle = baseAngle - spread / 2 + spread * t + jitter + animAngle;
    const w0 = Math.max(1, layer.rayWidth * widthVar * animWidthVar);
    const w1 = Math.max(1, w0 * layer.divergence);
    const len = Math.max(50, maxLen * lenVar * animLenVar);

    ctx.save();
    ctx.translate(ox, oy);
    ctx.rotate(angle);

    const grad = ctx.createLinearGradient(0, 0, len, 0);
    grad.addColorStop(0, rgba(colorStart, layer.opacity));
    grad.addColorStop(
      1,
      rgba(colorEnd, layer.fadeToTransparent ? 0 : layer.opacity)
    );
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.moveTo(0, -w0 / 2);
    ctx.lineTo(len, -w1 / 2);
    ctx.lineTo(len, w1 / 2);
    ctx.lineTo(0, w0 / 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

function renderRays(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  layer: RayLayer,
  time = 0,
  anim?: AnimParams
) {
  if (layer.blur > 0) {
    const off = new OffscreenCanvas(width, height);
    const offCtx = off.getContext("2d");
    if (!offCtx) return;
    drawRaysShapes(offCtx, width, height, layer, time, anim);
    ctx.save();
    ctx.globalCompositeOperation = layer.blendMode;
    ctx.filter = `blur(${layer.blur}px)`;
    ctx.drawImage(off, 0, 0);
    ctx.restore();
  } else {
    ctx.save();
    ctx.globalCompositeOperation = layer.blendMode;
    drawRaysShapes(ctx, width, height, layer, time, anim);
    ctx.restore();
  }
}

/* ----------------- main scene render ----------------- */

/**
 * Renders a complete `SceneConfig` onto a `HTMLCanvasElement`.
 *
 * Call this once for a static image, or on every `requestAnimationFrame` tick
 * for animation — increment `time` by `deltaSeconds * speed` each frame.
 *
 * The canvas `width` and `height` attributes are **not** set by this function;
 * make sure they match `scene.width` / `scene.height` before calling.
 *
 * @param canvas - Target canvas element. Must already be appended to the DOM
 *   (or at least have a valid 2-D context) before this is called.
 * @param scene  - Scene configuration. `scene.layers[0]` **must** be a
 *   `BackgroundLayer`; otherwise the canvas is not cleared between frames and
 *   you will see ghosting / smearing artifacts.
 * @param time   - Elapsed animation time in seconds (default `0`). When `0`,
 *   every ray is rendered at its rest position with no oscillation. Pass a
 *   monotonically increasing value to animate.
 * @param anim   - Optional amplitude modifiers. Only used when `time !== 0`.
 *   **Note:** there is no `opacityAmp` — the valid keys are `speed`,
 *   `angleAmp`, `lengthAmp`, `widthAmp`, and `haloAmp`.
 * @param skipGrain - When `true`, the film-grain pass is skipped. Set this to
 *   `true` in animated mode when grain is handled by a separate static overlay
 *   canvas (as `GodLights` does) to avoid re-generating grain every frame.
 *
 * @example
 * // Static render
 * const canvas = document.getElementById("canvas") as HTMLCanvasElement;
 * canvas.width = scene.width;
 * canvas.height = scene.height;
 * drawScene(canvas, scene);
 *
 * @example
 * // Animated render loop
 * let time = 0;
 * let last: number | null = null;
 * const anim: AnimParams = { speed: 1, angleAmp: 50, lengthAmp: 50, widthAmp: 50, haloAmp: 50 };
 *
 * function frame(ts: number) {
 *   if (last !== null) time += ((ts - last) / 1000) * anim.speed;
 *   last = ts;
 *   drawScene(canvas, scene, time, anim);
 *   requestAnimationFrame(frame);
 * }
 * requestAnimationFrame(frame);
 */
export function drawScene(
  canvas: HTMLCanvasElement,
  scene: SceneConfig,
  time = 0,
  anim?: AnimParams,
  skipGrain = false
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { width, height } = canvas;

  ctx.clearRect(0, 0, width, height);

  for (const layer of scene.layers) {
    if (layer.type === "background") renderBackground(ctx, width, height, layer);
    else if (layer.type === "halo") renderHalo(ctx, width, height, layer, time, anim);
    else if (layer.type === "rays") renderRays(ctx, width, height, layer, time, anim);
  }

  if (!skipGrain && scene.noise > 0) {
    addGrain(ctx, width, height, scene.noise, scene.grainSize);
  }
}

/* ----------------- legacy single-pass render ----------------- */

export function drawGodRays(canvas: HTMLCanvasElement, config: GodRaysConfig): void {
  drawScene(canvas, {
    width: config.width,
    height: config.height,
    noise: config.noise,
    grainSize: config.grainSize,
    layers: [
      {
        id: "background",
        type: "background",
        bgType: config.bgType,
        bgColor: config.bgColor,
        bgColor2: config.bgColor2,
        bgGradientAngle: config.bgGradientAngle,
      },
      {
        id: "halo-legacy",
        type: "halo",
        name: "Halo",
        originX: config.haloOriginX,
        originY: config.haloOriginY,
        intensity: config.halo,
        size: config.haloSize,
        color: config.haloColor,
        blendMode: config.haloBlendMode,
      },
      {
        id: "rays-legacy",
        type: "rays",
        name: "Rays",
        direction: config.direction,
        spread: config.spread,
        originX: config.originX,
        originY: config.originY,
        rayCount: config.rayCount,
        rayWidth: config.rayWidth,
        divergence: config.divergence,
        rayLength: config.rayLength,
        opacity: config.opacity,
        blendMode: config.blendMode,
        colorStart: config.colorStart,
        colorEnd: config.colorEnd,
        fadeToTransparent: config.fadeToTransparent,
        blur: config.blur,
        randomness: config.randomness,
        randomnessWidth: config.randomnessWidth,
        randomnessLength: config.randomnessLength,
        randomnessAngle: config.randomnessAngle,
        seed: config.seed,
      },
    ],
  });
}

function addGrain(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  amount: number,
  grainSize: number
) {
  const step = Math.max(1, Math.floor(grainSize));
  const img = ctx.getImageData(0, 0, width, height);
  const data = img.data;
  const intensity = (amount / 100) * 60;

  if (step === 1) {
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] === 0) continue;
      const n = (Math.random() - 0.5) * 2 * intensity;
      data[i] = clamp255(data[i] + n);
      data[i + 1] = clamp255(data[i + 1] + n);
      data[i + 2] = clamp255(data[i + 2] + n);
    }
  } else {
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const n = (Math.random() - 0.5) * 2 * intensity;
        for (let dy = 0; dy < step && y + dy < height; dy++) {
          for (let dx = 0; dx < step && x + dx < width; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4;
            if (data[idx + 3] === 0) continue;
            data[idx] = clamp255(data[idx] + n);
            data[idx + 1] = clamp255(data[idx + 1] + n);
            data[idx + 2] = clamp255(data[idx + 2] + n);
          }
        }
      }
    }
  }
  ctx.putImageData(img, 0, 0);
}

function clamp255(v: number) {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}

/* ----------------- export helpers ----------------- */

/**
 * Renders `scene` at its native resolution and returns the result as a PNG or
 * JPEG `Blob` suitable for `URL.createObjectURL`, `<a download>`, or
 * `FormData` uploads.
 *
 * Internally creates a temporary off-screen `<canvas>` (never attached to the
 * DOM), draws the full scene statically (`time = 0`, grain enabled), and calls
 * `canvas.toBlob`.
 *
 * @param scene   - Scene to render. Uses `scene.width` × `scene.height` as the
 *   canvas dimensions.
 * @param type    - MIME type. Use `"image/png"` for lossless export or
 *   `"image/jpeg"` for smaller files with lossy compression.
 * @param quality - Compression quality for JPEG, 0–1 (default `0.95`).
 *   Ignored for PNG.
 * @returns A `Promise` that resolves to a `Blob` containing the encoded image.
 *
 * @example
 * const blob = await exportScene(scene, "image/png");
 * const url = URL.createObjectURL(blob);
 * const a = document.createElement("a");
 * a.href = url;
 * a.download = "godlights.png";
 * a.click();
 * URL.revokeObjectURL(url);
 */
export async function exportScene(
  scene: SceneConfig,
  type: "image/png" | "image/jpeg",
  quality = 0.95
): Promise<Blob> {
  const off = document.createElement("canvas");
  off.width = scene.width;
  off.height = scene.height;
  drawScene(off, scene);
  return new Promise<Blob>((resolve, reject) => {
    off.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to generate image"));
      },
      type,
      quality
    );
  });
}

export async function buildSceneCssSnippet(scene: SceneConfig): Promise<string> {
  const off = document.createElement("canvas");
  off.width = scene.width;
  off.height = scene.height;
  drawScene(off, scene);
  const dataUrl = off.toDataURL("image/png");
  return `background-image: url("${dataUrl}");\nbackground-size: cover;\nbackground-position: center;\nbackground-repeat: no-repeat;`;
}

export async function exportImage(
  config: GodRaysConfig,
  type: "image/png" | "image/jpeg",
  quality = 0.95
): Promise<Blob> {
  const off = document.createElement("canvas");
  off.width = config.width;
  off.height = config.height;
  drawGodRays(off, config);
  return new Promise<Blob>((resolve, reject) => {
    off.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to generate image"));
      },
      type,
      quality
    );
  });
}

/**
 * Renders the legacy flat `GodRaysConfig` and returns the result as a PNG or
 * JPEG data URL string (a `"data:image/..."` Base64-encoded string).
 *
 * Use this when you need an inline image string — e.g. to set as a CSS
 * `background-image`, embed in an `<img src>`, or store in `localStorage`.
 * For downloads or network uploads, prefer `exportScene` which returns a
 * `Blob` instead (more memory-efficient for large images).
 *
 * @param config  - Legacy flat config. For the layer-based API use
 *   `exportScene` with a `SceneConfig` instead.
 * @param type    - MIME type: `"image/png"` or `"image/jpeg"`.
 * @param quality - JPEG quality 0–1 (default `0.95`). Ignored for PNG.
 * @returns A `Promise` resolving to a Base64 data URL string.
 *
 * @example
 * const dataUrl = await exportDataURL(config, "image/png");
 * document.body.style.backgroundImage = `url("${dataUrl}")`;
 */
export async function exportDataURL(
  config: GodRaysConfig,
  type: "image/png" | "image/jpeg",
  quality = 0.95
): Promise<string> {
  const off = document.createElement("canvas");
  off.width = config.width;
  off.height = config.height;
  drawGodRays(off, config);
  return off.toDataURL(type, quality);
}

export async function buildCssSnippet(config: GodRaysConfig): Promise<string> {
  const dataUrl = await exportDataURL(config, "image/png");
  return `background-image: url("${dataUrl}");\nbackground-size: cover;\nbackground-position: center;\nbackground-repeat: no-repeat;`;
}
