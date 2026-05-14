import * as React from "react";
import {
  Download,
  Image as ImageIcon,
  Code2,
  Shuffle,
  RotateCcw,
  Check,
  Copy,
  CopyPlus,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sun,
  Moon,
  ChevronLeft,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  SaveIcon,
  Trash2Icon,
  Dices,
  PanelLeft,
  PanelRight,
  Component,
  MoreHorizontal,
  Clapperboard,
  BookmarkCheck,
  BookOpen,
  Link,
  SparkleIcon,
} from "lucide-react";
import {
  drawScene,
  exportScene,
  buildSceneCssSnippet,
  DEFAULT_SCENE,
  DEFAULT_RAY_LAYER,
  DEFAULT_HALO_LAYER,
  DEFAULT_ANIM_PARAMS,
  type AnimParams,
  type SceneConfig,
  type Layer,
  type RayLayer,
  type HaloLayer,
  type BackgroundLayer,
  type BackgroundType,
} from "godlights";
import { OriginCrosshair } from "@/components/OriginCrosshair";
import { BlendModeSelect } from "@/components/BlendModeSelect";
import { OriginInputs } from "@/components/OriginInputs";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { ColorField } from "@/components/ColorField";
import { ColorPicker } from "@/components/ColorPicker";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Field } from "@/components/ControlSection";
import {
  RAYS_PRESETS,
  type PresetRayLayer,
  type PresetHaloLayer,
  type PresetLayer,
} from "@/lib/presets";
import { decodeScene, buildShareUrl } from "@/lib/share";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTheme } from "@/components/theme-provider";
import { Label } from "./ui/label";
import { Switch } from "@/components/ui/switch";

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
const MAX_ZOOM = 3.0;
const ZOOM_STEP = 0.1;

// ── Editor-internal layer types (extend public types with id/name) ──────────

type EditorRayLayer = RayLayer & { id: string; name: string };
type EditorHaloLayer = HaloLayer & { id: string; name: string };
type EditorBackgroundLayer = BackgroundLayer & { id: string };
type EditorLayer = EditorRayLayer | EditorHaloLayer | EditorBackgroundLayer;
type EditorScene = Omit<SceneConfig, "layers"> & { layers: EditorLayer[] };

function withEditorIds(scene: SceneConfig): EditorScene {
  let idx = 0;
  return {
    ...scene,
    layers: scene.layers.map((l) => {
      if (l.type === "background") return { ...l, id: "background" } as EditorBackgroundLayer;
      if (l.type === "halo") return { ...l, id: (l as EditorHaloLayer).id ?? `halo-${++idx}`, name: (l as EditorHaloLayer).name ?? "Halo" } as EditorHaloLayer;
      return { ...l, id: (l as EditorRayLayer).id ?? `rays-${++idx}`, name: (l as EditorRayLayer).name ?? "Rays" } as EditorRayLayer;
    }),
  };
}

// ── Preset helpers ─────────────────────────────────────────────────────────

function applyRaysPreset(
  scene: EditorScene,
  layers: PresetLayer[]
): EditorScene {
  // Extract current colors to preserve them, cross-referencing when one type is missing
  const existingRay = scene.layers.find(
    (l): l is EditorRayLayer => l.type === "rays"
  );
  const existingHalo = scene.layers.find(
    (l): l is EditorHaloLayer => l.type === "halo"
  );
  const rayColorStart =
    existingRay?.colorStart ??
    existingHalo?.color ??
    DEFAULT_RAY_LAYER.colorStart;
  const rayColorEnd =
    existingRay?.colorEnd ?? existingHalo?.color ?? DEFAULT_RAY_LAYER.colorEnd;
  const haloColor =
    existingHalo?.color ?? existingRay?.colorStart ?? DEFAULT_HALO_LAYER.color;

  // Keep only the background layer
  const bgLayers = scene.layers.filter((l) => l.type === "background");

  // Build new layers from preset, injecting current colors
  let raysIndex = 0;
  let halosIndex = 0;
  const newLayers: EditorLayer[] = layers.map((presetLayer) => {
    if (presetLayer.type === "rays") {
      raysIndex++;
      return {
        ...presetLayer,
        id: `rays-${Date.now() + raysIndex}`,
        name: raysIndex === 1 ? "Rays" : `Rays ${raysIndex}`,
        colorStart: rayColorStart,
        colorEnd: rayColorEnd,
      } as EditorRayLayer;
    } else {
      halosIndex++;
      return {
        ...presetLayer,
        id: `halo-${Date.now() + halosIndex}`,
        name: halosIndex === 1 ? "Halo" : `Halo ${halosIndex}`,
        color: haloColor,
      } as EditorHaloLayer;
    }
  });

  return {
    ...scene,
    layers: [...bgLayers, ...newLayers],
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

// ── Scene migration (adds new fields to old saved data) ────────────────────

function migrateScene(scene: SceneConfig): EditorScene {
  return withEditorIds({
    ...scene,
    layers: scene.layers.map((layer) => {
      if (layer.type === "rays") {
        const legacy = (layer as RayLayer & { randomness?: number }).randomness;
        const fallback = legacy ?? 30;
        return {
          ...layer,
          randomnessWidth: layer.randomnessWidth ?? fallback,
          randomnessLength: layer.randomnessLength ?? fallback,
          randomnessAngle: layer.randomnessAngle ?? fallback,
        };
      }
      return layer;
    }),
  });
}

// ── Sidebar bridge helpers ─────────────────────────────────────────────────

const LeftToggleCtx = React.createContext<() => void>(() => {});

function LeftSidebarBridge({ children }: { children: React.ReactNode }) {
  const { toggleSidebar } = useSidebar();
  return (
    <LeftToggleCtx.Provider value={toggleSidebar}>
      {children}
    </LeftToggleCtx.Provider>
  );
}

function LeftPanelTrigger() {
  const toggle = React.useContext(LeftToggleCtx);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          className="h-8 w-8 shrink-0"
          onClick={toggle}
        >
          <PanelLeft className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Painel de presets</TooltipContent>
    </Tooltip>
  );
}

function RightPanelTrigger() {
  const { toggleSidebar } = useSidebar();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          className="h-8 w-8 shrink-0"
          onClick={toggleSidebar}
        >
          <PanelRight className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Layers panel</TooltipContent>
    </Tooltip>
  );
}

// ── Component ──────────────────────────────────────────────────────────────

