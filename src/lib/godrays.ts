/**
 * God Rays / Light Rays rendering engine
 * Renders configurable volumetric light rays to a 2D canvas.
 */

export type BlendMode =
  | "source-over"
  | "lighter"
  | "screen"
  | "overlay"
  | "soft-light"
  | "hard-light";

export type BackgroundType = "transparent" | "solid" | "gradient";

export interface GodRaysConfig {
  // Canvas / output
  width: number;
  height: number;

  // Rays
  rayCount: number; // total number of rays
  rayWidth: number; // base width (px) at origin
  divergence: number; // 0..n, how much wider rays get at the far end (1 = same, 2 = doubles)
  rayLength: number; // 0..2 multiplier on canvas diagonal
  opacity: number; // 0..1
  blendMode: BlendMode;

  // Direction
  direction: number; // degrees, compass style: 0 = up, 90 = right, 180 = down, 270 = left
  spread: number; // degrees, total cone angle the rays fan out across

  // Origin (in % of canvas)
  originX: number; // 0..100
  originY: number; // 0..100

  // Colors
  colorStart: string; // hex, color at origin
  colorEnd: string; // hex, color at far end (typically same hue with 0 alpha)
  fadeToTransparent: boolean; // if true colorEnd alpha = 0, otherwise full opacity

  // Background
  bgType: BackgroundType;
  bgColor: string; // hex
  bgColor2: string; // hex (for gradient)
  bgGradientAngle: number; // degrees

  // Halo (soft glow at origin)
  halo: number; // 0..1 intensity
  haloSize: number; // 0..1 fraction of canvas diagonal

  // Effects
  blur: number; // px gaussian blur applied to rays
  noise: number; // 0..100 film grain amount
  grainSize: number; // 1..4 size of each grain "pixel"

  // Randomness
  randomness: number; // 0..100 jitter on width / length / angle
  seed: number; // PRNG seed
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

  direction: 200,
  spread: 60,

  originX: 50,
  originY: 0,

  colorStart: "#ffd28a",
  colorEnd: "#ffd28a",
  fadeToTransparent: true,

  bgType: "gradient",
  bgColor: "#0b1024",
  bgColor2: "#1a1340",
  bgGradientAngle: 180,

  halo: 0.5,
  haloSize: 0.25,

  blur: 8,
  noise: 8,
  grainSize: 1,

  randomness: 30,
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

/** Convert compass degrees (0 = up) to canvas radians (0 = right). */
function compassToCanvas(deg: number) {
  return ((deg - 90) * Math.PI) / 180;
}

/* ----------------- main render ----------------- */

export function drawGodRays(
  canvas: HTMLCanvasElement,
  config: GodRaysConfig
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { width, height } = canvas;

  // 1. Clear and paint background
  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.clearRect(0, 0, width, height);

  if (config.bgType === "solid") {
    ctx.fillStyle = config.bgColor;
    ctx.fillRect(0, 0, width, height);
  } else if (config.bgType === "gradient") {
    const a = (config.bgGradientAngle * Math.PI) / 180;
    const cx = width / 2;
    const cy = height / 2;
    const half = Math.hypot(width, height) / 2;
    const dx = Math.cos(a) * half;
    const dy = Math.sin(a) * half;
    const g = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);
    g.addColorStop(0, config.bgColor);
    g.addColorStop(1, config.bgColor2);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.restore();

  // 2. Origin + direction
  const ox = (config.originX / 100) * width;
  const oy = (config.originY / 100) * height;
  const baseAngle = compassToCanvas(config.direction);
  const spread = (config.spread * Math.PI) / 180;

  // 3. Halo (radial glow at origin) drawn before rays
  if (config.halo > 0) {
    ctx.save();
    ctx.globalCompositeOperation = config.blendMode;
    const haloR = Math.hypot(width, height) * config.haloSize;
    const haloG = ctx.createRadialGradient(ox, oy, 0, ox, oy, haloR);
    const c = hexToRgb(config.colorStart);
    haloG.addColorStop(0, rgba(c, config.halo));
    haloG.addColorStop(0.5, rgba(c, config.halo * 0.4));
    haloG.addColorStop(1, rgba(c, 0));
    ctx.fillStyle = haloG;
    ctx.beginPath();
    ctx.arc(ox, oy, haloR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 4. Rays
  ctx.save();
  ctx.globalCompositeOperation = config.blendMode;
  if (config.blur > 0) ctx.filter = `blur(${config.blur}px)`;

  const colorStart = hexToRgb(config.colorStart);
  const colorEnd = hexToRgb(config.colorEnd);
  const diag = Math.hypot(width, height);
  const maxLen = diag * config.rayLength;

  const rng = mulberry32(config.seed);

  for (let i = 0; i < config.rayCount; i++) {
    const t =
      config.rayCount === 1 ? 0.5 : i / (config.rayCount - 1);

    const widthVar = 1 - rng() * (config.randomness / 100);
    const lenVar = 1 - rng() * (config.randomness / 100) * 0.6;
    const slot =
      config.rayCount > 1 ? spread / (config.rayCount - 1) : spread;
    const jitter = (rng() - 0.5) * (config.randomness / 100) * slot;

    const angle = baseAngle - spread / 2 + spread * t + jitter;

    const w0 = Math.max(1, config.rayWidth * widthVar);
    const w1 = Math.max(1, w0 * config.divergence);
    const len = Math.max(50, maxLen * lenVar);

    ctx.save();
    ctx.translate(ox, oy);
    ctx.rotate(angle);

    const grad = ctx.createLinearGradient(0, 0, len, 0);
    grad.addColorStop(0, rgba(colorStart, config.opacity));
    grad.addColorStop(
      1,
      rgba(colorEnd, config.fadeToTransparent ? 0 : config.opacity)
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

  ctx.restore();

  // 5. Film grain / noise (last so it sits on top)
  if (config.noise > 0) {
    addGrain(ctx, width, height, config.noise, config.grainSize);
  }
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

export async function exportImage(
  config: GodRaysConfig,
  type: "image/png" | "image/jpeg",
  quality = 0.95
): Promise<Blob> {
  const off = document.createElement("canvas");
  off.width = config.width;
  off.height = config.height;
  drawGodRays(off, config);

  return await new Promise<Blob>((resolve, reject) => {
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

export async function buildCssSnippet(
  config: GodRaysConfig
): Promise<string> {
  const dataUrl = await exportDataURL(config, "image/png");
  return `background-image: url("${dataUrl}");\nbackground-size: cover;\nbackground-position: center;\nbackground-repeat: no-repeat;`;
}
