import React from "react";
import { GodLights } from "godlights";
import { type SceneConfig, type AnimParams } from "godlights";

export const PREVIEW_STORAGE_KEY = "rays-preview-scene";

interface PreviewConfig {
  scene: SceneConfig;
  animate: boolean;
  animParams: AnimParams;
}

export default function PreviewPage() {
  const [config, setConfig] = React.useState<PreviewConfig | null>(null);

  const load = () => {
    try {
      const raw = localStorage.getItem(PREVIEW_STORAGE_KEY);
      if (raw) setConfig(JSON.parse(raw) as PreviewConfig);
    } catch {
      // ignore
    }
  };

  React.useEffect(() => {
    load();

    // Live-update when generator saves a new preview config
    const onStorage = (e: StorageEvent) => {
      if (e.key !== PREVIEW_STORAGE_KEY || !e.newValue) return;
      try {
        setConfig(JSON.parse(e.newValue) as PreviewConfig);
      } catch {
        // ignore
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (!config) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black text-white/40 text-sm">
        Nenhuma cena encontrada. Abra o preview a partir do gerador.
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-black flex items-center justify-center">
      <GodLights
        scene={config.scene}
        animate={config.animate}
        animParams={config.animParams}
        showFps={config.animate}
        className="max-w-full max-h-full"
      />
    </div>
  );
}
