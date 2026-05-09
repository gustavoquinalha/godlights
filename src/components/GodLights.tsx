import React from "react";
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
      // Only resize when dimensions actually change — avoids full buffer realloc every frame
      if (canvas.width !== s.width || canvas.height !== s.height) {
        canvas.width = s.width;
        canvas.height = s.height;
      }
      // skipGrain=true: avoids getImageData/putImageData CPU↔GPU round-trip per frame
      drawScene(canvas, s, time, animParamsRef.current, true);

      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [animate]);

  const canvas = (
    <canvas
      ref={canvasRef}
      width={scene.width}
      height={scene.height}
      className={className}
      style={style}
    />
  );

  if (!showFps || !animate) return canvas;

  return (
    <div className="relative" style={style}>
      <canvas
        ref={canvasRef}
        width={scene.width}
        height={scene.height}
        className={className}
      />
      <span className="absolute top-3 right-3 rounded-md bg-black/60 px-2 py-1 font-mono text-xs tabular-nums text-white/70 backdrop-blur-sm pointer-events-none">
        {fps} fps
      </span>
    </div>
  );
}