export function GodRaysGenerator() {
  const { theme, setTheme } = useTheme();
  const dark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  const toggleTheme = () => setTheme(dark ? "light" : "dark");

  const [scene, setScene] = React.useState<EditorScene>(() => {
    const params = new URLSearchParams(window.location.search);

    // ?scene=<encoded> — shared scene URL (highest priority)
    const urlScene = params.get("scene");
    if (urlScene) {
      const decoded = decodeScene(urlScene);
      if (decoded) return migrateScene(decoded);
    }

    // If coming from /presets with ?preset=key, apply that preset
    const urlPresetKey = params.get("preset");
    if (urlPresetKey) {
      const urlPreset = RAYS_PRESETS.find((p) => p.key === urlPresetKey);
      if (urlPreset) {
        const s = withEditorIds(DEFAULT_SCENE);
        return applyRaysPreset(s, urlPreset.layers);
      }
    }
    try {
      const saved = localStorage.getItem("rays-scene");
      if (saved) return migrateScene(JSON.parse(saved) as SceneConfig);
    } catch {
      /* ignore corrupt data */
    }
    let s = withEditorIds(DEFAULT_SCENE);
    if (RAYS_PRESETS[0]) s = applyRaysPreset(s, RAYS_PRESETS[0].layers);
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
    activeRaysPreset?: string | null;
  }

  const [saves, setSaves] = React.useState<SavedScene[]>(() => {
    try {
      const raw = localStorage.getItem("rays-saves");
      return raw ? (JSON.parse(raw) as SavedScene[]) : [];
    } catch {
      return [];
    }
  });
  const [selectedSaveId, setSelectedSaveId] = React.useState<string | null>(
    null
  );

  React.useEffect(() => {
    try {
      localStorage.setItem("rays-saves", JSON.stringify(saves));
    } catch {
      /* quota */
    }
  }, [saves]);

  const [activeRaysPreset, setActiveRaysPreset] = React.useState<string | null>(
    () => {
      // If a preset was passed in the URL, use it as the active preset
      const urlPresetKey = new URLSearchParams(window.location.search).get(
        "preset"
      );
      if (urlPresetKey && RAYS_PRESETS.some((p) => p.key === urlPresetKey)) {
        return urlPresetKey;
      }
      try {
        const raw = localStorage.getItem("rays-ui-state");
        if (raw) {
          const parsed = JSON.parse(raw) as {
            activeRaysPreset?: string | null;
          };
          return parsed.activeRaysPreset ?? "r_corner_flare";
        }
      } catch {
        /* ignore */
      }
      return "r_corner_flare";
    }
  );

  // Persist active preset key immediately
  React.useEffect(() => {
    try {
      localStorage.setItem(
        "rays-ui-state",
        JSON.stringify({ activeRaysPreset })
      );
    } catch {
      /* quota */
    }
  }, [activeRaysPreset]);

  const [mainTab, setMainTab] = React.useState<"editor" | "saved">("editor");

  const generateThumb = React.useCallback(
    async (s: SceneConfig): Promise<string> => {
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
    },
    []
  );

  const handleSaveSlot = React.useCallback(async () => {
    const thumb = await generateThumb(scene);
    const newSave: SavedScene = {
      id: `save-${Date.now()}`,
      thumb,
      scene: JSON.parse(JSON.stringify(scene)) as SceneConfig,
      createdAt: Date.now(),
      activeRaysPreset,
    };
    setSaves((prev) => [newSave, ...prev]);
    setSelectedSaveId(newSave.id);
  }, [scene, generateThumb, activeRaysPreset]);

  const handleDeleteSave = React.useCallback((id: string) => {
    setSaves((prev) => prev.filter((s) => s.id !== id));
    setSelectedSaveId((prev) => (prev === id ? null : prev));
  }, []);

  const [selectedLayerId, setSelectedLayerId] = React.useState<string | null>(
    null
  );
  const [hoveredLayerId, setHoveredLayerId] = React.useState<string | null>(
    null
  );

  const handleLoadSave = React.useCallback((save: SavedScene) => {
    setScene(migrateScene(save.scene));
    setSelectedSaveId(save.id);
    setSelectedLayerId(null);
    setActiveRaysPreset(save.activeRaysPreset ?? null);
  }, []);
  const [copiedJson, setCopiedJson] = React.useState(false);
  const [copiedCss, setCopiedCss] = React.useState(false);
  const [copiedInstall, setCopiedInstall] = React.useState(false);
  const [copiedComponentUsage, setCopiedComponentUsage] = React.useState(false);
  const [copiedShareUrl, setCopiedShareUrl] = React.useState(false);
  const [componentDialogOpen, setComponentDialogOpen] = React.useState(false);
  const [exporting, setExporting] = React.useState<"png" | "jpg" | null>(null);
  const [zoom, setZoom] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [isMiddlePanning, setIsMiddlePanning] = React.useState(false);
  const zoomRef = React.useRef(1);
  const panRef = React.useRef({ x: 0, y: 0 });
  const middlePanStartRef = React.useRef<{
    mx: number;
    my: number;
    panX: number;
    panY: number;
  } | null>(null);
  const containerSizeRef = React.useRef({ w: 0, h: 0 });
  const fittedSizeRef = React.useRef({ w: 0, h: 0 });
  const previewCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const previewWrapperRef = React.useRef<HTMLDivElement>(null);
  const previewContainerRef = React.useRef<HTMLDivElement>(null);
  const rafRef = React.useRef<number | null>(null);
  const [isAnimating, setIsAnimating] = React.useState<boolean>(() => {
    try {
      const raw = localStorage.getItem("rays-anim");
      if (raw)
        return (
          (JSON.parse(raw) as { isAnimating: boolean }).isAnimating ?? false
        );
    } catch {
      /* ignore */
    }
    return false;
  });
  const [animParams, setAnimParams] = React.useState<AnimParams>(() => {
    try {
      const raw = localStorage.getItem("rays-anim");
      if (raw)
        return {
          ...DEFAULT_ANIM_PARAMS,
          ...(JSON.parse(raw) as { animParams?: Partial<AnimParams> })
            .animParams,
        };
    } catch {
      /* ignore */
    }
    return DEFAULT_ANIM_PARAMS;
  });
  const animParamsRef = React.useRef<AnimParams>(animParams);
  React.useEffect(() => {
    animParamsRef.current = animParams;
  }, [animParams]);

  // Persist animation config to localStorage (debounced)
  React.useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        localStorage.setItem(
          "rays-anim",
          JSON.stringify({ isAnimating, animParams })
        );
      } catch {
        /* quota */
      }
    }, 500);
    return () => window.clearTimeout(id);
  }, [isAnimating, animParams]);

  const isAnimatingRef = React.useRef(false);
  const animTimeRef = React.useRef(0);
  const animLastTsRef = React.useRef<number | null>(null);
  const animRafRef = React.useRef<number | null>(null);
  const fpsLabelRef = React.useRef<HTMLSpanElement>(null);
  const fpsFramesRef = React.useRef<number[]>([]);
  const previewGrainCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const deferredScene = React.useDeferredValue(scene);
  // Keep latest deferredScene accessible from animation loop without stale closure
  const deferredSceneRef = React.useRef(deferredScene);
  // Pre-scaled scene cached so the animation loop never recomputes it per-frame
  const scaledSceneRef = React.useRef<SceneConfig>(
    scaleSceneForPreview(deferredScene)
  );
  React.useEffect(() => {
    deferredSceneRef.current = deferredScene;
    scaledSceneRef.current = scaleSceneForPreview(deferredScene);
  }, [deferredScene]);

  // ── Derived layer state ──────────────────────────────────────────────────

  const selectedLayer =
    scene.layers.find((l) => l.id === selectedLayerId) ?? null;
  const selectedRayLayer =
    selectedLayer?.type === "rays" ? (selectedLayer as EditorRayLayer) : null;
  const selectedHaloLayer =
    selectedLayer?.type === "halo" ? (selectedLayer as EditorHaloLayer) : null;

  const bgLayer = scene.layers.find(
    (l) => l.type === "background"
  ) as EditorBackgroundLayer;
  const nonBgLayers = scene.layers.filter((l) => l.type !== "background") as (
    | EditorRayLayer
    | EditorHaloLayer
  )[];

  // ── Layer management ─────────────────────────────────────────────────────

  const updateLayer = React.useCallback(
    (id: string, changes: Partial<Record<string, unknown>>) => {
      setScene((s) => ({
        ...s,
        layers: s.layers.map((l) =>
          l.id === id ? ({ ...l, ...changes } as EditorLayer) : l
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
      const newLayer: EditorLayer =
        type === "rays"
          ? {
              id,
              name,
              ...DEFAULT_RAY_LAYER,
              colorStart:
                (firstOfType as EditorRayLayer | undefined)?.colorStart ??
                DEFAULT_RAY_LAYER.colorStart,
              colorEnd:
                (firstOfType as EditorRayLayer | undefined)?.colorEnd ??
                DEFAULT_RAY_LAYER.colorEnd,
              seed: Math.floor(Math.random() * 1_000_000),
            }
          : {
              id,
              name,
              ...DEFAULT_HALO_LAYER,
              color:
                (firstOfType as EditorHaloLayer | undefined)?.color ??
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
      if (original.type === "background") return s;

      // Strip trailing number to get base name (e.g. "Rays 2" → "Rays")
      const baseName = original.name.replace(/\s+\d+$/, "");
      const escapedBase = baseName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`^${escapedBase} \\d+$`);
      const takenNumbers = new Set(
        s.layers
          .filter((l) => l.type !== "background")
          .map((l) => l.name)
          .filter((n) => n === baseName || regex.test(n))
          .map((n) => {
            if (n === baseName) return 1;
            const m = n.match(/(\d+)$/);
            return m ? parseInt(m[1], 10) : 1;
          })
      );
      let num = 2;
      while (takenNumbers.has(num)) num++;

      const copy: EditorLayer = {
        ...original,
        id: newId,
        name: `${baseName} ${num}`,
        ...(original.type === "rays" && {
          seed: Math.floor(Math.random() * 1_000_000),
        }),
      } as EditorLayer;
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

  // ── Middle-mouse pan ──────────────────────────────────────────────────────
  React.useEffect(() => {
    const el = previewContainerRef.current;
    if (!el) return;

    const isPanButton = (btn: number) => btn === 1 || btn === 2;

    const onMouseDown = (e: MouseEvent) => {
      if (!isPanButton(e.button)) return;
      e.preventDefault();
      middlePanStartRef.current = {
        mx: e.clientX,
        my: e.clientY,
        panX: panRef.current.x,
        panY: panRef.current.y,
      };
      setIsMiddlePanning(true);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!middlePanStartRef.current) return;
      const dx = e.clientX - middlePanStartRef.current.mx;
      const dy = e.clientY - middlePanStartRef.current.my;
      const newPan = {
        x: middlePanStartRef.current.panX + dx,
        y: middlePanStartRef.current.panY + dy,
      };
      panRef.current = newPan;
      setPan(newPan);
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!isPanButton(e.button)) return;
      middlePanStartRef.current = null;
      setIsMiddlePanning(false);
    };

    // Prevent default middle-click scroll and right-click context menu while over canvas
    const onAuxClick = (e: MouseEvent) => {
      if (isPanButton(e.button)) e.preventDefault();
    };
    const onContextMenu = (e: MouseEvent) => e.preventDefault();

    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    el.addEventListener("auxclick", onAuxClick);
    el.addEventListener("contextmenu", onContextMenu);
    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("auxclick", onAuxClick);
      el.removeEventListener("contextmenu", onContextMenu);
    };
  }, []);

  // ── Canvas render ─────────────────────────────────────────────────────────

  React.useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    if (isAnimatingRef.current) return; // animation loop owns the canvas
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

  // ── Animation loop ────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (!isAnimating) {
      isAnimatingRef.current = false;
      if (animRafRef.current) cancelAnimationFrame(animRafRef.current);
      animRafRef.current = null;
      animLastTsRef.current = null;
      fpsFramesRef.current = [];
      if (fpsLabelRef.current) fpsLabelRef.current.textContent = "0 fps";
      // Restore static render
      const canvas = previewCanvasRef.current;
      if (canvas) {
        const scaled = scaleSceneForPreview(deferredSceneRef.current);
        canvas.width = scaled.width;
        canvas.height = scaled.height;
        drawScene(canvas, scaled, 0);
      }
      return;
    }

    isAnimatingRef.current = true;

    // Grain overlay — renderizado uma única vez ao iniciar (textura fixa sobre os rays animados)
    // A atualização por noise/grainSize fica no useEffect separado abaixo
    const grainCtxForAnim =
      previewGrainCanvasRef.current?.getContext("2d") ?? null;
    if (grainCtxForAnim && deferredSceneRef.current.noise > 0) {
      const { width, height } = deferredSceneRef.current;
      const step = Math.max(1, Math.floor(deferredSceneRef.current.grainSize));
      const img = grainCtxForAnim.createImageData(width, height);
      const d = img.data;
      if (step === 1) {
        for (let j = 0; j < d.length; j += 4) {
          const v = (Math.random() * 255) | 0;
          d[j] = d[j + 1] = d[j + 2] = v;
          d[j + 3] = 255;
        }
      } else {
        for (let y = 0; y < height; y += step) {
          for (let x = 0; x < width; x += step) {
            const v = (Math.random() * 255) | 0;
            for (let dy = 0; dy < step && y + dy < height; dy++) {
              for (let dx = 0; dx < step && x + dx < width; dx++) {
                const idx = ((y + dy) * width + (x + dx)) * 4;
                d[idx] = d[idx + 1] = d[idx + 2] = v;
                d[idx + 3] = 255;
              }
            }
          }
        }
      }
      grainCtxForAnim.putImageData(img, 0, 0);
    }

    const frame = (ts: number) => {
      if (!isAnimatingRef.current) return;
      if (animLastTsRef.current !== null) {
        animTimeRef.current +=
          ((ts - animLastTsRef.current) / 1000) * animParamsRef.current.speed;
      }
      animLastTsRef.current = ts;

      // FPS: keep timestamps of the last second, count them
      const frames = fpsFramesRef.current;
      frames.push(ts);
      const cutoff = ts - 1000;
      let i = 0;
      while (i < frames.length && frames[i] < cutoff) i++;
      fpsFramesRef.current = frames.slice(i);
      if (fpsLabelRef.current) {
        fpsLabelRef.current.textContent = fpsFramesRef.current.length + " fps";
      }

      const canvas = previewCanvasRef.current;
      if (canvas) {
        const scaled = scaledSceneRef.current;
        if (canvas.width !== scaled.width || canvas.height !== scaled.height) {
          canvas.width = scaled.width;
          canvas.height = scaled.height;
        }
        // skipGrain=true: grain é tratado pelo canvas overlay fixo
        drawScene(
          canvas,
          scaled,
          animTimeRef.current,
          animParamsRef.current,
          true
        );
      }
      animRafRef.current = requestAnimationFrame(frame);
    };

    animRafRef.current = requestAnimationFrame(frame);

    return () => {
      isAnimatingRef.current = false;
      if (animRafRef.current) cancelAnimationFrame(animRafRef.current);
    };
  }, [isAnimating]);

  // Re-renderiza o grain overlay quando noise/grainSize muda durante a animação
  const {
    noise: sceneNoise,
    grainSize: sceneGrainSize,
    width: sceneWidth,
    height: sceneHeight,
  } = scene;
  React.useEffect(() => {
    if (!isAnimating) return;
    const gc = previewGrainCanvasRef.current;
    if (!gc) return;
    const ctx = gc.getContext("2d");
    if (!ctx) return;
    if (sceneNoise <= 0) return;
    const width = sceneWidth;
    const height = sceneHeight;
    const img = ctx.createImageData(width, height);
    const d = img.data;
    const step = Math.max(1, Math.floor(sceneGrainSize));
    if (step === 1) {
      for (let j = 0; j < d.length; j += 4) {
        const v = (Math.random() * 255) | 0;
        d[j] = d[j + 1] = d[j + 2] = v;
        d[j + 3] = 255;
      }
    } else {
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const v = (Math.random() * 255) | 0;
          for (let dy = 0; dy < step && y + dy < height; dy++) {
            for (let dx = 0; dx < step && x + dx < width; dx++) {
              const idx = ((y + dy) * width + (x + dx)) * 4;
              d[idx] = d[idx + 1] = d[idx + 2] = v;
              d[idx + 3] = 255;
            }
          }
        }
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [isAnimating, sceneNoise, sceneGrainSize, sceneWidth, sceneHeight]);

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
    const payload = isAnimating
      ? { scene, animParams }
      : { scene };
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedJson(true);
    window.setTimeout(() => setCopiedJson(false), 1800);
  };

  const buildUsageSnippet = () => {
    const exportScene: SceneConfig = {
      ...scene,
      layers: scene.layers.map((l) => {
        if (l.type === "background") return { type: l.type, bgType: l.bgType, bgColor: l.bgColor, bgColor2: l.bgColor2, bgGradientAngle: l.bgGradientAngle };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _id, name: _name, ...rest } = l as EditorRayLayer | EditorHaloLayer;
        return rest as RayLayer | HaloLayer;
      }),
    };
    const sceneJson = JSON.stringify(exportScene, null, 2).split("\n").join("\n  ");
    const lines = [
      `import { GodLights } from "godlights";`,
      ``,
      `const scene = ${sceneJson};`,
    ];
    if (isAnimating) {
      const animJson = JSON.stringify(animParams, null, 2)
        .split("\n")
        .join("\n  ");
      lines.push(``, `const animParams = ${animJson};`);
    }
    lines.push(
      ``,
      `export default function MyComponent() {`,
      isAnimating
        ? `  return <GodLights scene={scene} animParams={animParams} className="w-full h-full" />;`
        : `  return <GodLights scene={scene} className="w-full h-full" />;`,
      `}`
    );
    return lines.join("\n");
  };

  const handleCopyComponent = () => setComponentDialogOpen(true);

  const handleShareUrl = async () => {
    const url = buildShareUrl(scene);
    await navigator.clipboard.writeText(url);
    setCopiedShareUrl(true);
    window.setTimeout(() => setCopiedShareUrl(false), 2000);
  };

  const handleCopyInstall = async () => {
    await navigator.clipboard.writeText("npm install godlights");
    setCopiedInstall(true);
    window.setTimeout(() => setCopiedInstall(false), 1800);
  };

  const handleCopyComponentUsage = async () => {
    await navigator.clipboard.writeText(buildUsageSnippet());
    setCopiedComponentUsage(true);
    window.setTimeout(() => setCopiedComponentUsage(false), 1800);
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
        ) as EditorLayer[],
      }));
    }
    setActiveRaysPreset(null);
  };

  const handleRandomizeLayer = React.useCallback(() => {
    if (selectedRayLayer) {
      const pick =
        RAYS_PRESETS[Math.floor(Math.random() * RAYS_PRESETS.length)];
      const presetRayLayer = pick.layers.find(
        (l): l is PresetRayLayer => l.type === "rays"
      );
      if (!presetRayLayer) return;
      updateLayer(selectedRayLayer.id, {
        direction: presetRayLayer.direction,
        spread: presetRayLayer.spread,
        originX: presetRayLayer.originX,
        originY: presetRayLayer.originY,
        rayCount: presetRayLayer.rayCount,
        rayWidth: presetRayLayer.rayWidth,
        divergence: presetRayLayer.divergence,
        rayLength: presetRayLayer.rayLength,
        opacity: presetRayLayer.opacity,
        blendMode: presetRayLayer.blendMode,
        fadeToTransparent: presetRayLayer.fadeToTransparent,
        blur: presetRayLayer.blur,
        randomnessWidth: presetRayLayer.randomnessWidth,
        randomnessLength: presetRayLayer.randomnessLength,
        randomnessAngle: presetRayLayer.randomnessAngle,
        seed: Math.floor(Math.random() * 1_000_000),
      });
      setActiveRaysPreset(null);
    } else if (selectedHaloLayer) {
      const presetsWithHalo = RAYS_PRESETS.filter((p) =>
        p.layers.some((l) => l.type === "halo")
      );
      const pool = presetsWithHalo.length > 0 ? presetsWithHalo : RAYS_PRESETS;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      const presetHaloLayer = pick.layers.find(
        (l): l is PresetHaloLayer => l.type === "halo"
      );
      if (!presetHaloLayer) return;
      updateLayer(selectedHaloLayer.id, {
        originX: presetHaloLayer.originX,
        originY: presetHaloLayer.originY,
        intensity: presetHaloLayer.intensity,
        size: presetHaloLayer.size,
        blendMode: presetHaloLayer.blendMode,
      });
      setActiveRaysPreset(null);
    }
  }, [selectedRayLayer, selectedHaloLayer, updateLayer]);

  const handleRandomizeAll = () => {
    const candidates = RAYS_PRESETS.filter((p) => p.key !== activeRaysPreset);
    const pool = candidates.length > 0 ? candidates : RAYS_PRESETS;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setScene((s) => applyRaysPreset(s, pick.layers));
    setActiveRaysPreset(pick.key);
    setSelectedLayerId(null);
  };

  const handleReset = () => {
    const raysPreset = RAYS_PRESETS.find((p) => p.key === "r_corner_flare");
    let s: EditorScene = withEditorIds(DEFAULT_SCENE);
    if (raysPreset) s = applyRaysPreset(s, raysPreset.layers);
    setScene(s);
    setSelectedLayerId(null);
    setActiveRaysPreset("r_corner_flare");
    localStorage.removeItem("rays-scene");
    localStorage.removeItem("rays-ui-state");
  };

  const applyPreset = (key: string) => {
    const preset = RAYS_PRESETS.find((p) => p.key === key);
    if (!preset) return;
    setScene((s) => applyRaysPreset(s, preset.layers));
    setActiveRaysPreset(key);
    setSelectedLayerId(null);
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
        <SidebarHeader className="border-b border-sidebar-border px-4 py-3 h-12 flex justify-center">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <img src="/logo.svg" alt="Godlights logo" className="size-6" />
              <span className="text-sm font-semibold tracking-tight">
                Godlights
              </span>
            </a>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={toggleTheme}
              className="size-7"
              title={dark ? "Light mode" : "Dark mode"}
            >
              {dark ? <Sun className="size-3" /> : <Moon className="size-3" />}
            </Button>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {/* DIMENSIONS */}
          <SidebarGroup>
            <SidebarGroupLabel>Dimensions</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="w-full flex flex-col gap-6 px-2 pb-2">
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
                      <SelectItem value="-1" disabled>
                        Custom
                      </SelectItem>
                      {DIMENSION_PRESETS.map((p, i) => (
                        <SelectItem key={p.label} value={String(i)}>
                          {p.label} — {p.w}×{p.h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Width" unit="px" value={scene.width}>
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
                  <Field label="Height" unit="px" value={scene.height}>
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

          <SidebarSeparator />

          {/* PRESETS */}
          <SidebarGroup>
            <SidebarGroupLabel>Presets</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-2 w-full grid grid-cols-7 gap-1 pb-1">
                {RAYS_PRESETS.map((p) => (
                  <Button
                    key={p.key}
                    variant="outline"
                    onClick={() => applyPreset(p.key)}
                    className={cn(
                      "relative w-full aspect-square h-auto p-0 m-0 rounded-md overflow-hidden transition-all border border-border",
                      activeRaysPreset === p.key && "border-primary"
                    )}
                  >
                    <div
                      className="absolute inset-0 scale-150"
                      style={{
                        background: p.thumb,
                        filter: "blur(3px)",
                      }}
                    />
                  </Button>
                ))}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          {/* ANIMATION */}
          <SidebarGroup>
            <SidebarGroupLabel className="items-center justify-between">
              Animation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="w-full flex flex-col gap-6 px-2 pb-2">
                <div className="w-full flex items-center gap-2 justify-between">
                  <Label className="text-sm font-medium text-foreground/90">
                    Habilitar animação
                  </Label>
                  <Switch
                    checked={isAnimating}
                    onCheckedChange={setIsAnimating}
                  />
                </div>

                {isAnimating && (
                  <>
                    <Field
                      label="Speed"
                      value={animParams.speed.toFixed(2) + "×"}
                    >
                      <Slider
                        min={0.1}
                        max={3}
                        step={0.05}
                        value={[animParams.speed]}
                        onValueChange={([v]) =>
                          setAnimParams((p) => ({ ...p, speed: v }))
                        }
                      />
                    </Field>
                    <Field
                      label="Angle"
                      value={animParams.angleAmp.toFixed(0)}
                      unit="%"
                    >
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[animParams.angleAmp]}
                        onValueChange={([v]) =>
                          setAnimParams((p) => ({ ...p, angleAmp: v }))
                        }
                      />
                    </Field>
                    <Field
                      label="Length"
                      value={animParams.lengthAmp.toFixed(0)}
                      unit="%"
                    >
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[animParams.lengthAmp]}
                        onValueChange={([v]) =>
                          setAnimParams((p) => ({ ...p, lengthAmp: v }))
                        }
                      />
                    </Field>
                    <Field
                      label="Width"
                      value={animParams.widthAmp.toFixed(0)}
                      unit="%"
                    >
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[animParams.widthAmp]}
                        onValueChange={([v]) =>
                          setAnimParams((p) => ({ ...p, widthAmp: v }))
                        }
                      />
                    </Field>
                    <Field
                      label="Halo"
                      value={animParams.haloAmp.toFixed(0)}
                      unit="%"
                    >
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[animParams.haloAmp]}
                        onValueChange={([v]) =>
                          setAnimParams((p) => ({ ...p, haloAmp: v }))
                        }
                      />
                    </Field>
                  </>
                )}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          {/* EFFECTS (global) */}
          <SidebarGroup>
            <SidebarGroupLabel>Effects</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="w-full flex flex-col gap-6 px-2 pb-2">
                <Field label="Noise / grain" value={scene.noise.toFixed(0)}>
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={[scene.noise]}
                    onValueChange={([v]) => updateScene({ noise: v })}
                  />
                </Field>
                <Field
                  label="Grain size"
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

          <SidebarGroup>
            <div className="w-full flex flex-col gap-6 px-2 pb-2 h-full">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="size-3" /> Reset
              </Button>
            </div>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {/* ── CENTER: Preview ───────────────────────────────────────────── */}
      <LeftSidebarBridge>
        <SidebarProvider className="flex-1 min-h-0">
          <SidebarInset className="relative w-full overflow-hidden">
            <Tabs
              value={mainTab}
              onValueChange={(v) => setMainTab(v as "editor" | "saved")}
              className="flex flex-col h-full"
            >
              <div className="flex items-center justify-between gap-3 bg-background border-b border-border px-3 py-3 h-12">
                <div className="flex gap-2 flex-1">
                  {/* <Button variant={"ghost"} size="icon-xs" asChild>
                    <a href="/">
                      <ChevronLeft className="size-3.5" />
                    </a>
                  </Button> */}

                  <a href="/" className="flex lg:hidden items-center gap-2">
                    <img
                      src="/logo.svg"
                      alt="Godlights logo"
                      className="size-6"
                    />
                    <span className="text-sm font-semibold tracking-tight">
                      Godlights
                    </span>
                  </a>

                  <LeftPanelTrigger />

                  {/* ── Tabs (desktop only) ── */}
                  <TabsList className="hidden lg:inline-flex h-8">
                    <TabsTrigger value="editor" className="text-xs px-3">
                      Editor
                    </TabsTrigger>
                    <TabsTrigger value="saved" className="text-xs px-3">
                      Saved
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex items-center gap-2 flex-1 justify-end">
                  {/* Share — desktop only */}
                  <Button
                    variant={"outline"}
                    size="icon-xs"
                    className="hidden lg:inline-flex gap-1.5"
                    onClick={handleShareUrl}
                  >
                    {copiedShareUrl ? (
                      <Check className="size-3.5" />
                    ) : (
                      <Link className="size-3.5" />
                    )}
                  </Button>

                  {/* Save — desktop only */}
                  <Button
                    variant={"outline"}
                    size="icon-xs"
                    className="hidden lg:inline-flex gap-1.5"
                    onClick={() => {
                      handleSaveSlot();
                    }}
                  >
                    <SaveIcon className="size-3.5" />
                  </Button>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        size="xs"
                        className="hidden lg:inline-flex gap-1.5"
                      >
                        <Download className="size-3.5" />
                        Export
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-48 p-1.5">
                      <div className="flex flex-col gap-0.5">
                        <p className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Copy
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyPresetJson}
                          className="w-full justify-start gap-2.5 rounded-sm px-2.5 font-normal"
                        >
                          {copiedJson ? (
                            <Check className="size-3.5 shrink-0" />
                          ) : (
                            <Copy className="size-3.5 shrink-0" />
                          )}
                          {copiedJson ? "Copied!" : "JSON"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyCss}
                          className="w-full justify-start gap-2.5 rounded-sm px-2.5 font-normal"
                        >
                          {copiedCss ? (
                            <Check className="size-3.5 shrink-0" />
                          ) : (
                            <Code2 className="size-3.5 shrink-0" />
                          )}
                          {copiedCss ? "Copied!" : "CSS"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyComponent}
                          className="w-full justify-start gap-2.5 rounded-sm px-2.5 font-normal"
                        >
                          <Component className="size-3.5 shrink-0" />
                          JSX Component
                        </Button>
                        <div className="my-1 h-px bg-border" />
                        <p className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Download
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleExport("jpg")}
                          disabled={exporting !== null}
                          className="w-full justify-start gap-2.5 rounded-sm px-2.5 font-normal"
                        >
                          <ImageIcon className="size-3.5 shrink-0" /> JPG
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleExport("png")}
                          disabled={exporting !== null}
                          className="w-full justify-start gap-2.5 rounded-sm px-2.5 font-normal"
                        >
                          <Download className="size-3.5 shrink-0" /> PNG
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* ── Dots menu — mobile/tablet only ── */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon-xs"
                        className="lg:hidden h-8 w-8"
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={toggleTheme}>
                        {dark ? (
                          <Sun className="size-3.5 shrink-0" />
                        ) : (
                          <Moon className="size-3.5 shrink-0" />
                        )}
                        {dark ? "Light mode" : "Dark mode"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleSaveSlot}>
                        <SaveIcon className="size-3.5 shrink-0" />
                        Save
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleShareUrl}>
                        {copiedShareUrl ? (
                          <Check className="size-3.5 shrink-0" />
                        ) : (
                          <Link className="size-3.5 shrink-0" />
                        )}
                        {copiedShareUrl ? "Copied!" : "Share"}
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href="/docs">
                          <BookOpen className="size-3.5 shrink-0" />
                          Docs
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                        View
                      </DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => setMainTab("editor")}>
                        <Clapperboard className="size-3.5 shrink-0" />
                        Editor
                        {mainTab === "editor" && (
                          <Check className="size-3.5 ml-auto shrink-0 opacity-60" />
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setMainTab("saved")}>
                        <BookmarkCheck className="size-3.5 shrink-0" />
                        Saved
                        {mainTab === "saved" && (
                          <Check className="size-3.5 ml-auto shrink-0 opacity-60" />
                        )}
                        {saves.length > 0 && (
                          <span className="ml-auto tabular-nums text-xs opacity-60">
                            {saves.length}
                          </span>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Copy
                      </DropdownMenuLabel>
                      <DropdownMenuItem onClick={handleCopyPresetJson}>
                        {copiedJson ? (
                          <Check className="size-3.5 shrink-0" />
                        ) : (
                          <Copy className="size-3.5 shrink-0" />
                        )}
                        {copiedJson ? "Copied!" : "JSON"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleCopyCss}>
                        {copiedCss ? (
                          <Check className="size-3.5 shrink-0" />
                        ) : (
                          <Code2 className="size-3.5 shrink-0" />
                        )}
                        {copiedCss ? "Copied!" : "CSS"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleCopyComponent}>
                        <Component className="size-3.5 shrink-0" />
                        JSX Component
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Download
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => handleExport("jpg")}
                        disabled={exporting !== null}
                      >
                        <ImageIcon className="size-3.5 shrink-0" /> JPG
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleExport("png")}
                        disabled={exporting !== null}
                      >
                        <Download className="size-3.5 shrink-0" /> PNG
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <RightPanelTrigger />
                </div>
              </div>

              <TabsContent
                value="editor"
                forceMount
                className="flex flex-col flex-1 overflow-hidden mt-0 data-[state=inactive]:hidden"
              >
                <ScrollAreaPrimitive.Root className="relative flex-1 overflow-hidden bg-muted/20">
                  <ScrollAreaPrimitive.Viewport
                    ref={previewContainerRef}
                    className={cn(
                      "h-full w-full",
                      isMiddlePanning ? "cursor-grabbing" : "cursor-default"
                    )}
                    onClick={() => {
                      setSelectedLayerId(null);
                      setHoveredLayerId(null);
                    }}
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
                      {/* Wrapper holds visual styles so canvas repaints don't re-trigger shadow/radius compositing */}
                      <div className="relative block h-full w-full rounded-2xl shadow-2xl overflow-hidden">
                        <canvas
                          ref={previewCanvasRef}
                          className="block h-full w-full"
                        />
                        {/* Grain overlay — mesmas dimensões do scene, CSS escala para o preview */}
                        {isAnimating && (
                          <canvas
                            ref={previewGrainCanvasRef}
                            width={scene.width}
                            height={scene.height}
                            className="absolute inset-0 w-full h-full pointer-events-none"
                            style={{
                              mixBlendMode: "overlay",
                              opacity: (scene.noise / 100) * 0.35,
                              display: scene.noise > 0 ? "block" : "none",
                            }}
                          />
                        )}
                      </div>

                      {/* Hit areas for all non-background layers — selected layer rendered last so its drag overlay is always on top */}
                      {[
                        ...nonBgLayers.filter((l) => l.id !== selectedLayerId),
                        ...nonBgLayers.filter((l) => l.id === selectedLayerId),
                      ].map((layer) => {
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
                        const isHovered = layer.id === hoveredLayerId;
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
                                  : "rounded-full group-hover:border-amber-400/50",
                                isHovered &&
                                  isRay &&
                                  "border-dashed border-blue-400/50",
                                isHovered &&
                                  !isRay &&
                                  "rounded-full border-dashed border-amber-400/50"
                              )}
                            />
                            <span
                              className={cn(
                                "pointer-events-none absolute -top-5 hidden whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-semibold group-hover:block",
                                isRay ? "left-0" : "left-1/2 -translate-x-1/2",
                                isHovered && "block"
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

                    {/* FPS counter — DOM ref to avoid React re-renders on every frame */}
                    {isAnimating && (
                      <div className="absolute top-3 right-3 pointer-events-none">
                        <span
                          ref={fpsLabelRef}
                          className="rounded-md bg-background/60 px-2 py-1 font-mono text-xs tabular-nums text-white/70 backdrop-blur-sm"
                        >
                          0 fps
                        </span>
                      </div>
                    )}

                    {/* Floating controls */}
                    <div
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 flex justify-center items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Zoom controls */}
                      <div className="flex items-center gap-1 rounded-full border border-border bg-background/80 px-2 py-1 shadow-lg backdrop-blur-sm">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => changeZoom(-ZOOM_STEP)}
                          disabled={zoom <= MIN_ZOOM}
                          className="size-7 rounded-full hidden md:flex"
                          title="Diminuir zoom"
                        >
                          <ZoomOut className="size-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={resetView}
                          className="h-7 min-w-13 px-1 text-xs font-medium tabular-nums"
                          title="Resetar zoom"
                        >
                          {Math.round(zoom * 100)}%
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => changeZoom(ZOOM_STEP)}
                          disabled={zoom >= MAX_ZOOM}
                          className="size-7 rounded-full hidden md:flex"
                          title="Aumentar zoom"
                        >
                          <ZoomIn className="size-3" />
                        </Button>
                        <div className="mx-1 h-4 w-px bg-border" />
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={resetView}
                          className="size-7 rounded-full"
                          title="Zoom 100%"
                        >
                          <Maximize2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      {/* Dice: randomize color + rays */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon-xs"
                            onClick={handleRandomizeAll}
                            className="h-8 w-8 rounded-full"
                          >
                            <Dices className="size-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Randomize</TooltipContent>
                      </Tooltip>
                    </div>
                  </ScrollAreaPrimitive.Viewport>
                  <ScrollAreaPrimitive.Scrollbar
                    orientation="vertical"
                    className="flex w-2 touch-none select-none p-0.5"
                  >
                    <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-border" />
                  </ScrollAreaPrimitive.Scrollbar>
                  <ScrollAreaPrimitive.Scrollbar
                    orientation="horizontal"
                    className="flex h-2 touch-none select-none flex-col p-0.5"
                  >
                    <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-border" />
                  </ScrollAreaPrimitive.Scrollbar>
                  <ScrollAreaPrimitive.Corner />
                </ScrollAreaPrimitive.Root>

                <div className="flex items-center justify-between gap-3 bg-background border-t border-border px-5 py-2 text-xs text-muted-foreground">
                  <span>
                    {scene.width} × {scene.height}px ·{" "}
                    {((scene.width * scene.height) / 1_000_000).toFixed(2)} MP
                  </span>

                  <div className="hidden md:flex gap-1 items-center">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={handleReset}
                      className="py-1.5 h-auto"
                      asChild
                    >
                      <a href="/presets" target="_blank">
                        Presets
                      </a>
                    </Button>

                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={handleReset}
                      className="py-1.5 h-auto"
                      asChild
                    >
                      <a href="/docs" target="_blank">
                        Docs
                      </a>
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* ── SAVED tab ──────────────────────────────────────────────── */}
              <TabsContent
                value="saved"
                forceMount
                className="flex flex-col flex-1 overflow-hidden mt-0 data-[state=inactive]:hidden"
              >
                <div className="flex flex-1 flex-col overflow-hidden">
                  {/* Actions bar */}
                  <div className="container flex items-center justify-between px-4 pt-4 pb-2">
                    <span className="text-base text-muted-foreground">
                      {saves.length} {saves.length === 1 ? "save" : "saves"}{" "}
                      saved
                    </span>
                    <div className="flex items-center gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 gap-1.5"
                            disabled={saves.length === 0}
                          >
                            <Trash2Icon className="size-3" />
                            Clear all
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Remove all saves?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. All {saves.length}{" "}
                              {saves.length === 1 ? "save" : "saves"} will be
                              permanently deleted.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => {
                                setSaves([]);
                                setSelectedSaveId(null);
                              }}
                            >
                              Remove all
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  {/* Grid */}
                  <ScrollAreaPrimitive.Root className="flex-1 overflow-hidden">
                    <ScrollAreaPrimitive.Viewport className="h-full w-full">
                      {saves.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center gap-2 text-center p-8">
                          <p className="text-sm font-medium text-muted-foreground">
                            No saves yet
                          </p>
                          <p className="text-xs text-muted-foreground/60">
                            Click the save button to store the current scene.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4">
                          {saves.map((save) => (
                            <div
                              key={save.id}
                              className={cn(
                                "group relative cursor-pointer overflow-hidden rounded-xl border-2 transition-all",
                                selectedSaveId === save.id
                                  ? "border-primary shadow-md"
                                  : "border-transparent hover:border-border"
                              )}
                              onClick={() => {
                                handleLoadSave(save);
                                setMainTab("editor");
                              }}
                              title={new Date(save.createdAt).toLocaleString()}
                            >
                              <img
                                src={save.thumb}
                                alt="save"
                                className="w-full object-cover aspect-video"
                              />
                              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-background/60 px-2 py-1 opacity-0 transition-opacity group-hover:opacity-100">
                                <span className="text-[10px] text-white/80">
                                  {new Date(
                                    save.createdAt
                                  ).toLocaleDateString()}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  className="size-5 text-white hover:text-red-400 hover:bg-transparent"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSave(save.id);
                                  }}
                                  title="Remove"
                                >
                                  <Trash2Icon className="size-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollAreaPrimitive.Viewport>
                    <ScrollAreaPrimitive.Scrollbar
                      orientation="vertical"
                      className="flex w-2 touch-none select-none p-0.5"
                    >
                      <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-border" />
                    </ScrollAreaPrimitive.Scrollbar>
                  </ScrollAreaPrimitive.Root>
                </div>
              </TabsContent>
            </Tabs>
          </SidebarInset>

          {/* ── RIGHT SIDEBAR ────────────────────────────────────────────── */}
          <Sidebar side="right">
            {/* Header */}
            <SidebarHeader className="border-b border-sidebar-border px-4 py-3 h-12 flex justify-center">
              {selectedLayerId === null ? (
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold tracking-tight">Layers</h2>
                  </div>

                  {/* Add layer button */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-xs">
                        <Plus className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem onClick={() => addLayer("rays")}>
                        <SparkleIcon className="h-3.5 w-3.5" /> Rays
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addLayer("halo")}>
                        <Sun className="h-3.5 w-3.5" /> Halo
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="size-7 shrink-0 text-sidebar-foreground/60 hover:text-sidebar-foreground"
                      onClick={() => {
                        setSelectedLayerId(null);
                        setHoveredLayerId(null);
                      }}
                      title="Back to layers"
                    >
                      <ChevronLeft className="size-3" />
                    </Button>
                    <div className="min-w-0">
                      <h2 className="text-sm font-bold tracking-tight truncate">
                        {selectedLayer?.type === "rays" &&
                          (selectedLayer as EditorRayLayer).name}
                        {selectedLayer?.type === "halo" &&
                          (selectedLayer as EditorHaloLayer).name}
                        {selectedLayer?.type === "background" && "Background"}
                      </h2>
                    </div>
                  </div>
                  {(selectedRayLayer || selectedHaloLayer) && (
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="size-7 shrink-0"
                            onClick={handleRandomizeLayer}
                          >
                            <Shuffle className="size-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Randomize layer</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="size-7 shrink-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              removeLayer(selectedLayerId!);
                              setSelectedLayerId(null);
                            }}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Remove layer</TooltipContent>
                      </Tooltip>
                    </div>
                  )}
                </div>
              )}
            </SidebarHeader>

            <SidebarContent>
              {/* ── LAYERS LIST ──────────────────────────────────────────── */}
              {selectedLayerId === null && (
                <div className="flex flex-col">
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
                          key={layer.id!}
                          className="group rounded-xl border border-sidebar-border bg-sidebar-accent/30 transition-all hover:border-sidebar-border/80 hover:bg-sidebar-accent/50 hover:shadow-sm overflow-hidden"
                          onMouseEnter={() => setHoveredLayerId(layer.id)}
                          onMouseLeave={() => setHoveredLayerId(null)}
                        >
                          {/* Clickable area */}
                          <button
                            className="w-full flex-col h-auto p-3 text-left items-center justify-center rounded-none gap-3 cursor-pointer"
                            onClick={() => {
                              setSelectedLayerId(layer.id);
                              setHoveredLayerId(null);
                            }}
                          >
                            <div className="w-full flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold">
                                  {layer.name}
                                </span>
                              </div>
                              <ChevronLeft className="size-3 rotate-180 text-sidebar-foreground/30 transition-colors group-hover:text-sidebar-foreground/60" />
                            </div>

                            {/* Color preview */}
                            {layer.type === "rays" && (
                              <div
                                className="h-6 w-full rounded-2xl ring-1 ring-border"
                                style={{
                                  background: `linear-gradient(135deg, ${layer.colorStart}, transparent)`,
                                }}
                              />
                            )}
                            {layer.type === "halo" && (
                              <div
                                className="h-6 w-full rounded-2xl ring-1 ring-border"
                                style={{
                                  background: `radial-gradient(ellipse at center, ${layer.color} 0%, transparent 70%)`,
                                }}
                              />
                            )}
                          </button>

                          {/* Layer controls */}
                          <div className="flex items-center justify-between border-t border-sidebar-border/50 px-3 py-2">
                            <ColorPicker
                              className="size-6 rounded-full"
                              value={
                                layer.type === "rays"
                                  ? layer.colorStart
                                  : layer.color
                              }
                              onChange={(v) => {
                                if (layer.type === "rays") {
                                  updateLayer(layer.id, {
                                    colorStart: v,
                                    colorEnd: v,
                                  });
                                } else {
                                  updateLayer(layer.id, { color: v });
                                }
                              }}
                            />
                            <div className="flex items-center gap-0.5">
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                disabled={!canMoveUp}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveLayerUp(layer.id);
                                }}
                                title="Move up"
                              >
                                <ArrowUp className="size-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                disabled={!canMoveDown}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveLayerDown(layer.id);
                                }}
                                title="Move down"
                              >
                                <ArrowDown className="size-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  duplicateLayer(layer.id);
                                }}
                                title="Duplicate layer"
                              >
                                <CopyPlus className="size-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeLayer(layer.id);
                                }}
                                title="Remove layer"
                              >
                                <Trash2 className="size-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Background layer card */}
                    <div className="group rounded-xl border border-sidebar-border bg-sidebar-accent/30 transition-all hover:border-sidebar-border/80 hover:bg-sidebar-accent/50 hover:shadow-sm overflow-hidden">
                      <button
                        className="w-full flex-col h-auto p-3 text-left items-center justify-center rounded-none gap-3 cursor-pointer"
                        onClick={() => setSelectedLayerId("background")}
                      >
                        <div className="w-full flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">
                              Background
                            </span>
                          </div>
                          <ChevronLeft className="size-3 rotate-180 text-sidebar-foreground/30 transition-colors group-hover:text-sidebar-foreground/60" />
                        </div>
                        {bgLayer.bgType !== "transparent" && (
                          <div
                            className="h-6 w-full rounded-2xl ring-1 ring-border"
                            style={{
                              background:
                                bgLayer.bgType === "gradient"
                                  ? `linear-gradient(${bgLayer.bgGradientAngle}deg, ${bgLayer.bgColor}, ${bgLayer.bgColor2})`
                                  : bgLayer.bgColor,
                            }}
                          />
                        )}
                      </button>
                      <div className="flex items-center justify-between border-t border-sidebar-border/50 px-3 py-2">
                        {bgLayer.bgType !== "transparent" ? (
                          <ColorPicker
                            className="size-6 rounded-full"
                            value={bgLayer.bgColor}
                            onChange={(v) =>
                              updateLayer("background", {
                                bgColor: v,
                                bgColor2: v,
                              })
                            }
                          />
                        ) : (
                          <div className="size-6" />
                        )}
                        <div className="flex items-center gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            disabled
                            title="Move up"
                          >
                            <ArrowUp className="size-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            disabled
                            title="Move down"
                          >
                            <ArrowDown className="size-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            disabled
                            title="Duplicate"
                          >
                            <CopyPlus className="size-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            disabled
                            title="Remove"
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── BACKGROUND PROPERTIES ────────────────────────────────── */}
              {selectedLayer?.type === "background" && (
                <>
                  <SidebarGroup>
                    <SidebarGroupLabel>Background</SidebarGroupLabel>
                    <SidebarGroupContent>
                      <div className="w-full flex flex-col gap-6 px-2 pb-2">
                        <ToggleGroup
                          type="single"
                          value={bgLayer.bgType}
                          onValueChange={(v) => {
                            if (v)
                              updateLayer("background", {
                                bgType: v as BackgroundType,
                              });
                          }}
                          className="w-full"
                        >
                          <ToggleGroupItem
                            value="transparent"
                            className="flex-1 text-xs border"
                          >
                            None
                          </ToggleGroupItem>
                          <ToggleGroupItem
                            value="solid"
                            className="flex-1 text-xs border"
                          >
                            Solid
                          </ToggleGroupItem>
                          <ToggleGroupItem
                            value="gradient"
                            className="flex-1 text-xs border"
                          >
                            Gradient
                          </ToggleGroupItem>
                        </ToggleGroup>

                        {bgLayer.bgType === "solid" && (
                          <div className="w-full flex flex-col gap-2">
                            <Label className="text-sm font-medium text-foreground/90">
                              Color
                            </Label>
                            <ColorField
                              value={bgLayer.bgColor}
                              onChange={(v) =>
                                updateLayer("background", { bgColor: v })
                              }
                            />
                          </div>
                        )}

                        {bgLayer.bgType === "gradient" && (
                          <>
                            <div className="w-full flex flex-col gap-2">
                              <Label className="text-sm font-medium text-foreground/90">
                                Colors
                              </Label>
                              <div className="flex flex-col gap-2">
                                <ColorField
                                  value={bgLayer.bgColor}
                                  onChange={(v) =>
                                    updateLayer("background", { bgColor: v })
                                  }
                                />

                                <ColorField
                                  value={bgLayer.bgColor2}
                                  onChange={(v) =>
                                    updateLayer("background", { bgColor2: v })
                                  }
                                />

                                <div
                                  className="h-8 w-full rounded-lg ring-1 ring-border"
                                  style={{
                                    background: `linear-gradient(to right, ${bgLayer.bgColor}, ${bgLayer.bgColor2})`,
                                  }}
                                />
                              </div>
                            </div>
                            <Field
                              label="Angle"
                              value={bgLayer.bgGradientAngle.toFixed(0)}
                              unit="°"
                            >
                              <Slider
                                min={0}
                                max={360}
                                step={1}
                                value={[bgLayer.bgGradientAngle]}
                                onValueChange={([v]) =>
                                  updateLayer("background", {
                                    bgGradientAngle: v,
                                  })
                                }
                              />
                            </Field>
                          </>
                        )}
                      </div>
                    </SidebarGroupContent>
                  </SidebarGroup>
                </>
              )}

              {/* ── RAYS PROPERTIES ──────────────────────────────────────── */}
              {selectedRayLayer && (
                <>
                  <SidebarGroup>
                    <SidebarGroupLabel>Color</SidebarGroupLabel>
                    <SidebarGroupContent>
                      <div className="px-2 pb-2">
                        <ColorField
                          value={selectedRayLayer.colorStart}
                          onChange={(v) =>
                            updateLayer(selectedRayLayer.id, {
                              colorStart: v,
                              colorEnd: v,
                            })
                          }
                        />
                      </div>
                    </SidebarGroupContent>
                  </SidebarGroup>

                  <SidebarSeparator />

                  <SidebarGroup>
                    <SidebarGroupLabel>Shape</SidebarGroupLabel>
                    <SidebarGroupContent>
                      <div className="w-full flex flex-col gap-6 px-2 pb-2">
                        <Field label="Count" value={selectedRayLayer.rayCount}>
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
                          label="Base width"
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
                          label="Divergence"
                          value={selectedRayLayer.divergence.toFixed(2)}
                          hint="1 = parallel, >1 = spread outward, <1 = converge"
                        >
                          <Slider
                            min={0.1}
                            max={5}
                            step={0.05}
                            value={[selectedRayLayer.divergence]}
                            onValueChange={([v]) =>
                              updateLayer(selectedRayLayer.id, {
                                divergence: v,
                              })
                            }
                          />
                        </Field>
                        <Field
                          label="Length"
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
                          label="Opacity"
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
                    <SidebarGroupLabel>
                      Direction &amp; origin
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                      <div className="w-full flex flex-col gap-6 px-2 pb-2">
                        <Field
                          label="Direction"
                          value={selectedRayLayer.direction.toFixed(0)}
                          unit="°"
                          hint="0° up · 90° right · 180° down · 270° left"
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
                          label="Spread"
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
                    <SidebarGroupLabel>Randomness</SidebarGroupLabel>
                    <SidebarGroupContent>
                      <div className="w-full flex flex-col gap-6 px-2 pb-2">
                        <Field
                          label="Width"
                          value={selectedRayLayer.randomnessWidth.toFixed(0)}
                          unit="%"
                        >
                          <Slider
                            min={0}
                            max={100}
                            step={1}
                            value={[selectedRayLayer.randomnessWidth]}
                            onValueChange={([v]) =>
                              updateLayer(selectedRayLayer.id, {
                                randomnessWidth: v,
                              })
                            }
                          />
                        </Field>
                        <Field
                          label="Length"
                          value={selectedRayLayer.randomnessLength.toFixed(0)}
                          unit="%"
                        >
                          <Slider
                            min={0}
                            max={100}
                            step={1}
                            value={[selectedRayLayer.randomnessLength]}
                            onValueChange={([v]) =>
                              updateLayer(selectedRayLayer.id, {
                                randomnessLength: v,
                              })
                            }
                          />
                        </Field>
                        <Field
                          label="Angle"
                          value={selectedRayLayer.randomnessAngle.toFixed(0)}
                          unit="%"
                        >
                          <Slider
                            min={0}
                            max={100}
                            step={1}
                            value={[selectedRayLayer.randomnessAngle]}
                            onValueChange={([v]) =>
                              updateLayer(selectedRayLayer.id, {
                                randomnessAngle: v,
                              })
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
                            size="icon-xs"
                            onClick={handleRandomize}
                            title="New random seed"
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
                    <div className="w-full flex flex-col gap-6 px-2 pb-2">
                      <Field label="Color">
                        <ColorField
                          value={selectedHaloLayer.color}
                          onChange={(v) =>
                            updateLayer(selectedHaloLayer.id, { color: v })
                          }
                        />
                      </Field>
                      <Field
                        label="Intensity"
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
                        label="Size"
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
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      </LeftSidebarBridge>

      {/* ── Component export dialog ──────────────────────────────────── */}
      <Dialog open={componentDialogOpen} onOpenChange={setComponentDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
          <DialogHeader className="px-6 py-5 border-b border-border shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Component className="size-4" />
              Export as React Component
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Install the{" "}
              <a
                href="https://www.npmjs.com/package/godlights"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-foreground transition-colors"
              >
                godlights
              </a>{" "}
              package and use the component with your configured scene.
            </p>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-6">
            {/* Step 1 — Install */}
            <section className="flex flex-col gap-3">
              <div>
                <h3 className="text-sm font-semibold">1. Install</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Add the package to your project:
                </p>
              </div>
              <div className="relative rounded-md border border-border bg-muted/40 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-muted/60">
                  <span className="text-[11px] font-mono text-muted-foreground">
                    Terminal
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyInstall}
                    className="h-auto py-0.5 px-1.5 text-[11px] text-muted-foreground gap-1.5"
                  >
                    {copiedInstall ? (
                      <Check className="size-3" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                    {copiedInstall ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <pre className="overflow-x-auto p-4 text-[12px] leading-relaxed font-mono text-foreground/80">
                  <code>npm install godlights</code>
                </pre>
              </div>
            </section>

            {/* Step 2 — Usage */}
            <section className="flex flex-col gap-3">
              <div>
                <h3 className="text-sm font-semibold">2. Usage</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Import the component and pass your configured scene as a prop:
                </p>
              </div>
              <div className="relative rounded-md border border-border bg-muted/40 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-muted/60">
                  <span className="text-[11px] font-mono text-muted-foreground">
                    MyComponent.tsx
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyComponentUsage}
                    className="h-auto py-0.5 px-1.5 text-[11px] text-muted-foreground gap-1.5"
                  >
                    {copiedComponentUsage ? (
                      <Check className="size-3" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                    {copiedComponentUsage ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <pre className="overflow-x-auto p-4 text-[12px] leading-relaxed font-mono text-foreground/80 max-h-96 overflow-y-auto">
                  <code>{buildUsageSnippet()}</code>
                </pre>
              </div>
            </section>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}

function clampNum(value: string, min: number, max: number) {
  const n = Number(value);
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}
