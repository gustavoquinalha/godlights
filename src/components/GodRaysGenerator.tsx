import * as React from "react";
import {
  Download,
  Image as ImageIcon,
  Code2,
  Shuffle,
  RotateCcw,
  Sparkles,
  Check,
  Copy,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";
import {
  drawGodRays,
  exportImage,
  buildCssSnippet,
  DEFAULT_CONFIG,
  type GodRaysConfig,
  type BackgroundType,
  type BlendMode,
} from "@/lib/godrays";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ColorPicker } from "@/components/ColorPicker";
import { ControlSection, Field } from "@/components/ControlSection";
import { PRESETS } from "@/lib/presets";
import { Separator } from "./ui/separator";
import { Label } from "./ui/label";

const DIMENSION_PRESETS: { label: string; w: number; h: number }[] = [
  { label: "Square 1:1", w: 1080, h: 1080 },
  { label: "Story 9:16", w: 1080, h: 1920 },
  { label: "Post 4:5", w: 1080, h: 1350 },
  { label: "HD 16:9", w: 1920, h: 1080 },
  { label: "2K 16:9", w: 2560, h: 1440 },
  { label: "4K 16:9", w: 3840, h: 2160 },
  { label: "Wide 21:9", w: 2560, h: 1080 },
  { label: "Banner", w: 1500, h: 500 },
];

const BLEND_MODES: { label: string; value: BlendMode }[] = [
  { label: "Normal", value: "source-over" },
  { label: "Lighter (additive)", value: "lighter" },
  { label: "Screen", value: "screen" },
  { label: "Overlay", value: "overlay" },
  { label: "Soft light", value: "soft-light" },
  { label: "Hard light", value: "hard-light" },
];

const PREVIEW_MAX_DIMENSION = 1200;
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 2.0;
const ZOOM_STEP = 0.1;

function scaleConfigForPreview(config: GodRaysConfig): GodRaysConfig {
  const maxDim = Math.max(config.width, config.height);
  if (maxDim <= PREVIEW_MAX_DIMENSION) return config;
  const ratio = PREVIEW_MAX_DIMENSION / maxDim;
  return {
    ...config,
    width: Math.round(config.width * ratio),
    height: Math.round(config.height * ratio),
    rayWidth: config.rayWidth * ratio,
    blur: config.blur * ratio,
  };
}

