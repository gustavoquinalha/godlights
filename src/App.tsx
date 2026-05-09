import { GodRaysGenerator } from "@/components/GodRaysGenerator";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import PreviewPage from "@/pages/PreviewPage";

export default function App() {
  const isPreview = window.location.pathname === "/preview";

  return (
    <ThemeProvider defaultTheme="dark" storageKey="rays-ui-theme">
      <TooltipProvider delayDuration={400}>
        {isPreview ? <PreviewPage /> : <GodRaysGenerator />}
      </TooltipProvider>
    </ThemeProvider>
  );
}
