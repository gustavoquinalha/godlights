import type { SceneConfig } from "godlights";

/** Encode a SceneConfig into a URL-safe base64 string. */
export function encodeScene(scene: SceneConfig): string {
  const json = JSON.stringify(scene);
  return btoa(encodeURIComponent(json))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/** Decode a URL-safe base64 string back into a SceneConfig. Returns null on failure. */
export function decodeScene(encoded: string): SceneConfig | null {
  try {
    const padded =
      encoded.replace(/-/g, "+").replace(/_/g, "/") +
      "==".slice(0, (4 - (encoded.length % 4)) % 4);
    const json = decodeURIComponent(atob(padded));
    return JSON.parse(json) as SceneConfig;
  } catch {
    return null;
  }
}

/** Build a full shareable URL for the given scene. */
export function buildShareUrl(scene: SceneConfig): string {
  const encoded = encodeScene(scene);
  const base = `${window.location.origin}/editor`;
  return `${base}?scene=${encoded}`;
}
