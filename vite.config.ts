import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Resolve godlights from package source in dev (no need to build dist first)
      "godlights": path.resolve(__dirname, "./packages/godlights/src/index.ts"),
      // Alias for ?raw imports of package source in editor
      "@godlights": path.resolve(__dirname, "./packages/godlights/src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          "radix-vendor": [
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-dialog",
            "@radix-ui/react-label",
            "@radix-ui/react-popover",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-select",
            "@radix-ui/react-separator",
            "@radix-ui/react-slider",
            "@radix-ui/react-slot",
            "@radix-ui/react-toggle",
            "@radix-ui/react-tooltip",
          ],
          "ui-vendor": ["lucide-react", "react-colorful", "next-themes"],
        },
      },
    },
  },
});
