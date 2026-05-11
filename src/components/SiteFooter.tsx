import { cn, LINKS } from "@/lib/utils";



export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("w-full border-t border-border bg-background", className)}>
      <div className="container mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Godlights. MIT License.
        </p>
        <nav className="hidden sm:flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
          {LINKS.map(({ label, href, external }) => (
            <a
              key={label}
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
