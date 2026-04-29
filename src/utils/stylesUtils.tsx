import type { CSSProperties } from "react";

export const clampTextStyle = (lines: number): CSSProperties => ({
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: lines,
  overflow: "hidden",
});

export const quantityButtonClass =
  "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-500 hover:bg-purple-50 hover:text-purple-700 active:translate-y-0 active:scale-95 dark:bg-muted/40 dark:hover:bg-purple-500/20 dark:hover:text-purple-300";

export const quantityContainerClass =
  "flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1.5 shadow-sm transition-all duration-200 hover:border-purple-300 dark:bg-muted/20";

export const removeButtonClass =
  "flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background text-red-500 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:translate-y-0 active:scale-95 dark:bg-muted/20 dark:hover:border-red-500/40 dark:hover:bg-red-500/10";
