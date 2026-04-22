// ============================================================
// COMPONENTS/FLOATINGMENU.TSX - Menu nổi đóng/mở thay NavBar
// ============================================================
// Nút nổi góc trên-phải, click để mở overlay menu
// Không chiếm không gian → không che nội dung

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "🗺️", text: "Roadmaps" },
  { href: "/content", label: "📚", text: "Nội dung" },
  { href: "/blog", label: "✍️", text: "Blog" },
  { href: "/notes", label: "📝", text: "Ghi chú" },
  { href: "/guide", label: "📖", text: "Hướng dẫn" },
];

export default function FloatingMenu() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Đóng khi click ngoài
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Đóng khi đổi route
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Khoá scroll body khi menu mở
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* ── Nút trigger nổi ── */}
      <div
        ref={menuRef}
        className="fixed top-4 right-4 z-50"
      >
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Đóng menu" : "Mở menu"}
          aria-expanded={open}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-200",
            "bg-background/90 backdrop-blur border border-border",
            "hover:bg-muted hover:scale-105 active:scale-95",
            open && "rotate-90 bg-muted"
          )}
        >
          {open ? (
            // X icon
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            // Hamburger icon
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* ── Dropdown panel ── */}
        {open && (
          <div
            className={cn(
              "absolute top-12 right-0 w-64",
              "bg-card/95 backdrop-blur-sm border border-border rounded-2xl shadow-2xl",
              "py-2 overflow-hidden",
              "animate-in fade-in slide-in-from-top-2 duration-150"
            )}
          >
            {/* Logo / Brand */}
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <span className="text-xl">🗺️</span>
              <span className="font-bold text-sm tracking-tight">Roadmap Builder</span>
            </div>

            {/* Nav links */}
            <nav className="py-1">
              {NAV_LINKS.map(({ href, label, text }) => {
                const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <span className="text-base w-5 text-center">{label}</span>
                    {text}
                    {active && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Auth section */}
            <div className="border-t border-border pt-1">
              {status === "loading" ? (
                <div className="flex items-center gap-3 px-4 py-2.5">
                  <div className="w-7 h-7 rounded-full bg-muted animate-pulse" />
                  <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                </div>
              ) : session ? (
                <>
                  {/* User info */}
                  <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border/60">
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name ?? "User"}
                        className="w-7 h-7 rounded-full border border-border flex-shrink-0"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
                        {session.user?.name?.[0]?.toUpperCase() ?? "U"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{session.user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <Link href="/dashboard"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors">
                    <span className="w-5 text-center">📊</span> Dashboard
                  </Link>
                  <Link href="/builder/new"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors">
                    <span className="w-5 text-center">➕</span> Tạo Roadmap mới
                  </Link>
                  <Link href="/blog/new"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors">
                    <span className="w-5 text-center">✍️</span> Viết bài mới
                  </Link>
                  <Link href="/content/new"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors">
                    <span className="w-5 text-center">📄</span> Thêm nội dung
                  </Link>
                  <Link href="/notes/new"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors">
                    <span className="w-5 text-center">📝</span> Tạo ghi chú
                  </Link>
                  <div className="border-t border-border mt-1">
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors w-full text-left"
                    >
                      <span className="w-5 text-center">🚪</span> Đăng xuất
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => signIn("github")}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors w-full text-left"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  Đăng nhập với GitHub
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Backdrop mờ khi menu mở ── */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}
    </>
  );
}
