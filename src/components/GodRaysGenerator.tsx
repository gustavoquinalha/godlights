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
  Move,
  Sun,
  Moon,
} from "lucide-react";
import {
  drawGodRays,
  exportImage,
  buildCssSnippet,
  DEFAULT_CONFIG,
  type GodRaysConfig,
  type BackgroundType,
} from "@/lib/godrays";
import { LayerCard } from "@/components/LayerCard";
import { OriginCrosshair } from "@/components/OriginCrosshair";
import { BlendModeSelect } from "@/components/BlendModeSelect";
import { OriginInputs } from "@/components/OriginInputs";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
} from "@/components/ui/sidebar";
import { ColorPicker } from "@/components/ColorPicker";
import { ControlSection, Field } from "@/components/ControlSection";
import { COLOR_PRESETS, RAYS_PRESETS, PRESETS } from "@/lib/presets";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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

function useTheme() {
  const [dark, setDark] = React.useState(() =>
    document.documentElement.classList.contains("dark")
  );
  const toggle = React.useCallback(() => {
    setDark((d) => {
      document.documentElement.classList.toggle("dark", !d);
      return !d;
    });
  }, []);
  return { dark, toggle };
}

type LayerView = "layers" | "rays" | "halo" | "background";

export function GodRaysGenerator() {
  const { dark, toggle: toggleTheme } = useTheme();
  const [config, setConfig] = React.useState<GodRaysConfig>(() => {
    const colorPreset = COLOR_PRESETS.find((p) => p.key === "c_ember");
    const raysPreset = RAYS_PRESETS.find((p) => p.key === "r_side_glow");
    let cfg = { ...DEFAULT_CONFIG, ...(colorPreset?.config ?? {}) };
    if (raysPreset) cfg = { ...DEFAULT_CONFIG, ...raysPreset.config, colorStart: cfg.colorStart, colorEnd: cfg.colorEnd, haloColor: cfg.haloColor, bgType: cfg.bgType, bgColor: cfg.bgColor, bgColor2: cfg.bgColor2, bgGradientAngle: cfg.bgGradientAngle };
    return cfg;
  });
  const [copiedJson, setCopiedJson] = React.useState(false);
  const [copiedCss, setCopiedCss] = React.useState(false);
  const [exporting, setExporting] = React.useState<"png" | "jpg" | null>(null);
  const [zoom, setZoom] = React.useState(1);
  const [layerView, setLayerView] = React.useState<LayerView>("layers");
  const [activeColorPreset, setActiveColorPreset] = React.useState<string | null>("c_ember");
  const [activeRaysPreset, setActiveRaysPreset] = React.useState<string | null>("r_side_glow");
  const previewCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const previewWrapperRef = React.useRef<HTMLDivElement>(null);
  const previewContainerRef = React.useRef<HTMLDivElement>(null);
  const rafRef = React.useRef<number | null>(null);
  const deferredConfig = React.useDeferredValue(config);

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
      const scaled = scaleConfigForPreview(deferredConfig);
      canvas.width = scaled.width;
      canvas.height = scaled.height;
      drawGodRays(canvas, scaled);
    });
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [deferredConfig]);

  const update = React.useCallback(
    <K extends keyof GodRaysConfig>(key: K, value: GodRaysConfig[K]) => {
      setConfig((c) => ({ ...c, [key]: value }));
    },
    []
  );

  // ---- Drag handles (rays / halo independent) ----
  type DragHandle = "rays" | "halo";
  const [draggingHandle, setDraggingHandle] = React.useState<DragHandle | null>(null);
  const dragStartRef = React.useRef<{
    pctX: number; pctY: number; originX: number; originY: number;
  } | null>(null);

  const canvasPct = (e: React.PointerEvent) => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  };

  const onOverlayPointerDown = (handle: DragHandle) => (e: React.PointerEvent) => {
    e.stopPropagation();
    setDraggingHandle(handle);
    setLayerView(handle);
    e.currentTarget.setPointerCapture(e.pointerId);
    const pos = canvasPct(e);
    if (!pos) return;
    dragStartRef.current = {
      pctX: pos.x,
      pctY: pos.y,
      originX: handle === "rays" ? config.originX : config.haloOriginX,
      originY: handle === "rays" ? config.originY : config.haloOriginY,
    };
  };

  const onOverlayPointerMove = (handle: DragHandle) => (e: React.PointerEvent) => {
    if (!dragStartRef.current) return;
    const pos = canvasPct(e);
    if (!pos) return;
    const newX = dragStartRef.current.originX + (pos.x - dragStartRef.current.pctX);
    const newY = dragStartRef.current.originY + (pos.y - dragStartRef.current.pctY);
    if (handle === "rays") setConfig((c) => ({ ...c, originX: newX, originY: newY }));
    else setConfig((c) => ({ ...c, haloOriginX: newX, haloOriginY: newY }));
  };

  const onOverlayPointerUp = (_handle: DragHandle) => (e: React.PointerEvent) => {
    setDraggingHandle(null);
    dragStartRef.current = null;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
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
    setCopiedCss(true);
    window.setTimeout(() => setCopiedCss(false), 1800);
  };

  const handleCopyPresetJson = async () => {
    const COLOR_KEYS: (keyof GodRaysConfig)[] = [
      "colorStart", "colorEnd", "fadeToTransparent",
      "haloColor",
      "bgType", "bgColor", "bgColor2", "bgGradientAngle",
    ];
    const RAYS_KEYS: (keyof GodRaysConfig)[] = [
      "rayCount", "rayWidth", "divergence", "rayLength", "opacity",
      "blendMode", "direction", "spread", "originX", "originY",
      "haloBlendMode", "halo", "haloSize", "haloOriginX", "haloOriginY",
      "blur", "noise", "grainSize", "randomness", "seed",
    ];
    const pick = (keys: (keyof GodRaysConfig)[]) =>
      Object.fromEntries(keys.map((k) => [k, config[k]]));
    await navigator.clipboard.writeText(JSON.stringify({ color: pick(COLOR_KEYS), rays: pick(RAYS_KEYS) }, null, 2));
    setCopiedJson(true);
    window.setTimeout(() => setCopiedJson(false), 1800);
  };

  const handleRandomize = () => {
    setConfig((c) => ({ ...c, seed: Math.floor(Math.random() * 1_000_000) }));
    setActiveRaysPreset(null);
  };
  const handleReset = () => { setConfig(DEFAULT_CONFIG); setActiveColorPreset(null); setActiveRaysPreset(null); };
  const applyPreset = (key: string) => {
    const preset = PRESETS.find((p) => p.key === key);
    if (!preset) return;
    if (preset.category === "color") {
      setConfig((c) => ({ ...c, ...preset.config }));
    } else {
      setConfig((c) => ({ ...DEFAULT_CONFIG, ...preset.config, colorStart: c.colorStart, colorEnd: c.colorEnd, haloColor: c.haloColor, bgType: c.bgType, bgColor: c.bgColor, bgColor2: c.bgColor2, bgGradientAngle: c.bgGradientAngle }));
    }
    if (preset.category === "color") setActiveColorPreset(key);
    else setActiveRaysPreset(key);
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

  // Bounding box of the rays cone in display pixels
  const raysBBox = React.useMemo(() => {
    const { w, h } = fittedSize;
    if (!w || !h) return null;
    const ox = (config.originX / 100) * w;
    const oy = (config.originY / 100) * h;
    const baseAngle = ((config.direction - 90) * Math.PI) / 180;
    const spreadRad = (config.spread * Math.PI) / 180;
    const maxLen = Math.hypot(w, h) * config.rayLength;
    const pts: [number, number][] = [[ox, oy]];
    const steps = 64;
    for (let i = 0; i <= steps; i++) {
      const angle = baseAngle - spreadRad / 2 + spreadRad * (i / steps);
      pts.push([ox + Math.cos(angle) * maxLen, oy + Math.sin(angle) * maxLen]);
    }
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    const x = Math.min(...xs);
    const y = Math.min(...ys);
    return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
  }, [fittedSize, config.originX, config.originY, config.direction, config.spread, config.rayLength]);

  // Bounding circle of the halo in display pixels
  const haloBCircle = React.useMemo(() => {
    const { w, h } = fittedSize;
    if (!w || !h) return null;
    const r = Math.hypot(w, h) * config.haloSize;
    return {
      cx: (config.haloOriginX / 100) * w,
      cy: (config.haloOriginY / 100) * h,
      r,
    };
  }, [fittedSize, config.haloOriginX, config.haloOriginY, config.haloSize]);

  // Hit-test click on canvas — Figma-style layer selection
  const onCanvasClick = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * fittedSize.w;
    const py = ((e.clientY - rect.top) / rect.height) * fittedSize.h;

    // Rays (rendered on top — check first)
    if (raysBBox && px >= raysBBox.x && px <= raysBBox.x + raysBBox.w && py >= raysBBox.y && py <= raysBBox.y + raysBBox.h) {
      setLayerView("rays");
      return;
    }
    // Halo
    if (haloBCircle && Math.hypot(px - haloBCircle.cx, py - haloBCircle.cy) <= haloBCircle.r) {
      setLayerView("halo");
      return;
    }
    setLayerView("layers");
  }, [fittedSize, raysBBox, haloBCircle]);

  return (
    <SidebarProvider>
      {/* ----------- LEFT SIDEBAR ----------- */}
      <Sidebar side="left" collapsible="none">
        <SidebarHeader className="flex-row items-center justify-between gap-2 px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-semibold tracking-tight">Rays Generator</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-7 w-7 text-sidebar-foreground/60 hover:text-sidebar-foreground"
            title={dark ? "Modo claro" : "Modo escuro"}
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </SidebarHeader>
        <SidebarContent>
          <ControlSection title="Presets" defaultOpen={true}>
            <div className="space-y-3">
              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Cores</p>
                <div className="grid grid-cols-6 gap-1.5">
                  {COLOR_PRESETS.map((p) => (
                    <Tooltip key={p.key}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => applyPreset(p.key)}
                          className={cn("aspect-square w-full overflow-hidden rounded-full border border-border/60 transition-all hover:scale-110 hover:border-border hover:shadow-md", activeColorPreset === p.key && "ring-2 ring-primary")}
                          style={{ background: p.thumb }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>{p.label}</TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Rays / Halo</p>
                <div className="grid grid-cols-6 gap-1.5">
                  {RAYS_PRESETS.map((p) => (
                    <Tooltip key={p.key}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => applyPreset(p.key)}
                          className={cn("aspect-square w-full overflow-hidden rounded-full border border-border/60 transition-all hover:scale-110 hover:border-border hover:shadow-md", activeRaysPreset === p.key && "ring-2 ring-primary")}
                          style={{ background: p.thumb }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>{p.label}</TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRandomize} className="flex-1 gap-2">
                <Shuffle className="h-4 w-4" /> Aleatório
              </Button>
              <Button variant="outline" size="sm" onClick={handleReset} className="flex-1 gap-2">
                <RotateCcw className="h-4 w-4" /> Reset
              </Button>
            </div>
          </ControlSection>

          <ControlSection title="Efeitos">
            <Field label="Blur" value={config.blur.toFixed(1)} unit="px">
              <Slider min={0} max={80} step={0.5} value={[config.blur]} onValueChange={([v]) => update("blur", v)} />
            </Field>
            <Field label="Ruído / grão" value={config.noise.toFixed(0)}>
              <Slider min={0} max={100} step={1} value={[config.noise]} onValueChange={([v]) => update("noise", v)} />
            </Field>
            <Field label="Tamanho do grão" value={config.grainSize.toFixed(0)} unit="px">
              <Slider min={1} max={6} step={1} value={[config.grainSize]} onValueChange={([v]) => update("grainSize", v)} />
            </Field>
          </ControlSection>

          <ControlSection title="Dimensões">
            <Field label="Preset">
              <Select
                defaultValue={String(DIMENSION_PRESETS.findIndex((p) => p.w === 1920 && p.h === 1080))}
                onValueChange={(v) => {
                  const p = DIMENSION_PRESETS[parseInt(v, 10)];
                  if (p) setConfig((c) => ({ ...c, width: p.w, height: p.h }));
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DIMENSION_PRESETS.map((p, i) => (
                    <SelectItem key={p.label} value={String(i)}>{p.label} — {p.w}×{p.h}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Largura" unit="px" value={config.width}>
                <Input type="number" min={64} max={8000} value={config.width} onChange={(e) => update("width", clampNum(e.target.value, 64, 8000))} />
              </Field>
              <Field label="Altura" unit="px" value={config.height}>
                <Input type="number" min={64} max={8000} value={config.height} onChange={(e) => update("height", clampNum(e.target.value, 64, 8000))} />
              </Field>
            </div>
          </ControlSection>

        </SidebarContent>
      </Sidebar>

      {/* ----------- CENTER: Preview ----------- */}
      <SidebarInset>
        <div className="flex items-center justify-end gap-3 border-b border-border px-5 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleCopyPresetJson} className="gap-2">
              {copiedJson ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              {copiedJson ? "Copiado" : "Copiar JSON"}
            </Button>
            <Button size="sm" variant="outline" onClick={handleCopyCss} className="gap-2">
              {copiedCss ? <Check className="h-4 w-4 text-emerald-400" /> : <Code2 className="h-4 w-4" />}
              {copiedCss ? "Copiado" : "Copiar CSS"}
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
          onClick={() => setLayerView("layers")}
        >
          <div
            ref={previewWrapperRef}
            className="relative select-none"
            onClick={onCanvasClick}
            style={{
              width: fittedSize.w ? `${fittedSize.w}px` : "0px",
              height: fittedSize.h ? `${fittedSize.h}px` : "0px",
              transform: `scale(${zoom})`,
              transformOrigin: "center center",
            }}
          >
            <canvas
              ref={previewCanvasRef}
              className="block h-full w-full rounded-md shadow-2xl ring-1 ring-border"
            />

            {/* Rays bounding box — fits the actual cone */}
            {layerView === "rays" && raysBBox && (
              <div
                className={cn(
                  "absolute",
                  draggingHandle === "rays" ? "cursor-grabbing" : "cursor-grab"
                )}
                style={{ left: raysBBox.x, top: raysBBox.y, width: raysBBox.w, height: raysBBox.h }}
                onPointerDown={onOverlayPointerDown("rays")}
                onPointerMove={onOverlayPointerMove("rays")}
                onPointerUp={onOverlayPointerUp("rays")}
                onPointerCancel={onOverlayPointerUp("rays")}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="pointer-events-none absolute inset-0 border border-dashed border-blue-400/80" />
                <span className="pointer-events-none absolute -top-5 left-0 rounded bg-blue-400 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  Rays
                </span>
                <span className="pointer-events-none absolute -left-1 -top-1 h-2 w-2 rounded-sm bg-blue-400" />
                <span className="pointer-events-none absolute -right-1 -top-1 h-2 w-2 rounded-sm bg-blue-400" />
                <span className="pointer-events-none absolute -bottom-1 -left-1 h-2 w-2 rounded-sm bg-blue-400" />
                <span className="pointer-events-none absolute -bottom-1 -right-1 h-2 w-2 rounded-sm bg-blue-400" />
                <OriginCrosshair
                  color="blue"
                  style={{
                    left: (config.originX / 100) * fittedSize.w - raysBBox.x,
                    top: (config.originY / 100) * fittedSize.h - raysBBox.y,
                  }}
                />
              </div>
            )}

            {/* Halo bounding circle — fits the actual glow radius */}
            {layerView === "halo" && haloBCircle && (
              <div
                className={cn(
                  "absolute",
                  draggingHandle === "halo" ? "cursor-grabbing" : "cursor-grab"
                )}
                style={{
                  left: haloBCircle.cx - haloBCircle.r,
                  top: haloBCircle.cy - haloBCircle.r,
                  width: haloBCircle.r * 2,
                  height: haloBCircle.r * 2,
                }}
                onPointerDown={onOverlayPointerDown("halo")}
                onPointerMove={onOverlayPointerMove("halo")}
                onPointerUp={onOverlayPointerUp("halo")}
                onPointerCancel={onOverlayPointerUp("halo")}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="pointer-events-none absolute inset-0 rounded-full border border-dashed border-amber-400/80" />
                <span className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-semibold text-black">
                  Halo
                </span>
                <OriginCrosshair color="amber" className="left-1/2 top-1/2" />
              </div>
            )}
          </div>

          {/* Floating zoom controls */}
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full border border-border bg-background/80 px-2 py-1 shadow-lg backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => changeZoom(-ZOOM_STEP)}
              disabled={zoom <= MIN_ZOOM}
              className="h-7 w-7 rounded-full text-foreground/70 hover:text-foreground"
              title="Diminuir zoom"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => setZoom(1)}
              className="h-7 min-w-[52px] px-1 text-xs font-medium tabular-nums text-foreground/80 hover:text-foreground"
              title="Resetar zoom"
            >
              {Math.round(zoom * 100)}%
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => changeZoom(ZOOM_STEP)}
              disabled={zoom >= MAX_ZOOM}
              className="h-7 w-7 rounded-full text-foreground/70 hover:text-foreground"
              title="Aumentar zoom"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <div className="mx-1 h-4 w-px bg-border" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setZoom(1)}
              className="h-7 w-7 rounded-full text-foreground/70 hover:text-foreground"
              title="Zoom 100%"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-2 text-xs text-muted-foreground">
          <span>
            {config.width} × {config.height}px ·{" "}
            {((config.width * config.height) / 1_000_000).toFixed(2)} MP
          </span>
          <span>Arraste no preview para mover a origem</span>
        </div>
      </SidebarInset>

      {/* ----------- RIGHT SIDEBAR: Layers ----------- */}
      <Sidebar side="right" collapsible="none">
        <SidebarHeader className="flex-row items-center gap-2 px-4 py-3">
          {layerView !== "layers" && (
            <Button
              variant="ghost"
              onClick={() => setLayerView("layers")}
              className="h-auto gap-1 px-1 py-0.5 text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground [&_svg]:size-3"
            >
              <RotateCcw className="rotate-90" />
              Camadas
            </Button>
          )}
          <span className="text-sm font-semibold tracking-tight">
            {layerView === "layers" && "Camadas"}
            {layerView === "rays" && "Rays"}
            {layerView === "halo" && "Halo"}
            {layerView === "background" && "Background"}
          </span>
        </SidebarHeader>
        <SidebarContent>

          {/* LAYERS LIST */}
          {layerView === "layers" && (
            <div className="space-y-2 p-3">
              <LayerCard
                accent="blue"
                icon={<Move className="h-4 w-4" />}
                label="Rays"
                description={`${config.rayCount} raios · ${Math.round(config.opacity * 100)}% opac.`}
                preview={
                  <div
                    className="h-6 w-10 rounded-md border border-border/40"
                    style={{ background: `linear-gradient(to right, ${config.colorStart}, ${config.fadeToTransparent ? "transparent" : config.colorEnd})` }}
                  />
                }
                onClick={() => setLayerView("rays")}
              />
              <LayerCard
                accent="amber"
                icon={<Move className="h-4 w-4" />}
                label="Halo"
                description={`${Math.round(config.halo * 100)}% intensidade`}
                preview={
                  <div
                    className="h-6 w-6 rounded-full border border-border/40"
                    style={{ background: config.haloColor }}
                  />
                }
                onClick={() => setLayerView("halo")}
              />
              <LayerCard
                icon={<ImageIcon className="h-4 w-4" />}
                label="Background"
                description={<span className="capitalize">{config.bgType}</span>}
                preview={
                  config.bgType === "gradient" ? (
                    <div
                      className="h-6 w-10 rounded-md border border-border/40"
                      style={{ background: `linear-gradient(to right, ${config.bgColor}, ${config.bgColor2})` }}
                    />
                  ) : config.bgType === "solid" ? (
                    <div className="h-6 w-6 rounded-full border border-border/40" style={{ background: config.bgColor }} />
                  ) : (
                    <div className="h-6 w-6 rounded-full border border-border/40 bg-checker" />
                  )
                }
                onClick={() => setLayerView("background")}
              />
            </div>
          )}

          {/* RAYS PROPERTIES */}
          {layerView === "rays" && (
            <>
              <ControlSection title="Cores">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center gap-1.5">
                    <ColorPicker value={config.colorStart} onChange={(v) => update("colorStart", v)} />
                    <span className="text-[11px] text-muted-foreground">Início</span>
                  </div>
                  <div
                    className="h-9 flex-1 rounded-lg border border-border/40"
                    style={{ background: `linear-gradient(to right, ${config.colorStart}, ${config.fadeToTransparent ? "transparent" : config.colorEnd})` }}
                  />
                  <div className="flex flex-col items-center gap-1.5">
                    <ColorPicker value={config.colorEnd} onChange={(v) => update("colorEnd", v)} />
                    <span className="text-[11px] text-muted-foreground">Fim</span>
                  </div>
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground/80">
                  <Checkbox
                    checked={config.fadeToTransparent}
                    onCheckedChange={(v) => update("fadeToTransparent", v === true)}
                  />
                  Desvanecer para transparente
                </label>
              </ControlSection>

              <ControlSection title="Forma">
                <Field label="Quantidade" value={config.rayCount}>
                  <Slider min={1} max={200} step={1} value={[config.rayCount]} onValueChange={([v]) => update("rayCount", v)} />
                </Field>
                <Field label="Largura base" unit="px" value={config.rayWidth.toFixed(0)}>
                  <Slider min={1} max={400} step={1} value={[config.rayWidth]} onValueChange={([v]) => update("rayWidth", v)} />
                </Field>
                <Field label="Divergência" value={config.divergence.toFixed(2)} hint="1 = paralelos, >1 = abrem para a ponta, <1 = fecham">
                  <Slider min={0.1} max={5} step={0.05} value={[config.divergence]} onValueChange={([v]) => update("divergence", v)} />
                </Field>
                <Field label="Comprimento" value={config.rayLength.toFixed(2)} unit="× diag">
                  <Slider min={0.2} max={2.5} step={0.05} value={[config.rayLength]} onValueChange={([v]) => update("rayLength", v)} />
                </Field>
                <Field label="Opacidade" value={(config.opacity * 100).toFixed(0)} unit="%">
                  <Slider min={0} max={1} step={0.01} value={[config.opacity]} onValueChange={([v]) => update("opacity", v)} />
                </Field>
                <Field label="Blend mode">
                  <BlendModeSelect value={config.blendMode} onChange={(v) => update("blendMode", v)} />
                </Field>
              </ControlSection>

              <ControlSection title="Direção e origem">
                <Field label="Direção" value={config.direction.toFixed(0)} unit="°" hint="0° aponta para cima · 90° direita · 180° baixo · 270° esquerda">
                  <Slider min={0} max={360} step={1} value={[config.direction]} onValueChange={([v]) => update("direction", v)} />
                </Field>
                <Field label="Abertura (spread)" value={config.spread.toFixed(0)} unit="°">
                  <Slider min={0} max={360} step={1} value={[config.spread]} onValueChange={([v]) => update("spread", v)} />
                </Field>
                <OriginInputs
                  x={config.originX}
                  y={config.originY}
                  onXChange={(v) => update("originX", v)}
                  onYChange={(v) => update("originY", v)}
                />
              </ControlSection>

              <ControlSection title="Aleatoriedade" defaultOpen={true}>
                <Field label="Variação" value={config.randomness.toFixed(0)} unit="%" hint="Jitter na largura, comprimento e ângulo de cada raio">
                  <Slider min={0} max={100} step={1} value={[config.randomness]} onValueChange={([v]) => update("randomness", v)} />
                </Field>
                <div className="grid grid-cols-[1fr_auto] items-end gap-2">
                  <Field label="Seed" value={config.seed}>
                    <Input type="number" value={config.seed} onChange={(e) => update("seed", clampNum(e.target.value, 0, 1_000_000))} />
                  </Field>
                  <Button variant="outline" size="icon" onClick={handleRandomize} title="Sortear nova seed">
                    <Shuffle className="h-4 w-4" />
                  </Button>
                </div>
              </ControlSection>
            </>
          )}

          {/* HALO PROPERTIES */}
          {layerView === "halo" && (
            <ControlSection title="Halo">
              <Field label="Cor">
                <div className="flex items-center gap-3">
                  <ColorPicker value={config.haloColor} onChange={(v) => update("haloColor", v)} />
                  <span className="font-mono text-xs text-muted-foreground">{config.haloColor}</span>
                </div>
              </Field>
              <Field label="Intensidade" value={(config.halo * 100).toFixed(0)} unit="%">
                <Slider min={0} max={1} step={0.01} value={[config.halo]} onValueChange={([v]) => update("halo", v)} />
              </Field>
              <Field label="Tamanho" value={(config.haloSize * 100).toFixed(0)} unit="%">
                <Slider min={0.05} max={1.5} step={0.01} value={[config.haloSize]} onValueChange={([v]) => update("haloSize", v)} />
              </Field>
              <Field label="Blend mode">
                <BlendModeSelect value={config.haloBlendMode} onChange={(v) => update("haloBlendMode", v)} />
              </Field>
              <OriginInputs
                x={config.haloOriginX}
                y={config.haloOriginY}
                onXChange={(v) => update("haloOriginX", v)}
                onYChange={(v) => update("haloOriginY", v)}
              />
            </ControlSection>
          )}

          {/* BACKGROUND PROPERTIES */}
          {layerView === "background" && (
            <ControlSection title="Background">
              <Field label="Tipo">
                <Select value={config.bgType} onValueChange={(v) => update("bgType", v as BackgroundType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transparent">Transparente</SelectItem>
                    <SelectItem value="solid">Cor sólida</SelectItem>
                    <SelectItem value="gradient">Gradiente</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              {config.bgType === "solid" && (
                <div className="flex items-center gap-3">
                  <ColorPicker value={config.bgColor} onChange={(v) => update("bgColor", v)} />
                  <span className="font-mono text-xs text-muted-foreground">{config.bgColor}</span>
                </div>
              )}
              {config.bgType === "gradient" && (
                <>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center gap-1.5">
                      <ColorPicker value={config.bgColor} onChange={(v) => update("bgColor", v)} />
                      <span className="text-[11px] text-muted-foreground">Início</span>
                    </div>
                    <div className="h-9 flex-1 rounded-lg border border-border/40" style={{ background: `linear-gradient(to right, ${config.bgColor}, ${config.bgColor2})` }} />
                    <div className="flex flex-col items-center gap-1.5">
                      <ColorPicker value={config.bgColor2} onChange={(v) => update("bgColor2", v)} />
                      <span className="text-[11px] text-muted-foreground">Fim</span>
                    </div>
                  </div>
                  <Field label="Ângulo" value={config.bgGradientAngle.toFixed(0)} unit="°">
                    <Slider min={0} max={360} step={1} value={[config.bgGradientAngle]} onValueChange={([v]) => update("bgGradientAngle", v)} />
                  </Field>
                </>
              )}
            </ControlSection>
          )}

        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}

function clampNum(value: string, min: number, max: number) {
  const n = Number(value);
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}
