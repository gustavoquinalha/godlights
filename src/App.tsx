import { GodRaysGenerator } from "@/components/GodRaysGenerator";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import PreviewPage from "@/pages/PreviewPage";
import LandingPage from "@/pages/LandingPage";
import PresetsPage from "@/pages/PresetsPage";

export default function App() {
  const path = window.location.pathname;

  const page =
    path === "/editor"
      ? "editor"
      : path === "/preview"
      ? "preview"
      : path === "/presets"
      ? "presets"
      : "landing";

  return (
    <ThemeProvider defaultTheme="dark" storageKey="rays-ui-theme">
      <TooltipProvider delayDuration={400}>
        {page === "editor" && <GodRaysGenerator />}
        {page === "preview" && <PreviewPage />}
        {page === "presets" && <PresetsPage />}
        {page === "landing" && <LandingPage />}
      </TooltipProvider>
    </ThemeProvider>
  );
}
