// ============================================================
// APP/GUIDE/_COMPONENTS.TSX — Shared UI dùng lại trong các trang guide
// ============================================================

import React from "react";

export type BadgeColor = "green" | "blue" | "purple" | "orange" | "red" | "yellow" | "pink";

export const BADGE_COLORS: Record<BadgeColor, string> = {
  green:  "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  blue:   "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  purple: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
  orange: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
  red:    "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  yellow: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
  pink:   "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800",
};

export function Tag({ label, color = "blue" }: { label: string; color?: BadgeColor }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${BADGE_COLORS[color]}`}>
      {label}
    </span>
  );
}

export function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
        {number}
      </div>
      <div className="flex-1 pb-6">
        <h4 className="font-semibold mb-1.5">{title}</h4>
        <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`border border-border rounded-xl p-5 bg-card ${className}`}>
      {children}
    </div>
  );
}

export function InfoBox({ type, children }: { type: "tip" | "warning" | "info"; children: React.ReactNode }) {
  const styles = {
    tip:     { icon: "💡", cls: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300" },
    warning: { icon: "⚠️", cls: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300" },
    info:    { icon: "ℹ️", cls: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300" },
  }[type];
  return (
    <div className={`flex gap-3 border rounded-xl p-4 text-sm ${styles.cls}`}>
      <span className="text-base flex-shrink-0">{styles.icon}</span>
      <div>{children}</div>
    </div>
  );
}

export function PageTitle({ icon, title, description }: { icon: string; title: string; description?: string }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{icon}</span>
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  );
}

export function PageNav({ prev, next }: { prev?: { href: string; label: string }; next?: { href: string; label: string } }) {
  return (
    <div className="flex items-center justify-between pt-8 mt-8 border-t border-border">
      {prev ? (
        <a href={prev.href} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← {prev.label}
        </a>
      ) : <div />}
      {next && (
        <a href={next.href} className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
          {next.label} →
        </a>
      )}
    </div>
  );
}
