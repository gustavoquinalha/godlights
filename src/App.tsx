import { GodRaysGenerator } from "@/components/GodRaysGenerator";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function App() {
  return (
    <TooltipProvider delayDuration={400}>
      <GodRaysGenerator />
    </TooltipProvider>
  );
}
