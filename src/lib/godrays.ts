/**
 * God Rays / Light Rays rendering engine
 * Supports multiple independent ray and halo layers per scene.
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

export type BackgroundType = "transparent" | "solid" | "gradient";

// ── Layer types ────────────────────────────────────────────────────────────

export interface RayLayer {
  id: string;
  type: "rays";
  name: string;
  direction: number;
  spread: number;
  originX: number;
  originY: number;
  rayCount: number;
  rayWidth: number;
  divergence: number;
  rayLength: number;
  opacity: number;
  blendMode: BlendMode;
  colorStart: string;
  colorEnd: string;
  fadeToTransparent: boolean;
  blur: number;
  /** @deprecated use randomnessWidth/Length/Angle */
  randomness?: number;
  randomnessWidth: number;
  randomnessLength: number;
  randomnessAngle: number;
  seed: number;
}

export interface HaloLayer {
  id: string;
  type: "halo";
  name: string;
  originX: number;
  originY: number;
  intensity: number;
  size: number;
  color: string;
  blendMode: BlendMode;
}

export interface BackgroundLayer {
  id: "background";
  type: "background";
  bgType: BackgroundType;
  bgColor: string;
  bgColor2: string;
  bgGradientAngle: number;
}

export type Layer = RayLayer | HaloLayer | BackgroundLayer;

export interface SceneConfig {
  width: number;
  height: number;
  noise: number;
  grainSize: number;
  /** Ordered back-to-front. BackgroundLayer is always at index 0. */
  layers: Layer[];
}

/** Parameters that control the animation loop — not persisted in scene. */
export interface AnimParams {
  /** Time multiplier — higher = faster (default 1). */
  speed: number;
  /** Angle swing intensity 0–100 (default 50). */
  angleAmp: number;
  /** Ray length oscillation intensity 0–100 (default 50). */
  lengthAmp: number;
  /** Ray width oscillation intensity 0–100 (default 50). */
  widthAmp: number;
  /** Halo pulse intensity 0–100 (default 50). */
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
  colorStart: "#ffd28a",
  colorEnd: "#ffd28a",
  fadeToTransparent: true,
  blur: 8,
  randomnessWidth: 30,
  randomnessLength: 18,
  randomnessAngle: 30,
  seed: 1337,
};

export const DEFAULT_HALO_LAYER: Omit<HaloLayer, "id" | "name"> = {
  type: "halo",
  originX: 50,
  originY: 0,
  intensity: 0.5,
  size: 0.25,
  color: "#ffd28a",
  blendMode: "lighter",
};

export const DEFAULT_BACKGROUND_LAYER: BackgroundLayer = {
  id: "background",
  type: "background",
  bgType: "gradient",
  bgColor: "#0b1024",
  bgColor2: "#1a1340",
  bgGradientAngle: 180,
};

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

// ── Legacy flat config (kept for presets.ts compatibility) ─────────────────

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

    // Smooth per-ray oscillation — golden-ratio phase keeps rays independent
    const phase = i * 2.399; // ~golden angle (rad), no extra RNG needed
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
    // Draw all rays into an offscreen canvas first (no blur per-shape),
    // then composite the whole layer with a single blur pass onto the main canvas.
    // This reduces blur operations from rayCount → 1, a massive speedup.
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

export function drawScene(canvas: HTMLCanvasElement, scene: SceneConfig, time = 0, anim?: AnimParams, skipGrain = false): void {
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

/* ----------------- legacy single-pass render (kept for drawGodRays callers) --- */

export function drawGodRays(
  canvas: HTMLCanvasElement,
  config: GodRaysConfig
): void {
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
        else reject(new Error("Falha ao gerar imagem"));
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

// kept for backward-compat callers
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
        else reject(new Error("Falha ao gerar imagem"));
      },
      type,
      quality
    );
  });
}

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
