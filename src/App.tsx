import { GodRaysGenerator } from "@/components/GodRaysGenerator";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import PreviewPage from "@/pages/PreviewPage";
import LandingPage from "@/pages/LandingPage";

export default function App() {
  const path = window.location.pathname;

  const page = path === "/editor"
    ? "editor"
    : path === "/preview"
    ? "preview"
    : "landing";

  return (
    <ThemeProvider defaultTheme="dark" storageKey="rays-ui-theme">
      <TooltipProvider delayDuration={400}>
        {page === "editor" && <GodRaysGenerator />}
        {page === "preview" && <PreviewPage />}
        {page === "landing" && <LandingPage />}
      </TooltipProvider>
    </ThemeProvider>
  );
}
