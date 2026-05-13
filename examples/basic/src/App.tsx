import { useMemo, useState } from "react";
import { GodLights } from "godlights";
import type { SceneConfig, AnimParams } from "godlights";

const animParams: AnimParams = {
  speed: 1,
  angleAmp: 40,
  lengthAmp: 25,
  widthAmp: 15,
  haloAmp: 40,
};

const COLORS = [
  { label: "Purple", value: "#a78bfa", bg: "#06060f" },
  { label: "Green",  value: "#34d399", bg: "#060f08" },
  { label: "Red",    value: "#f87171", bg: "#0f0608" },
  { label: "Blue",   value: "#60a5fa", bg: "#060a0f" },
];

export function App() {
  const [colorIndex, setColorIndex] = useState(0);
  const { value: color, bg: bgColor } = COLORS[colorIndex];

  const scene: SceneConfig = useMemo(
    () => ({
      width: 1920,
      height: 1080,
      noise: 8,
      grainSize: 1,
      layers: [
        {
          id: "background",
          type: "background",
          bgType: "solid",
          bgColor,
          bgColor2: bgColor,
          bgGradientAngle: 180,
        },
        {
          id: "halo-1",
          name: "Halo",
          type: "halo",
          originX: 50,
          originY: -5,
          color,
          intensity: 0.3,
          size: 0.5,
          blendMode: "lighter",
        },
        {
          id: "rays-1",
          name: "Rays",
          type: "rays",
          direction: 180,
          spread: 90,
          originX: 50,
          originY: -5,
          rayCount: 24,
          rayWidth: 70,
          divergence: 1.8,
          rayLength: 1.1,
          colorStart: color,
          colorEnd: color,
          opacity: 0.18,
          blendMode: "screen",
          fadeToTransparent: true,
          blur: 12,
          randomnessWidth: 60,
          randomnessLength: 20,
          randomnessAngle: 15,
          seed: 42,
        },
      ],
    }),
    [color, bgColor]
  );

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <GodLights
        scene={scene}
        animate
        animParams={animParams}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          gap: "2rem",
        }}
      >
        <h1 style={{ fontSize: "3rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
          godlights
        </h1>
        <p style={{ opacity: 0.6, fontSize: "1.1rem" }}>
          Animated god ray backgrounds for React
        </p>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {COLORS.map((c, i) => (
            <button
              key={c.label}
              onClick={() => setColorIndex(i)}
              style={{
                padding: "0.5rem 1.25rem",
                borderRadius: "9999px",
                border: `2px solid ${i === colorIndex ? c.value : "rgba(255,255,255,0.15)"}`,
                background: i === colorIndex ? `${c.value}22` : "transparent",
                color: i === colorIndex ? c.value : "rgba(255,255,255,0.5)",
                cursor: "pointer",
                fontSize: "0.9rem",
                transition: "all 0.2s ease",
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
        <a
          href="https://www.godlights.io"
          target="_blank"
          rel="noopener noreferrer"
          style={{ opacity: 0.4, fontSize: "0.85rem", color: "inherit" }}
        >
          godlights.io →
        </a>
      </div>
    </div>
  );
}
