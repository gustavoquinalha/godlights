import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const LINKS = [
  { label: "Home", href: "/" },
  { label: "Editor", href: "/editor" },
  { label: "Presets", href: "/presets" },
  { label: "Docs", href: "/docs" },
  { label: "Npm", href: "https://www.npmjs.com/package/godlights", external: true },
  { label: "GitHub", href: "https://github.com/gustavoquinalha/rays-generator", external: true },
];