import React from "react";
import { cn } from "@/lib/utils";
import { drawScene, SceneConfig, AnimParams } from "@/lib/godrays";

export interface GodLightsProps {
  /** Full scene configuration — use the Godlights generator to build this. */
  scene: SceneConfig;
  /** Enable animation loop. */
  animate?: boolean;
  /** Animation parameters (speed, amplitudes). Only used when animate=true. */
  animParams?: AnimParams;
  /** Show FPS counter overlay. Only visible when animate=true. */
  showFps?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Standalone Godlights canvas component.
 *
 * @example
 * <GodLights scene={myScene} className="w-full h-full" />
 * <GodLights scene={myScene} animate showFps animParams={{ speed: 1, angleAmp: 50, lengthAmp: 50, widthAmp: 50, haloAmp: 50 }} />
 */
export function GodLights({ scene, animate = false, animParams, showFps = false, className, style }: GodLightsProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const grainCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const sceneRef = React.useRef(scene);
  const animParamsRef = React.useRef(animParams);
  const [fps, setFps] = React.useState(0);
  const fpsFramesRef = React.useRef<number[]>([]);

  React.useEffect(() => { sceneRef.current = scene; }, [scene]);
  React.useEffect(() => { animParamsRef.current = animParams; }, [animParams]);

  // Static render
  React.useEffect(() => {
    if (animate) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const raf = requestAnimationFrame(() => {
      canvas.width = scene.width;
      canvas.height = scene.height;
      drawScene(canvas, scene);
    });
    return () => cancelAnimationFrame(raf);
  }, [scene, animate]);

  // Grain overlay — mesmo tamanho do canvas principal, renderizado uma única vez
  // Re-renderiza só quando noise, grainSize ou dimensões mudam
  const { noise, grainSize, width: sceneWidth, height: sceneHeight } = scene;
  React.useEffect(() => {
    if (!animate) return;
    const gc = grainCanvasRef.current;
    if (!gc || noise <= 0) return;
    const ctx = gc.getContext("2d");
    if (!ctx) return;
    const width = sceneWidth;
    const height = sceneHeight;
    const img = ctx.createImageData(width, height);
    const d = img.data;
    const step = Math.max(1, Math.floor(grainSize));
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
  }, [animate, noise, grainSize, sceneWidth, sceneHeight]);

  // Animation loop
  React.useEffect(() => {
    if (!animate) {
      fpsFramesRef.current = [];
      setFps(0);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    let rafId: number;
    let time = 0;
    let lastTs: number | null = null;

    const frame = (ts: number) => {
      if (lastTs !== null) {
        time += ((ts - lastTs) / 1000) * (animParamsRef.current?.speed ?? 1);
      }
      lastTs = ts;

      // FPS: sliding 1-second window
      const frames = fpsFramesRef.current;
      frames.push(ts);
      const cutoff = ts - 1000;
      let i = 0;
      while (i < frames.length && frames[i] < cutoff) i++;
      fpsFramesRef.current = frames.slice(i);
      setFps(fpsFramesRef.current.length);

      const s = sceneRef.current;
      if (canvas.width !== s.width || canvas.height !== s.height) {
        canvas.width = s.width;
        canvas.height = s.height;
      }
      // skipGrain=true: grain é tratado pelo canvas overlay fixo
      drawScene(canvas, s, time, animParamsRef.current, true);

      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [animate]);

  const grainOpacity = animate && scene.noise > 0
    ? (scene.noise / 100) * 0.35
    : 0;

  return (
    <div className={cn("relative overflow-hidden", className)} style={style}>
      <canvas
        ref={canvasRef}
        width={scene.width}
        height={scene.height}
        className="absolute inset-0 w-full h-full"
      />

      {/* Grain overlay — mesmo tamanho do canvas, textura fixa */}
      {animate && (
        <canvas
          ref={grainCanvasRef}
          width={scene.width}
          height={scene.height}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            mixBlendMode: "overlay",
            opacity: grainOpacity,
            display: scene.noise > 0 ? "block" : "none",
          }}
        />
      )}

      {showFps && animate && (
        <span className="absolute top-3 right-3 rounded-md bg-black/60 px-2 py-1 font-mono text-xs tabular-nums text-white/70 backdrop-blur-sm pointer-events-none">
          {fps} fps
        </span>
      )}
    </div>
  );
}
