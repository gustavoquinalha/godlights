import React from "react";
import { drawScene, SceneConfig, AnimParams } from "./godrays";

export interface GodLightsProps {
  /** Full scene configuration — use the Godlights editor to build this. */
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

const fillAbsolute: React.CSSProperties = {
  position: "absolute",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  width: "100%",
  height: "100%",
  display: "block",
};

/**
 * Standalone Godlights canvas component.
 *
 * @example
 * <GodLights scene={myScene} className="w-full h-full" />
 * <GodLights scene={myScene} animate animParams={{ speed: 1, angleAmp: 50, lengthAmp: 50, widthAmp: 50, haloAmp: 50 }} />
 */
export function GodLights({
  scene,
  animate = false,
  animParams,
  showFps = false,
  className,
  style,
}: GodLightsProps) {
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

  // Grain overlay — rendered once, stays fixed (static texture over moving rays)
  // Re-renders only when noise amount, grain size or dimensions change
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

      if (showFps) {
        const frames = fpsFramesRef.current;
        frames.push(ts);
        const cutoff = ts - 1000;
        let i = 0;
        while (i < frames.length && frames[i] < cutoff) i++;
        fpsFramesRef.current = frames.slice(i);
        setFps(fpsFramesRef.current.length);
      }

      const s = sceneRef.current;
      if (canvas.width !== s.width || canvas.height !== s.height) {
        canvas.width = s.width;
        canvas.height = s.height;
      }
      // skipGrain=true: grain handled by the fixed overlay canvas
      drawScene(canvas, s, time, animParamsRef.current, true);

      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [animate, showFps]);

  const grainOpacity = animate && noise > 0 ? (noise / 100) * 0.35 : 0;

  return (
    <div
      className={className}
      style={{ position: "relative", overflow: "hidden", ...style }}
    >
      {/* Main render canvas */}
      <canvas
        ref={canvasRef}
        width={sceneWidth}
        height={sceneHeight}
        style={fillAbsolute}
      />

      {/* Grain overlay — same size as main canvas, fixed texture */}
      {animate && (
        <canvas
          ref={grainCanvasRef}
          width={sceneWidth}
          height={sceneHeight}
          style={{
            ...fillAbsolute,
            pointerEvents: "none",
            mixBlendMode: "overlay",
            opacity: grainOpacity,
            display: noise > 0 ? "block" : "none",
          }}
        />
      )}

      {/* FPS counter */}
      {showFps && animate && (
        <span
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            borderRadius: 6,
            background: "rgba(0,0,0,0.6)",
            padding: "2px 8px",
            fontFamily: "monospace",
            fontSize: 12,
            color: "rgba(255,255,255,0.7)",
            pointerEvents: "none",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
        >
          {fps} fps
        </span>
      )}
    </div>
  );
}
