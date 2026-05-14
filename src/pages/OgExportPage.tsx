import React from "react";
import {
  exportScene,
  DEFAULT_RAY_LAYER,
  DEFAULT_HALO_LAYER,
  type SceneConfig,
  type RayLayer,
  type HaloLayer,
  type BackgroundLayer,
} from "godlights";
import { RAYS_PRESETS, type RaysPreset } from "@/lib/presets";
import { Download, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/** OG image dimensions (standard social preview). */
const OG_W = 1200;
const OG_H = 630;

/** Convert a preset (shape-only) to a full SceneConfig at OG size. */
function presetToScene(preset: RaysPreset): SceneConfig {
  const bgLayer: BackgroundLayer = {
    type: "background",
    bgType: "solid",
    bgColor: "#000000",
    bgColor2: "#000000",
    bgGradientAngle: 180,
  };

  const layers = preset.layers.map((l) => {
    if (l.type === "rays") {
      return {
        ...DEFAULT_RAY_LAYER,
        ...l,
        colorStart: "#ffffff",
        colorEnd: "#ffffff",
      } as RayLayer;
    }
    return {
      ...DEFAULT_HALO_LAYER,
      ...l,
      color: "#ffffff",
    } as HaloLayer;
  });

  return {
    width: OG_W,
    height: OG_H,
    noise: 8,
    grainSize: 1,
    layers: [bgLayer, ...layers],
  };
}

type Status = "idle" | "rendering" | "done";

interface PresetItem {
  key: string;
  label: string;
  blob: Blob | null;
  dataUrl: string | null;
  status: Status;
}

/**
 * Internal tool page for generating OG images (1200×630 PNGs) for every preset.
 *
 * Visit /og-export → click "Render All" → download each PNG →
 * place them in public/og/ and commit.
 *
 * Not linked from the public nav — access directly via URL.
 */
export default function OgExportPage() {
  const [items, setItems] = React.useState<PresetItem[]>(
    RAYS_PRESETS.map((p) => ({
      key: p.key,
      label: p.label,
      blob: null,
      dataUrl: null,
      status: "idle",
    }))
  );
  const [isRendering, setIsRendering] = React.useState(false);

  const setItemField = (key: string, patch: Partial<PresetItem>) =>
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...patch } : it)));

  /** Render a single preset to Blob + dataUrl. */
  const renderOne = React.useCallback(async (preset: RaysPreset) => {
    setItemField(preset.key, { status: "rendering" });
    try {
      const scene = presetToScene(preset);
      const blob = await exportScene(scene, "image/png");
      const dataUrl = URL.createObjectURL(blob);
      setItemField(preset.key, { blob, dataUrl, status: "done" });
    } catch (e) {
      console.error("Failed to render", preset.key, e);
      setItemField(preset.key, { status: "idle" });
    }
  }, []);

  /** Render all presets sequentially (avoids browser jank). */
  const renderAll = React.useCallback(async () => {
    setIsRendering(true);
    for (const preset of RAYS_PRESETS) {
      await renderOne(preset);
      // Yield to browser between renders
      await new Promise((r) => setTimeout(r, 50));
    }
    setIsRendering(false);
  }, [renderOne]);

  /** Download a single PNG. */
  const downloadOne = (item: PresetItem) => {
    if (!item.blob) return;
    const url = URL.createObjectURL(item.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `og-${item.key}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  /** Download all rendered PNGs sequentially. */
  const downloadAll = () => {
    const done = items.filter((it) => it.blob);
    done.forEach((item, i) => setTimeout(() => downloadOne(item), i * 250));
  };

  const doneCount = items.filter((it) => it.status === "done").length;
  const allDone = doneCount === items.length;

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">OG Image Generator</h1>
          <p className="text-muted-foreground text-sm max-w-xl">
            Renders every preset at 1200&times;630 px using the actual godlights engine. Download
            the PNGs and place them in <code className="text-xs bg-muted px-1 py-0.5 rounded">public/og/</code>.
            The file named <code className="text-xs bg-muted px-1 py-0.5 rounded">og-default.png</code>{" "}
            (or any preset you choose) can be renamed to{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">og-image.png</code> and placed in{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">public/</code> for the site-wide OG
            image.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mb-8">
          <Button
            onClick={renderAll}
            disabled={isRendering}
          >
            {isRendering ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCircle className="size-4" />
            )}
            {isRendering ? `Rendering… (${doneCount}/${items.length})` : "Render All"}
          </Button>

          {allDone && (
            <Button
              variant="outline"
              onClick={downloadAll}
            >
              <Download className="size-4" />
              Download All ({items.length} PNGs)
            </Button>
          )}

          {doneCount > 0 && (
            <span className="text-sm text-muted-foreground">
              {doneCount}/{items.length} rendered
            </span>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.key}
              className="rounded-xl border border-border overflow-hidden bg-background"
            >
              {/* Preview */}
              <div className="relative aspect-[1200/630] w-full bg-background">
                {item.dataUrl ? (
                  <img
                    src={item.dataUrl}
                    alt={item.label}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30 text-xs">
                    {item.status === "rendering" ? (
                      <Loader2 className="size-6 animate-spin" />
                    ) : (
                      "not rendered"
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-t border-border/60">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-medium truncate">{item.label}</span>
                  <span className="text-[10px] text-muted-foreground font-mono truncate">
                    og-{item.key}.png
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (item.status === "done") {
                      downloadOne(item);
                    } else {
                      const preset = RAYS_PRESETS.find((p) => p.key === item.key)!;
                      setItemField(preset.key, { status: "rendering" });
                      const scene = presetToScene(preset);
                      const blob = await exportScene(scene, "image/png");
                      const dataUrl = URL.createObjectURL(blob);
                      setItemField(preset.key, { blob, dataUrl, status: "done" });
                      downloadOne({ ...item, blob, dataUrl, status: "done" });
                    }
                  }}
                  disabled={item.status === "rendering"}
                  className="shrink-0"
                >
                  {item.status === "rendering" ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Download className="size-3" />
                  )}
                  {item.status === "done" ? "Download" : item.status === "rendering" ? "Rendering" : "Render & Download"}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        {allDone && (
          <div className="mt-10 rounded-xl border border-border bg-muted/30 p-6 text-sm space-y-2">
            <p className="font-medium">Next steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>
                Download all PNGs above (or pick your favourite individually).
              </li>
              <li>
                Create a <code className="text-xs bg-muted px-1 py-0.5 rounded">public/og/</code> folder
                and place the files there.
              </li>
              <li>
                Copy the best-looking one to{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">public/og-image.png</code> — this
                is the site-wide OG image referenced in <code className="text-xs bg-muted px-1 py-0.5 rounded">index.html</code>.
              </li>
              <li>Commit and deploy.</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
