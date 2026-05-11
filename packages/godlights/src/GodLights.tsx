import React from "react";
import { drawScene, SceneConfig, AnimParams } from "./godrays";

/**
 * Props for the `<GodLights>` React component.
 *
 * **Positioning note:** the component renders a `position: relative` `<div>`
 * that contains one or two absolutely-positioned `<canvas>` elements. To make
 * it fill a parent container as a full-bleed background, give the parent
 * `position: relative` (or `absolute`) and pass:
 * ```tsx
 * style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
 * ```
 */
export interface GodLightsProps {
  /**
   * Full scene configuration describing the background, halos, and ray layers.
   * Build this with the Godlights visual editor, or construct it manually
   * using `DEFAULT_SCENE` / `DEFAULT_RAY_LAYER` as starting points.
   *
   * **`scene.layers[0]` must be a `BackgroundLayer`** — it is the only thing
   * that clears the canvas between animation frames. Omitting it causes ray
   * trails in animated mode.
   *
   * The component re-renders whenever this prop reference changes, so avoid
   * constructing the object inline in JSX; memoize it with `useMemo` or
   * define it outside the component.
   */
  scene: SceneConfig;
  /**
   * When `true`, starts a `requestAnimationFrame` loop that continuously
   * redraws the scene with an incrementing time clock, producing smooth
   * animation. When `false` (default), the scene is drawn once statically.
   */
  animate?: boolean;
  /**
   * Amplitude and speed settings for the animation loop. Only consulted when
   * `animate={true}`.
   *
   * **Common mistake:** there is NO `opacityAmp` field. The valid keys are:
   * - `speed` — global time multiplier (default `1`)
   * - `angleAmp` — ray swing amount 0–100 (default `50`)
   * - `lengthAmp` — ray length pulsation 0–100 (default `50`)
   * - `widthAmp` — ray width breathing 0–100 (default `50`)
   * - `haloAmp` — halo size pulse 0–100 (default `50`)
   *
   * Omit this prop to use the defaults from `DEFAULT_ANIM_PARAMS`.
   */
  animParams?: AnimParams;
  /**
   * When `true`, a small FPS counter badge is rendered in the top-right corner
   * of the canvas. Only visible when `animate={true}`. Useful during
   * development to check rendering performance. Default: `false`.
   */
  showFps?: boolean;
  /**
   * Optional CSS class name applied to the outer wrapper `<div>`.
   * Useful for Tailwind sizing utilities, e.g. `className="w-full h-full"`.
   */
  className?: string;
  /**
   * Inline styles merged onto the outer wrapper `<div>`, which already has
   * `position: "relative"` and `overflow: "hidden"` set.
   *
   * **Full-bleed background pattern** — add this to a relatively-positioned
   * parent and pass:
   * ```tsx
   * style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
   * ```
   */
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
 * Standalone canvas component that renders a Godlights scene.
 *
 * The outer wrapper is a `position: relative` `<div>` with `overflow: hidden`.
 * Inside it, one `<canvas>` is used for the main render. In animated mode a
 * second `<canvas>` is added as a fixed grain overlay — grain is drawn once
 * and composited with `mixBlendMode: "overlay"`, avoiding the cost of
 * regenerating noise on every frame.
 *
 * **Positioning:** the component does not set its own size. You must give it
 * explicit dimensions via `className`, `style`, or a parent constraint.
 * For a full-bleed background behind other content:
 *
 * ```tsx
 * // Parent must have position: relative (or absolute/fixed)
 * <div style={{ position: "relative" }}>
 *   <GodLights
 *     scene={myScene}
 *     style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
 *   />
 *   <p style={{ position: "relative" }}>Content on top</p>
 * </div>
 * ```
 *
 * **Blend modes:** `scene` layers using `blendMode: "screen"` or
 * `blendMode: "lighter"` look correct only on dark backgrounds. Switch to
 * `blendMode: "multiply"` when the background layer is light or white.
 *
 * **`opacityAmp` does not exist.** The animation amplitude fields are:
 * `angleAmp`, `lengthAmp`, `widthAmp`, and `haloAmp` (all 0–100).
 *
 * @example
 * // Static render — draws once, no RAF loop
 * import { GodLights, DEFAULT_SCENE } from "@your-org/godlights";
 *
 * export function HeroBackground() {
 *   return (
 *     <GodLights
 *       scene={DEFAULT_SCENE}
 *       className="w-full h-64"
 *     />
 *   );
 * }
 *
 * @example
 * // Animated render — continuous RAF loop with custom amplitudes
 * import { GodLights, DEFAULT_SCENE, AnimParams } from "@your-org/godlights";
 * import { useMemo } from "react";
 *
 * export function AnimatedBackground() {
 *   const animParams: AnimParams = useMemo(() => ({
 *     speed: 1,
 *     angleAmp: 60,   // moderate swing
 *     lengthAmp: 40,  // subtle length pulsation
 *     widthAmp: 20,   // gentle width breathing
 *     haloAmp: 50,    // standard halo pulse
 *     // ⚠️ opacityAmp does NOT exist — omit it
 *   }), []);
 *
 *   return (
 *     <div style={{ position: "relative", height: 480 }}>
 *       <GodLights
 *         scene={DEFAULT_SCENE}
 *         animate
 *         animParams={animParams}
 *         showFps   // optional FPS badge for dev
 *         style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
 *       />
 *       <h1 style={{ position: "relative", color: "#fff" }}>Hello</h1>
 *     </div>
 *   );
 * }
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
