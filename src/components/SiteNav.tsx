import { Sparkles, Github, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Editor", href: "/editor" },
  { label: "Presets", href: "/presets" },
];

interface SiteNavProps {
  /** Current path used to highlight the active link. Defaults to window.location.pathname. */
  activePath?: string;
  /** Extra classes applied to the <header> element. */
  className?: string;
}

export function SiteNav({ activePath, className }: SiteNavProps) {
  const current = activePath ?? window.location.pathname;

  return (
    <header className={cn("z-20 h-16", className)}>
      <div className="container mx-auto px-4 flex h-full items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="size-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Godlights
          </span>
        </a>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className={cn(
                "text-sm transition-colors hover:text-foreground",
                current === href
                  ? "text-foreground font-medium"
                  : "text-foreground/70"
              )}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline" className="rounded-full" asChild>
            <a
              href="https://github.com/gustavoquinalha/godlights"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="size-3.5" />
              GitHub
            </a>
          </Button>

          <Button size="sm" className="rounded-full" asChild>
            <a href="/editor">
              Open Editor
              <ArrowRight className="size-3" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