export function GodRaysGenerator() {
  const [config, setConfig] = React.useState<GodRaysConfig>(DEFAULT_CONFIG);
  const [copied, setCopied] = React.useState(false);
  const [exporting, setExporting] = React.useState<"png" | "jpg" | null>(null);
  const [zoom, setZoom] = React.useState(1);
  const previewCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const previewWrapperRef = React.useRef<HTMLDivElement>(null);
  const previewContainerRef = React.useRef<HTMLDivElement>(null);
  const rafRef = React.useRef<number | null>(null);

  const clampZoom = (v: number) =>
    Math.round(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v)) * 100) / 100;

  const changeZoom = React.useCallback((delta: number) => {
    setZoom((z) => clampZoom(z + delta));
  }, []);

  // Wheel zoom — must use non-passive listener to call preventDefault
  React.useEffect(() => {
    const el = previewContainerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
      setZoom((z) => clampZoom(z + delta));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // ---- Render preview on config change ----
  React.useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const scaled = scaleConfigForPreview(config);
      canvas.width = scaled.width;
      canvas.height = scaled.height;
      drawGodRays(canvas, scaled);
    });
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [config]);

  const update = React.useCallback(
    <K extends keyof GodRaysConfig>(key: K, value: GodRaysConfig[K]) => {
      setConfig((c) => ({ ...c, [key]: value }));
    },
    []
  );

  // ---- Drag origin point ----
  const draggingRef = React.useRef(false);
  const onPreviewPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    handleOriginUpdate(e);
  };
  const onPreviewPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    handleOriginUpdate(e);
  };
  const onPreviewPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };
  const handleOriginUpdate = (e: React.PointerEvent<HTMLDivElement>) => {
    const wrapper = previewWrapperRef.current;
    const canvas = previewCanvasRef.current;
    if (!wrapper || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setConfig((c) => ({ ...c, originX: x, originY: y }));
  };

  // ---- Exports ----
  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleExport = async (type: "png" | "jpg") => {
    setExporting(type);
    try {
      const mime = type === "png" ? "image/png" : "image/jpeg";
      const blob = await exportImage(config, mime, 0.95);
      const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      downloadBlob(
        blob,
        `god-rays_${config.width}x${config.height}_${stamp}.${type}`
      );
    } finally {
      setExporting(null);
    }
  };

  const handleCopyCss = async () => {
    const snippet = await buildCssSnippet(config);
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const handleRandomize = () => {
    setConfig((c) => ({ ...c, seed: Math.floor(Math.random() * 1_000_000) }));
  };
  const handleReset = () => setConfig(DEFAULT_CONFIG);
  const applyPreset = (key: string) => {
    const preset = PRESETS.find((p) => p.key === key);
    if (preset) setConfig({ ...DEFAULT_CONFIG, ...preset.config });
  };

  // Compute responsive preview size (largest box of given AR fitting available area)
  const [containerSize, setContainerSize] = React.useState({ w: 0, h: 0 });
  React.useEffect(() => {
    const el = previewContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setContainerSize({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const fittedSize = React.useMemo(() => {
    const padding = 24;
    const aw = Math.max(0, containerSize.w - padding * 2);
    const ah = Math.max(0, containerSize.h - padding * 2);
    if (aw === 0 || ah === 0) return { w: 0, h: 0 };
    const ar = config.width / config.height;
    let w = aw;
    let h = w / ar;
    if (h > ah) {
      h = ah;
      w = h * ar;
    }
    return { w, h };
  }, [containerSize, config.width, config.height]);

  return (
    <div className="grid h-screen grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px]">
      {/* ----------- LEFT: Preview ----------- */}
      <div className="flex h-full flex-col overflow-hidden border-b border-border bg-background lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span className="text-sm font-semibold tracking-tight">
              Rays Generator
            </span>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              · god rays / light rays
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyCss}
              className="gap-2"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Code2 className="h-4 w-4" />
              )}
              {copied ? "Copiado" : "Copiar CSS"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleExport("jpg")}
              disabled={exporting !== null}
              className="gap-2"
            >
              <ImageIcon className="h-4 w-4" />
              JPG
            </Button>
            <Button
              size="sm"
              onClick={() => handleExport("png")}
              disabled={exporting !== null}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              PNG
            </Button>
          </div>
        </div>

        <div
          ref={previewContainerRef}
          className="relative flex flex-1 items-center justify-center overflow-hidden bg-checker"
        >
          <div
            ref={previewWrapperRef}
            className="relative select-none"
            style={{
              width: fittedSize.w ? `${fittedSize.w}px` : "0px",
              height: fittedSize.h ? `${fittedSize.h}px` : "0px",
              transform: `scale(${zoom})`,
              transformOrigin: "center center",
            }}
            onPointerDown={onPreviewPointerDown}
            onPointerMove={onPreviewPointerMove}
            onPointerUp={onPreviewPointerUp}
            onPointerCancel={onPreviewPointerUp}
          >
            <canvas
              ref={previewCanvasRef}
              className="block h-full w-full rounded-md shadow-2xl ring-1 ring-border"
            />
            {/* Origin marker */}
            <div
              className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-lg ring-2 ring-black/40 mix-blend-difference"
              style={{
                left: `${config.originX}%`,
                top: `${config.originY}%`,
              }}
            />
          </div>

          {/* Floating zoom controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full border border-border bg-background/80 px-2 py-1 shadow-lg backdrop-blur-sm">
            <button
              onClick={() => changeZoom(-ZOOM_STEP)}
              disabled={zoom <= MIN_ZOOM}
              className="flex h-7 w-7 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
              title="Diminuir zoom"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="min-w-[52px] text-center text-xs font-medium tabular-nums text-foreground/80 transition-colors hover:text-foreground"
              title="Resetar zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={() => changeZoom(ZOOM_STEP)}
              disabled={zoom >= MAX_ZOOM}
              className="flex h-7 w-7 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
              title="Aumentar zoom"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <div className="mx-1 h-4 w-px bg-border" />
            <button
              onClick={() => setZoom(1)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
              title="Zoom 100%"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-2 text-xs text-muted-foreground">
          <span>
            {config.width} × {config.height}px ·{" "}
            {((config.width * config.height) / 1_000_000).toFixed(2)} MP
          </span>
          <span>Arraste no preview para mover a origem</span>
        </div>
      </div>

      {/* ----------- RIGHT: Controls ----------- */}
      <aside className="flex h-full flex-col overflow-hidden bg-card">
        <div className="flex-1 overflow-y-auto">
          <ControlSection title="Presets" defaultOpen={true}>
            <div className="mt-3">
              <div className="grid grid-cols-4 gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => applyPreset(p.key)}
                    className="group relative h-16 overflow-hidden rounded-md border border-border text-left transition-shadow hover:shadow-lg"
                    style={{ background: p.thumb }}
                    title={p.label}
                  >
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1 text-[10px] font-medium tracking-tight text-white">
                      {p.label}
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRandomize}
                  className="flex-1 gap-2"
                >
                  <Shuffle className="h-4 w-4" /> Aleatório
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="flex-1 gap-2"
                >
                  <RotateCcw className="h-4 w-4" /> Reset
                </Button>
              </div>
            </div>
          </ControlSection>

          {/* CORES */}
          <ControlSection title="Cores">
            {/* BACKGROUND */}
            <div className="w-full flex flex-col gap-4">
              <Label>Background</Label>
              <Field label="Tipo">
                <Select
                  value={config.bgType}
                  onValueChange={(v) => update("bgType", v as BackgroundType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transparent">Transparente</SelectItem>
                    <SelectItem value="solid">Cor sólida</SelectItem>
                    <SelectItem value="gradient">Gradiente</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              {config.bgType !== "transparent" && (
                <Field label="Cor">
                  <ColorPicker
                    value={config.bgColor}
                    onChange={(v) => update("bgColor", v)}
                  />
                </Field>
              )}
              {config.bgType === "gradient" && (
                <>
                  <Field label="Cor 2">
                    <ColorPicker
                      value={config.bgColor2}
                      onChange={(v) => update("bgColor2", v)}
                    />
                  </Field>
                  <Field
                    label="Ângulo do gradiente"
                    value={config.bgGradientAngle.toFixed(0)}
                    unit="°"
                  >
                    <Slider
                      min={0}
                      max={360}
                      step={1}
                      value={[config.bgGradientAngle]}
                      onValueChange={([v]) => update("bgGradientAngle", v)}
                    />
                  </Field>
                </>
              )}
            </div>

            <Separator className="my-8!" />

            <div className="w-full flex flex-col gap-4">
              <Label>Rays colors</Label>

              <Field label="Cor inicial (origem)">
                <ColorPicker
                  value={config.colorStart}
                  onChange={(v) => update("colorStart", v)}
                />
              </Field>

              <Field label="Cor final (ponta)">
                <ColorPicker
                  value={config.colorEnd}
                  onChange={(v) => update("colorEnd", v)}
                />
              </Field>

              <label className="flex cursor-pointer items-center gap-2 text-xs text-foreground/80">
                <input
                  type="checkbox"
                  checked={config.fadeToTransparent}
                  onChange={(e) =>
                    update("fadeToTransparent", e.target.checked)
                  }
                  className="h-4 w-4 accent-primary"
                />
                Desvanecer para transparente na ponta
              </label>
            </div>
          </ControlSection>

          {/* RAIOS */}
          <ControlSection title="Raios">
            <Field label="Quantidade" value={config.rayCount}>
              <Slider
                min={1}
                max={200}
                step={1}
                value={[config.rayCount]}
                onValueChange={([v]) => update("rayCount", v)}
              />
            </Field>
            <Field
              label="Largura base"
              unit="px"
              value={config.rayWidth.toFixed(0)}
            >
              <Slider
                min={1}
                max={400}
                step={1}
                value={[config.rayWidth]}
                onValueChange={([v]) => update("rayWidth", v)}
              />
            </Field>
            <Field
              label="Divergência"
              value={config.divergence.toFixed(2)}
              hint="1 = paralelos, >1 = abrem para a ponta, <1 = fecham"
            >
              <Slider
                min={0.1}
                max={5}
                step={0.05}
                value={[config.divergence]}
                onValueChange={([v]) => update("divergence", v)}
              />
            </Field>
            <Field
              label="Comprimento"
              value={config.rayLength.toFixed(2)}
              unit="× diag"
            >
              <Slider
                min={0.2}
                max={2.5}
                step={0.05}
                value={[config.rayLength]}
                onValueChange={([v]) => update("rayLength", v)}
              />
            </Field>
            <Field
              label="Opacidade"
              value={(config.opacity * 100).toFixed(0)}
              unit="%"
            >
              <Slider
                min={0}
                max={1}
                step={0.01}
                value={[config.opacity]}
                onValueChange={([v]) => update("opacity", v)}
              />
            </Field>
            <Field label="Blend mode">
              <Select
                value={config.blendMode}
                onValueChange={(v) => update("blendMode", v as BlendMode)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BLEND_MODES.map((b) => (
                    <SelectItem key={b.value} value={b.value}>
                      {b.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </ControlSection>

          {/* DIREÇÃO */}
          <ControlSection title="Direção e origem">
            <Field
              label="Direção"
              value={config.direction.toFixed(0)}
              unit="°"
              hint="0° aponta para cima · 90° direita · 180° baixo · 270° esquerda"
            >
              <Slider
                min={0}
                max={360}
                step={1}
                value={[config.direction]}
                onValueChange={([v]) => update("direction", v)}
              />
            </Field>
            <Field
              label="Abertura (spread)"
              value={config.spread.toFixed(0)}
              unit="°"
            >
              <Slider
                min={0}
                max={360}
                step={1}
                value={[config.spread]}
                onValueChange={([v]) => update("spread", v)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Origem X" unit="%">
                <Input
                  type="number"
                  value={config.originX.toFixed(0)}
                  onChange={(e) => update("originX", Number(e.target.value))}
                />
              </Field>
              <Field label="Origem Y" unit="%">
                <Input
                  type="number"
                  value={config.originY.toFixed(0)}
                  onChange={(e) => update("originY", Number(e.target.value))}
                />
              </Field>
            </div>
          </ControlSection>

          {/* HALO */}
          <ControlSection title="Halo" defaultOpen={false}>
            <Field
              label="Intensidade"
              value={(config.halo * 100).toFixed(0)}
              unit="%"
            >
              <Slider
                min={0}
                max={1}
                step={0.01}
                value={[config.halo]}
                onValueChange={([v]) => update("halo", v)}
              />
            </Field>
            <Field
              label="Tamanho"
              value={(config.haloSize * 100).toFixed(0)}
              unit="%"
            >
              <Slider
                min={0.05}
                max={1.5}
                step={0.01}
                value={[config.haloSize]}
                onValueChange={([v]) => update("haloSize", v)}
              />
            </Field>
          </ControlSection>

          {/* ALEATORIEDADE */}
          <ControlSection title="Aleatoriedade" defaultOpen={false}>
            <Field
              label="Variação"
              value={config.randomness.toFixed(0)}
              unit="%"
              hint="Jitter na largura, comprimento e ângulo de cada raio"
            >
              <Slider
                min={0}
                max={100}
                step={1}
                value={[config.randomness]}
                onValueChange={([v]) => update("randomness", v)}
              />
            </Field>
            <div className="grid grid-cols-[1fr_auto] items-end gap-2">
              <Field label="Seed" value={config.seed}>
                <Input
                  type="number"
                  value={config.seed}
                  onChange={(e) =>
                    update("seed", clampNum(e.target.value, 0, 1_000_000))
                  }
                />
              </Field>
              <Button
                variant="outline"
                size="icon"
                onClick={handleRandomize}
                title="Sortear nova seed"
              >
                <Shuffle className="h-4 w-4" />
              </Button>
            </div>
          </ControlSection>

          {/* EFEITOS */}
          <ControlSection title="Efeitos">
            <Field label="Blur" value={config.blur.toFixed(1)} unit="px">
              <Slider
                min={0}
                max={80}
                step={0.5}
                value={[config.blur]}
                onValueChange={([v]) => update("blur", v)}
              />
            </Field>
            <Field label="Ruído / grão" value={config.noise.toFixed(0)}>
              <Slider
                min={0}
                max={100}
                step={1}
                value={[config.noise]}
                onValueChange={([v]) => update("noise", v)}
              />
            </Field>
            <Field
              label="Tamanho do grão"
              value={config.grainSize.toFixed(0)}
              unit="px"
            >
              <Slider
                min={1}
                max={6}
                step={1}
                value={[config.grainSize]}
                onValueChange={([v]) => update("grainSize", v)}
              />
            </Field>
          </ControlSection>

          {/* DIMENSÕES */}
          <ControlSection title="Dimensões">
            <Field label="Preset">
              <Select
                defaultValue={String(
                  DIMENSION_PRESETS.findIndex(
                    (p) => p.w === 1920 && p.h === 1080
                  )
                )}
                onValueChange={(v) => {
                  const p = DIMENSION_PRESETS[parseInt(v, 10)];
                  if (p) setConfig((c) => ({ ...c, width: p.w, height: p.h }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIMENSION_PRESETS.map((p, i) => (
                    <SelectItem key={p.label} value={String(i)}>
                      {p.label} — {p.w}×{p.h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Largura" unit="px" value={config.width}>
                <Input
                  type="number"
                  min={64}
                  max={8000}
                  value={config.width}
                  onChange={(e) =>
                    update("width", clampNum(e.target.value, 64, 8000))
                  }
                />
              </Field>
              <Field label="Altura" unit="px" value={config.height}>
                <Input
                  type="number"
                  min={64}
                  max={8000}
                  value={config.height}
                  onChange={(e) =>
                    update("height", clampNum(e.target.value, 64, 8000))
                  }
                />
              </Field>
            </div>
          </ControlSection>

          {/* COPIAR JSON */}
          <ControlSection title="Configuração" defaultOpen={false}>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={async () => {
                await navigator.clipboard.writeText(
                  JSON.stringify(config, null, 2)
                );
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1800);
              }}
            >
              <Copy className="h-4 w-4" />
              Copiar JSON do preset
            </Button>
          </ControlSection>
        </div>
      </aside>
    </div>
  );
}

function clampNum(value: string, min: number, max: number) {
  const n = Number(value);
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}
