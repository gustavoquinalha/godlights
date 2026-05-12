import { Sparkles, Github, ArrowRight, Menu, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, LINKS } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Presets", href: "/presets" },
  { label: "Docs", href: "/docs" },
];

interface SiteNavProps {
  /** Current path used to highlight the active link. Defaults to window.location.pathname. */
  activePath?: string;
  /** Extra classes applied to the <header> element. */
  className?: string;
}

export function SiteNav({ activePath, className }: SiteNavProps) {
  const current = activePath ?? window.location.pathname;
  const { theme, setTheme } = useTheme();
  const dark = theme === "dark";
  const toggleTheme = () => setTheme(dark ? "light" : "dark");

  return (
    <header className={cn("h-14 z-100", className)}>
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

        {/* Nav links — desktop */}
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
        <div className="flex items-center gap-2">
          {/* Theme toggle — desktop */}
          <Button
            variant="outline"
            size="icon-xs"
            className="hidden md:inline-flex h-8 w-8 rounded-full bg-background/20"
            onClick={toggleTheme}
            title={dark ? "Light mode" : "Dark mode"}
          >
            {dark ? (
              <Sun className="size-3.5" />
            ) : (
              <Moon className="size-3.5" />
            )}
          </Button>

          <Button
            size="xs"
            variant="outline"
            className="hidden sm:inline-flex rounded-full bg-background/20"
            asChild
          >
            <a
              href="https://github.com/gustavoquinalha/godlights"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="size-3.5" />
              GitHub
            </a>
          </Button>

          <Button size="xs" className="rounded-full" asChild>
            <a href="/editor">
              <span className="hidden sm:inline">Open Editor</span>
              <span className="sm:hidden">Editor</span>
              <ArrowRight className="size-3" />
            </a>
          </Button>

          {/* Mobile dots menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon-xs"
                className="md:hidden h-8 w-8 rounded-full"
              >
                <Menu className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {LINKS.map(({ label, href, external }) => (
                <DropdownMenuItem key={label} asChild>
                  <a
                    href={href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    className={cn(current === href ? "font-medium" : "")}
                  >
                    {label}
                  </a>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={toggleTheme}>
                {dark ? (
                  <Sun className="size-3.5 shrink-0" />
                ) : (
                  <Moon className="size-3.5 shrink-0" />
                )}
                {dark ? "Light mode" : "Dark mode"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
