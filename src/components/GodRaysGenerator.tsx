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
  ChevronLeft,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  drawScene,
  exportScene,
  buildSceneCssSnippet,
  DEFAULT_SCENE,
  DEFAULT_RAY_LAYER,
  DEFAULT_HALO_LAYER,
  type SceneConfig,
  type Layer,
  type RayLayer,
  type HaloLayer,
  type BackgroundLayer,
  type BackgroundType,
  type GodRaysConfig,
} from "@/lib/godrays";
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
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { ColorPicker } from "@/components/ColorPicker";
import { Field } from "@/components/ControlSection";
import { COLOR_PRESETS, RAYS_PRESETS, PRESETS } from "@/lib/presets";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
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

// ── Preset helpers ─────────────────────────────────────────────────────────

function applyColorPreset(
  scene: SceneConfig,
  flat: Partial<GodRaysConfig>
): SceneConfig {
  return {
    ...scene,
    layers: scene.layers.map((layer) => {
      if (layer.type === "rays") {
        return {
          ...layer,
          ...(flat.colorStart !== undefined && { colorStart: flat.colorStart }),
          ...(flat.colorEnd !== undefined && { colorEnd: flat.colorEnd }),
          ...(flat.fadeToTransparent !== undefined && {
            fadeToTransparent: flat.fadeToTransparent,
          }),
        };
      }
      if (layer.type === "halo") {
        return {
          ...layer,
          ...(flat.haloColor !== undefined && { color: flat.haloColor }),
        };
      }
      if (layer.type === "background") {
        return {
          ...layer,
          ...(flat.bgType !== undefined && { bgType: flat.bgType }),
          ...(flat.bgColor !== undefined && { bgColor: flat.bgColor }),
          ...(flat.bgColor2 !== undefined && { bgColor2: flat.bgColor2 }),
          ...(flat.bgGradientAngle !== undefined && {
            bgGradientAngle: flat.bgGradientAngle,
          }),
        };
      }
      return layer;
    }) as Layer[],
  };
}

function applyRaysPreset(
  scene: SceneConfig,
  flat: Partial<GodRaysConfig>
): SceneConfig {
  let firstRaysDone = false;
  let firstHaloDone = false;
  return {
    ...scene,
    noise: flat.noise ?? DEFAULT_SCENE.noise,
    grainSize: flat.grainSize ?? DEFAULT_SCENE.grainSize,
    layers: scene.layers.map((layer) => {
      if (layer.type === "rays" && !firstRaysDone) {
        firstRaysDone = true;
        return {
          ...DEFAULT_RAY_LAYER,
          id: layer.id,
          name: layer.name,
          colorStart: layer.colorStart,
          colorEnd: layer.colorEnd,
          fadeToTransparent: layer.fadeToTransparent,
          ...(flat.rayCount !== undefined && { rayCount: flat.rayCount }),
          ...(flat.rayWidth !== undefined && { rayWidth: flat.rayWidth }),
          ...(flat.divergence !== undefined && { divergence: flat.divergence }),
          ...(flat.rayLength !== undefined && { rayLength: flat.rayLength }),
          ...(flat.opacity !== undefined && { opacity: flat.opacity }),
          ...(flat.blendMode !== undefined && { blendMode: flat.blendMode }),
          ...(flat.direction !== undefined && { direction: flat.direction }),
          ...(flat.spread !== undefined && { spread: flat.spread }),
          ...(flat.originX !== undefined && { originX: flat.originX }),
          ...(flat.originY !== undefined && { originY: flat.originY }),
          ...(flat.blur !== undefined && { blur: flat.blur }),
          ...(flat.randomness !== undefined && { randomness: flat.randomness }),
          ...(flat.seed !== undefined && { seed: flat.seed }),
        } as RayLayer;
      }
      if (layer.type === "halo" && !firstHaloDone) {
        firstHaloDone = true;
        return {
          ...DEFAULT_HALO_LAYER,
          id: layer.id,
          name: layer.name,
          color: layer.color,
          ...(flat.halo !== undefined && { intensity: flat.halo }),
          ...(flat.haloSize !== undefined && { size: flat.haloSize }),
          ...(flat.haloOriginX !== undefined && { originX: flat.haloOriginX }),
          ...(flat.haloOriginY !== undefined && { originY: flat.haloOriginY }),
          ...(flat.haloBlendMode !== undefined && {
            blendMode: flat.haloBlendMode,
          }),
        } as HaloLayer;
      }
      return layer;
    }) as Layer[],
  };
}

function scaleSceneForPreview(scene: SceneConfig): SceneConfig {
  const maxDim = Math.max(scene.width, scene.height);
  if (maxDim <= PREVIEW_MAX_DIMENSION) return scene;
  const ratio = PREVIEW_MAX_DIMENSION / maxDim;
  return {
    ...scene,
    width: Math.round(scene.width * ratio),
    height: Math.round(scene.height * ratio),
    layers: scene.layers.map((layer) => {
      if (layer.type === "rays") {
        return {
          ...layer,
          rayWidth: layer.rayWidth * ratio,
          blur: layer.blur * ratio,
        };
      }
      return layer;
    }) as Layer[],
  };
}

// ── Theme hook ─────────────────────────────────────────────────────────────

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

