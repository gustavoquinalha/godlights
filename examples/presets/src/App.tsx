import { useState } from "react";
import { GodLights } from "godlights";
import { PRESETS } from "./presets";

const animParams = { speed: 1, angleAmp: 30, lengthAmp: 20, widthAmp: 10, haloAmp: 30 };

export function App() {
  const [active, setActive] = useState(0);
  const preset = PRESETS[active];

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 180,
          flexShrink: 0,
          background: "rgba(255,255,255,0.04)",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          padding: "1rem 0",
          gap: 2,
        }}
      >
        <div style={{ padding: "0 1rem 0.75rem", opacity: 0.4, fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Presets
        </div>
        {PRESETS.map((p, i) => (
          <button
            key={p.key}
            onClick={() => setActive(i)}
            style={{
              background: i === active ? "rgba(255,255,255,0.08)" : "transparent",
              border: "none",
              borderLeft: `2px solid ${i === active ? "rgba(255,255,255,0.5)" : "transparent"}`,
              color: i === active ? "#fff" : "rgba(255,255,255,0.45)",
              padding: "0.5rem 1rem",
              textAlign: "left",
              cursor: "pointer",
              fontSize: "0.875rem",
              transition: "all 0.15s ease",
            }}
          >
            {p.label}
          </button>
        ))}
        <div style={{ marginTop: "auto", padding: "1rem", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <a
            href="https://www.godlights.io"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.75rem", textDecoration: "none" }}
          >
            godlights.io →
          </a>
        </div>
      </aside>

      {/* Canvas area */}
      <div style={{ flex: 1, position: "relative" }}>
        <GodLights
          key={preset.key}
          scene={preset.scene}
          animParams={animParams}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "2rem",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 1,
          }}
        >
          <span
            style={{
              fontSize: "0.8rem",
              color: "rgba(255,255,255,0.3)",
              background: "rgba(0,0,0,0.3)",
              padding: "0.25rem 0.75rem",
              borderRadius: "9999px",
              backdropFilter: "blur(8px)",
            }}
          >
            {active + 1} / {PRESETS.length} — {preset.label}
          </span>
        </div>
      </div>
    </div>
  );
}
