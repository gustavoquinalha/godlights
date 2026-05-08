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
  CopyPlus,
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
  SaveIcon,
  Trash2Icon,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useTheme } from "@/components/theme-provider";

const DIMENSION_PRESETS: { label: string; w: number; h: number }[] = [
  { label: "Square 1:1", w: 1080, h: 1080 },
  { label: "Story 9:16", w: 1080, h: 1920 },
  { label: "Post 4:5", w: 1080, h: 1350 },
  { label: "HD 16:9", w: 1920, h: 1080 },
  { label: "2K 16:9", w: 2560, h: 1440 },
  { label: "4K 16:9", w: 3840, h: 2160 },
  { label: "Wide 21:9", w: 2560, h: 1080 },
  { label: "OG Image", w: 1200, h: 630 },
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

// ── Component ──────────────────────────────────────────────────────────────

export function GodRaysGenerator() {
  const { theme, setTheme } = useTheme();
  const dark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  const toggleTheme = () => setTheme(dark ? "light" : "dark");

  const [scene, setScene] = React.useState<SceneConfig>(() => {
    try {
      const saved = localStorage.getItem("rays-scene");
      if (saved) return JSON.parse(saved) as SceneConfig;
    } catch {
      /* ignore corrupt data */
    }
    const colorPreset = COLOR_PRESETS.find((p) => p.key === "c_contentnow");
    const raysPreset = RAYS_PRESETS.find((p) => p.key === "r_side_glow");
    let s: SceneConfig = {
      ...DEFAULT_SCENE,
      layers: DEFAULT_SCENE.layers.map((l) => ({ ...l })) as Layer[],
    };
    if (colorPreset) s = applyColorPreset(s, colorPreset.config);
    if (raysPreset) s = applyRaysPreset(s, raysPreset.config);
    return s;
  });

  // Persist scene to localStorage on every change (debounced)
  React.useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        localStorage.setItem("rays-scene", JSON.stringify(scene));
      } catch {
        /* quota */
      }
    }, 500);
    return () => window.clearTimeout(id);
  }, [scene]);


  // ── Saves ────────────────────────────────────────────────────────────────

  interface SavedScene {
    id: string;
    thumb: string;
    scene: SceneConfig;
    createdAt: number;
    activeColorPreset?: string | null;
    activeRaysPreset?: string | null;
  }

  const [saves, setSaves] = React.useState<SavedScene[]>(() => {
    try {
      const raw = localStorage.getItem("rays-saves");
      return raw ? (JSON.parse(raw) as SavedScene[]) : [];
    } catch { return []; }
  });
  const [selectedSaveId, setSelectedSaveId] = React.useState<string | null>(null);

  React.useEffect(() => {
    try { localStorage.setItem("rays-saves", JSON.stringify(saves)); } catch { /* quota */ }
  }, [saves]);

  const [activeColorPreset, setActiveColorPreset] = React.useState<string | null>(() => {
    try {
      const raw = localStorage.getItem("rays-ui-state");
      if (raw) {
        const parsed = JSON.parse(raw) as { activeColorPreset?: string | null };
        return parsed.activeColorPreset ?? "c_contentnow";
      }
    } catch { /* ignore */ }
    return "c_contentnow";
  });
  const [activeRaysPreset, setActiveRaysPreset] = React.useState<string | null>(() => {
    try {
      const raw = localStorage.getItem("rays-ui-state");
      if (raw) {
        const parsed = JSON.parse(raw) as { activeRaysPreset?: string | null };
        return parsed.activeRaysPreset ?? "r_side_glow";
      }
    } catch { /* ignore */ }
    return "r_side_glow";
  });

  // Persist active preset keys immediately
  React.useEffect(() => {
    try {
      localStorage.setItem(
        "rays-ui-state",
        JSON.stringify({ activeColorPreset, activeRaysPreset })
      );
    } catch { /* quota */ }
  }, [activeColorPreset, activeRaysPreset]);

  const generateThumb = React.useCallback(async (s: SceneConfig): Promise<string> => {
    const thumbW = 192;
    const thumbH = Math.round(192 * (s.height / s.width));
    const canvas = document.createElement("canvas");
    canvas.width = thumbW;
    canvas.height = thumbH;
    const ratio = thumbW / s.width;
    const scaled: SceneConfig = {
      ...s,
      width: thumbW,
      height: thumbH,
      layers: s.layers.map((l) =>
        l.type === "rays"
          ? { ...l, rayWidth: l.rayWidth * ratio, blur: l.blur * ratio }
          : l
      ) as Layer[],
    };
    drawScene(canvas, scaled);
    return canvas.toDataURL("image/jpeg", 0.8);
  }, []);

  const handleSaveSlot = React.useCallback(async () => {
    const thumb = await generateThumb(scene);
    const newSave: SavedScene = {
      id: `save-${Date.now()}`,
      thumb,
      scene: JSON.parse(JSON.stringify(scene)) as SceneConfig,
      createdAt: Date.now(),
      activeColorPreset,
      activeRaysPreset,
    };
    setSaves((prev) => [newSave, ...prev]);
    setSelectedSaveId(newSave.id);
  }, [scene, generateThumb, activeColorPreset, activeRaysPreset]);

  const handleDeleteSave = React.useCallback((id: string) => {
    setSaves((prev) => prev.filter((s) => s.id !== id));
    setSelectedSaveId((prev) => (prev === id ? null : prev));
  }, []);

  const handleLoadSave = React.useCallback((save: SavedScene) => {
    setScene(save.scene);
    setSelectedSaveId(save.id);
    setSelectedLayerId(null);
    setActiveColorPreset(save.activeColorPreset ?? null);
    setActiveRaysPreset(save.activeRaysPreset ?? null);
  }, []);

  const [selectedLayerId, setSelectedLayerId] = React.useState<string | null>(
    null
  );
  const [copiedJson, setCopiedJson] = React.useState(false);
  const [copiedCss, setCopiedCss] = React.useState(false);
  const [exporting, setExporting] = React.useState<"png" | "jpg" | null>(null);
  const [zoom, setZoom] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const zoomRef = React.useRef(1);
  const panRef = React.useRef({ x: 0, y: 0 });
  const containerSizeRef = React.useRef({ w: 0, h: 0 });
  const fittedSizeRef = React.useRef({ w: 0, h: 0 });
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
  const nonBgLayers = scene.layers.filter((l) => l.type !== "background") as (
    | RayLayer
    | HaloLayer
  )[];

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
    (
      changes: Partial<
        Pick<SceneConfig, "width" | "height" | "noise" | "grainSize">
      >
    ) => {
      setScene((s) => ({ ...s, ...changes }));
    },
    []
  );

  const addLayer = React.useCallback((type: "rays" | "halo") => {
    const id = `${type}-${Date.now()}`;
    setScene((s) => {
      const count = s.layers.filter((l) => l.type === type).length;
      const name = type === "rays" ? `Rays ${count + 1}` : `Halo ${count + 1}`;
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
  }, []);

  const duplicateLayer = React.useCallback((id: string) => {
    const newId = `${id.split("-")[0]}-${Date.now()}`;
    setScene((s) => {
      const idx = s.layers.findIndex((l) => l.id === id);
      if (idx < 0) return s;
      const original = s.layers[idx];
      const copy: Layer = {
        ...original,
        id: newId,
        ...(original.type !== "background" && {
          name: `${original.name} (cópia)`,
          seed:
            original.type === "rays"
              ? Math.floor(Math.random() * 1_000_000)
              : undefined,
        }),
      } as Layer;
      const layers = [...s.layers];
      layers.splice(idx + 1, 0, copy);
      return { ...s, layers };
    });
    setSelectedLayerId(newId);
  }, []);

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

  // Keep refs in sync (zoom + pan only; containerSize/fittedSize synced after their declarations)
  React.useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);
  React.useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  const changeZoom = React.useCallback((delta: number) => {
    setZoom((z) => clampZoom(z + delta));
  }, []);

  const resetView = React.useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  React.useEffect(() => {
    const el = previewContainerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const curZoom = zoomRef.current;
      const { x: panX, y: panY } = panRef.current;
      const { w: cw, h: ch } = containerSizeRef.current;
      const { w: fw, h: fh } = fittedSizeRef.current;

      const newZoom = clampZoom(
        curZoom + (e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP)
      );

      // Wrapper center in container space
      const wrapperCX = cw / 2 + panX;
      const wrapperCY = ch / 2 + panY;

      // Canvas-space point under the mouse (relative to wrapper center)
      const canvasX = (mx - wrapperCX) / curZoom;
      const canvasY = (my - wrapperCY) / curZoom;

      // Adjust pan so that same canvas point stays under mouse
      const newPanX = mx - canvasX * newZoom - cw / 2;
      const newPanY = my - canvasY * newZoom - ch / 2;

      // Suppress pan when canvas hasn't sized yet
      if (!fw || !fh) return;

      zoomRef.current = newZoom;
      panRef.current = { x: newPanX, y: newPanY };
      setZoom(newZoom);
      setPan({ x: newPanX, y: newPanY });
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
    const colorPreset = COLOR_PRESETS.find((p) => p.key === "c_contentnow");
    const raysPreset = RAYS_PRESETS.find((p) => p.key === "r_side_glow");
    let s: SceneConfig = {
      ...DEFAULT_SCENE,
      layers: DEFAULT_SCENE.layers.map((l) => ({ ...l })) as Layer[],
    };
    if (colorPreset) s = applyColorPreset(s, colorPreset.config);
    if (raysPreset) s = applyRaysPreset(s, raysPreset.config);
    setScene(s);
    setSelectedLayerId(null);
    setActiveColorPreset("c_contentnow");
    setActiveRaysPreset("r_side_glow");
    localStorage.removeItem("rays-scene");
    localStorage.removeItem("rays-ui-state");
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

  // Sync size refs (used in the wheel handler to avoid stale closures)
  React.useEffect(() => {
    containerSizeRef.current = containerSize;
  }, [containerSize]);
  React.useEffect(() => {
    fittedSizeRef.current = fittedSize;
  }, [fittedSize]);

  // Reset pan when the scene output dimensions change
  const prevSceneDimRef = React.useRef({ w: scene.width, h: scene.height });
  React.useEffect(() => {
    if (
      prevSceneDimRef.current.w !== scene.width ||
      prevSceneDimRef.current.h !== scene.height
    ) {
      setPan({ x: 0, y: 0 });
      prevSceneDimRef.current = { w: scene.width, h: scene.height };
    }
  }, [scene.width, scene.height]);

  // ── Canvas overlays ───────────────────────────────────────────────────────

  const layerBounds = React.useMemo(() => {
    const { w, h } = fittedSize;
    if (!w || !h)
      return new Map<
        string,
        {
          type: "rays" | "halo";
          bbox: { x: number; y: number; w: number; h: number };
        }
      >();
    const map = new Map<
      string,
      {
        type: "rays" | "halo";
        bbox: { x: number; y: number; w: number; h: number };
      }
    >();
    for (const layer of nonBgLayers) {
      if (layer.type === "rays") {
        const ox = (layer.originX / 100) * w;
        const oy = (layer.originY / 100) * h;
        const baseAngle = ((layer.direction - 90) * Math.PI) / 180;
        const spreadRad = (layer.spread * Math.PI) / 180;
        const maxLen = Math.hypot(w, h) * layer.rayLength;
        const pts: [number, number][] = [[ox, oy]];
        for (let i = 0; i <= 64; i++) {
          const angle = baseAngle - spreadRad / 2 + spreadRad * (i / 64);
          pts.push([
            ox + Math.cos(angle) * maxLen,
            oy + Math.sin(angle) * maxLen,
          ]);
        }
        const xs = pts.map((p) => p[0]);
        const ys = pts.map((p) => p[1]);
        const x = Math.min(...xs);
        const y = Math.min(...ys);
        map.set(layer.id, {
          type: "rays",
          bbox: { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y },
        });
      } else if (layer.type === "halo") {
        const r = Math.hypot(w, h) * layer.size;
        const cx = (layer.originX / 100) * w;
        const cy = (layer.originY / 100) * h;
        map.set(layer.id, {
          type: "halo",
          bbox: { x: cx - r, y: cy - r, w: r * 2, h: r * 2 },
        });
      }
    }
    return map;
  }, [fittedSize, nonBgLayers]);

  const selectedBounds = selectedLayerId
    ? layerBounds.get(selectedLayerId) ?? null
    : null;
  const raysBBox =
    selectedRayLayer && selectedBounds ? selectedBounds.bbox : null;

  // ─────────────────────────────────────────────────────────────────────────
  // JSX
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <SidebarProvider className="h-svh">
      {/* ── LEFT SIDEBAR ─────────────────────────────────────────────── */}
      <Sidebar side="left">
        <SidebarHeader className="border-b border-sidebar-border px-4 py-3 h-14 flex justify-center">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="size-3 text-amber-400" />
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
              {dark ? <Sun className="size-3" /> : <Moon className="size-3" />}
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
                              "aspect-square w-full overflow-hidden rounded-md border border-sidebar-border/60 transition-all hover:scale-110 hover:border-sidebar-border hover:shadow-md",
                              activeColorPreset === p.key &&
                                "ring-2 ring-primary"
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
                              "aspect-square w-full overflow-hidden rounded-md border border-sidebar-border/60 transition-all hover:scale-110 hover:border-sidebar-border hover:shadow-md",
                              activeRaysPreset === p.key &&
                                "ring-2 ring-primary"
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
                    <Shuffle className="size-3" /> Aleatório
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
              <div className="space-y-8 px-2 pb-2">
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
              <div className="space-y-8 px-2 h-full">
                <Field label="Preset">
                  <Select
                    value={String(
                      DIMENSION_PRESETS.findIndex(
                        (p) => p.w === scene.width && p.h === scene.height
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

                <div className="flex-1 h-full flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="w-full"
                  >
                    <RotateCcw className="size-3" /> Reset
                  </Button>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {/* ── CENTER: Preview ───────────────────────────────────────────── */}
      <SidebarInset className="relative w-full">
        <div className="flex items-center justify-end gap-3 bg-background border-b border-border px-5 py-3 h-14">
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleCopyPresetJson}>
              {copiedJson ? (
                <Check className="size-3 " />
              ) : (
                <Copy className="size-2.5" />
              )}
              {copiedJson ? "Copiado" : "Copiar JSON"}
            </Button>
            <Button size="sm" variant="outline" onClick={handleCopyCss}>
              {copiedCss ? (
                <Check className="size-3 " />
              ) : (
                <Code2 className="size-3" />
              )}
              {copiedCss ? "Copiado" : "Copiar CSS"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleExport("jpg")}
              disabled={exporting !== null}
            >
              <ImageIcon className="size-3" /> JPG
            </Button>
            <Button
              size="sm"
              onClick={() => handleExport("png")}
              disabled={exporting !== null}
            >
              <Download className="size-3" /> PNG
            </Button>
          </div>
        </div>

        <div
          ref={previewContainerRef}
          className="relative flex-1 overflow-hidden bg-muted/20"
          onClick={() => setSelectedLayerId(null)}
        >
          <div
            ref={previewWrapperRef}
            className="absolute select-none"
            style={{
              width: fittedSize.w ? `${fittedSize.w}px` : "0px",
              height: fittedSize.h ? `${fittedSize.h}px` : "0px",
              left: containerSize.w / 2 - fittedSize.w / 2 + pan.x,
              top: containerSize.h / 2 - fittedSize.h / 2 + pan.y,
              transform: `scale(${zoom})`,
              transformOrigin: "center center",
            }}
          >
            <canvas
              ref={previewCanvasRef}
              className="block h-full w-full rounded-2xl shadow-2xl"
            />

            {/* Hit areas for all non-background layers */}
            {nonBgLayers.map((layer) => {
              const bounds = layerBounds.get(layer.id);
              if (!bounds) return null;
              const isSelected = layer.id === selectedLayerId;
              const isRay = layer.type === "rays";

              if (isSelected) {
                // Full drag overlay for selected layer
                return (
                  <div
                    key={layer.id}
                    className={cn(
                      "absolute",
                      isDragging ? "cursor-grabbing" : "cursor-grab"
                    )}
                    style={{
                      left: bounds.bbox.x,
                      top: bounds.bbox.y,
                      width: bounds.bbox.w,
                      height: bounds.bbox.h,
                    }}
                    onPointerDown={onOverlayPointerDown}
                    onPointerMove={onOverlayPointerMove}
                    onPointerUp={onOverlayPointerUp}
                    onPointerCancel={onOverlayPointerUp}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isRay ? (
                      <>
                        <div className="pointer-events-none absolute inset-0 border border-dashed border-blue-400/80" />
                        <span className="pointer-events-none absolute -top-5 left-0 rounded bg-blue-400 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                          {layer.name}
                        </span>
                        <span className="pointer-events-none absolute -left-1 -top-1 h-2 w-2 rounded-sm bg-blue-400" />
                        <span className="pointer-events-none absolute -right-1 -top-1 h-2 w-2 rounded-sm bg-blue-400" />
                        <span className="pointer-events-none absolute -bottom-1 -left-1 h-2 w-2 rounded-sm bg-blue-400" />
                        <span className="pointer-events-none absolute -bottom-1 -right-1 h-2 w-2 rounded-sm bg-blue-400" />
                        {raysBBox && (
                          <OriginCrosshair
                            color="blue"
                            style={{
                              left:
                                (layer.originX / 100) * fittedSize.w -
                                raysBBox.x,
                              top:
                                (layer.originY / 100) * fittedSize.h -
                                raysBBox.y,
                            }}
                          />
                        )}
                      </>
                    ) : (
                      <>
                        <div className="pointer-events-none absolute inset-0 rounded-full border border-dashed border-amber-400/80" />
                        <span className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-semibold text-black">
                          {layer.name}
                        </span>
                        <OriginCrosshair
                          color="amber"
                          className="left-1/2 top-1/2"
                        />
                      </>
                    )}
                  </div>
                );
              }

              // Click-to-select area for unselected layers
              return (
                <div
                  key={layer.id}
                  className="group absolute cursor-pointer"
                  style={{
                    left: bounds.bbox.x,
                    top: bounds.bbox.y,
                    width: bounds.bbox.w,
                    height: bounds.bbox.h,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedLayerId(layer.id);
                  }}
                >
                  <div
                    className={cn(
                      "pointer-events-none absolute inset-0 border border-transparent transition-colors group-hover:border-dashed",
                      isRay
                        ? "group-hover:border-blue-400/50"
                        : "rounded-full group-hover:border-amber-400/50"
                    )}
                  />
                  <span
                    className={cn(
                      "pointer-events-none absolute -top-5 hidden whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-semibold group-hover:block",
                      isRay ? "left-0" : "left-1/2 -translate-x-1/2"
                    )}
                    style={{
                      background: isRay ? "#60a5fa" : "#fbbf24",
                      color: isRay ? "white" : "black",
                    }}
                  >
                    {layer.name}
                  </span>
                </div>
              );
            })}
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
              <ZoomOut className="size-3" />
            </Button>
            <Button
              variant="ghost"
              onClick={resetView}
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
              <ZoomIn className="size-3" />
            </Button>
            <div className="mx-1 h-4 w-px bg-border" />
            <Button
              variant="ghost"
              size="icon"
              onClick={resetView}
              className="h-7 w-7 rounded-full"
              title="Zoom 100%"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* ── SAVES BAR ─────────────────────────────────────────────── */}
        <div className="border-t bg-background flex h-28 w-full shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* Thumbnails */}
          <div className="flex flex-1 items-center gap-2 overflow-x-auto px-3 py-2">
            {saves.length === 0 && (
              <p className="text-xs text-muted-foreground select-none">
                Nenhum save ainda — clique em <strong>Salvar</strong> para guardar a cena atual.
              </p>
            )}
            {saves.map((save) => (
              <div
                key={save.id}
                className={cn(
                  "group relative h-full shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 transition-all",
                  selectedSaveId === save.id
                    ? "border-primary shadow-md"
                    : "border-transparent hover:border-border"
                )}
                style={{ aspectRatio: `${save.scene.width} / ${save.scene.height}` }}
                onClick={() => handleLoadSave(save)}
                title={new Date(save.createdAt).toLocaleString("pt-BR")}
              >
                <img
                  src={save.thumb}
                  alt="save"
                  className="h-full w-full object-cover"
                />
                {/* Delete button on hover */}
                <button
                  className="absolute right-1 top-1 hidden rounded-sm bg-black/60 p-0.5 text-white hover:bg-destructive group-hover:flex items-center justify-center"
                  onClick={(e) => { e.stopPropagation(); handleDeleteSave(save.id); }}
                  title="Remover"
                >
                  <Trash2Icon className="size-2.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex shrink-0 flex-col items-center justify-center gap-2 border-l px-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" onClick={handleSaveSlot}>
                  <SaveIcon className="size-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Salvar cena atual</TooltipContent>
            </Tooltip>

            <AlertDialog>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertDialogTrigger asChild>
                    <Button size="icon" variant="destructive" disabled={saves.length === 0}>
                      <Trash2Icon className="size-3" />
                    </Button>
                  </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Remover todos os saves</TooltipContent>
              </Tooltip>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remover todos os saves?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa ação não pode ser desfeita. Todos os {saves.length}{" "}
                    {saves.length === 1 ? "save salvo" : "saves salvos"} serão
                    removidos permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => {
                      setSaves([]);
                      setSelectedSaveId(null);
                    }}
                  >
                    Remover todos
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
        <SidebarHeader className="border-b border-sidebar-border px-4 py-3 h-14 flex justify-center">
          {selectedLayerId === null ? (
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold tracking-tight">Camadas</h2>
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
                <ChevronLeft className="size-3" />
              </Button>
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-sidebar-foreground/40">
                  Camada
                </p>
                <h2 className="text-sm font-bold tracking-tight">
                  {selectedLayer?.type === "rays" &&
                    (selectedLayer as RayLayer).name}
                  {selectedLayer?.type === "halo" &&
                    (selectedLayer as HaloLayer).name}
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
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
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
                          <ChevronLeft className="size-3 rotate-180 text-sidebar-foreground/30 transition-colors group-hover:text-sidebar-foreground/60" />
                        </div>

                        {/* Color preview */}
                        {layer.type === "rays" && (
                          <div
                            className="mb-2 h-8 w-full rounded-lg border border-sidebar-border/40"
                            style={{
                              background: `linear-gradient(135deg, ${
                                layer.colorStart
                              }, ${
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
                            className="h-6 w-6 rounded text-sidebar-foreground/40 hover:text-sidebar-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateLayer(layer.id);
                            }}
                            title="Duplicar camada"
                          >
                            <CopyPlus className="h-3 w-3" />
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
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <ImageIcon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm font-semibold">Background</span>
                    </div>
                    <ChevronLeft className="size-3 rotate-180 text-sidebar-foreground/30 transition-colors group-hover:text-sidebar-foreground/60" />
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
                  <div className="space-y-8 px-2 pb-2">
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
                  <div className="space-y-8 px-2 pb-2">
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
                  <div className="space-y-8 px-2 pb-2">
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
                        <Shuffle className="size-3" />
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
                <div className="space-y-8 px-2 pb-2">
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
                <div className="space-y-8 px-2 pb-2">
                  <Field label="Tipo">
                    <Select
                      value={selectedBgLayer.bgType}
                      onValueChange={(v) =>
                        updateLayer("background", {
                          bgType: v as BackgroundType,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="transparent">
                          Transparente
                        </SelectItem>
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