// ── Component ──────────────────────────────────────────────────────────────

export function GodRaysGenerator() {
  const { dark, toggle: toggleTheme } = useTheme();

  const [scene, setScene] = React.useState<SceneConfig>(() => {
    const colorPreset = COLOR_PRESETS.find((p) => p.key === "c_ember");
    const raysPreset = RAYS_PRESETS.find((p) => p.key === "r_side_glow");
    let s: SceneConfig = {
      ...DEFAULT_SCENE,
      layers: DEFAULT_SCENE.layers.map((l) => ({ ...l })) as Layer[],
    };
    if (colorPreset) s = applyColorPreset(s, colorPreset.config);
    if (raysPreset) s = applyRaysPreset(s, raysPreset.config);
    return s;
  });

  const [selectedLayerId, setSelectedLayerId] = React.useState<string | null>(
    null
  );
  const [copiedJson, setCopiedJson] = React.useState(false);
  const [copiedCss, setCopiedCss] = React.useState(false);
  const [exporting, setExporting] = React.useState<"png" | "jpg" | null>(null);
  const [zoom, setZoom] = React.useState(1);
  const [activeColorPreset, setActiveColorPreset] = React.useState<
    string | null
  >("c_ember");
  const [activeRaysPreset, setActiveRaysPreset] = React.useState<string | null>(
    "r_side_glow"
  );

  const previewCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const previewWrapperRef = React.useRef<HTMLDivElement>(null);
  const previewContainerRef = React.useRef<HTMLDivElement>(null);
  const rafRef = React.useRef<number | null>(null);
  const deferredScene = React.useDeferredValue(scene);

  // ── Derived layer state ──────────────────────────────────────────────────

  const selectedLayer =
    scene.layers.find((l) => l.id === selectedLayerId) ?? null;
  const selectedRayLayer =
    selectedLayer?.type === "rays" ? (selectedLayer as RayLayer) : null;
  const selectedHaloLayer =
    selectedLayer?.type === "halo" ? (selectedLayer as HaloLayer) : null;
  const selectedBgLayer =
    selectedLayer?.type === "background"
      ? (selectedLayer as BackgroundLayer)
      : null;

  const bgLayer = scene.layers.find(
    (l) => l.type === "background"
  ) as BackgroundLayer;
  const nonBgLayers = scene.layers.filter(
    (l) => l.type !== "background"
  ) as (RayLayer | HaloLayer)[];

  // ── Layer management ─────────────────────────────────────────────────────

  const updateLayer = React.useCallback(
    (id: string, changes: Partial<Record<string, unknown>>) => {
      setScene((s) => ({
        ...s,
        layers: s.layers.map((l) =>
          l.id === id ? ({ ...l, ...changes } as Layer) : l
        ),
      }));
    },
    []
  );

  const updateScene = React.useCallback(
    (changes: Partial<Pick<SceneConfig, "width" | "height" | "noise" | "grainSize">>) => {
      setScene((s) => ({ ...s, ...changes }));
    },
    []
  );

  const addLayer = React.useCallback(
    (type: "rays" | "halo") => {
      const id = `${type}-${Date.now()}`;
      setScene((s) => {
        const count = s.layers.filter((l) => l.type === type).length;
        const name =
          type === "rays" ? `Rays ${count + 1}` : `Halo ${count + 1}`;
        const firstOfType = s.layers.find((l) => l.type === type);
        const newLayer: Layer =
          type === "rays"
            ? {
                id,
                name,
                ...DEFAULT_RAY_LAYER,
                colorStart:
                  (firstOfType as RayLayer | undefined)?.colorStart ??
                  DEFAULT_RAY_LAYER.colorStart,
                colorEnd:
                  (firstOfType as RayLayer | undefined)?.colorEnd ??
                  DEFAULT_RAY_LAYER.colorEnd,
                seed: Math.floor(Math.random() * 1_000_000),
              }
            : {
                id,
                name,
                ...DEFAULT_HALO_LAYER,
                color:
                  (firstOfType as HaloLayer | undefined)?.color ??
                  DEFAULT_HALO_LAYER.color,
              };
        return { ...s, layers: [...s.layers, newLayer] };
      });
      setSelectedLayerId(id);
    },
    []
  );

  const removeLayer = React.useCallback((id: string) => {
    setScene((s) => ({ ...s, layers: s.layers.filter((l) => l.id !== id) }));
    setSelectedLayerId((prev) => (prev === id ? null : prev));
  }, []);

  const moveLayerUp = React.useCallback((id: string) => {
    setScene((s) => {
      const layers = [...s.layers];
      const idx = layers.findIndex((l) => l.id === id);
      if (idx < 0 || idx >= layers.length - 1) return s;
      [layers[idx], layers[idx + 1]] = [layers[idx + 1], layers[idx]];
      return { ...s, layers };
    });
  }, []);

  const moveLayerDown = React.useCallback((id: string) => {
    setScene((s) => {
      const layers = [...s.layers];
      const idx = layers.findIndex((l) => l.id === id);
      if (idx <= 1) return s;
      [layers[idx], layers[idx - 1]] = [layers[idx - 1], layers[idx]];
      return { ...s, layers };
    });
  }, []);

  // ── Zoom ──────────────────────────────────────────────────────────────────

  const clampZoom = (v: number) =>
    Math.round(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v)) * 100) / 100;

  const changeZoom = React.useCallback((delta: number) => {
    setZoom((z) => clampZoom(z + delta));
  }, []);

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

  // ── Canvas render ─────────────────────────────────────────────────────────

  React.useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const scaled = scaleSceneForPreview(deferredScene);
      canvas.width = scaled.width;
      canvas.height = scaled.height;
      drawScene(canvas, scaled);
    });
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [deferredScene]);

  // ── Drag to move origin ───────────────────────────────────────────────────

  const [isDragging, setIsDragging] = React.useState(false);
  const dragStartRef = React.useRef<{
    pctX: number;
    pctY: number;
    originX: number;
    originY: number;
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

  const onOverlayPointerDown = (e: React.PointerEvent) => {
    if (!selectedLayer) return;
    e.stopPropagation();
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    const pos = canvasPct(e);
    if (!pos) return;
    dragStartRef.current = {
      pctX: pos.x,
      pctY: pos.y,
      originX: selectedLayer.type !== "background" ? selectedLayer.originX : 0,
      originY: selectedLayer.type !== "background" ? selectedLayer.originY : 0,
    };
  };

  const onOverlayPointerMove = (e: React.PointerEvent) => {
    if (!dragStartRef.current || !selectedLayer) return;
    const pos = canvasPct(e);
    if (!pos) return;
    const newX =
      dragStartRef.current.originX + (pos.x - dragStartRef.current.pctX);
    const newY =
      dragStartRef.current.originY + (pos.y - dragStartRef.current.pctY);
    updateLayer(selectedLayer.id, { originX: newX, originY: newY });
  };

  const onOverlayPointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    dragStartRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  // ── Export & clipboard ────────────────────────────────────────────────────

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
      const blob = await exportScene(scene, mime, 0.95);
      const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      downloadBlob(
        blob,
        `god-rays_${scene.width}x${scene.height}_${stamp}.${type}`
      );
    } finally {
      setExporting(null);
    }
  };

  const handleCopyCss = async () => {
    const snippet = await buildSceneCssSnippet(scene);
    await navigator.clipboard.writeText(snippet);
    setCopiedCss(true);
    window.setTimeout(() => setCopiedCss(false), 1800);
  };

  const handleCopyPresetJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(scene, null, 2));
    setCopiedJson(true);
    window.setTimeout(() => setCopiedJson(false), 1800);
  };

  // ── Presets & randomize ───────────────────────────────────────────────────

  const handleRandomize = () => {
    if (selectedRayLayer) {
      updateLayer(selectedRayLayer.id, {
        seed: Math.floor(Math.random() * 1_000_000),
      });
    } else {
      setScene((s) => ({
        ...s,
        layers: s.layers.map((l) =>
          l.type === "rays"
            ? { ...l, seed: Math.floor(Math.random() * 1_000_000) }
            : l
        ) as Layer[],
      }));
    }
    setActiveRaysPreset(null);
  };

  const handleReset = () => {
    setScene({
      ...DEFAULT_SCENE,
      layers: DEFAULT_SCENE.layers.map((l) => ({ ...l })) as Layer[],
    });
    setSelectedLayerId(null);
    setActiveColorPreset(null);
    setActiveRaysPreset(null);
  };

  const applyPreset = (key: string) => {
    const preset = PRESETS.find((p) => p.key === key);
    if (!preset) return;
    if (preset.category === "color") {
      setScene((s) => applyColorPreset(s, preset.config));
      setActiveColorPreset(key);
    } else {
      setScene((s) => applyRaysPreset(s, preset.config));
      setActiveRaysPreset(key);
    }
  };

  // ── Fitted canvas size ────────────────────────────────────────────────────

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
    const ar = scene.width / scene.height;
    let w = aw;
    let h = w / ar;
    if (h > ah) {
      h = ah;
      w = h * ar;
    }
    return { w, h };
  }, [containerSize, scene.width, scene.height]);

  // ── Canvas overlays ───────────────────────────────────────────────────────

  const raysBBox = React.useMemo(() => {
    if (!selectedRayLayer) return null;
    const { w, h } = fittedSize;
    if (!w || !h) return null;
    const ox = (selectedRayLayer.originX / 100) * w;
    const oy = (selectedRayLayer.originY / 100) * h;
    const baseAngle = ((selectedRayLayer.direction - 90) * Math.PI) / 180;
    const spreadRad = (selectedRayLayer.spread * Math.PI) / 180;
    const maxLen = Math.hypot(w, h) * selectedRayLayer.rayLength;
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
  }, [fittedSize, selectedRayLayer]);

  const haloBCircle = React.useMemo(() => {
    if (!selectedHaloLayer) return null;
    const { w, h } = fittedSize;
    if (!w || !h) return null;
    const r = Math.hypot(w, h) * selectedHaloLayer.size;
    return {
      cx: (selectedHaloLayer.originX / 100) * w,
      cy: (selectedHaloLayer.originY / 100) * h,
      r,
    };
  }, [fittedSize, selectedHaloLayer]);

  // ─────────────────────────────────────────────────────────────────────────
  // JSX
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <SidebarProvider className="h-svh">
      {/* ── LEFT SIDEBAR ─────────────────────────────────────────────── */}
      <Sidebar side="left">
        <SidebarHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-semibold tracking-tight">
                Rays Generator
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-7 w-7"
              title={dark ? "Modo claro" : "Modo escuro"}
            >
              {dark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {/* PRESETS */}
          <SidebarGroup>
            <SidebarGroupLabel>Presets</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-3 px-2 pb-2">
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/50">
                    Cores
                  </p>
                  <div className="grid grid-cols-6 gap-1.5">
                    {COLOR_PRESETS.map((p) => (
                      <Tooltip key={p.key}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => applyPreset(p.key)}
                            className={cn(
                              "aspect-square w-full overflow-hidden rounded-full border border-sidebar-border/60 transition-all hover:scale-110 hover:border-sidebar-border hover:shadow-md",
                              activeColorPreset === p.key &&
                                "ring-2 ring-sidebar-ring"
                            )}
                            style={{ background: p.thumb }}
                          />
                        </TooltipTrigger>
                        <TooltipContent>{p.label}</TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/50">
                    Rays / Halo
                  </p>
                  <div className="grid grid-cols-6 gap-1.5">
                    {RAYS_PRESETS.map((p) => (
                      <Tooltip key={p.key}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => applyPreset(p.key)}
                            className={cn(
                              "aspect-square w-full overflow-hidden rounded-full border border-sidebar-border/60 transition-all hover:scale-110 hover:border-sidebar-border hover:shadow-md",
                              activeRaysPreset === p.key &&
                                "ring-2 ring-sidebar-ring"
                            )}
                            style={{ background: p.thumb }}
                          />
                        </TooltipTrigger>
                        <TooltipContent>{p.label}</TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
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
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          {/* EFFECTS (global) */}
          <SidebarGroup>
            <SidebarGroupLabel>Efeitos globais</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-4 px-2 pb-2">
                <Field label="Ruído / grão" value={scene.noise.toFixed(0)}>
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={[scene.noise]}
                    onValueChange={([v]) => updateScene({ noise: v })}
                  />
                </Field>
                <Field
                  label="Tamanho do grão"
                  value={scene.grainSize.toFixed(0)}
                  unit="px"
                >
                  <Slider
                    min={1}
                    max={6}
                    step={1}
                    value={[scene.grainSize]}
                    onValueChange={([v]) => updateScene({ grainSize: v })}
                  />
                </Field>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          {/* DIMENSIONS */}
          <SidebarGroup>
            <SidebarGroupLabel>Dimensões</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-4 px-2 pb-2">
                <Field label="Preset">
                  <Select
                    defaultValue={String(
                      DIMENSION_PRESETS.findIndex(
                        (p) => p.w === 1920 && p.h === 1080
                      )
                    )}
                    onValueChange={(v) => {
                      const p = DIMENSION_PRESETS[parseInt(v, 10)];
                      if (p) updateScene({ width: p.w, height: p.h });
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
                  <Field label="Largura" unit="px" value={scene.width}>
                    <Input
                      type="number"
                      min={64}
                      max={8000}
                      value={scene.width}
                      onChange={(e) =>
                        updateScene({
                          width: clampNum(e.target.value, 64, 8000),
                        })
                      }
                    />
                  </Field>
                  <Field label="Altura" unit="px" value={scene.height}>
                    <Input
                      type="number"
                      min={64}
                      max={8000}
                      value={scene.height}
                      onChange={(e) =>
                        updateScene({
                          height: clampNum(e.target.value, 64, 8000),
                        })
                      }
                    />
                  </Field>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {/* ── CENTER: Preview ───────────────────────────────────────────── */}
      <SidebarInset className="relative w-full">
        <div className="flex items-center justify-end gap-3 bg-background border-b border-border px-5 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyPresetJson}
              className="gap-2"
            >
              {copiedJson ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copiedJson ? "Copiado" : "Copiar JSON"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyCss}
              className="gap-2"
            >
              {copiedCss ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Code2 className="h-4 w-4" />
              )}
              {copiedCss ? "Copiado" : "Copiar CSS"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleExport("jpg")}
              disabled={exporting !== null}
              className="gap-2"
            >
              <ImageIcon className="h-4 w-4" /> JPG
            </Button>
            <Button
              size="sm"
              onClick={() => handleExport("png")}
              disabled={exporting !== null}
              className="gap-2"
            >
              <Download className="h-4 w-4" /> PNG
            </Button>
          </div>
        </div>

        <div
          ref={previewContainerRef}
          className="relative flex flex-1 items-center justify-center overflow-hidden bg-checker"
          onClick={() => setSelectedLayerId(null)}
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
          >
            <canvas
              ref={previewCanvasRef}
              className="block h-full w-full rounded-md shadow-2xl ring-1 ring-border"
            />

            {/* Rays overlay */}
            {selectedRayLayer && raysBBox && (
              <div
                className={cn(
                  "absolute",
                  isDragging ? "cursor-grabbing" : "cursor-grab"
                )}
                style={{
                  left: raysBBox.x,
                  top: raysBBox.y,
                  width: raysBBox.w,
                  height: raysBBox.h,
                }}
                onPointerDown={onOverlayPointerDown}
                onPointerMove={onOverlayPointerMove}
                onPointerUp={onOverlayPointerUp}
                onPointerCancel={onOverlayPointerUp}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="pointer-events-none absolute inset-0 border border-dashed border-blue-400/80" />
                <span className="pointer-events-none absolute -top-5 left-0 rounded bg-blue-400 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {selectedRayLayer.name}
                </span>
                <span className="pointer-events-none absolute -left-1 -top-1 h-2 w-2 rounded-sm bg-blue-400" />
                <span className="pointer-events-none absolute -right-1 -top-1 h-2 w-2 rounded-sm bg-blue-400" />
                <span className="pointer-events-none absolute -bottom-1 -left-1 h-2 w-2 rounded-sm bg-blue-400" />
                <span className="pointer-events-none absolute -bottom-1 -right-1 h-2 w-2 rounded-sm bg-blue-400" />
                <OriginCrosshair
                  color="blue"
                  style={{
                    left:
                      (selectedRayLayer.originX / 100) * fittedSize.w -
                      raysBBox.x,
                    top:
                      (selectedRayLayer.originY / 100) * fittedSize.h -
                      raysBBox.y,
                  }}
                />
              </div>
            )}

            {/* Halo overlay */}
            {selectedHaloLayer && haloBCircle && (
              <div
                className={cn(
                  "absolute",
                  isDragging ? "cursor-grabbing" : "cursor-grab"
                )}
                style={{
                  left: haloBCircle.cx - haloBCircle.r,
                  top: haloBCircle.cy - haloBCircle.r,
                  width: haloBCircle.r * 2,
                  height: haloBCircle.r * 2,
                }}
                onPointerDown={onOverlayPointerDown}
                onPointerMove={onOverlayPointerMove}
                onPointerUp={onOverlayPointerUp}
                onPointerCancel={onOverlayPointerUp}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="pointer-events-none absolute inset-0 rounded-full border border-dashed border-amber-400/80" />
                <span className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-semibold text-black">
                  {selectedHaloLayer.name}
                </span>
                <OriginCrosshair
                  color="amber"
                  className="left-1/2 top-1/2"
                />
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
              className="h-7 w-7 rounded-full"
              title="Diminuir zoom"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => setZoom(1)}
              className="h-7 min-w-[52px] px-1 text-xs font-medium tabular-nums"
              title="Resetar zoom"
            >
              {Math.round(zoom * 100)}%
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => changeZoom(ZOOM_STEP)}
              disabled={zoom >= MAX_ZOOM}
              className="h-7 w-7 rounded-full"
              title="Aumentar zoom"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <div className="mx-1 h-4 w-px bg-border" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setZoom(1)}
              className="h-7 w-7 rounded-full"
              title="Zoom 100%"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 bg-background border-t border-border px-5 py-2 text-xs text-muted-foreground">
          <span>
            {scene.width} × {scene.height}px ·{" "}
            {((scene.width * scene.height) / 1_000_000).toFixed(2)} MP
          </span>
          <span>Arraste no preview para mover a origem</span>
        </div>
      </SidebarInset>

      {/* ── RIGHT SIDEBAR ────────────────────────────────────────────── */}
      <Sidebar side="right">
        {/* Header */}
        <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
          {selectedLayerId === null ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-sidebar-foreground/40">
                  Painel
                </p>
                <h2 className="text-base font-bold tracking-tight">Camadas</h2>
              </div>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sidebar-primary/10 text-xs font-semibold text-sidebar-primary">
                {nonBgLayers.length + 1}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-sidebar-foreground/60 hover:text-sidebar-foreground"
                onClick={() => setSelectedLayerId(null)}
                title="Voltar para camadas"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-sidebar-foreground/40">
                  Camada
                </p>
                <h2 className="text-sm font-bold tracking-tight">
                  {selectedLayer?.type === "rays" && (selectedLayer as RayLayer).name}
                  {selectedLayer?.type === "halo" && (selectedLayer as HaloLayer).name}
                  {selectedLayer?.type === "background" && "Background"}
                </h2>
              </div>
            </div>
          )}
        </SidebarHeader>

        <SidebarContent>
          {/* ── LAYERS LIST ──────────────────────────────────────────── */}
          {selectedLayerId === null && (
            <div className="flex flex-col">
              {/* Add layer buttons */}
              <div className="flex gap-2 border-b border-sidebar-border p-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5 text-xs"
                  onClick={() => addLayer("rays")}
                >
                  <Plus className="h-3.5 w-3.5" /> Rays
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5 text-xs"
                  onClick={() => addLayer("halo")}
                >
                  <Plus className="h-3.5 w-3.5" /> Halo
                </Button>
              </div>

              {/* Layer cards */}
              <div className="flex flex-col gap-2 p-3">
                {/* Non-background layers in reverse visual order (top of stack first) */}
                {[...nonBgLayers].reverse().map((layer) => {
                  const arrayIdx = scene.layers.findIndex(
                    (l) => l.id === layer.id
                  );
                  const canMoveUp = arrayIdx < scene.layers.length - 1;
                  const canMoveDown = arrayIdx > 1;

                  return (
                    <div
                      key={layer.id}
                      className="group rounded-xl border border-sidebar-border bg-sidebar-accent/30 transition-all hover:border-sidebar-border/80 hover:bg-sidebar-accent hover:shadow-sm"
                    >
                      {/* Clickable area */}
                      <button
                        className="w-full p-3 text-left"
                        onClick={() => setSelectedLayerId(layer.id)}
                      >
                        <div className="mb-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sidebar-primary/10 text-sidebar-primary">
                              {layer.type === "rays" ? (
                                <Move className="h-3.5 w-3.5" />
                              ) : (
                                <Sparkles className="h-3.5 w-3.5" />
                              )}
                            </div>
                            <span className="text-sm font-semibold">
                              {layer.name}
                            </span>
                          </div>
                          <ChevronLeft className="h-4 w-4 rotate-180 text-sidebar-foreground/30 transition-colors group-hover:text-sidebar-foreground/60" />
                        </div>

                        {/* Color preview */}
                        {layer.type === "rays" && (
                          <div
                            className="mb-2 h-8 w-full rounded-lg border border-sidebar-border/40"
                            style={{
                              background: `linear-gradient(135deg, ${layer.colorStart}, ${
                                layer.fadeToTransparent
                                  ? "transparent"
                                  : layer.colorEnd
                              })`,
                            }}
                          />
                        )}
                        {layer.type === "halo" && (
                          <div
                            className="mb-2 h-8 w-full rounded-lg border border-sidebar-border/40"
                            style={{
                              background: `radial-gradient(ellipse at center, ${layer.color} 0%, transparent 70%)`,
                            }}
                          />
                        )}

                        {/* Metadata */}
                        <div className="flex items-center gap-2 text-[11px] text-sidebar-foreground/50">
                          {layer.type === "rays" && (
                            <>
                              <span>{layer.rayCount} raios</span>
                              <span className="h-1 w-1 rounded-full bg-sidebar-foreground/30" />
                              <span>
                                {Math.round(layer.opacity * 100)}% opac.
                              </span>
                            </>
                          )}
                          {layer.type === "halo" && (
                            <>
                              <span>
                                {Math.round(layer.intensity * 100)}% intens.
                              </span>
                              <span className="h-1 w-1 rounded-full bg-sidebar-foreground/30" />
                              <span
                                className="font-mono uppercase"
                                style={{ color: layer.color }}
                              >
                                {layer.color}
                              </span>
                            </>
                          )}
                        </div>
                      </button>

                      {/* Layer controls */}
                      <div className="flex items-center justify-between border-t border-sidebar-border/50 px-2 py-1.5">
                        <span className="px-1 text-[10px] font-medium uppercase tracking-widest text-sidebar-foreground/30">
                          {layer.type}
                        </span>
                        <div className="flex items-center gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded text-sidebar-foreground/40 hover:text-sidebar-foreground"
                            disabled={!canMoveUp}
                            onClick={(e) => {
                              e.stopPropagation();
                              moveLayerUp(layer.id);
                            }}
                            title="Mover para cima"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded text-sidebar-foreground/40 hover:text-sidebar-foreground"
                            disabled={!canMoveDown}
                            onClick={(e) => {
                              e.stopPropagation();
                              moveLayerDown(layer.id);
                            }}
                            title="Mover para baixo"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded text-sidebar-foreground/40 hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeLayer(layer.id);
                            }}
                            title="Remover camada"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Background card (always at bottom, no move/delete) */}
                <button
                  className="group w-full rounded-xl border border-sidebar-border bg-sidebar-accent/30 p-3 text-left transition-all hover:border-sidebar-border/80 hover:bg-sidebar-accent hover:shadow-sm"
                  onClick={() => setSelectedLayerId("background")}
                >
                  <div className="mb-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sidebar-primary/10 text-sidebar-primary">
                        <ImageIcon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm font-semibold">Background</span>
                    </div>
                    <ChevronLeft className="h-4 w-4 rotate-180 text-sidebar-foreground/30 transition-colors group-hover:text-sidebar-foreground/60" />
                  </div>
                  <div
                    className="mb-2 h-8 w-full rounded-lg border border-sidebar-border/40"
                    style={{
                      background:
                        bgLayer.bgType === "gradient"
                          ? `linear-gradient(135deg, ${bgLayer.bgColor}, ${bgLayer.bgColor2})`
                          : bgLayer.bgType === "solid"
                          ? bgLayer.bgColor
                          : undefined,
                    }}
                  >
                    {bgLayer.bgType === "transparent" && (
                      <div className="h-full w-full rounded-lg bg-checker" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-sidebar-foreground/50 capitalize">
                    <span>{bgLayer.bgType}</span>
                    {bgLayer.bgType !== "transparent" && (
                      <>
                        <span className="h-1 w-1 rounded-full bg-sidebar-foreground/30" />
                        <span className="font-mono uppercase">
                          {bgLayer.bgColor}
                        </span>
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ── RAYS PROPERTIES ──────────────────────────────────────── */}
          {selectedRayLayer && (
            <>
              <SidebarGroup>
                <SidebarGroupLabel>Cores</SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="space-y-3 px-2 pb-2">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center gap-1.5">
                        <ColorPicker
                          value={selectedRayLayer.colorStart}
                          onChange={(v) =>
                            updateLayer(selectedRayLayer.id, { colorStart: v })
                          }
                        />
                        <span className="text-[11px] text-sidebar-foreground/60">
                          Início
                        </span>
                      </div>
                      <div
                        className="h-9 flex-1 rounded-lg border border-sidebar-border/40"
                        style={{
                          background: `linear-gradient(to right, ${
                            selectedRayLayer.colorStart
                          }, ${
                            selectedRayLayer.fadeToTransparent
                              ? "transparent"
                              : selectedRayLayer.colorEnd
                          })`,
                        }}
                      />
                      <div className="flex flex-col items-center gap-1.5">
                        <ColorPicker
                          value={selectedRayLayer.colorEnd}
                          onChange={(v) =>
                            updateLayer(selectedRayLayer.id, { colorEnd: v })
                          }
                        />
                        <span className="text-[11px] text-sidebar-foreground/60">
                          Fim
                        </span>
                      </div>
                    </div>
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <Checkbox
                        checked={selectedRayLayer.fadeToTransparent}
                        onCheckedChange={(v) =>
                          updateLayer(selectedRayLayer.id, {
                            fadeToTransparent: v === true,
                          })
                        }
                      />
                      Desvanecer para transparente
                    </label>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarSeparator />

              <SidebarGroup>
                <SidebarGroupLabel>Forma</SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="space-y-4 px-2 pb-2">
                    <Field label="Quantidade" value={selectedRayLayer.rayCount}>
                      <Slider
                        min={1}
                        max={200}
                        step={1}
                        value={[selectedRayLayer.rayCount]}
                        onValueChange={([v]) =>
                          updateLayer(selectedRayLayer.id, { rayCount: v })
                        }
                      />
                    </Field>
                    <Field
                      label="Largura base"
                      unit="px"
                      value={selectedRayLayer.rayWidth.toFixed(0)}
                    >
                      <Slider
                        min={1}
                        max={400}
                        step={1}
                        value={[selectedRayLayer.rayWidth]}
                        onValueChange={([v]) =>
                          updateLayer(selectedRayLayer.id, { rayWidth: v })
                        }
                      />
                    </Field>
                    <Field
                      label="Divergência"
                      value={selectedRayLayer.divergence.toFixed(2)}
                      hint="1 = paralelos, >1 = abrem para a ponta, <1 = fecham"
                    >
                      <Slider
                        min={0.1}
                        max={5}
                        step={0.05}
                        value={[selectedRayLayer.divergence]}
                        onValueChange={([v]) =>
                          updateLayer(selectedRayLayer.id, { divergence: v })
                        }
                      />
                    </Field>
                    <Field
                      label="Comprimento"
                      value={selectedRayLayer.rayLength.toFixed(2)}
                      unit="× diag"
                    >
                      <Slider
                        min={0.2}
                        max={2.5}
                        step={0.05}
                        value={[selectedRayLayer.rayLength]}
                        onValueChange={([v]) =>
                          updateLayer(selectedRayLayer.id, { rayLength: v })
                        }
                      />
                    </Field>
                    <Field
                      label="Opacidade"
                      value={(selectedRayLayer.opacity * 100).toFixed(0)}
                      unit="%"
                    >
                      <Slider
                        min={0}
                        max={1}
                        step={0.01}
                        value={[selectedRayLayer.opacity]}
                        onValueChange={([v]) =>
                          updateLayer(selectedRayLayer.id, { opacity: v })
                        }
                      />
                    </Field>
                    <Field
                      label="Blur"
                      value={selectedRayLayer.blur.toFixed(1)}
                      unit="px"
                    >
                      <Slider
                        min={0}
                        max={80}
                        step={0.5}
                        value={[selectedRayLayer.blur]}
                        onValueChange={([v]) =>
                          updateLayer(selectedRayLayer.id, { blur: v })
                        }
                      />
                    </Field>
                    <Field label="Blend mode">
                      <BlendModeSelect
                        value={selectedRayLayer.blendMode}
                        onChange={(v) =>
                          updateLayer(selectedRayLayer.id, { blendMode: v })
                        }
                      />
                    </Field>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarSeparator />

              <SidebarGroup>
                <SidebarGroupLabel>Direção e origem</SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="space-y-4 px-2 pb-2">
                    <Field
                      label="Direção"
                      value={selectedRayLayer.direction.toFixed(0)}
                      unit="°"
                      hint="0° aponta para cima · 90° direita · 180° baixo · 270° esquerda"
                    >
                      <Slider
                        min={0}
                        max={360}
                        step={1}
                        value={[selectedRayLayer.direction]}
                        onValueChange={([v]) =>
                          updateLayer(selectedRayLayer.id, { direction: v })
                        }
                      />
                    </Field>
                    <Field
                      label="Abertura (spread)"
                      value={selectedRayLayer.spread.toFixed(0)}
                      unit="°"
                    >
                      <Slider
                        min={0}
                        max={360}
                        step={1}
                        value={[selectedRayLayer.spread]}
                        onValueChange={([v]) =>
                          updateLayer(selectedRayLayer.id, { spread: v })
                        }
                      />
                    </Field>
                    <OriginInputs
                      x={selectedRayLayer.originX}
                      y={selectedRayLayer.originY}
                      onXChange={(v) =>
                        updateLayer(selectedRayLayer.id, { originX: v })
                      }
                      onYChange={(v) =>
                        updateLayer(selectedRayLayer.id, { originY: v })
                      }
                    />
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarSeparator />

              <SidebarGroup>
                <SidebarGroupLabel>Aleatoriedade</SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="space-y-4 px-2 pb-2">
                    <Field
                      label="Variação"
                      value={selectedRayLayer.randomness.toFixed(0)}
                      unit="%"
                      hint="Jitter na largura, comprimento e ângulo de cada raio"
                    >
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[selectedRayLayer.randomness]}
                        onValueChange={([v]) =>
                          updateLayer(selectedRayLayer.id, { randomness: v })
                        }
                      />
                    </Field>
                    <div className="grid grid-cols-[1fr_auto] items-end gap-2">
                      <Field label="Seed" value={selectedRayLayer.seed}>
                        <Input
                          type="number"
                          value={selectedRayLayer.seed}
                          onChange={(e) =>
                            updateLayer(selectedRayLayer.id, {
                              seed: clampNum(e.target.value, 0, 1_000_000),
                            })
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
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            </>
          )}

          {/* ── HALO PROPERTIES ──────────────────────────────────────── */}
          {selectedHaloLayer && (
            <SidebarGroup>
              <SidebarGroupLabel>Halo</SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="space-y-4 px-2 pb-2">
                  <Field label="Cor">
                    <div className="flex items-center gap-3">
                      <ColorPicker
                        value={selectedHaloLayer.color}
                        onChange={(v) =>
                          updateLayer(selectedHaloLayer.id, { color: v })
                        }
                      />
                      <span className="font-mono text-xs text-sidebar-foreground/60">
                        {selectedHaloLayer.color}
                      </span>
                    </div>
                  </Field>
                  <Field
                    label="Intensidade"
                    value={(selectedHaloLayer.intensity * 100).toFixed(0)}
                    unit="%"
                  >
                    <Slider
                      min={0}
                      max={1}
                      step={0.01}
                      value={[selectedHaloLayer.intensity]}
                      onValueChange={([v]) =>
                        updateLayer(selectedHaloLayer.id, { intensity: v })
                      }
                    />
                  </Field>
                  <Field
                    label="Tamanho"
                    value={(selectedHaloLayer.size * 100).toFixed(0)}
                    unit="%"
                  >
                    <Slider
                      min={0.05}
                      max={1.5}
                      step={0.01}
                      value={[selectedHaloLayer.size]}
                      onValueChange={([v]) =>
                        updateLayer(selectedHaloLayer.id, { size: v })
                      }
                    />
                  </Field>
                  <Field label="Blend mode">
                    <BlendModeSelect
                      value={selectedHaloLayer.blendMode}
                      onChange={(v) =>
                        updateLayer(selectedHaloLayer.id, { blendMode: v })
                      }
                    />
                  </Field>
                  <OriginInputs
                    x={selectedHaloLayer.originX}
                    y={selectedHaloLayer.originY}
                    onXChange={(v) =>
                      updateLayer(selectedHaloLayer.id, { originX: v })
                    }
                    onYChange={(v) =>
                      updateLayer(selectedHaloLayer.id, { originY: v })
                    }
                  />
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* ── BACKGROUND PROPERTIES ────────────────────────────────── */}
          {selectedBgLayer && (
            <SidebarGroup>
              <SidebarGroupLabel>Background</SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="space-y-4 px-2 pb-2">
                  <Field label="Tipo">
                    <Select
                      value={selectedBgLayer.bgType}
                      onValueChange={(v) =>
                        updateLayer("background", { bgType: v as BackgroundType })
                      }
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
                  {selectedBgLayer.bgType === "solid" && (
                    <div className="flex items-center gap-3">
                      <ColorPicker
                        value={selectedBgLayer.bgColor}
                        onChange={(v) =>
                          updateLayer("background", { bgColor: v })
                        }
                      />
                      <span className="font-mono text-xs text-sidebar-foreground/60">
                        {selectedBgLayer.bgColor}
                      </span>
                    </div>
                  )}
                  {selectedBgLayer.bgType === "gradient" && (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center gap-1.5">
                          <ColorPicker
                            value={selectedBgLayer.bgColor}
                            onChange={(v) =>
                              updateLayer("background", { bgColor: v })
                            }
                          />
                          <span className="text-[11px] text-sidebar-foreground/60">
                            Início
                          </span>
                        </div>
                        <div
                          className="h-9 flex-1 rounded-lg border border-sidebar-border/40"
                          style={{
                            background: `linear-gradient(to right, ${selectedBgLayer.bgColor}, ${selectedBgLayer.bgColor2})`,
                          }}
                        />
                        <div className="flex flex-col items-center gap-1.5">
                          <ColorPicker
                            value={selectedBgLayer.bgColor2}
                            onChange={(v) =>
                              updateLayer("background", { bgColor2: v })
                            }
                          />
                          <span className="text-[11px] text-sidebar-foreground/60">
                            Fim
                          </span>
                        </div>
                      </div>
                      <Field
                        label="Ângulo"
                        value={selectedBgLayer.bgGradientAngle.toFixed(0)}
                        unit="°"
                      >
                        <Slider
                          min={0}
                          max={360}
                          step={1}
                          value={[selectedBgLayer.bgGradientAngle]}
                          onValueChange={([v]) =>
                            updateLayer("background", { bgGradientAngle: v })
                          }
                        />
                      </Field>
                    </>
                  )}
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
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
