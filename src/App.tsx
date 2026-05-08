import { GodRaysGenerator } from "@/components/GodRaysGenerator";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="rays-ui-theme">
      <TooltipProvider delayDuration={400}>
        <GodRaysGenerator />
      </TooltipProvider>
    </ThemeProvider>
  );
}
