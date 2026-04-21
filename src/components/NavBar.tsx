// ============================================================
// COMPONENTS/NAVBAR.TSX - Navigation Bar
// ============================================================

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "🗺️ Roadmaps" },
  { href: "/content", label: "📚 Nội dung" },
  { href: "/blog", label: "✍️ Blog" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-base tracking-tight hover:opacity-80 transition-opacity"
        >
          <span className="text-xl">🗺️</span>
          <span className="hidden sm:inline">Roadmap Builder</span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* CTA */}
        <Link
          href="/builder/new"
          className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          ➕ Tạo Roadmap
        </Link>
      </div>
    </header>
  );
}
